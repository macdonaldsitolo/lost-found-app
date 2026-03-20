import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

function initGoogleButton(ref, callback) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !window.google?.accounts?.id || !ref) return false
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback,
    ux_mode: "popup",
  })
  window.google.accounts.id.renderButton(ref, {
    theme: "outline", size: "large", width: 350, text: "signup_with", shape: "rectangular",
  })
  return true
}

export default function Register() {
  const { user, login } = useAuth()
  const navigate  = useNavigate()
  const googleRef = useRef(null)

  const [firstName,  setFirstName]  = useState("")
  const [lastName,   setLastName]   = useState("")
  const [email,      setEmail]      = useState("")
  const [phone,      setPhone]      = useState("")
  const [password,   setPassword]   = useState("")
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState("")
  const [done,       setDone]       = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) navigate("/", { replace: true }) }, [user])

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return

    if (initGoogleButton(googleRef.current, handleGoogleResponse)) return

    const existing = document.getElementById("google-gsi-script")
    if (!existing) {
      const script  = document.createElement("script")
      script.id     = "google-gsi-script"
      script.src    = "https://accounts.google.com/gsi/client"
      script.async  = true
      script.defer  = true
      script.onload = () => initGoogleButton(googleRef.current, handleGoogleResponse)
      document.head.appendChild(script)
    } else {
      const poll = setInterval(() => {
        if (initGoogleButton(googleRef.current, handleGoogleResponse)) clearInterval(poll)
      }, 100)
      return () => clearInterval(poll)
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    setError("")
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", { idToken: response.credential })
      login(res.data.user, res.data.token)
      navigate("/", { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || "Google sign-up failed. Please try again.")
    }
  }

  const handleSubmit = async () => {
    setError("")
    if (!firstName || !lastName || !email || !password) {
      setError("All fields except phone are required"); return
    }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    setSubmitting(true)
    try {
      await axios.post("http://localhost:5000/api/auth/register", { firstName, lastName, email, phone, password })
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={S.screen}>
        <div style={{ ...S.container, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
          <h2 style={S.title}>Check your email</h2>
          <p style={{ color: "#6e6e73", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
            We sent a verification link to <strong>{email}</strong>.<br />
            Click it to activate your account, then log in.
          </p>
          <Link to="/login"><button style={S.submitBtn}>Go to Login</button></Link>
        </div>
      </div>
    )
  }

  return (
    <div style={S.screen}>
      <div style={S.container}>

        <div style={S.header}>
          <div style={S.logo}>🔍</div>
          <h2 style={S.title}>Create account</h2>
          <p style={S.subtitle}>Join Lost & Found Malawi</p>
        </div>

        {error && <div style={S.errorBanner}><FiAlertCircle size={16} /> {error}</div>}

        {/* Google sign-up button — only renders if VITE_GOOGLE_CLIENT_ID is set */}
        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div style={S.googleWrap}><div ref={googleRef} /></div>
            <div style={S.dividerRow}>
              <div style={S.dividerLine} />
              <span style={S.dividerText}>or register with email</span>
              <div style={S.dividerLine} />
            </div>
          </>
        )}

        {/* First name + Last name side by side */}
        <div style={S.row}>
          <div style={{ ...S.inputWrap, flex: 1 }}>
            <FiUser style={S.inputIcon} />
            <input style={S.input} type="text" placeholder="First name"
              value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div style={{ ...S.inputWrap, flex: 1 }}>
            <FiUser style={S.inputIcon} />
            <input style={S.input} type="text" placeholder="Last name"
              value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        </div>

        <div style={S.inputWrap}>
          <FiMail style={S.inputIcon} />
          <input style={S.input} type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div style={S.inputWrap}>
          <FiPhone style={S.inputIcon} />
          <input style={S.input} type="tel" placeholder="Phone number (optional)"
            value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <div style={S.inputWrap}>
          <FiLock style={S.inputIcon} />
          <input
            style={S.input}
            type={showPass ? "text" : "password"}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button style={S.eyeBtn} onClick={() => setShowPass(p => !p)}>
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <p style={S.terms}>
          By signing up you agree to our terms. Your email will only be used for
          account notifications about your reports.
        </p>

        <button
          style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>

        <p style={S.footer}>
          Already have an account?{" "}
          <Link to="/login" style={S.link}>Log in</Link>
        </p>

      </div>
    </div>
  )
}

const S = {
  screen:       { backgroundColor: "#f2f2f7", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  container:    { width: "100%", maxWidth: "420px", padding: "32px 24px" },
  header:       { textAlign: "center", marginBottom: 28 },
  logo:         { fontSize: 40, marginBottom: 12 },
  title:        { fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: "#1c1c1e" },
  subtitle:     { fontSize: 14, color: "#6e6e73", margin: 0 },
  errorBanner:  { background: "#fff0f0", border: "1px solid #fcd0d0", color: "#c0392b", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  googleWrap:   { display: "flex", justifyContent: "center", marginBottom: 16, minHeight: 44 },
  dividerRow:   { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine:  { flex: 1, height: 1, background: "#e5e7eb" },
  dividerText:  { color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap" },
  row:          { display: "flex", gap: 10, marginBottom: 0 },
  inputWrap:    { position: "relative", marginBottom: 14 },
  inputIcon:    { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" },
  input:        { width: "100%", padding: "14px 14px 14px 42px", borderRadius: 16, border: "1.5px solid #e5e7eb", fontSize: 15, background: "white", outline: "none", boxSizing: "border-box", margin: 0 },
  eyeBtn:       { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 },
  terms:        { fontSize: 12, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 },
  submitBtn:    { width: "100%", padding: 16, borderRadius: 18, border: "none", background: "#0a4d8c", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 20, boxShadow: "0 8px 20px rgba(10,77,140,0.25)" },
  footer:       { textAlign: "center", fontSize: 14, color: "#6e6e73" },
  link:         { color: "#0a4d8c", fontWeight: 600, textDecoration: "none" },
}
