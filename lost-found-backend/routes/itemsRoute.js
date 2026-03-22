const express  = require("express")
const router   = express.Router()
const Item     = require("../models/Item")
const multer   = require("multer")
const path     = require("path")
const authMiddleware = require("../middleware/authMiddleware")

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})
const upload = multer({ storage })

// ── POST /api/items ───────────────────────────────────────────────────────
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { type, category, description, location, date, reward, name, phone1, phone2 } = req.body
    const images = req.files ? req.files.map(f => f.filename) : []
    let parsedExtraFields = {}
    if (req.body.extraFields) {
      try { parsedExtraFields = JSON.parse(req.body.extraFields) } catch {}
    }
    const newItem = new Item({
      type, category, description, location, date, reward,
      name, phone1, phone2, images,
      extraFields: parsedExtraFields,
      createdBy:   req.user.id,
    })
    await newItem.save()
    res.status(201).json({ message: "Report submitted successfully", item: newItem })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/items ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/items/mine — MUST come before /:id ───────────────────────────
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/items/:id — increments view count ────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },        // increment views on every fetch
      { returnDocument: "after" }
    ).populate("createdBy", "firstName lastName _id")

    if (!item) return res.status(404).json({ message: "Not found" })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── POST /api/items/:id/care — toggle care (auth required) ────────────────
router.post("/:id/care", authMiddleware, async (req, res) => {
  try {
    const item   = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Not found" })

    const userId  = req.user.id
    // guard: cares may be undefined on old documents
    if (!item.cares) item.cares = []
    const already = item.cares.map(id => id.toString()).includes(userId)

    if (already) {
      item.cares = item.cares.filter(id => id.toString() !== userId)
    } else {
      item.cares.push(userId)
    }

    await item.save()
    res.json({ cares: item.cares.length, cared: !already })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/items/:id/share — increment share count (no auth) ──────────
router.patch("/:id/share", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { returnDocument: "after" }
    )
    if (!item) return res.status(404).json({ message: "Not found" })
    res.json({ shares: item.shares })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/items/:id/resolve ──────────────────────────────────────────
router.patch("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })
    if (item.status === "resolved")
      return res.status(400).json({ message: "Already marked as resolved" })

    item.status = "resolved"
    if (req.body.resolveComment?.trim())
      item.resolveComment = req.body.resolveComment.trim()

    await item.save()
    res.json({ message: "Marked as resolved", item })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/items/:id — edit ───────────────────────────────────────────
router.patch("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })

    const allowed = ["description", "location", "date", "reward", "phone1", "phone2"]
    allowed.forEach(field => { if (req.body[field] !== undefined) item[field] = req.body[field] })
    if (req.body.extraFields) { try { item.extraFields = JSON.parse(req.body.extraFields) } catch {} }
    if (req.files?.length > 0) item.images = req.files.map(f => f.filename)

    await item.save()
    res.json({ message: "Updated", item })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
