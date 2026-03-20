const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String },
  passwordHash: { type: String },
  googleId:     { type: String },
  avatar:       { type: String },
  isVerified:   { type: Boolean, default: false },
  verifyToken:  { type: String },
  resetToken:   { type: String },
  createdAt:    { type: Date, default: Date.now }
})

// Virtual so the rest of the app can still use .fullName anywhere
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model("User", UserSchema)
