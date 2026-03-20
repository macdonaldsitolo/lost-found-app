const mongoose = require("mongoose")

const ClaimSchema = new mongoose.Schema({
  category:   { type: String, enum: ["Phone", "Laptop", "Tablet"], required: true },
  deviceName: { type: String },
  brand:      { type: String },
  model:      { type: String },
  color:      { type: String },
  storage:    { type: String },
  specs:      { type: String },

  imei:   { type: String },
  imei2:  { type: String },
  serial: { type: String },

  claimantName: { type: String },
  phone1:       { type: String, required: true },
  phone2:       { type: String },

  images: [String],

  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // ← NEW

  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Claim", ClaimSchema)
