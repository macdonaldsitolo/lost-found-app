import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import {
  FiAlertCircle, FiCheckCircle, FiTrash2, FiEdit2,
  FiShield, FiSmartphone, FiMonitor, FiTablet,
  FiPhone, FiPackage, FiShare2, FiX, FiCheck,
  FiMapPin, FiCalendar, FiCpu
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { getItemName, formatDate } from "../utils/itemHelpers"

// ── colour maps ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  active:   { bg: "#f0f7ff", color: "#007aff", label: "Active"   },
  resolved: { bg: "#f0fff4", color: "#1a7a3c", label: "Resolved" },
  pending:  { bg: "#fff8e1", color: "#b45309", label: "Pending"  },
  verified: { bg: "#f0fff4", color: "#1a7a3c", label: "Verified" },
  rejected: { bg: "#fff0f0", color: "#c0392b", label: "Rejected" },
}
const TYPE_COLORS = {
  lost:    { bg: "#fff0f0", color: "#c0392b", border: "#fcd0d0" },
  found:   { bg: "#f0fff4", color: "#1a7a3c", border: "#b7ebca" },
  missing: { bg: "#fff8e1", color: "#b45309", border: "#fde68a" },
  wanted:  { bg: "#eef2ff", color: "#0a4d8c", border: "#c7d7f9" },
}

// ── Resolve modal ──────────────────────────────────────────────────────────
function ResolveModal({ label, onConfirm, onCancel }) {
  const [comment, setComment] = useState("")
  const [saving,  setSaving]  = useState(false)
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, textAlign: "center" }}>
          Mark as Resolved?
        </p>
        <p style={{ color: "#6e6e73", fontSize: 13, marginBottom: 16, textAlign: "center", lineHeight: 1.5 }}>
          {label}
        </p>
        <textarea
          placeholder="How was it resolved? (optional)"
          value={comment} onChange={e => setComment(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 14, border: "1.5px solid #e5e7eb", fontSize: 13, minHeight: 80, resize: "vertical", outline: "none", marginBottom: 16, boxSizing: "border-box", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.cancelBtn} onClick={onCancel} disabled={saving}>Cancel</button>
          <button style={{ ...S.resolveConfirmBtn, opacity: saving ? 0.7 : 1 }}
            onClick={async () => { setSaving(true); await onConfirm(comment); setSaving(false) }}
            disabled={saving}>
            {saving ? "Saving…" : "Mark Resolved"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, textAlign: "center" }}>Delete this claim?</p>
        <p style={{ color: "#6e6e73", fontSize: 13, marginBottom: 24, textAlign: "center" }}>
          This will permanently remove the claim from the database.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={S.deleteConfirmBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Share modal ────────────────────────────────────────────────────────────
function ShareModal({ item, onClose }) {
  const url    = `${window.location.origin}/item/${item._id}`
  const tc     = TYPE_COLORS[item.type] || TYPE_COLORS.lost
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nativeShare = async () => {
    if (!navigator.share) return
    try { await navigator.share({ title: getItemName(item), text: `Check this Lost & Found report!`, url }) }
    catch {}
  }

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 320 }}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, textAlign: "center" }}>Share this Report</p>

        {/* Mini card preview */}
        <div style={{ border: `1.5px solid ${tc.border || "#e5e7eb"}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
          {item.images?.length > 0 ? (
            <img src={`${import.meta.env.VITE_API_URL}/uploads/${item.images[0]}`} alt=""
              style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ height: 60, background: tc.bg }} />
          )}
          <div style={{ padding: "10px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: tc.bg, color: tc.color }}>
              {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
            </span>
            <p style={{ fontWeight: 700, fontSize: 13, margin: "6px 0 2px", color: "#1c1c1e" }}>{getItemName(item)}</p>
            {item.location && <p style={{ fontSize: 11, color: "#6e6e73", margin: 0 }}>{item.location}</p>}
          </div>
        </div>

        {/* Link row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input readOnly value={url}
            style={{ flex: 1, padding: "9px 12px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 11, color: "#6e6e73", outline: "none", background: "#f9f9f9" }}
          />
          <button onClick={copy} style={{ padding: "9px 14px", borderRadius: 12, border: "none", background: copied ? "#25D366" : "#0a4d8c", color: "white", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "0.2s", whiteSpace: "nowrap" }}>
            {copied ? <FiCheck size={14} /> : "Copy"}
          </button>
        </div>

        {navigator.share && (
          <button onClick={nativeShare} style={{ width: "100%", padding: "11px 0", borderRadius: 13, border: "none", background: "#f2f3f7", color: "#0a4d8c", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <FiShare2 size={15} /> Share via…
          </button>
        )}

        <button onClick={onClose} style={{ width: "100%", padding: "11px 0", borderRadius: 13, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ── Edit claim inline modal ────────────────────────────────────────────────
function EditClaimModal({ claim, onSave, onCancel }) {
  const [phone1,  setPhone1]  = useState(claim.phone1  || "")
  const [phone2,  setPhone2]  = useState(claim.phone2  || "")
  const [color,   setColor]   = useState(claim.color   || "")
  const [storage, setStorage] = useState(claim.storage || "")
  const [specs,   setSpecs]   = useState(claim.specs   || "")
  const [saving,  setSaving]  = useState(false)

  const save = async () => {
    setSaving(true)
    await onSave({ phone1, phone2, color, storage, specs })
    setSaving(false)
  }

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 360 }}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Edit Claim</p>

        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Primary phone *</p>
        <input value={phone1} onChange={e => setPhone1(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />

        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Second phone</p>
        <input value={phone2} onChange={e => setPhone2(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Color</p>
            <input value={color} onChange={e => setColor(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Storage</p>
            <input value={storage} onChange={e => setStorage(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Additional specs</p>
        <textarea value={specs} onChange={e => setSpecs(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", minHeight: 70, resize: "vertical", marginBottom: 16, boxSizing: "border-box", fontFamily: "inherit" }} />

        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.cancelBtn} onClick={onCancel} disabled={saving}>Cancel</button>
          <button style={{ ...S.resolveConfirmBtn, opacity: saving ? 0.7 : 1 }}
            onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
export default function MyPosts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [items,       setItems]       = useState([])
  const [claims,      setClaims]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState(location.state?.tab || "items")

  // modal states
  const [resolveTarget, setResolveTarget] = useState(null)   // { kind: "item"|"claim", data }
  const [deleteTarget,  setDeleteTarget]  = useState(null)   // claim to delete
  const [shareTarget,   setShareTarget]   = useState(null)   // item to share
  const [editClaim,     setEditClaim]     = useState(null)   // claim to edit

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${import.meta.env.VITE_API_URL}/api/items/mine`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/claims/mine`),
    ]).then(([ir, cr]) => {
      if (ir.status === "fulfilled") setItems(ir.value.data)
      if (cr.status === "fulfilled") setClaims(cr.value.data)
    }).finally(() => setLoading(false))
  }, [])

  // ── item resolve ──────────────────────────────────────────────────────
  const handleItemResolve = async (comment) => {
    const item = resolveTarget.data
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/items/${item._id}/resolve`, { resolveComment: comment })
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, status: "resolved", resolveComment: comment } : i))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
    setResolveTarget(null)
  }

  // ── claim resolve ─────────────────────────────────────────────────────
  const handleClaimResolve = async (comment) => {
    const claim = resolveTarget.data
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/claims/${claim._id}/resolve`, { resolveComment: comment })
      setClaims(prev => prev.map(c => c._id === claim._id ? { ...c, status: "resolved", resolveComment: comment } : c))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
    setResolveTarget(null)
  }

  // ── claim delete ──────────────────────────────────────────────────────
  const handleClaimDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/claims/${deleteTarget._id}`)
      setClaims(prev => prev.filter(c => c._id !== deleteTarget._id))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
    setDeleteTarget(null)
  }

  // ── claim edit save ───────────────────────────────────────────────────
  const handleClaimEditSave = async (fields) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/claims/${editClaim._id}`, fields)
      setClaims(prev => prev.map(c => c._id === editClaim._id ? res.data.claim : c))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
    setEditClaim(null)
  }

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?"

  return (
    <div style={S.screen}>
      <div style={S.container}>

        {/* Profile */}
        <div style={S.profileCard}>
          {user?.avatar
            ? <img src={user.avatar} alt="" style={S.avatar} />
            : <div style={S.avatarInitials}>{initials}</div>}
          <div>
            <p style={S.profileName}>{user?.firstName} {user?.lastName}</p>
            <p style={S.profileEmail}>{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={{ ...S.tab, ...(tab === "items"  ? S.tabActive : {}) }} onClick={() => setTab("items")}>
            <FiPackage size={15} /> Reports ({items.length})
          </button>
          <button style={{ ...S.tab, ...(tab === "claims" ? S.tabActive : {}) }} onClick={() => setTab("claims")}>
            <FiShield size={15} /> Claims ({claims.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={S.spinner} /><p>Loading…</p>
          </div>

        ) : tab === "items" ? (
          items.length === 0 ? (
            <div style={S.empty}>
              <FiAlertCircle size={36} color="#cbd5e1" /><p>No reports yet</p>
            </div>
          ) : (
            <div style={S.list}>
              {items.map(item => {
                const tc = TYPE_COLORS[item.type] || TYPE_COLORS.lost
                const sc = STATUS_COLORS[item.status] || STATUS_COLORS.active
                return (
                  <div style={S.card} key={item._id}
                    onClick={() => navigate(`/item/${item._id}`)}>
                    {item.images?.length > 0
                      ? <img src={`${import.meta.env.VITE_API_URL}/uploads/${item.images[0]}`} alt="" style={S.cardImg} />
                      : <div style={S.cardImgPlaceholder} />}

                    <div style={S.cardBody}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ ...S.badge, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                          {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                        </span>
                        <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>

                      <p style={S.cardTitle}>{getItemName(item)}</p>
                      <p style={S.cardMeta}>{item.category}</p>
                      {item.location && <p style={S.cardMeta}><FiMapPin size={11} style={{marginRight:4,flexShrink:0}} />{item.location}</p>}

                      {item.status === "resolved" && item.resolveComment && (
                        <p style={{ fontSize: 12, color: "#1a7a3c", marginTop: 6, background: "#f0fff4", padding: "6px 10px", borderRadius: 10 }}>
                          ✓ {item.resolveComment}
                        </p>
                      )}

                      <div style={S.actions} onClick={e => e.stopPropagation()}>
                        {/* Edit — only if active */}
                        {item.status !== "resolved" && (
                          <button style={S.editBtn}
                            onClick={() => navigate(`/edit-item/${item._id}`)}>
                            <FiEdit2 size={13} /> Edit
                          </button>
                        )}
                        {/* Resolve */}
                        {item.status !== "resolved" && (
                          <button style={S.resolveBtn}
                            onClick={() => setResolveTarget({ kind: "item", data: item })}>
                            <FiCheckCircle size={13} /> Resolve
                          </button>
                        )}
                        {/* Share */}
                        <button style={S.shareBtn}
                          onClick={() => setShareTarget(item)}>
                          <FiShare2 size={13} /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )

        ) : (
          claims.length === 0 ? (
            <div style={S.empty}>
              <FiShield size={36} color="#cbd5e1" /><p>No claims yet</p>
            </div>
          ) : (
            <div style={S.list}>
              {claims.map(claim => {
                const sc = STATUS_COLORS[claim.status] || STATUS_COLORS.active
                const CatIcon = claim.category === "Laptop" ? FiMonitor
                  : claim.category === "Tablet" ? FiTablet : FiSmartphone
                return (
                  <div style={S.card} key={claim._id}>
                    {claim.images?.length > 0
                      ? <img src={`${import.meta.env.VITE_API_URL}/uploads/${claim.images[0]}`} alt="" style={S.cardImg} />
                      : <div style={{ ...S.cardImgPlaceholder, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CatIcon size={28} color="#d1d5db" />
                        </div>}

                    <div style={S.cardBody}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <span style={{ ...S.badge, background: "#f0f7ff", color: "#007aff", border: "1px solid #bdd9fc" }}>
                          {claim.category}
                        </span>
                        <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>

                      <p style={S.cardTitle}>
                        {claim.deviceName || [claim.brand, claim.model].filter(Boolean).join(" ") || claim.category}
                      </p>
                      {claim.color   && <p style={S.cardMeta}><FiCpu size={11} style={{marginRight:4,flexShrink:0}} />{claim.color}{claim.storage ? ` · ${claim.storage}` : ""}</p>}
                      {claim.imei    && <p style={S.cardMeta}>IMEI: {claim.imei.slice(0,6)}••••••••</p>}
                      {claim.serial  && <p style={S.cardMeta}>S/N: {claim.serial.slice(0,5)}•••••</p>}
                      {claim.phone1  && (
                        <a href={`tel:${claim.phone1}`} style={S.phoneLink}>
                          <FiPhone size={12} /> {claim.phone1}
                        </a>
                      )}
                      <p style={S.cardMeta}>Submitted {formatDate(claim.createdAt)}</p>

                      {claim.status === "resolved" && claim.resolveComment && (
                        <p style={{ fontSize: 12, color: "#1a7a3c", marginTop: 6, background: "#f0fff4", padding: "6px 10px", borderRadius: 10 }}>
                          ✓ {claim.resolveComment}
                        </p>
                      )}

                      <div style={S.actions}>
                        {claim.status !== "resolved" && (
                          <>
                            <button style={S.editBtn}
                              onClick={() => setEditClaim(claim)}>
                              <FiEdit2 size={13} /> Edit
                            </button>
                            <button style={S.resolveBtn}
                              onClick={() => setResolveTarget({ kind: "claim", data: claim })}>
                              <FiCheckCircle size={13} /> Resolve
                            </button>
                          </>
                        )}
                        <button style={S.deleteBtn}
                          onClick={() => setDeleteTarget(claim)}>
                          <FiTrash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* Resolve modal */}
      {resolveTarget && (
        <ResolveModal
          label={resolveTarget.kind === "item"
            ? "This means the item was found or the situation was resolved."
            : "This means your gadget ownership claim is settled."}
          onConfirm={resolveTarget.kind === "item" ? handleItemResolve : handleClaimResolve}
          onCancel={() => setResolveTarget(null)}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          onConfirm={handleClaimDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Share modal */}
      {shareTarget && (
        <ShareModal item={shareTarget} onClose={() => setShareTarget(null)} />
      )}

      {/* Edit claim modal */}
      {editClaim && (
        <EditClaimModal
          claim={editClaim}
          onSave={handleClaimEditSave}
          onCancel={() => setEditClaim(null)}
        />
      )}
    </div>
  )
}

const S = {
  screen:            { backgroundColor: "#f2f2f7", minHeight: "100vh" },
  container:         { maxWidth: 600, margin: "0 auto", padding: "20px 18px 80px" },
  profileCard:       { background: "white", borderRadius: 22, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
  avatar:            { width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  avatarInitials:    { width: 48, height: 48, borderRadius: "50%", background: "#0a4d8c", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, flexShrink: 0 },
  profileName:       { fontWeight: 700, fontSize: 15, margin: 0, color: "#1c1c1e" },
  profileEmail:      { fontSize: 12, color: "#6e6e73", margin: "2px 0 0" },
  tabs:              { display: "flex", gap: 10, marginBottom: 20 },
  tab:               { flex: 1, padding: "11px 0", borderRadius: 14, border: "none", background: "white", color: "#6e6e73", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 3px 8px rgba(0,0,0,0.05)" },
  tabActive:         { background: "#0a4d8c", color: "white" },
  list:              { display: "flex", flexDirection: "column", gap: 12 },
  card:              { background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", display: "flex", cursor: "pointer" },
  cardImg:           { width: 100, height: 100, objectFit: "cover", flexShrink: 0 },
  cardImgPlaceholder:{ width: 100, height: 100, background: "#f2f3f7", flexShrink: 0 },
  cardBody:          { flex: 1, padding: "11px 13px" },
  badge:             { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 },
  cardTitle:         { fontWeight: 600, fontSize: 14, color: "#1c1c1e", margin: "0 0 2px" },
  cardMeta:          { fontSize: 11, color: "#6e6e73", margin: "2px 0", display: "flex", alignItems: "center" },
  phoneLink:         { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#0a4d8c", textDecoration: "none", margin: "3px 0" },
  actions:           { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" },
  editBtn:           { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 10, border: "none", background: "#f0f7ff", color: "#007aff", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  resolveBtn:        { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 10, border: "none", background: "#f0fff4", color: "#1a7a3c", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  shareBtn:          { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 10, border: "none", background: "#eef2ff", color: "#0a4d8c", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  deleteBtn:         { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 10, border: "none", background: "#fff0f0", color: "#c0392b", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  empty:             { textAlign: "center", padding: "60px 20px", color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  spinner:           { width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #0a4d8c", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 14px" },
  overlay:           { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" },
  modal:             { background: "white", borderRadius: 22, padding: "22px", width: "100%", maxWidth: 340, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  cancelBtn:         { flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  resolveConfirmBtn: { flex: 1, padding: "12px 0", borderRadius: 14, border: "none", background: "#25D366", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  deleteConfirmBtn:  { flex: 1, padding: "12px 0", borderRadius: 14, border: "none", background: "#e53e3e", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
}
