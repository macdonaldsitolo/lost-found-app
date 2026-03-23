import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import useValidation from "../hooks/useValidation"
import FieldError, { inputErrorStyle } from "../components/FieldError"
import { validateEmail, validateRequired } from "../utils/validators"

function initGoogleButton(ref, callback) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !window.google?.accounts?.id || !ref) return false
  window.google.accounts.id.initialize({ client_id: clientId, callback, ux_mode: "popup" })
  window.google.accounts.id.renderButton(ref, {
    theme: "outline", size: "large", width: 350, text: "signin_with", shape: "rectangular"
  })
  return true
}

export default function Login() {
  const { login, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || "/"
  const googleRef = useRef(null)

  const [email,      setEmail]      = useState("")
  const [password,   setPassword]   = useState("")
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState("")
  const [success,    setSuccess]    = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) navigate(from, { replace: true }) }, [user])
  useEffect(() => {
    if (location.search.includes("verified=1")) setSuccess("Email verified! You can now log in.")
  }, [])

  const { errors, touched, touch, validateAll } = useValidation({
    email:    () => validateEmail(email),
    password: () => validateRequired(password, "Password"),
  })

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return
    if (initGoogleButton(googleRef.current, handleGoogleResponse)) return
    const existing = document.getElementById("google-gsi-script")
    if (!existing) {
      const script = document.createElement("script")
      script.id = "google-gsi-script"; script.src = "https://accounts.google.com/gsi/client"
      script.async = true; script.defer = true
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
      const res = await axios.post("https://lost-found-app-4-w6wh.onrender.com/api/auth/google", { idToken: response.credential })
      login(res.data.user, res.data.token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || "Google sign-in failed.")
    }
  }

  const handleSubmit = async () => {
    setError("")
    if (!validateAll()) return
    setSubmitting(true)
    try {
      const res = await axios.post("https://lost-found-app-4-w6wh.onrender.com/api/auth/login", { email, password })
      login(res.data.user, res.data.token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.screen}>
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.logo}>🔍</div>
          <h2 style={S.title}>Welcome back</h2>
          <p style={S.subtitle}>Log in to manage your reports</p>
        </div>

        {success && <div style={S.successBanner}><FiCheckCircle size={16} /> {success}</div>}
        {error   && <div style={S.errorBanner}><FiAlertCircle  size={16} /> {error}</div>}

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div style={S.googleWrap}><div ref={googleRef} /></div>
            <div style={S.dividerRow}>
              <div style={S.dividerLine} />
              <span style={S.dividerText}>or</span>
              <div style={S.dividerLine} />
            </div>
          </>
        )}

        <input
          style={inputErrorStyle(errors.email, touched.email, S.input)}
          type="email" placeholder="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); touch("email") }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        <FieldError error={errors.email} touched={touched.email} />

        <div style={S.passWrap}>
          <input
            style={inputErrorStyle(errors.password, touched.password, S.input)}
            type={showPass ? "text" : "password"} placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); touch("password") }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button style={S.eyeBtn} onClick={() => setShowPass(p => !p)}>
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <FieldError error={errors.password} touched={touched.password} />

        <button
          style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={submitting}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <p style={S.footer}>
          Don't have an account? <Link to="/register" style={S.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const S = {
  screen:        { backgroundColor: "#f2f2f7", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  container:     { width: "100%", maxWidth: "400px", padding: "32px 24px" },
  header:        { textAlign: "center", marginBottom: 28 },
  logo:          { fontSize: 40, marginBottom: 12 },
  title:         { fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: "#1c1c1e" },
  subtitle:      { fontSize: 14, color: "#6e6e73", margin: 0 },
  successBanner: { background: "#f0fff4", border: "1px solid #b7ebca", color: "#1a7a3c", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  errorBanner:   { background: "#fff0f0", border: "1px solid #fcd0d0", color: "#c0392b", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  googleWrap:    { display: "flex", justifyContent: "center", marginBottom: 16, minHeight: 44 },
  dividerRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine:   { flex: 1, height: 1, background: "#e5e7eb" },
  dividerText:   { color: "#9ca3af", fontSize: 13 },
  input:         { width: "100%", padding: "14px", borderRadius: 16, border: "1.5px solid #e5e7eb", fontSize: 15, background: "white", outline: "none", boxSizing: "border-box", margin: "0 0 4px" },
  passWrap:      { position: "relative" },
  eyeBtn:        { position: "absolute", right: 14, top: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 },
  submitBtn:     { width: "100%", padding: 16, borderRadius: 18, border: "none", background: "#0a4d8c", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 20, boxShadow: "0 8px 20px rgba(10,77,140,0.25)" },
  footer:        { textAlign: "center", fontSize: 14, color: "#6e6e73" },
  link:          { color: "#0a4d8c", fontWeight: 600, textDecoration: "none" },
}
