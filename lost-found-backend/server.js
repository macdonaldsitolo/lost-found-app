const express  = require("express")
const mongoose = require("mongoose")
const cors     = require("cors")
const dotenv   = require("dotenv")
const path     = require("path")

dotenv.config()

const app = express()

// ── CORS — explicit config so Chrome and Edge behave identically ──────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://lost-found-app-7-git-main-macdonald-sitolos-projects.vercel.app",
    ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ── Routes ────────────────────────────────────────────────────────────────
const itemsRoute     = require("./routes/itemsRoute")
const claimsRoute    = require("./routes/claimsRoute")
const authRoutes     = require("./routes/authRoutes")
const adminAuthRoute = require("./routes/adminAuthRoute")
const adminRoutes    = require("./routes/adminRoutes")

app.use("/api/items",      itemsRoute)
app.use("/api/claims",     claimsRoute)
app.use("/api/auth",       authRoutes)
app.use("/api/admin/auth", adminAuthRoute)   // login + /me lives here at /api/admin/auth/me
app.use("/api/admin",      adminRoutes)      // all other admin CRUD

// ── MongoDB ───────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
