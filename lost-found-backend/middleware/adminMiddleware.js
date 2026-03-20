const jwt = require("jsonwebtoken")

module.exports = function adminMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ message: "Admin token required" })

  const token = header.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
    if (!decoded.isAdmin)
      return res.status(403).json({ message: "Not an admin token" })
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin token" })
  }
}
