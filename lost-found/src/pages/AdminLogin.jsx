import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi"
import { useAdminAuth } from "../context/AdminAuthContext"

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth()
  const navigate = useNavigate()

  const [username,   setUsername]   = useState("")
  const [password,   setPassword]   = useState("")
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError("")
    if (!username || !password) { setError("Both fields are required"); return }
    setSubmitting(true)
    try {
      const res = await axios.post("http://localhost:5000/api/admin/auth/login", { username, password })
      adminLogin(res.data.admin, res.data.token)
      navigate("/admin")
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.screen}>
      <div style={S.card}>
        <div style={S.header}>
          <div style={S.shield}>🛡</div>
          <h2 style={S.title}>Admin Portal</h2>
          <p style={S.subtitle}>Lost & Found Malawi</p>
        </div>

        {error && (
          <div style={S.errorBanner}>
            <FiAlertCircle size={15} /> {error}
          </div>
        )}

        <div style={S.inputWrap}>
          <FiUser style={S.icon} />
          <input style={S.input} type="text" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <div style={S.inputWrap}>
          <FiLock style={S.icon} />
          <input style={S.input} type={showPass ? "text" : "password"} placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button style={S.eye} onClick={() => setShowPass(p => !p)}>
            {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>

        <button
          style={{ ...S.btn, opacity: submitting ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </div>
  )
}

const S = {
  screen:      { minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" },
  card:        { background: "white", borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" },
  header:      { textAlign: "center", marginBottom: 28 },
  shield:      { fontSize: 44, marginBottom: 10 },
  title:       { fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#0f172a" },
  subtitle:    { fontSize: 13, color: "#94a3b8", margin: 0 },
  errorBanner: { background: "#fff0f0", border: "1px solid #fcd0d0", color: "#c0392b", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
  inputWrap:   { position: "relative", marginBottom: 14 },
  icon:        { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" },
  input:       { width: "100%", padding: "13px 13px 13px 40px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box", margin: 0 },
  eye:         { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 },
  btn:         { width: "100%", padding: 14, borderRadius: 16, border: "none", background: "#0f172a", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" },
}
