/**
 * Run this ONCE to create your admin account:
 *   cd lost-found-backend
 *   node scripts/createAdmin.js
 *
 * Then delete or keep this file — running it again
 * will just say "Admin already exists".
 */

require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt   = require("bcryptjs")
const Admin    = require("../models/Admin")

const USERNAME = process.env.ADMIN_USERNAME || "admin"
const PASSWORD = process.env.ADMIN_PASSWORD || "changeme123"

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log("Connected to MongoDB")

  const existing = await Admin.findOne({ username: USERNAME })
  if (existing) {
    console.log(`Admin "${USERNAME}" already exists. Nothing to do.`)
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12)
  await Admin.create({ username: USERNAME, passwordHash })
  console.log(`✅ Admin created — username: "${USERNAME}", password: "${PASSWORD}"`)
  console.log("⚠️  Change these credentials in your .env before going to production!")
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
