import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import useValidation from "../hooks/useValidation"
import FieldError from "../components/FieldError"
import { validateName, validateEmail, validatePhone, validatePassword } from "../utils/validators"
import axios from "axios"
function initGoogleButton(ref, callback) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !window.google?.accounts?.id || !ref) return false
  window.google.accounts.id.initialize({ client_id: clientId, callback, ux_mode: "popup" })
  window.google.accounts.id.renderButton(ref, {
    theme: "outline", size: "large", width: 350, text: "signup_with", shape: "rectangular"
  })
  return true
}

export default function Register() {
  const { user, login } = useAuth()
  const navigate  = useNavigate()
  const googleRef = useRef(null)

  const [firstName,    setFirstName]    = useState("")
  const [lastName,     setLastName]     = useState("")
  const [email,        setEmail]        = useState("")
  const [phone,        setPhone]        = useState("")
  const [password,     setPassword]     = useState("")
  const [showPass,     setShowPass]     = useState(false)
  const [confirmPass,  setConfirmPass]  = useState("")
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [confirmError, setConfirmError] = useState(null)
  const [error,        setError]        = useState("")
  const [submitting,   setSubmitting]   = useState(false)

  // ── verification code state ──────────────────────────────────────────────
  const [step,        setStep]        = useState("form")  // "form" | "verify"
  const [code,        setCode]        = useState("")
  const [codeError,   setCodeError]   = useState("")
  const [verifying,   setVerifying]   = useState(false)
  const [resending,   setResending]   = useState(false)
  const [resent,      setResent]      = useState(false)
  const [countdown,   setCountdown]   = useState(0)

  useEffect(() => { if (user) navigate("/", { replace: true }) }, [user])

  // countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const checkConfirm = (pw, cpw) => {
    if (!cpw) { setConfirmError(null); return }
    setConfirmError(pw !== cpw ? "Passwords do not match" : null)
  }

  const { errors, touched, validateAll } = useValidation({
    firstName: () => validateName(firstName, "First name"),
    lastName:  () => validateName(lastName,  "Last name"),
    email:     () => validateEmail(email),
    phone:     () => validatePhone(phone, false),
    password:  () => validatePassword(password),
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
      const res = await axios.post("/api/auth/google", { idToken: response.credential })
      login(res.data.user, res.data.token)
      navigate("/", { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || "Google sign-up failed.")
    }
  }

  // ── Step 1: submit registration form ─────────────────────────────────────
  const handleSubmit = async () => {
    setError("")
    if (confirmError || password !== confirmPass) {
      setConfirmError("Passwords do not match")
      return
    }
    if (!validateAll()) return
    setSubmitting(true)
    try {
      await axios.post("/api/auth/register", {
        firstName, lastName, email,
        phone: phone || "",
        password
      })
      setStep("verify")
      setCountdown(60)  // 60 second cooldown before resend
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: verify the 6-digit code ──────────────────────────────────────
  const handleVerify = async () => {
    setCodeError("")
    if (!code || code.length !== 6) {
      setCodeError("Please enter the 6-digit code")
      return
    }
    setVerifying(true)
    try {
      const res = await axios.post("/api/auth/verify-code", { email, code })
      login(res.data.user, res.data.token)
      navigate("/", { replace: true })
    } catch (err) {
      setCodeError(err?.response?.data?.message || "Invalid code")
    } finally {
      setVerifying(false)
    }
  }

  // ── Resend code ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true)
    setResent(false)
    setCodeError("")
    try {
      await axios.post("/api/auth/resend-code", { email })
      setResent(true)
      setCountdown(60)
      setCode("")
    } catch (err) {
      setCodeError(err?.response?.data?.message || "Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  // ── Verification screen ───────────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div style={S.screen}>
        <div style={S.container}>
          <div style={S.header}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📩</div>
            <h2 style={S.title}>Check your email</h2>
            <p style={{ ...S.subtitle, lineHeight: 1.6 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: "#0a4d8c" }}>{email}</strong>
            </p>
          </div>

          {codeError && (
            <div style={S.errorBanner}>
              <FiAlertCircle size={16} /> {codeError}
            </div>
          )}

          {resent && (
            <div style={{ ...S.errorBanner, background: "#f0fff4", borderColor: "#b7ebca", color: "#1a7a3c" }}>
              ✓ New code sent successfully
            </div>
          )}

          {/* 6-digit code input */}
          <div style={{ marginBottom: 8 }}>
            <input
              style={{
                ...S.input,
                textAlign: "center",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 12,
                padding: "18px 14px",
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "")
                setCode(val)
                setCodeError("")
              }}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              autoFocus
            />
          </div>

          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, textAlign: "center" }}>
            Code expires in 10 minutes
          </p>

          <button
            style={{ ...S.submitBtn, opacity: verifying ? 0.7 : 1, marginBottom: 14 }}
            onClick={handleVerify}
            disabled={verifying}>
            {verifying ? "Verifying…" : "Verify & Continue"}
          </button>

          {/* Resend */}
          <div style={{ textAlign: "center" }}>
            {countdown > 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                Resend code in {countdown}s
              </p>
            ) : (
              <button
                style={{ background: "none", border: "none", color: "#0a4d8c", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                onClick={handleResend}
                disabled={resending}>
                {resending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 16 }}>
            Wrong email?{" "}
            <button
              style={{ background: "none", border: "none", color: "#0a4d8c", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}
              onClick={() => { setStep("form"); setCode(""); setCodeError("") }}>
              Go back
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div style={S.screen}>
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.logo}>🔍</div>
          <h2 style={S.title}>Create account</h2>
          <p style={S.subtitle}>Join Lost & Found Malawi</p>
        </div>

        {error && <div style={S.errorBanner}><FiAlertCircle size={16} /> {error}</div>}

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

        <div style={S.nameRow}>
          <div style={{ flex: 1 }}>
            <input style={S.input} type="text" placeholder="First name"
              value={firstName} onChange={e => setFirstName(e.target.value)} />
            <FieldError error={errors.firstName} touched={touched.firstName} />
          </div>
          <div style={{ flex: 1 }}>
            <input style={S.input} type="text" placeholder="Last name"
              value={lastName} onChange={e => setLastName(e.target.value)} />
            <FieldError error={errors.lastName} touched={touched.lastName} />
          </div>
        </div>

        <input style={S.input} type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} />
        <FieldError error={errors.email} touched={touched.email} />

        <input style={S.input} type="tel" placeholder="Phone number (optional)"
          value={phone} onChange={e => setPhone(e.target.value)} />
        <FieldError error={errors.phone} touched={touched.phone} />

        <div style={S.passWrap}>
          <input style={S.input} type={showPass ? "text" : "password"}
            placeholder="Password (min 6 chars + 1 number)"
            value={password}
            onChange={e => { setPassword(e.target.value); checkConfirm(e.target.value, confirmPass) }} />
          <button style={S.eyeBtn} onClick={() => setShowPass(p => !p)}>
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <FieldError error={errors.password} touched={touched.password} />

        <div style={S.passWrap}>
          <input style={S.input} type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPass}
            onChange={e => { setConfirmPass(e.target.value); checkConfirm(password, e.target.value) }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button style={S.eyeBtn} onClick={() => setShowConfirm(p => !p)}>
            {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        {confirmError && <p style={{ fontSize: 12, color: "#e53e3e", marginBottom: 4 }}>{confirmError}</p>}

        <p style={S.terms}>
          By signing up you agree to our terms. Your email will only be used for account notifications.
        </p>

        <button style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating account…" : "Create Account"}
        </button>

        <p style={S.footer}>
          Already have an account? <Link to="/login" style={S.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

const S = {
  screen:      { backgroundColor: "#f2f2f7", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  container:   { width: "100%", maxWidth: "420px", padding: "32px 24px" },
  header:      { textAlign: "center", marginBottom: 28 },
  logo:        { fontSize: 40, marginBottom: 12 },
  title:       { fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: "#1c1c1e" },
  subtitle:    { fontSize: 14, color: "#6e6e73", margin: 0 },
  errorBanner: { background: "#fff0f0", border: "1px solid #fcd0d0", color: "#c0392b", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  googleWrap:  { display: "flex", justifyContent: "center", marginBottom: 16, minHeight: 44 },
  dividerRow:  { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, background: "#e5e7eb" },
  dividerText: { color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap" },
  nameRow:     { display: "flex", gap: 10 },
  input:       { width: "100%", padding: "14px", borderRadius: 16, border: "1.5px solid #e5e7eb", fontSize: 15, background: "white", outline: "none", boxSizing: "border-box", margin: "0 0 4px" },
  passWrap:    { position: "relative" },
  eyeBtn:      { position: "absolute", right: 14, top: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 },
  terms:       { fontSize: 12, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 },
  submitBtn:   { width: "100%", padding: 16, borderRadius: 18, border: "none", background: "#0a4d8c", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 20, boxShadow: "0 8px 20px rgba(10,77,140,0.25)" },
  footer:      { textAlign: "center", fontSize: 14, color: "#6e6e73" },
  link:        { color: "#0a4d8c", fontWeight: 600, textDecoration: "none" },
}
