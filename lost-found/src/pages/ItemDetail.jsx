import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FiArrowLeft, FiPhone, FiMapPin, FiCalendar,
  FiUser, FiAlertCircle, FiGift, FiFileText,
  FiSmartphone, FiMonitor, FiCreditCard, FiBox,
  FiShare2, FiHeart, FiEye, FiEdit2, FiCheckCircle,
  FiCheck, FiX
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { getExtra, formatDate } from "../utils/itemHelpers"

// ── Type config ────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  lost:    { label: "Lost",    bg: "#fff0f0", color: "#c0392b", border: "#fcd0d0" },
  found:   { label: "Found",   bg: "#f0fff4", color: "#1a7a3c", border: "#b7ebca" },
  missing: { label: "Missing", bg: "#fff8e1", color: "#b45309", border: "#fde68a" },
  wanted:  { label: "Wanted",  bg: "#eef2ff", color: "#0a4d8c", border: "#c7d7f9" },
}

const CAT_ICONS = {
  phone:     <FiSmartphone size={48} strokeWidth={1.2} color="#9ca3af" />,
  laptop:    <FiMonitor    size={48} strokeWidth={1.2} color="#9ca3af" />,
  wallet:    <FiCreditCard size={48} strokeWidth={1.2} color="#9ca3af" />,
  "id card": <FiCreditCard size={48} strokeWidth={1.2} color="#9ca3af" />,
  person:    <FiUser       size={48} strokeWidth={1.2} color="#9ca3af" />,
  other:     <FiBox        size={48} strokeWidth={1.2} color="#9ca3af" />,
}

// ── Resolve modal ──────────────────────────────────────────────────────────
function ResolveModal({ onConfirm, onCancel }) {
  const [comment, setComment] = useState("")
  const [saving,  setSaving]  = useState(false)

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, textAlign: "center" }}>
          Mark as Resolved?
        </p>
        <p style={{ color: "#6e6e73", fontSize: 13, marginBottom: 14, textAlign: "center", lineHeight: 1.5 }}>
          This means the item was found or the situation was resolved. This cannot be undone.
        </p>
        <textarea
          placeholder="How was it resolved? (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={S.textarea}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button style={S.cancelBtn} onClick={onCancel} disabled={saving}>Cancel</button>
          <button
            style={{ ...S.confirmBtn, opacity: saving ? 0.7 : 1 }}
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              await onConfirm(comment)
              setSaving(false)
            }}>
            {saving ? "Saving…" : "Mark Resolved"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Share modal ────────────────────────────────────────────────────────────
function ShareModal({ item, onClose, onShared }) {
  const url  = `${window.location.origin}/item/${item._id}`
  const tc   = TYPE_CONFIG[item.type] || TYPE_CONFIG.lost
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    onShared()
    setTimeout(() => setCopied(false), 2000)
  }

  const nativeShare = async () => {
    if (!navigator.share) return
    try {
      await navigator.share({ title: item.category, text: `Check this Lost & Found report!`, url })
      onShared()
    } catch {}
  }

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 320 }}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, textAlign: "center" }}>Share Report</p>

        {/* Mini preview */}
        <div style={{ border: `1.5px solid ${tc.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
          {item.images?.length > 0 ? (
            <img src={`http://localhost:5000/uploads/${item.images[0]}`}
              alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ height: 60, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {CAT_ICONS[item.category?.toLowerCase()] || <FiBox size={28} color="#9ca3af" />}
            </div>
          )}
          <div style={{ padding: "10px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: tc.bg, color: tc.color }}>
              {tc.label}
            </span>
            <p style={{ fontWeight: 700, fontSize: 13, margin: "6px 0 2px", color: "#1c1c1e" }}>{item.category}</p>
            {item.location && <p style={{ fontSize: 11, color: "#6e6e73", margin: 0 }}>📍 {item.location}</p>}
          </div>
        </div>

        {/* Link row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input readOnly value={url}
            style={{ flex: 1, padding: "9px 12px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 11, color: "#6e6e73", outline: "none", background: "#f9f9f9" }} />
          <button onClick={copy}
            style={{ padding: "9px 14px", borderRadius: 12, border: "none", background: copied ? "#25D366" : "#0a4d8c", color: "white", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "0.2s", whiteSpace: "nowrap" }}>
            {copied ? <FiCheck size={14} /> : "Copy"}
          </button>
        </div>

        {navigator.share && (
          <button onClick={nativeShare}
            style={{ width: "100%", padding: "11px 0", borderRadius: 13, border: "none", background: "#f2f3f7", color: "#0a4d8c", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <FiShare2 size={15} /> Share via…
          </button>
        )}

        <button onClick={onClose}
          style={{ width: "100%", padding: "11px 0", borderRadius: 13, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
export default function ItemDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [item,         setItem]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [imgIdx,       setImgIdx]       = useState(0)
  const [showShare,    setShowShare]    = useState(false)
  const [showResolve,  setShowResolve]  = useState(false)
  const [caresCount,   setCaresCount]   = useState(0)
  const [isCared,      setIsCared]      = useState(false)
  const [sharesCount,  setSharesCount]  = useState(0)
  const [caringLoading, setCaringLoading] = useState(false)

  useEffect(() => {
    axios.get(`http://localhost:5000/api/items/${id}`)
      .then(res => {
        setItem(res.data)
        setCaresCount(res.data.cares?.length || 0)
        setSharesCount(res.data.shares || 0)
        // check if current user has cared
        if (user) {
          const caredIds = (res.data.cares || []).map(c =>
            typeof c === "object" ? c._id?.toString() || c.toString() : c.toString()
          )
          setIsCared(caredIds.includes(user.id) || caredIds.includes(String(user.id)))
        }
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id, user])

  // ── Is this the owner? ──────────────────────────────────────────────────
  const isOwner = user && item && (
    item.createdBy?._id === user.id ||
    item.createdBy === user.id ||
    item.createdBy?._id?.toString() === user.id
  )

  // ── Care toggle ─────────────────────────────────────────────────────────
  const handleCare = async () => {
    if (!user) { navigate("/login"); return }
    if (caringLoading) return
    setCaringLoading(true)
    try {
      const res = await axios.post(`http://localhost:5000/api/items/${id}/care`)
      setCaresCount(res.data.cares)
      setIsCared(res.data.cared)
    } catch {}
    setCaringLoading(false)
  }

  // ── Share — increment counter + open modal ──────────────────────────────
  const handleShare = () => {
    setShowShare(true)
  }

  const handleShared = async () => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/items/${id}/share`)
      setSharesCount(res.data.shares)
    } catch {}
  }

  // ── Resolve ─────────────────────────────────────────────────────────────
  const handleResolve = async (comment) => {
    try {
      await axios.patch(`http://localhost:5000/api/items/${id}/resolve`, { resolveComment: comment })
      setItem(prev => ({ ...prev, status: "resolved", resolveComment: comment }))
      setShowResolve(false)
    } catch (err) {
      alert(err?.response?.data?.message || "Error resolving")
      setShowResolve(false)
    }
  }

  // ── Loading / not found ─────────────────────────────────────────────────
  if (loading) return (
    <div style={S.center}><div style={S.spinner} /></div>
  )

  if (!item) return (
    <div style={S.center}>
      <FiAlertCircle size={40} color="#cbd5e1" />
      <p style={{ color: "#9ca3af", marginTop: 12 }}>Report not found</p>
      <button style={S.smallBtn} onClick={() => navigate(-1)}>Go back</button>
    </div>
  )

  const extra   = getExtra(item)
  const tc      = TYPE_CONFIG[item.type] || TYPE_CONFIG.lost
  const catIcon = CAT_ICONS[item.category?.toLowerCase()] || <FiBox size={48} color="#9ca3af" />
  const images  = item.images || []
  const cat     = item.category?.toLowerCase()

  // Build extra field detail rows
  const extraRows = []
  if (cat === "person") {
    if (extra.personName)   extraRows.push(["Name",         extra.personName])
    if (extra.age)          extraRows.push(["Age",          extra.age])
    if (extra.gender)       extraRows.push(["Gender",       extra.gender])
    if (extra.outfit)       extraRows.push(["Wearing",      extra.outfit])
    if (extra.homeDistrict) extraRows.push(["Home district",extra.homeDistrict])
  }
  if (cat === "phone") {
    if (extra.phoneName)    extraRows.push(["Phone",        extra.phoneName])
    if (extra.model)        extraRows.push(["Model",        extra.model])
    if (extra.color)        extraRows.push(["Color",        extra.color])
    if (extra.specs)        extraRows.push(["Details",      extra.specs])
    if (extra.imei)         extraRows.push(["IMEI",         extra.imei])
    if (extra.mac)          extraRows.push(["MAC",          extra.mac])
  }
  if (cat === "laptop") {
    if (extra.laptopName)   extraRows.push(["Laptop",       extra.laptopName])
    if (!extra.laptopName && extra.brand) extraRows.push(["Brand", extra.brand])
    if (extra.specs)        extraRows.push(["Details",      extra.specs])
    if (extra.serial)       extraRows.push(["Serial",       extra.serial])
  }
  if (cat === "wallet") {
    if (extra.brand)        extraRows.push(["Brand",        extra.brand])
    if (extra.color)        extraRows.push(["Color",        extra.color])
    if (extra.contents)     extraRows.push(["Contents",     extra.contents])
  }
  if (cat === "id card") {
    if (extra.idType)       extraRows.push(["ID Type",      extra.idType])
    if (extra.type)         extraRows.push(["ID Type",      extra.type])
    if (extra.fullName)     extraRows.push(["Name on ID",   extra.fullName])
  }
  if (cat === "other") {
    if (extra.itemName)     extraRows.push(["Item",         extra.itemName])
    if (extra.specs)        extraRows.push(["Details",      extra.specs])
  }

  return (
    <div style={S.page}>

      {/* ── Top bar ── */}
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>

        {/* Owner actions in top bar */}
        {isOwner && item.status !== "resolved" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.ownerBtn} onClick={() => navigate(`/edit-item/${item._id}`)}>
              <FiEdit2 size={14} /> Edit
            </button>
            <button style={{ ...S.ownerBtn, background: "#f0fff4", color: "#1a7a3c" }}
              onClick={() => setShowResolve(true)}>
              <FiCheckCircle size={14} /> Resolve
            </button>
          </div>
        )}
        {isOwner && item.status === "resolved" && (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a7a3c", background: "#f0fff4", padding: "6px 12px", borderRadius: 20, border: "1px solid #b7ebca" }}>
            ✓ Resolved
          </span>
        )}
      </div>

      {/* ── Images — contained, not full width ── */}
      <div style={S.imageContainer}>
        {images.length > 0 ? (
          <>
            <div style={S.imageWrapper}>
              <img
                src={`http://localhost:5000/uploads/${images[imgIdx]}`}
                alt=""
                style={S.image}
              />
            </div>
            {images.length > 1 && (
              <div style={S.thumbRow}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setImgIdx(i)}
                    style={{ ...S.thumb, outline: i === imgIdx ? `2px solid ${tc.color}` : "none" }}>
                    <img src={`http://localhost:5000/uploads/${img}`} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ ...S.imagePlaceholder, background: tc.bg }}>
            {catIcon}
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 10 }}>{item.category}</p>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={S.body}>

        {/* Badges */}
        <div style={S.badgeRow}>
          <span style={{ ...S.typeBadge, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
            {tc.label}
          </span>
          <span style={S.catChip}>{item.category}</span>
          {item.status === "resolved" && (
            <span style={S.resolvedBadge}>✓ Resolved</span>
          )}
        </div>

        {/* Resolve comment */}
        {item.status === "resolved" && item.resolveComment && (
          <div style={S.resolveNote}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1a7a3c", margin: "0 0 4px" }}>Resolution note</p>
            <p style={{ fontSize: 14, color: "#166534", margin: 0 }}>{item.resolveComment}</p>
          </div>
        )}

        {/* Reward */}
        {item.reward && (
          <div style={S.rewardBanner}>
            <FiGift size={16} color="#b45309" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#b45309", margin: "0 0 3px" }}>Reward offered</p>
              <p style={{ fontSize: 14, color: "#92400e", margin: 0 }}>{item.reward}</p>
            </div>
          </div>
        )}

        {/* ── Engagement bar — visible to everyone ── */}
        <div style={S.engageBar}>

          {/* Care */}
          <button
            style={{ ...S.engageItem, color: isCared ? "#e53e3e" : "#6e6e73" }}
            onClick={handleCare}
            disabled={caringLoading}>
            <FiHeart
              size={22}
              fill={isCared ? "#e53e3e" : "none"}
              color={isCared ? "#e53e3e" : "#9ca3af"}
              style={{ transition: "0.2s" }}
            />
            <span style={S.engageNum}>{caresCount}</span>
            <span style={S.engageLabel}>{isCared ? "Cared" : "Care"}</span>
          </button>

          <div style={S.engageDivider} />

          {/* Views */}
          <div style={{ ...S.engageItem, cursor: "default" }}>
            <FiEye size={22} color="#9ca3af" />
            <span style={S.engageNum}>{item.views || 0}</span>
            <span style={S.engageLabel}>Views</span>
          </div>

          <div style={S.engageDivider} />

          {/* Shares */}
          <button style={{ ...S.engageItem, color: "#0a4d8c" }} onClick={handleShare}>
            <FiShare2 size={22} color="#9ca3af" />
            <span style={S.engageNum}>{sharesCount}</span>
            <span style={S.engageLabel}>Shares</span>
          </button>

        </div>

        {/* ── Core details ── */}
        <div style={S.section}>
          {item.location && (
            <div style={S.detailRow}>
              <FiMapPin size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
              <div>
                <p style={S.detailLabel}>{item.type === "found" ? "Found at" : "Last seen in"}</p>
                <p style={S.detailValue}>{item.location}</p>
              </div>
            </div>
          )}
          {item.date && (
            <div style={S.detailRow}>
              <FiCalendar size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
              <div>
                <p style={S.detailLabel}>Date</p>
                <p style={S.detailValue}>{formatDate(item.date)}</p>
              </div>
            </div>
          )}
          {item.description && (
            <div style={S.detailRow}>
              <FiFileText size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
              <div>
                <p style={S.detailLabel}>Description</p>
                <p style={S.detailValue}>{item.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Extra fields */}
        {extraRows.length > 0 && (
          <div style={S.section}>
            <p style={S.sectionTitle}>Item Details</p>
            {extraRows.map(([label, val]) => (
              <div key={label} style={S.extraRow}>
                <span style={S.extraLabel}>{label}</span>
                <span style={S.extraVal}>{String(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        <div style={S.section}>
          <p style={S.sectionTitle}>Contact</p>
          {item.phone1 && (
            <a href={`tel:${item.phone1}`} style={S.callBtn}>
              <FiPhone size={16} /><span>{item.phone1}</span>
            </a>
          )}
          {item.phone2 && (
            <a href={`tel:${item.phone2}`} style={{ ...S.callBtn, marginTop: 10, background: "#f2f3f7" }}>
              <FiPhone size={16} /><span>{item.phone2}</span>
            </a>
          )}
        </div>

        <p style={S.postedAt}>Posted {formatDate(item.createdAt)}</p>

      </div>

      {/* Modals */}
      {showShare && (
        <ShareModal item={item} onClose={() => setShowShare(false)} onShared={handleShared} />
      )}
      {showResolve && (
        <ResolveModal onConfirm={handleResolve} onCancel={() => setShowResolve(false)} />
      )}

    </div>
  )
}

const S = {
  page:          { backgroundColor: "#f2f2f7", minHeight: "100vh" },
  center:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 },
  spinner:       { width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #0a4d8c", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  smallBtn:      { marginTop: 16, padding: "10px 24px", borderRadius: 14, border: "none", background: "#0a4d8c", color: "white", fontWeight: 600, cursor: "pointer" },

  // Top bar
  topBar:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" },
  backBtn:       { background: "none", border: "none", color: "#0a4d8c", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, borderRadius: 10 },
  ownerBtn:      { display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 14, border: "none", background: "#eef2ff", color: "#0a4d8c", fontWeight: 600, fontSize: 13, cursor: "pointer" },

  // Image — contained, centred, not full bleed
  imageContainer:{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 4px" },
  imageWrapper:  { width: "100%", maxWidth: 480, borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" },
  image:         { width: "100%", maxHeight: 320, objectFit: "contain", background: "#f2f3f7", display: "block" },
  thumbRow:      { display: "flex", gap: 8, padding: "10px 0", overflowX: "auto", width: "100%", maxWidth: 480 },
  thumb:         { width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, cursor: "pointer" },
  imagePlaceholder:{ width: "100%", maxWidth: 480, height: 180, background: "#f2f3f7", borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },

  // Body
  body:          { padding: "14px 16px 60px", maxWidth: 560, margin: "0 auto" },
  badgeRow:      { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 },
  typeBadge:     { fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
  catChip:       { fontSize: 12, fontWeight: 600, color: "#6e6e73", background: "#f2f3f7", padding: "4px 12px", borderRadius: 20 },
  resolvedBadge: { fontSize: 12, fontWeight: 700, color: "#1a7a3c", background: "#f0fff4", border: "1px solid #b7ebca", padding: "4px 12px", borderRadius: 20 },
  resolveNote:   { background: "#f0fff4", border: "1px solid #b7ebca", borderRadius: 14, padding: "12px 14px", marginBottom: 14 },
  rewardBanner:  { display: "flex", alignItems: "flex-start", gap: 12, background: "#fff8e1", border: "1px solid #fde68a", borderRadius: 16, padding: "14px 16px", marginBottom: 14 },

  // Engagement bar
  engageBar:      { display: "flex", alignItems: "center", background: "white", borderRadius: 18, padding: "14px 8px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  engageItem:     { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0", flex: 1, transition: "0.15s" },
  engageNum:      { fontSize: 17, fontWeight: 800, color: "#1c1c1e", lineHeight: 1 },
  engageLabel:    { fontSize: 11, fontWeight: 500, color: "#9ca3af", lineHeight: 1 },
  engageDivider:  { width: 1, height: 36, background: "#f2f3f7", flexShrink: 0 },

  // Sections
  section:       { background: "white", borderRadius: 20, padding: "16px 18px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  sectionTitle:  { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" },
  detailRow:     { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  detailLabel:   { fontSize: 11, color: "#9ca3af", fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" },
  detailValue:   { fontSize: 15, color: "#1c1c1e", margin: 0, lineHeight: 1.5 },
  extraRow:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #f2f3f7" },
  extraLabel:    { fontSize: 13, color: "#9ca3af", fontWeight: 500 },
  extraVal:      { fontSize: 14, color: "#1c1c1e", fontWeight: 500, textAlign: "right", maxWidth: "60%" },
  callBtn:       { display: "flex", alignItems: "center", gap: 10, background: "#eef6ff", borderRadius: 14, padding: "14px 16px", textDecoration: "none", color: "#0a4d8c", fontWeight: 600, fontSize: 15 },
  postedAt:      { fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 },

  // Modals
  overlay:       { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" },
  modal:         { background: "white", borderRadius: 22, padding: "22px", width: "100%", maxWidth: 340, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  textarea:      { width: "100%", padding: "12px", borderRadius: 14, border: "1.5px solid #e5e7eb", fontSize: 13, minHeight: 80, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  cancelBtn:     { flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  confirmBtn:    { flex: 1, padding: "12px 0", borderRadius: 14, border: "none", background: "#25D366", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
}
