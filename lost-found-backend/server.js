const express  = require("express")
const mongoose = require("mongoose")
const cors     = require("cors")
const dotenv   = require("dotenv")
const path     = require("path")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
const itemsRoute      = require("./routes/itemsRoute")
const claimsRoute     = require("./routes/claimsRoute")
const authRoutes      = require("./routes/authRoutes")
const adminAuthRoute  = require("./routes/adminAuthRoute")
const adminRoutes     = require("./routes/adminRoutes")

app.use("/api/items",       itemsRoute)
app.use("/api/claims",      claimsRoute)
app.use("/api/auth",        authRoutes)
app.use("/api/admin/auth",  adminAuthRoute)
app.use("/api/admin",       adminRoutes)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
