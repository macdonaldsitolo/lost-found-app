const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ POST /api/items
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔍 DEBUG

    const {
      type,
      category,
      description,
      location,
      date,
      reward,
      name,
      phone1,
      phone2,
    } = req.body;

    const images = req.files
      ? req.files.map((file) => file.filename)
      : [];

    // ✅ parse extraFields safely
    let parsedExtraFields = {};

    if (req.body.extraFields) {
      try {
        parsedExtraFields = JSON.parse(req.body.extraFields);
      } catch (err) {
        console.log("❌ Failed to parse extraFields:", req.body.extraFields);
      }
    }

    console.log("PARSED EXTRA:", parsedExtraFields); // 🔍 DEBUG

    const newItem = new Item({
      type,
      category,
      description,
      location,
      date,
      reward,
      name,
      phone1,
      phone2,
      images,
      extraFields: parsedExtraFields,
    });

    await newItem.save();

    res.status(201).json({
      message: "Report submitted successfully",
      item: newItem,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/items (YOU WERE MISSING THIS)
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;