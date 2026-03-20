const mongoose = require("mongoose")

const ItemSchema = new mongoose.Schema({
  type:     { type: String, enum: ["lost", "found", "missing", "wanted"], required: true },
  category: { type: String, required: true },
  description: { type: String },
  location:    { type: String },
  date:        { type: Date },

  name:   { type: String },
  phone1: { type: String, required: true },
  phone2: { type: String },

  reward: { type: String },
  images: [String],

  extraFields: { type: Object, default: {} },

  status: {
    type: String,
    enum: ["active", "resolved"],
    default: "active"
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // ← NEW

  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Item", ItemSchema)
