const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  phone:        { type: String, default: "" },
  passwordHash: { type: String },
  googleId:     { type: String },
  avatar:       { type: String },
  isVerified:   { type: Boolean, default: false },
  verifyToken:  { type: String },   // stores the 6-digit code
  verifyExpiry: { type: Date },     // code expiry time
  resetToken:   { type: String },
  createdAt:    { type: Date, default: Date.now },
})

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model("User", UserSchema)
