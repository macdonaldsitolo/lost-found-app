import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import {
  FiAlertCircle, FiCheckCircle, FiTrash2,
  FiShield, FiSmartphone, FiMonitor, FiTablet, FiPhone,
  FiPackage
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const formatDate = (d) => {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const TYPE_COLORS = {
  lost:    { bg: "#fff0f0", color: "#c0392b", border: "#fcd0d0" },
  found:   { bg: "#f0fff4", color: "#1a7a3c", border: "#b7ebca" },
  missing: { bg: "#fff8e1", color: "#b45309", border: "#fde68a" },
  wanted:  { bg: "#eef2ff", color: "#0a4d8c", border: "#c7d7f9" },
}
const STATUS_COLORS = {
  active:   { bg: "#f0f7ff", color: "#007aff", label: "Active"   },
  resolved: { bg: "#f0fff4", color: "#1a7a3c", label: "Resolved" },
  pending:  { bg: "#fff8e1", color: "#b45309", label: "Pending"  },
  verified: { bg: "#f0fff4", color: "#1a7a3c", label: "Verified" },
  rejected: { bg: "#fff0f0", color: "#c0392b", label: "Rejected" },
}

export default function MyPosts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Allow Navbar to deep-link directly to a tab
  const initialTab = location.state?.tab || "items"

  const [items,   setItems]   = useState([])
  const [claims,  setClaims]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState(initialTab)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      axios.get("http://localhost:5000/api/items/mine"),
      axios.get("http://localhost:5000/api/claims/mine"),
    ]).then(([ir, cr]) => {
      if (ir.status === "fulfilled") setItems(ir.value.data)
      if (cr.status === "fulfilled") setClaims(cr.value.data)
    }).finally(() => setLoading(false))
  }, [])

  const resolveItem = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/items/${id}/resolve`)
      setItems(prev => prev.map(i => i._id === id ? { ...i, status: "resolved" } : i))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
  }

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
    finally { setConfirm(null) }
  }

  const deleteClaim = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/claims/${id}`)
      setClaims(prev => prev.filter(c => c._id !== id))
    } catch (err) { alert(err?.response?.data?.message || "Error") }
    finally { setConfirm(null) }
  }

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?"

  return (
    <div style={S.screen}>
      <div style={S.container}>

        {/* Profile header */}
        <div style={S.profileCard}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={S.avatar} />
          ) : (
            <div style={S.avatarInitials}>{initials}</div>
          )}
          <div style={S.profileInfo}>
            <p style={S.profileName}>{user?.firstName} {user?.lastName}</p>
            <p style={S.profileEmail}>{user?.email}</p>
            {user?.phone && <p style={S.profileEmail}>{user.phone}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={{ ...S.tab, ...(tab === "items"  ? S.tabActive : {}) }} onClick={() => setTab("items")}>
            <FiPackage size={15} /> My Reports ({items.length})
          </button>
          <button style={{ ...S.tab, ...(tab === "claims" ? S.tabActive : {}) }} onClick={() => setTab("claims")}>
            <FiShield size={15} /> My Claims ({claims.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={S.spinner} /><p>Loading…</p>
          </div>
        ) : tab === "items" ? (
          items.length === 0 ? (
            <div style={S.empty}>
              <FiAlertCircle size={36} color="#cbd5e1" />
              <p>No reports yet</p>
              <span>Items you report will appear here.</span>
            </div>
          ) : (
            <div style={S.list}>
              {items.map(item => {
                const tc = TYPE_COLORS[item.type] || TYPE_COLORS.lost
                const sc = STATUS_COLORS[item.status] || STATUS_COLORS.active
                return (
                  <div style={S.card} key={item._id}>
                    {item.images?.length > 0
                      ? <img src={`http://localhost:5000/uploads/${item.images[0]}`} alt="" style={S.cardImg} />
                      : <div style={S.cardImgPlaceholder} />}
                    <div style={S.cardBody}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ ...S.badge, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                          {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                        </span>
                        <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <p style={S.cardTitle}>{item.category}</p>
                      {item.location && <p style={S.cardMeta}>📍 {item.location}</p>}
                      {item.date     && <p style={S.cardMeta}>📅 {formatDate(item.date)}</p>}
                      {item.phone1   && (
                        <a href={`tel:${item.phone1}`} style={S.phoneLink}>
                          <FiPhone size={12} /> {item.phone1}
                        </a>
                      )}
                      <div style={S.actions}>
                        {item.status !== "resolved" && (
                          <button style={S.resolveBtn} onClick={() => resolveItem(item._id)}>
                            <FiCheckCircle size={14} /> Mark resolved
                          </button>
                        )}
                        <button style={S.deleteBtn} onClick={() => setConfirm({ type: "item", id: item._id })}>
                          <FiTrash2 size={14} /> Delete
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
              <FiShield size={36} color="#cbd5e1" />
              <p>No claims yet</p>
              <span>Gadget claims you submit will appear here.</span>
            </div>
          ) : (
            <div style={S.list}>
              {claims.map(claim => {
                const sc = STATUS_COLORS[claim.status] || STATUS_COLORS.pending
                const CatIcon = claim.category === "Laptop" ? FiMonitor
                  : claim.category === "Tablet" ? FiTablet : FiSmartphone
                return (
                  <div style={S.card} key={claim._id}>
                    {claim.images?.length > 0
                      ? <img src={`http://localhost:5000/uploads/${claim.images[0]}`} alt="" style={S.cardImg} />
                      : <div style={{ ...S.cardImgPlaceholder, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CatIcon size={32} color="#d1d5db" />
                        </div>}
                    <div style={S.cardBody}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <span style={{ ...S.badge, background: "#f0f7ff", color: "#007aff", border: "1px solid #bdd9fc" }}>
                          <CatIcon size={11} style={{ marginRight: 3 }} />{claim.category}
                        </span>
                        <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <p style={S.cardTitle}>
                        {claim.deviceName || [claim.brand, claim.model].filter(Boolean).join(" ") || claim.category}
                      </p>
                      {claim.color  && <p style={S.cardMeta}>🎨 {claim.color}{claim.storage ? ` · ${claim.storage}` : ""}</p>}
                      {claim.imei   && <p style={S.cardMeta}>IMEI: {claim.imei.slice(0,6)}••••••••</p>}
                      {claim.serial && <p style={S.cardMeta}>S/N: {claim.serial.slice(0,5)}•••••</p>}
                      {claim.phone1 && (
                        <a href={`tel:${claim.phone1}`} style={S.phoneLink}>
                          <FiPhone size={12} /> {claim.phone1}
                        </a>
                      )}
                      <p style={S.cardMeta}>Submitted {formatDate(claim.createdAt)}</p>
                      <div style={S.actions}>
                        <button style={S.deleteBtn} onClick={() => setConfirm({ type: "claim", id: claim._id })}>
                          <FiTrash2 size={14} /> Delete
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

      {/* Delete confirm modal */}
      {confirm && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Delete this post?</p>
            <p style={{ color: "#6e6e73", fontSize: 14, marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={S.cancelBtn} onClick={() => setConfirm(null)}>Cancel</button>
              <button style={S.confirmDeleteBtn}
                onClick={() => confirm.type === "item" ? deleteItem(confirm.id) : deleteClaim(confirm.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  screen:            { backgroundColor: "#f2f2f7", minHeight: "100vh" },
  container:         { maxWidth: 600, margin: "0 auto", padding: "20px 18px 80px" },
  profileCard:       { background: "white", borderRadius: 22, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 20, boxShadow: "0 6px 15px rgba(0,0,0,0.07)" },
  avatar:            { width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  avatarInitials:    { width: 52, height: 52, borderRadius: "50%", background: "#0a4d8c", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 },
  profileInfo:       { flex: 1 },
  profileName:       { fontWeight: 700, fontSize: 16, margin: 0, color: "#1c1c1e" },
  profileEmail:      { fontSize: 13, color: "#6e6e73", margin: "2px 0 0" },
  tabs:              { display: "flex", gap: 10, marginBottom: 20 },
  tab:               { flex: 1, padding: "12px 0", borderRadius: 16, border: "none", background: "white", color: "#6e6e73", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" },
  tabActive:         { background: "#0a4d8c", color: "white" },
  list:              { display: "flex", flexDirection: "column", gap: 14 },
  card:              { background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 6px 14px rgba(0,0,0,0.07)", display: "flex" },
  cardImg:           { width: 110, height: 110, objectFit: "cover", flexShrink: 0 },
  cardImgPlaceholder:{ width: 110, height: 110, background: "#f2f3f7", flexShrink: 0 },
  cardBody:          { flex: 1, padding: "12px 14px" },
  badge:             { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  cardTitle:         { fontWeight: 600, fontSize: 15, color: "#1c1c1e", margin: "0 0 4px" },
  cardMeta:          { fontSize: 12, color: "#6e6e73", margin: "2px 0" },
  phoneLink:         { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#0a4d8c", textDecoration: "none", margin: "4px 0" },
  actions:           { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },
  resolveBtn:        { display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 12, border: "none", background: "#f0fff4", color: "#1a7a3c", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  deleteBtn:         { display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 12, border: "none", background: "#fff0f0", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  empty:             { textAlign: "center", padding: "60px 20px", color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  spinner:           { width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #0a4d8c", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 14px" },
  overlay:           { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:             { background: "white", borderRadius: 20, padding: "28px 24px", width: 280, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  cancelBtn:         { flex: 1, padding: "12px 0", borderRadius: 16, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  confirmDeleteBtn:  { flex: 1, padding: "12px 0", borderRadius: 16, border: "none", background: "#e53e3e", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
}
