import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiHome, FiShare2, FiCheck } from "react-icons/fi"
import kindnessIcon from "../assets/kindness.svg"

function getMessage(type, category) {
  const cat = (category || "").toLowerCase()
  if (type === "claim")   return "Your ownership claim has been submitted. Our team will review the details and get back to you."
  if (type === "lost") {
    if (cat === "person")  return "Missing person report submitted. The community will help look out for them."
    if (cat === "phone")   return "Your lost phone report is live. Someone who finds it can contact you directly."
    if (cat === "laptop")  return "Laptop report submitted. Check back — someone may have found it already."
    if (cat === "wallet")  return "Wallet report submitted. Don't worry — people in Malawi look out for each other."
    if (cat === "id card") return "ID card report submitted. We'll help you get it back."
    return "Your lost item report is now live. The community will help you find it."
  }
  if (type === "found") {
    if (cat === "person")  return "Thank you for reporting a found person. We'll help reunite them with their family."
    if (cat === "phone")   return "Great find! The owner will be so relieved. Thank you for reporting it."
    if (cat === "laptop")  return "Laptop report submitted. The owner can now find their way back to it."
    if (cat === "wallet")  return "You did a kind thing. The owner will be very grateful."
    if (cat === "id card") return "ID card report submitted. This will mean a lot to the owner."
    return "You did a kind thing by reporting this. We'll help reunite it with its owner."
  }
  if (type === "missing") return "Missing person report submitted. The community will be on the lookout. Stay hopeful."
  if (type === "wanted")  return "Wanted person report submitted. The right people will be notified."
  return "Report submitted successfully. Thank you for using Lost & Found Malawi."
}

function getTitle(type, category) {
  const cat = (category || "").toLowerCase()
  if (type === "claim")   return "Claim Submitted"
  if (type === "lost")    return cat === "person" ? "Missing Person Reported" : "Lost Report Submitted"
  if (type === "found")   return cat === "person" ? "Found Person Reported"   : "Found Report Submitted"
  if (type === "missing") return "Missing Person Reported"
  if (type === "wanted")  return "Wanted Report Submitted"
  return "Report Submitted"
}

// ══════════════════════════════════════════════════════════════════════════
// Props:
//   visible   — bool
//   type      — "lost" | "found" | "missing" | "wanted" | "claim"
//   category  — e.g. "Phone", "Person"
//   itemId    — the _id returned from the server after submit (item or claim)
//   onClose   — () => void
function SubmitModal({ visible, type, category, itemId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (visible) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 1800)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!visible) return null


  

  // Build the share URL — points directly to the item detail page
  const shareUrl = itemId
    ? `${window.location.origin}/item/${itemId}`
    : window.location.origin

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getTitle(type, category),
          text:  `Check this Lost & Found report on Lost & Found Malawi!`,
          url:   shareUrl,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {loading ? (
          <>
            <div style={styles.loader} />
            <p style={{ color: "#6e6e73", fontSize: 14 }}>
              {type === "claim" ? "Submitting your claim…" : "Submitting your report…"}
            </p>
          </>
        ) : (
          <>
            <div style={styles.animation}>
              <img src={kindnessIcon} alt="Success" style={{ width: "100%" }} />
            </div>

            <p style={styles.title}>{getTitle(type, category)}</p>
            <p style={styles.message}>{getMessage(type, category)}</p>

            {/* Share link box — always visible */}
            {itemId && (
              <div style={styles.linkBox}>
                <p style={styles.linkLabel}>Share this report</p>
                <div style={styles.linkRow}>
                  <span style={styles.linkText} title={shareUrl}>
                    /item/{itemId.slice(-8)}
                  </span>
                  <button onClick={copyLink} style={{
                    ...styles.copyBtn,
                    background: copied ? "#25D366" : "#0a4d8c"
                  }}>
                    {copied ? <FiCheck size={14} /> : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <div style={styles.buttons}>
              <button style={styles.homeBtn}
                onClick={() => { onClose(); navigate("/") }}>
                <FiHome style={{ marginRight: 6 }} /> Home
              </button>
              <button style={styles.shareBtn} onClick={handleShare}>
                <FiShare2 style={{ marginRight: 6 }} /> Share
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay:   { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000, padding:"0 16px" },
  modal:     { background:"white", padding:"28px 24px", borderRadius:"24px", textAlign:"center", width:"100%", maxWidth:"320px", boxShadow:"0 10px 30px rgba(0,0,0,0.15)" },
  loader:    { width:"40px", height:"40px", border:"4px solid #eee", borderTop:"4px solid #007aff", borderRadius:"50%", margin:"0 auto 20px", animation:"spin 1s linear infinite" },
  animation: { width:"100px", margin:"0 auto 12px" },
  title:     { fontWeight:700, fontSize:16, color:"#1c1c1e", margin:"0 0 8px" },
  message:   { fontSize:13, color:"#6e6e73", lineHeight:1.5, marginBottom:16 },
  linkBox:   { background:"#f2f3f7", borderRadius:14, padding:"12px 14px", marginBottom:16, textAlign:"left" },
  linkLabel: { fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 8px" },
  linkRow:   { display:"flex", alignItems:"center", gap:8 },
  linkText:  { flex:1, fontSize:12, color:"#1c1c1e", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  copyBtn:   { padding:"6px 12px", borderRadius:10, border:"none", color:"white", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", transition:"background 0.2s" },
  buttons:   { display:"flex", gap:"10px" },
  homeBtn:   { flex:1, display:"flex", justifyContent:"center", alignItems:"center", padding:"12px 0", borderRadius:"18px", border:"none", backgroundColor:"#007aff", color:"white", fontWeight:600, fontSize:"14px", cursor:"pointer" },
  shareBtn:  { flex:1, display:"flex", justifyContent:"center", alignItems:"center", padding:"12px 0", borderRadius:"18px", border:"none", backgroundColor:"#0a4d8c", color:"white", fontWeight:600, fontSize:"14px", cursor:"pointer" },
}

export default SubmitModal
