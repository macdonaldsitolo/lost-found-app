const express    = require("express")
const router     = express.Router()
const bcrypt     = require("bcryptjs")
const jwt        = require("jsonwebtoken")
const crypto     = require("crypto")
const nodemailer = require("nodemailer")
const { OAuth2Client } = require("google-auth-library")

const User = require("../models/User")
const authMiddleware = require("../middleware/authMiddleware")

// ── email transporter ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Google client — only create if env var is present ─────────────────────
const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null

// ── helpers ────────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    {
      id:        user._id,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      avatar:    user.avatar,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

const sendVerificationEmail = async (user, token) => {
  const link = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`
  await transporter.sendMail({
    from:    `"Lost & Found Malawi" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: "Verify your email — Lost & Found Malawi",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#0a4d8c">Verify your email</h2>
        <p>Hi ${user.firstName}, thanks for signing up!</p>
        <p>Click the button below to verify your email address.</p>
        <a href="${link}"
           style="display:inline-block;margin-top:12px;padding:14px 28px;
                  background:#0a4d8c;color:white;border-radius:14px;
                  text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="margin-top:20px;font-size:13px;color:#888">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  })
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/register
// ════════════════════════════════════════════════════════════════════════════
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "First name, last name, email and password are required" })

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" })

    const existing = await User.findOne({ email })
    if (existing)
      return res.status(400).json({ message: "An account with this email already exists" })

    const passwordHash = await bcrypt.hash(password, 12)
    const verifyToken  = crypto.randomBytes(32).toString("hex")

    const user = new User({ firstName, lastName, email, phone, passwordHash, verifyToken, isVerified: false })
    await user.save()

    sendVerificationEmail(user, verifyToken).catch(err =>
      console.error("Verification email failed:", err)
    )

    res.status(201).json({ message: "Account created! Check your email to verify your account." })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// GET /api/auth/verify-email?token=xxx
// ════════════════════════════════════════════════════════════════════════════
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query
    const user = await User.findOne({ verifyToken: token })

    if (!user)
      return res.status(400).json({ message: "Invalid or expired verification link" })

    user.isVerified  = true
    user.verifyToken = undefined
    await user.save()

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=1`)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ════════════════════════════════════════════════════════════════════════════
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ message: "No account found with this email" })

    if (!user.passwordHash)
      return res.status(400).json({ message: "This account uses Google sign-in. Please log in with Google." })

    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email before logging in. Check your inbox." })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match)
      return res.status(400).json({ message: "Incorrect password" })

    const token = signToken(user)
    res.json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        avatar:    user.avatar,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/google
// ════════════════════════════════════════════════════════════════════════════
router.post("/google", async (req, res) => {
  if (!googleClient)
    return res.status(500).json({ message: "Google auth is not configured on this server." })

  try {
    const { idToken } = req.body
    const ticket  = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // Split Google's full name into first / last
    const parts     = (name || "").trim().split(" ")
    const firstName = parts[0] || "User"
    const lastName  = parts.slice(1).join(" ") || ""

    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (!user) {
      user = new User({ firstName, lastName, email, googleId, avatar: picture, isVerified: true })
      await user.save()
    } else if (!user.googleId) {
      user.googleId   = googleId
      user.avatar     = user.avatar || picture
      user.isVerified = true
      await user.save()
    }

    const token = signToken(user)
    res.json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        avatar:    user.avatar,
      },
    })
  } catch (err) {
    console.error("Google auth error:", err)
    res.status(401).json({ message: "Google sign-in failed. Please try again." })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// GET /api/auth/me  (protected)
// ════════════════════════════════════════════════════════════════════════════
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -verifyToken -resetToken")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
