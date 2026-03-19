const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  type: { type: String, enum: ["lost", "found", "missing", "wanted"], required: true },
  category: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  date: { type: Date },

  name: { type: String }, // optional poster name
  phone1: { type: String, required: true }, // primary phone
  phone2: { type: String }, 


  reward: { type: String },

  images: [String],

  extraFields: {
  type: Object,
  default: {}
},

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", ItemSchema);