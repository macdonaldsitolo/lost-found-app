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

// ── POST /api/items  (auth required) ─────────────────────────────────────
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { type, category, description, location, date, reward, name, phone1, phone2 } = req.body

    const images = req.files ? req.files.map(f => f.filename) : []

    let parsedExtraFields = {}
    if (req.body.extraFields) {
      try { parsedExtraFields = JSON.parse(req.body.extraFields) }
      catch { console.log("Failed to parse extraFields") }
    }

    const newItem = new Item({
      type, category, description, location, date, reward,
      name, phone1, phone2, images,
      extraFields: parsedExtraFields,
      createdBy: req.user.id,        // ← link to user
    })

    await newItem.save()
    res.status(201).json({ message: "Report submitted successfully", item: newItem })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/items  (public) ──────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── GET /api/items/mine  (auth required) ─────────────────────────────────
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/items/:id  (owner only) ───────────────────────────────────
router.patch("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised to edit this post" })

    const allowed = ["description", "location", "date", "reward", "phone1", "phone2", "status"]
    allowed.forEach(field => { if (req.body[field] !== undefined) item[field] = req.body[field] })

    if (req.body.extraFields) {
      try { item.extraFields = JSON.parse(req.body.extraFields) } catch {}
    }
    if (req.files && req.files.length > 0) {
      item.images = req.files.map(f => f.filename)
    }

    await item.save()
    res.json({ message: "Updated", item })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── PATCH /api/items/:id/resolve  (owner only) ───────────────────────────
router.patch("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised" })

    item.status = "resolved"
    await item.save()
    res.json({ message: "Marked as resolved", item })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// ── DELETE /api/items/:id  (owner only) ──────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.createdBy?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorised to delete this post" })

    await item.deleteOne()
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
