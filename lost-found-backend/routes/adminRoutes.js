const express  = require("express")
const router   = express.Router()
const multer   = require("multer")
const path     = require("path")
const XLSX     = require("xlsx")
const adminMW  = require("../middleware/adminMiddleware")
const User     = require("../models/User")
const Item     = require("../models/Item")
const Claim    = require("../models/Claim")

// multer for images
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})
const uploadImgs = multer({ storage: imgStorage })

// multer for excel (memory storage so we can parse in-memory)
const uploadXlsx = multer({ storage: multer.memoryStorage() })

// ════════════════════════════════════════════════════════════════════════════
// STATS  GET /api/admin/stats
// ════════════════════════════════════════════════════════════════════════════
router.get("/stats", adminMW, async (req, res) => {
  try {
    const [
      totalUsers,
      totalItems,
      totalClaims,
      lostCount,
      foundCount,
      missingCount,
      wantedCount,
      resolvedCount,
      pendingClaims,
      verifiedClaims,
      recentItems,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Claim.countDocuments(),
      Item.countDocuments({ type: "lost" }),
      Item.countDocuments({ type: "found" }),
      Item.countDocuments({ type: "missing" }),
      Item.countDocuments({ type: "wanted" }),
      Item.countDocuments({ status: "resolved" }),
      Claim.countDocuments({ status: "pending" }),
      Claim.countDocuments({ status: "verified" }),
      Item.find().sort({ createdAt: -1 }).limit(5).select("type category location createdAt"),
      User.find().sort({ createdAt: -1 }).limit(5).select("firstName lastName email createdAt"),
    ])

    // items per day for last 14 days
    const since = new Date(); since.setDate(since.getDate() - 13)
    const itemsOverTime = await Item.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ])

    res.json({
      totalUsers, totalItems, totalClaims,
      lostCount, foundCount, missingCount, wantedCount,
      resolvedCount, pendingClaims, verifiedClaims,
      recentItems, recentUsers, itemsOverTime
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════════
router.get("/users", adminMW, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query
    const q = search ? {
      $or: [
        { firstName: new RegExp(search, "i") },
        { lastName:  new RegExp(search, "i") },
        { email:     new RegExp(search, "i") },
      ]
    } : {}
    const [users, total] = await Promise.all([
      User.find(q).sort({ createdAt: -1 })
          .skip((page - 1) * limit).limit(Number(limit))
          .select("-passwordHash -verifyToken -resetToken"),
      User.countDocuments(q)
    ])
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

router.delete("/users/:id", adminMW, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    // also remove their items & claims
    await Item.deleteMany({ createdBy: req.params.id })
    await Claim.deleteMany({ createdBy: req.params.id })
    res.json({ message: "User and all their posts deleted" })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

// ════════════════════════════════════════════════════════════════════════════
// ITEMS
// ════════════════════════════════════════════════════════════════════════════
router.get("/items", adminMW, async (req, res) => {
  try {
    const { search = "", type = "", status = "", page = 1, limit = 20 } = req.query
    const q = {}
    if (search) q.$or = [
      { category: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
    ]
    if (type)   q.type   = type
    if (status) q.status = status

    const [items, total] = await Promise.all([
      Item.find(q).sort({ createdAt: -1 })
          .skip((page - 1) * limit).limit(Number(limit))
          .populate("createdBy", "firstName lastName email"),
      Item.countDocuments(q)
    ])
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

// POST — create a single item (with images)
router.post("/items", adminMW, uploadImgs.array("images", 5), async (req, res) => {
  try {
    const { type, category, description, location, date,
            reward, name, phone1, phone2, extraFields } = req.body

    if (!phone1) return res.status(400).json({ message: "phone1 is required" })

    const images = req.files ? req.files.map(f => f.filename) : []
    let parsedExtra = {}
    if (extraFields) { try { parsedExtra = JSON.parse(extraFields) } catch {} }

    const item = new Item({
      type, category, description, location, date,
      reward, name, phone1, phone2, images, extraFields: parsedExtra
    })
    await item.save()
    res.status(201).json({ message: "Item created", item })
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }) }
})

// PATCH — edit any item
router.patch("/items/:id", adminMW, async (req, res) => {
  try {
    const allowed = ["type", "category", "description", "location",
                     "date", "reward", "phone1", "phone2", "status", "name"]
    const update = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f] })
    if (req.body.extraFields) {
      try { update.extraFields = JSON.parse(req.body.extraFields) } catch {}
    }
    const item = await Item.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!item) return res.status(404).json({ message: "Not found" })
    res.json({ message: "Updated", item })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

// PATCH resolve
router.patch("/items/:id/resolve", adminMW, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id, { status: "resolved" }, { new: true }
    )
    res.json({ message: "Resolved", item })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

// DELETE
router.delete("/items/:id", adminMW, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id)
    res.json({ message: "Deleted" })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

// ════════════════════════════════════════════════════════════════════════════
// BULK UPLOAD via Excel  POST /api/admin/items/bulk
// Expected columns: type, category, location, date, phone1, phone2,
//                   name, description, reward
// ════════════════════════════════════════════════════════════════════════════
router.post("/items/bulk", adminMW, uploadXlsx.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" })

    const wb   = XLSX.read(req.file.buffer, { type: "buffer" })
    const ws   = wb.Sheets[wb.SheetNames[0]]

    // Read with header row — skip the instructions row (row 2) if present
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" })

    // Filter out the instructions row (contains hint text like "lost / found / missing / wanted")
    const dataRows = rows.filter(row => {
      const t = String(row.type || "").toLowerCase().trim()
      return t !== "lost / found / missing / wanted" && t !== ""
    })

    if (!dataRows.length) return res.status(400).json({ message: "No data rows found. Make sure your file has a header row with: type, category, location, date, phone1, phone2, name, description, reward" })

    const VALID_TYPES = ["lost", "found", "missing", "wanted"]
    const docs   = []
    const errors = []

    dataRows.forEach((row, i) => {
      const rowNum = i + 2  // +2 because row 1 is header
      const type   = String(row.type  || "").toLowerCase().trim()
      const phone1 = String(row.phone1 || "").trim()

      if (!VALID_TYPES.includes(type)) {
        errors.push(`Row ${rowNum}: invalid type "${row.type}" — must be one of: lost, found, missing, wanted`)
        return
      }
      if (!phone1) {
        errors.push(`Row ${rowNum}: phone1 is required`)
        return
      }

      // Parse date flexibly
      let parsedDate
      if (row.date) {
        parsedDate = new Date(row.date)
        if (isNaN(parsedDate.getTime())) parsedDate = undefined
      }

      docs.push({
        type,
        category:    String(row.category    || "Other").trim(),
        location:    String(row.location    || "").trim(),
        date:        parsedDate,
        phone1:      phone1.replace(/\.0$/, ""),  // remove Excel's .0 on numbers
        phone2:      String(row.phone2      || "").trim().replace(/\.0$/, ""),
        name:        String(row.name        || "").trim(),
        description: String(row.description || "").trim(),
        reward:      String(row.reward      || "").trim(),
        extraFields: {}
      })
    })

    if (!docs.length) {
      return res.status(400).json({ message: "No valid rows to import", errors })
    }

    const inserted = await Item.insertMany(docs, { ordered: false })
    res.json({
      message:  `✅ ${inserted.length} item${inserted.length !== 1 ? "s" : ""} imported successfully`,
      imported: inserted.length,
      skipped:  errors.length,
      errors,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error during bulk import" })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// CLAIMS
// ════════════════════════════════════════════════════════════════════════════
router.get("/claims", adminMW, async (req, res) => {
  try {
    const { status = "", page = 1, limit = 20 } = req.query
    const q = status ? { status } : {}
    const [claims, total] = await Promise.all([
      Claim.find(q).sort({ createdAt: -1 })
           .skip((page - 1) * limit).limit(Number(limit))
           .populate("createdBy", "firstName lastName email"),
      Claim.countDocuments(q)
    ])
    res.json({ claims, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

// PATCH verify / reject claim
router.patch("/claims/:id/status", adminMW, async (req, res) => {
  try {
    const { status } = req.body
    if (!["pending", "verified", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" })
    const claim = await Claim.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!claim) return res.status(404).json({ message: "Not found" })
    res.json({ message: "Status updated", claim })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

router.delete("/claims/:id", adminMW, async (req, res) => {
  try {
    await Claim.findByIdAndDelete(req.params.id)
    res.json({ message: "Deleted" })
  } catch (err) { res.status(500).json({ message: "Server error" }) }
})

module.exports = router
