const express  = require("express")
const router   = express.Router()
const Claim    = require("../models/Claim")
const multer   = require("multer")
const path     = require("path")
const authMiddleware = require("../middleware/authMiddleware")

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})
const upload = multer({ storage })

// ── POST /api/claims  (auth required) ────────────────────────────────────
router.post("/", authMiddleware, upload.array("images", 3), async (req, res) => {
  try {
    const { category, deviceName, brand, model, color, storage: storageSize,
            specs, imei, imei2, serial, claimantName, phone1, phone2 } = req.body

    const images = req.files ? req.files.map(f => f.filename) : []

    const claim = new Claim({
      category, deviceName, brand, model, color,
      storage: storageSize, specs, imei, imei2, serial,
      claimantName, phone1, phone2, images,
      createdBy: req.user.id,        // ← link to user
    })

    await claim.save()
    res.status(201).json({ message: "Claim submitted successfully", claim })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/claims  (public) ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 })
    res.json(claims)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/claims/mine  (auth required) ────────────────────────────────
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(claims)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── DELETE /api/claims/:id  (owner only) ─────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: "Claim not found" })
    if (claim.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })

    await claim.deleteOne()
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
