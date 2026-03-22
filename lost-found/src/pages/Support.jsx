import { useState } from "react"
import { FiArrowLeft, FiMail, FiPhone, FiMessageCircle, FiChevronDown, FiChevronUp } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

const FAQS = [
  { q: "How do I report a lost item?",         a: "Tap 'Report Lost' from the home screen, select the category, fill in the details and submit. You need an account to report." },
  { q: "Is the service free?",                 a: "Yes, Lost & Found Malawi is completely free to use. Reporting lost or found items and missing persons costs nothing." },
  { q: "My item was found. How do I close the report?", a: "Go to My Posts, find the report, and tap 'Mark Resolved'. You can add a note like where it was found." },
  { q: "Can I edit my report after submitting?", a: "Yes. Go to My Posts, tap Edit on the report, and update the details." },
  { q: "How does claiming a gadget work?",     a: "You submit an ownership claim with your IMEI or serial number. Our team reviews it. The claim does not automatically return the item — it connects you with whoever reported finding it." },
  { q: "Why can't I ask for a reward for a found person?", a: "It is against our terms. Found persons must be returned to their families freely. Holding a person for reward is illegal and unethical." },
  { q: "How do I delete my account?",          a: "Contact us at support@lostfound.mw and we will process your request within 3 business days." },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: "1px solid #f2f3f7" }}>
      <button style={S.faqBtn} onClick={() => setOpen(p => !p)}>
        <span style={{ fontWeight: 600, fontSize: 14, textAlign: "left", flex: 1, color: "#1c1c1e" }}>{q}</span>
        {open ? <FiChevronUp size={16} color="#9ca3af" /> : <FiChevronDown size={16} color="#9ca3af" />}
      </button>
      {open && <p style={S.faqAnswer}>{a}</p>}
    </div>
  )
}

export default function Support() {
  const navigate = useNavigate()
  return (
    <div style={S.page}>
      <div style={S.container}>
        <button style={S.back} onClick={() => navigate(-1)}>
          <FiArrowLeft size={17} /> Back
        </button>

        <h1 style={S.h1}>Support</h1>
        <p style={S.sub}>We're here to help. Reach us any time.</p>

        {/* Contact channels */}
        <div style={S.channels}>
          <a href="mailto:support@lostfound.mw" style={S.channel}>
            <div style={{ ...S.channelIcon, background: "#eef2ff" }}>
              <FiMail size={22} color="#0a4d8c" />
            </div>
            <div>
              <p style={S.channelTitle}>Email</p>
              <p style={S.channelSub}>support@lostfound.mw</p>
            </div>
          </a>
          <a href="tel:+265999000000" style={S.channel}>
            <div style={{ ...S.channelIcon, background: "#f0fff4" }}>
              <FiPhone size={22} color="#1a7a3c" />
            </div>
            <div>
              <p style={S.channelTitle}>Phone</p>
              <p style={S.channelSub}>+265 999 000 000</p>
            </div>
          </a>
          <a href="https://wa.me/265999000000" target="_blank" rel="noreferrer" style={S.channel}>
            <div style={{ ...S.channelIcon, background: "#f0fff4" }}>
              <FiMessageCircle size={22} color="#25D366" />
            </div>
            <div>
              <p style={S.channelTitle}>WhatsApp</p>
              <p style={S.channelSub}>Chat with us</p>
            </div>
          </a>
        </div>

        {/* FAQ */}
        <div style={S.card}>
          <h2 style={S.h2}>Frequently Asked Questions</h2>
          {FAQS.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
        </div>

        {/* Response time notice */}
        <p style={S.notice}>
          We aim to respond to all emails within 24 hours on business days (Monday–Friday, 8am–5pm CAT).
        </p>
      </div>
    </div>
  )
}

const S = {
  page:         { backgroundColor: "#f2f2f7", minHeight: "100vh", paddingBottom: 60 },
  container:    { maxWidth: 640, margin: "0 auto", padding: "20px 20px" },
  back:         { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#0a4d8c", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "4px 0", marginBottom: 20 },
  h1:           { fontSize: 24, fontWeight: 700, color: "#1c1c1e", margin: "0 0 6px" },
  sub:          { fontSize: 14, color: "#6e6e73", marginBottom: 24 },
  channels:     { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 },
  channel:      { display: "flex", alignItems: "center", gap: 14, background: "white", borderRadius: 18, padding: "16px 18px", textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  channelIcon:  { width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  channelTitle: { fontWeight: 700, fontSize: 14, color: "#1c1c1e", margin: 0 },
  channelSub:   { fontSize: 13, color: "#6e6e73", margin: "2px 0 0" },
  card:         { background: "white", borderRadius: 20, padding: "18px 18px 4px", marginBottom: 16, boxShadow: "0 3px 10px rgba(0,0,0,0.06)" },
  h2:           { fontSize: 16, fontWeight: 700, color: "#1c1c1e", margin: "0 0 16px" },
  faqBtn:       { display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", padding: "14px 0", cursor: "pointer" },
  faqAnswer:    { fontSize: 13, color: "#6e6e73", lineHeight: 1.6, padding: "0 0 14px" },
  notice:       { fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 },
}
