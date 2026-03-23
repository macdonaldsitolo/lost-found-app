const express    = require("express")
const router     = express.Router()
const bcrypt     = require("bcryptjs")
const jwt        = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const { OAuth2Client } = require("google-auth-library")
const User       = require("../models/User")
const authMiddleware = require("../middleware/authMiddleware")

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ── Email transporter ─────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:             "smtp.gmail.com",
  port:             587,
  secure:           false,
  family:           4,
  connectionTimeout: 5000,
  greetingTimeout:  5000,
  socketTimeout:    5000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Generate 6-digit code ─────────────────────────────────────────────────
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "All fields are required" })

    const existing = await User.findOne({ email })
    if (existing && existing.isVerified)
      return res.status(400).json({ message: "Email already registered" })

    const passwordHash = await bcrypt.hash(password, 10)
    const code         = generateCode()
    const codeExpiry   = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (existing && !existing.isVerified) {
      // Resend code to existing unverified account
      existing.firstName    = firstName
      existing.lastName     = lastName
      existing.phone        = phone || ""
      existing.passwordHash = passwordHash
      existing.verifyToken  = code
      existing.verifyExpiry = codeExpiry
      await existing.save()
    } else {
      await User.create({
        firstName,
        lastName,
        email,
        phone:        phone || "",
        passwordHash,
        verifyToken:  code,
        verifyExpiry: codeExpiry,
        isVerified:   false,
      })
    }

    // Send verification code email — non-blocking so registration always succeeds
    transporter.sendMail({
      from:    `"Lost & Found Malawi" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "Your verification code — Lost & Found Malawi",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:24px">
          <h2 style="color:#0a4d8c;margin-bottom:8px">🔍 Lost & Found Malawi</h2>
          <p style="color:#4b5563;margin-bottom:24px">Hi ${firstName}, thanks for signing up!</p>
          <p style="color:#4b5563;margin-bottom:16px">Your verification code is:</p>
          <div style="background:#f2f3f7;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0a4d8c">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:13px">This code expires in 10 minutes. If you did not sign up, ignore this email.</p>
        </div>
      `,
    }).catch(err => console.error("Email send failed:", err.message))

    // Respond immediately — don't wait for email
    res.status(201).json({ message: "Verification code sent", email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── POST /api/auth/verify-code ────────────────────────────────────────────
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required" })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ message: "Account not found" })

    if (user.isVerified)
      return res.status(400).json({ message: "Account already verified" })

    if (user.verifyToken !== code)
      return res.status(400).json({ message: "Incorrect code" })

    if (user.verifyExpiry && new Date() > new Date(user.verifyExpiry))
      return res.status(400).json({ message: "Code has expired. Please register again to get a new code." })

    user.isVerified   = true
    user.verifyToken  = undefined
    user.verifyExpiry = undefined
    await user.save()

    // Auto-login after verification
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Account verified successfully",
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        avatar:    user.avatar,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── POST /api/auth/resend-code ────────────────────────────────────────────
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user)
      return res.status(400).json({ message: "Account not found" })
    if (user.isVerified)
      return res.status(400).json({ message: "Account already verified" })

    const code   = generateCode()
    user.verifyToken  = code
    user.verifyExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    transporter.sendMail({
      from:    `"Lost & Found Malawi" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "New verification code — Lost & Found Malawi",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:24px">
          <h2 style="color:#0a4d8c;margin-bottom:8px">🔍 Lost & Found Malawi</h2>
          <p style="color:#4b5563;margin-bottom:16px">Your new verification code is:</p>
          <div style="background:#f2f3f7;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0a4d8c">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:13px">This code expires in 10 minutes.</p>
        </div>
      `,
    }).catch(err => console.error("Email send failed:", err.message))

    res.json({ message: "New code sent" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" })

    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email first", needsVerification: true, email })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        avatar:    user.avatar,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── POST /api/auth/google ─────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { sub, email, given_name, family_name, picture } = ticket.getPayload()

    let user = await User.findOne({ $or: [{ googleId: sub }, { email }] })

    if (!user) {
      user = await User.create({
        firstName:  given_name  || "User",
        lastName:   family_name || "",
        email,
        googleId:   sub,
        avatar:     picture,
        isVerified: true,
      })
    } else {
      if (!user.googleId) user.googleId = sub
      if (!user.isVerified) user.isVerified = true
      if (picture) user.avatar = picture
      await user.save()
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        avatar:    user.avatar,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Google authentication failed" })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -verifyToken -verifyExpiry -resetToken")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json({
      id:        user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      phone:     user.phone,
      avatar:    user.avatar,
    })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
