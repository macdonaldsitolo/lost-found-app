const express = require("express")
const router  = express.Router()
const bcrypt  = require("bcryptjs")
const jwt     = require("jsonwebtoken")
const Admin   = require("../models/Admin")

// POST /api/admin/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" })

    const admin = await Admin.findOne({ username })
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" })

    const match = await bcrypt.compare(password, admin.passwordHash)
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign(
      { id: admin._id, username: admin.username, isAdmin: true },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "12h" }
    )

    res.json({ token, admin: { id: admin._id, username: admin.username } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
