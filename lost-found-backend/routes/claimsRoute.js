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

// ── POST /api/claims  (auth required) ─────────────────────────────────────
router.post("/", authMiddleware, upload.array("images", 3), async (req, res) => {
  try {
    const {
      category, deviceName, brand, model, color,
      storage: storageSize, specs, imei, imei2,
      serial, claimantName, phone1, phone2
    } = req.body

    const images = req.files ? req.files.map(f => f.filename) : []

    const claim = new Claim({
      category, deviceName, brand, model, color,
      storage: storageSize, specs, imei, imei2,
      serial, claimantName, phone1, phone2,
      images,
      createdBy: req.user.id,
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

// ── GET /api/claims/mine  (auth required) — must come before /:id ─────────
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(claims)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/claims/:id  (public) ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: "Claim not found" })
    res.json(claim)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/claims/:id  (owner only — edit) ────────────────────────────
router.patch("/:id", authMiddleware, upload.array("images", 3), async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: "Claim not found" })
    if (claim.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })
    if (claim.status === "resolved")
      return res.status(400).json({ message: "Cannot edit a resolved claim" })

    const allowed = [
      "deviceName", "brand", "model", "color", "storage",
      "specs", "phone1", "phone2", "claimantName"
    ]
    allowed.forEach(f => { if (req.body[f] !== undefined) claim[f] = req.body[f] })

    // Only update IMEI/serial if provided (don't blank them out accidentally)
    if (req.body.imei)   claim.imei   = req.body.imei
    if (req.body.imei2)  claim.imei2  = req.body.imei2
    if (req.body.serial) claim.serial = req.body.serial

    if (req.files?.length > 0)
      claim.images = req.files.map(f => f.filename)

    await claim.save()
    res.json({ message: "Claim updated", claim })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/claims/:id/resolve  (owner only) ───────────────────────────
router.patch("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: "Claim not found" })
    if (claim.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })
    if (claim.status === "resolved")
      return res.status(400).json({ message: "Already resolved" })

    claim.status = "resolved"
    if (req.body.resolveComment?.trim())
      claim.resolveComment = req.body.resolveComment.trim()

    await claim.save()
    res.json({ message: "Claim resolved", claim })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── DELETE /api/claims/:id  (owner only) ─────────────────────────────────
// Claims CAN be deleted by owner (unlike reports)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: "Claim not found" })
    if (claim.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })

    await claim.deleteOne()
    res.json({ message: "Claim deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
