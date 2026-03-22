import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FiBarChart2, FiUsers, FiAlertCircle, FiShield,
  FiLogOut, FiTrash2, FiCheck, FiX, FiUpload,
  FiPlus, FiSearch, FiCheckCircle, FiMenu, FiEdit2
} from "react-icons/fi"
import { useAdminAuth } from "../context/AdminAuthContext"

const API = "${import.meta.env.VITE_API_URL}/api/admin"
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"

// ── tiny bar chart (pure SVG, no lib needed) ──────────────────────────────
function MiniBarChart({ data }) {
  if (!data?.length) return <p style={{ color: "#94a3b8", fontSize: 13 }}>No data yet</p>
  const max   = Math.max(...data.map(d => d.count), 1)
  const W     = 560
  const H     = 120
  const barW  = Math.floor((W - 16) / data.length) - 2
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} style={{ display: "block" }}>
      {data.map((d, i) => {
        const h   = Math.max(4, Math.round((d.count / max) * H))
        const x   = 8 + i * (barW + 2)
        const y   = H - h
        return (
          <g key={d._id}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill="#3b82f6" opacity={0.8} />
            {i % Math.ceil(data.length / 7) === 0 && (
              <text x={x + barW / 2} y={H + 18} textAnchor="middle"
                fontSize={9} fill="#94a3b8">{d._id?.slice(5)}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, color = "#3b82f6", sub }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color }}>{value ?? "—"}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{sub}</p>}
    </div>
  )
}

// ── type / status badge ───────────────────────────────────────────────────
const TYPE_C = {
  lost:    "#c0392b", found: "#1a7a3c", missing: "#b45309",
  wanted:  "#0a4d8c", resolved: "#1a7a3c", active: "#007aff",
  pending: "#b45309", verified: "#1a7a3c", rejected: "#c0392b"
}
function Badge({ label }) {
  const c = TYPE_C[label?.toLowerCase()] || "#64748b"
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      background: c + "18", color: c, border: `1px solid ${c}33` }}>
      {label}
    </span>
  )
}

// ── confirm modal ─────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 20, padding: "28px 24px", width: 300, textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Are you sure?</p>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>{msg}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: 12, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "white", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 14, border: "none", background: "#e53e3e", color: "white", fontWeight: 600, cursor: "pointer" }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { admin, adminToken, adminLogout } = useAdminAuth()
  const navigate = useNavigate()

  const [tab,     setTab]     = useState("stats")
  const [sidebar, setSidebar] = useState(true)
  const [confirm, setConfirm] = useState(null)   // { msg, onConfirm }

  const headers = { Authorization: `Bearer ${adminToken()}` }

  // ── Stats ──────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null)
  const loadStats = async () => {
    const r = await axios.get(`${API}/stats`, { headers })
    setStats(r.data)
  }
  useEffect(() => { if (tab === "stats") loadStats() }, [tab])

  // ── Users ──────────────────────────────────────────────────────────────
  const [users,       setUsers]       = useState([])
  const [userSearch,  setUserSearch]  = useState("")
  const [userPage,    setUserPage]    = useState(1)
  const [userTotal,   setUserTotal]   = useState(0)

  const loadUsers = async (search = userSearch, page = userPage) => {
    const r = await axios.get(`${API}/users`, { headers, params: { search, page, limit: 15 } })
    setUsers(r.data.users); setUserTotal(r.data.total)
  }
  useEffect(() => { if (tab === "users") loadUsers() }, [tab, userPage])

  // ── Items ──────────────────────────────────────────────────────────────
  const [items,      setItems]      = useState([])
  const [itemSearch, setItemSearch] = useState("")
  const [itemType,   setItemType]   = useState("")
  const [itemStatus, setItemStatus] = useState("")
  const [itemPage,   setItemPage]   = useState(1)
  const [itemTotal,  setItemTotal]  = useState(0)
  const [showForm,   setShowForm]   = useState(false)
  const [bulkFile,   setBulkFile]   = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [newItem,    setNewItem]    = useState({ type: "lost", category: "Other", phone1: "", location: "", description: "", name: "" })

  const loadItems = async (search = itemSearch, type = itemType, status = itemStatus, page = itemPage) => {
    const r = await axios.get(`${API}/items`, { headers, params: { search, type, status, page, limit: 15 } })
    setItems(r.data.items); setItemTotal(r.data.total)
  }
  useEffect(() => { if (tab === "items") loadItems() }, [tab, itemPage])

  // ── Claims ─────────────────────────────────────────────────────────────
  const [claims,      setClaims]      = useState([])
  const [claimStatus, setClaimStatus] = useState("")
  const [claimPage,   setClaimPage]   = useState(1)
  const [claimTotal,  setClaimTotal]  = useState(0)

  const loadClaims = async (status = claimStatus, page = claimPage) => {
    const r = await axios.get(`${API}/claims`, { headers, params: { status, page, limit: 15 } })
    setClaims(r.data.claims); setClaimTotal(r.data.total)
  }
  useEffect(() => { if (tab === "claims") loadClaims() }, [tab, claimPage])

  // ── actions ────────────────────────────────────────────────────────────
  const ask = (msg, fn) => setConfirm({ msg, onConfirm: () => { fn(); setConfirm(null) } })

  const deleteUser = async (id) => {
    await axios.delete(`${API}/users/${id}`, { headers })
    loadUsers()
  }
  const deleteItem = async (id) => {
    await axios.delete(`${API}/items/${id}`, { headers })
    loadItems()
  }
  const resolveItem = async (id) => {
    await axios.patch(`${API}/items/${id}/resolve`, {}, { headers })
    loadItems()
  }
  const updateClaimStatus = async (id, status) => {
    await axios.patch(`${API}/claims/${id}/status`, { status }, { headers })
    loadClaims()
  }
  const deleteClaim = async (id) => {
    await axios.delete(`${API}/claims/${id}`, { headers })
    loadClaims()
  }

  const submitNewItem = async () => {
    if (!newItem.phone1) { alert("phone1 is required"); return }
    await axios.post(`${API}/items`, newItem, { headers })
    setShowForm(false)
    setNewItem({ type: "lost", category: "Other", phone1: "", location: "", description: "", name: "" })
    loadItems()
  }

  const submitBulk = async () => {
    if (!bulkFile) { alert("Choose an Excel file first"); return }
    const fd = new FormData()
    fd.append("file", bulkFile)
    const r = await axios.post(`${API}/items/bulk`, fd, { headers })
    setBulkResult(r.data)
    loadItems()
  }

  // ── sidebar nav items ──────────────────────────────────────────────────
  const NAV = [
    { id: "stats",  icon: <FiBarChart2  size={18} />, label: "Stats"   },
    { id: "items",  icon: <FiAlertCircle size={18} />, label: "Reports" },
    { id: "claims", icon: <FiShield     size={18} />, label: "Claims"  },
    { id: "users",  icon: <FiUsers      size={18} />, label: "Users"   },
  ]

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>

      {/* Sidebar */}
      <aside style={{ ...S.sidebar, width: sidebar ? 220 : 64 }}>
        <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <button style={S.menuBtn} onClick={() => setSidebar(p => !p)}><FiMenu size={18} /></button>
          {sidebar && <span style={{ fontWeight: 700, color: "white", fontSize: 15 }}>Admin</span>}
        </div>

        {NAV.map(n => (
          <button key={n.id}
            style={{ ...S.navItem, ...(tab === n.id ? S.navActive : {}) }}
            onClick={() => setTab(n.id)}
          >
            {n.icon}
            {sidebar && <span style={{ marginLeft: 10 }}>{n.label}</span>}
          </button>
        ))}

        <div style={{ marginTop: "auto", borderTop: "1px solid #1e293b", paddingTop: 12 }}>
          {sidebar && <p style={{ fontSize: 12, color: "#475569", padding: "0 16px 8px" }}>{admin?.username}</p>}
          <button style={S.navItem} onClick={() => { adminLogout(); navigate("/admin/login") }}>
            <FiLogOut size={18} />
            {sidebar && <span style={{ marginLeft: 10 }}>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>

        {/* ── STATS ── */}
        {tab === "stats" && (
          <div>
            <h2 style={S.pageTitle}>Dashboard</h2>
            {!stats ? <p style={{ color: "#94a3b8" }}>Loading…</p> : (
              <>
                <div style={S.statsGrid}>
                  <StatCard label="Total Users"    value={stats.totalUsers}    color="#3b82f6" />
                  <StatCard label="Total Reports"  value={stats.totalItems}    color="#8b5cf6" />
                  <StatCard label="Total Claims"   value={stats.totalClaims}   color="#f59e0b" />
                  <StatCard label="Resolved"       value={stats.resolvedCount} color="#10b981" sub={`of ${stats.totalItems} reports`} />
                  <StatCard label="Lost"           value={stats.lostCount}     color="#ef4444" />
                  <StatCard label="Found"          value={stats.foundCount}    color="#10b981" />
                  <StatCard label="Missing"        value={stats.missingCount}  color="#f59e0b" />
                  <StatCard label="Pending Claims" value={stats.pendingClaims} color="#f59e0b" />
                </div>

                <div style={S.section}>
                  <h3 style={S.sectionTitle}>Reports — last 14 days</h3>
                  <MiniBarChart data={stats.itemsOverTime} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                  <div style={S.section}>
                    <h3 style={S.sectionTitle}>Recent reports</h3>
                    {stats.recentItems.map(i => (
                      <div key={i._id} style={S.recentRow}>
                        <Badge label={i.type} />
                        <span style={{ fontSize: 13, color: "#334155" }}>{i.category}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>{fmt(i.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.section}>
                    <h3 style={S.sectionTitle}>Recent users</h3>
                    {stats.recentUsers.map(u => (
                      <div key={u._id} style={S.recentRow}>
                        <div style={S.userDot}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{u.firstName} {u.lastName}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{u.email}</p>
                        </div>
                        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>{fmt(u.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === "items" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={S.pageTitle}>Reports ({itemTotal})</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.addBtn} onClick={() => setShowForm(p => !p)}>
                  <FiPlus size={15} /> New Report
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={S.searchWrap}>
                <FiSearch style={S.searchIcon} size={15} />
                <input style={S.searchInput} placeholder="Search category or location…"
                  value={itemSearch} onChange={e => setItemSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loadItems(itemSearch)} />
              </div>
              <select style={S.select} value={itemType} onChange={e => { setItemType(e.target.value); loadItems(itemSearch, e.target.value) }}>
                <option value="">All types</option>
                {["lost","found","missing","wanted"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select style={S.select} value={itemStatus} onChange={e => { setItemStatus(e.target.value); loadItems(itemSearch, itemType, e.target.value) }}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* New item form */}
            {showForm && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>New Report</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10 }}>
                  {[
                    ["type", "Type", "select", ["lost","found","missing","wanted"]],
                    ["category", "Category", "select", ["Phone","Laptop","Wallet","ID Card","Person","Other"]],
                    ["name", "Reporter name", "text"],
                    ["phone1", "Phone 1 *", "tel"],
                    ["location", "Location", "text"],
                    ["description", "Description", "text"],
                  ].map(([key, label, type, opts]) => (
                    <div key={key}>
                      <label style={S.label}>{label}</label>
                      {type === "select" ? (
                        <select style={S.formInput} value={newItem[key]}
                          onChange={e => setNewItem(p => ({ ...p, [key]: e.target.value }))}>
                          {opts.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                        </select>
                      ) : (
                        <input style={S.formInput} type={type} value={newItem[key]}
                          onChange={e => setNewItem(p => ({ ...p, [key]: e.target.value }))} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button style={S.addBtn} onClick={submitNewItem}><FiCheck size={14} /> Save</button>
                  <button style={S.cancelBtn} onClick={() => setShowForm(false)}><FiX size={14} /> Cancel</button>
                </div>
              </div>
            )}

            {/* Bulk Excel upload */}
            <div style={{ ...S.section, marginBottom: 20 }}>
              <h3 style={S.sectionTitle}><FiUpload size={14} style={{ marginRight: 6 }} />Bulk Upload (Excel)</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                Columns: <code>type, category, location, date, phone1, phone2, name, description, reward</code>
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input type="file" accept=".xlsx,.xls" style={{ fontSize: 13 }}
                  onChange={e => { setBulkFile(e.target.files[0]); setBulkResult(null) }} />
                <button style={S.addBtn} onClick={submitBulk}><FiUpload size={14} /> Import</button>
              </div>
              {bulkResult && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "#f0fff4", borderRadius: 12, fontSize: 13, color: "#1a7a3c" }}>
                  ✅ {bulkResult.message}
                  {bulkResult.errors?.length > 0 && (
                    <div style={{ marginTop: 6, color: "#c0392b" }}>
                      {bulkResult.errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Table */}
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    {["Type","Category","Location","Reporter","Phone","Status","Date","Actions"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} style={S.tr}>
                      <td style={S.td}><Badge label={item.type} /></td>
                      <td style={S.td}>{item.category}</td>
                      <td style={S.td}>{item.location || "—"}</td>
                      <td style={S.td} title={item.createdBy?.email}>
                        {item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : item.name || "—"}
                      </td>
                      <td style={S.td}>{item.phone1}</td>
                      <td style={S.td}><Badge label={item.status || "active"} /></td>
                      <td style={S.td}>{fmt(item.createdAt)}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {item.status !== "resolved" && (
                            <button title="Mark resolved" style={S.iconActionBtn("#10b981")}
                              onClick={() => ask("Mark this item as resolved?", () => resolveItem(item._id))}>
                              <FiCheckCircle size={14} />
                            </button>
                          )}
                          <button title="Delete" style={S.iconActionBtn("#ef4444")}
                            onClick={() => ask("Delete this report permanently?", () => deleteItem(item._id))}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={itemPage} total={itemTotal} limit={15} onPage={setItemPage} />
          </div>
        )}

        {/* ── CLAIMS ── */}
        {tab === "claims" && (
          <div>
            <h2 style={S.pageTitle}>Claims ({claimTotal})</h2>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <select style={S.select} value={claimStatus}
                onChange={e => { setClaimStatus(e.target.value); loadClaims(e.target.value) }}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    {["Device","Category","IMEI / S/N","Claimant","Phone","Status","Submitted","Actions"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map(c => (
                    <tr key={c._id} style={S.tr}>
                      <td style={S.td}>{c.deviceName || [c.brand, c.model].filter(Boolean).join(" ") || "—"}</td>
                      <td style={S.td}>{c.category}</td>
                      <td style={S.td}>
                        {c.imei ? `IMEI: ${c.imei}` : c.serial ? `S/N: ${c.serial}` : "—"}
                      </td>
                      <td style={S.td} title={c.createdBy?.email}>
                        {c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}` : c.claimantName || "—"}
                      </td>
                      <td style={S.td}>{c.phone1}</td>
                      <td style={S.td}><Badge label={c.status} /></td>
                      <td style={S.td}>{fmt(c.createdAt)}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {c.status !== "verified" && (
                            <button title="Verify" style={S.iconActionBtn("#10b981")}
                              onClick={() => ask("Mark claim as Verified?", () => updateClaimStatus(c._id, "verified"))}>
                              <FiCheck size={14} />
                            </button>
                          )}
                          {c.status !== "rejected" && (
                            <button title="Reject" style={S.iconActionBtn("#f59e0b")}
                              onClick={() => ask("Mark claim as Rejected?", () => updateClaimStatus(c._id, "rejected"))}>
                              <FiX size={14} />
                            </button>
                          )}
                          <button title="Delete" style={S.iconActionBtn("#ef4444")}
                            onClick={() => ask("Delete this claim permanently?", () => deleteClaim(c._id))}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={claimPage} total={claimTotal} limit={15} onPage={setClaimPage} />
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <h2 style={S.pageTitle}>Users ({userTotal})</h2>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={S.searchWrap}>
                <FiSearch style={S.searchIcon} size={15} />
                <input style={S.searchInput} placeholder="Search by name or email…"
                  value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loadUsers(userSearch)} />
              </div>
              <button style={S.addBtn} onClick={() => loadUsers(userSearch)}>
                <FiSearch size={14} /> Search
              </button>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    {["Name","Email","Phone","Verified","Joined","Actions"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={S.tr}>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {u.avatar
                            ? <img src={u.avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                            : <div style={S.userDot}>{u.firstName?.[0]}{u.lastName?.[0]}</div>}
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>{u.phone || "—"}</td>
                      <td style={S.td}>
                        {u.isVerified
                          ? <span style={{ color: "#10b981", fontSize: 13 }}>✓ Yes</span>
                          : <span style={{ color: "#f59e0b", fontSize: 13 }}>Pending</span>}
                      </td>
                      <td style={S.td}>{fmt(u.createdAt)}</td>
                      <td style={S.td}>
                        <button title="Ban / Delete user" style={S.iconActionBtn("#ef4444")}
                          onClick={() => ask(`Delete user "${u.firstName} ${u.lastName}" and all their posts?`, () => deleteUser(u._id))}>
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={userPage} total={userTotal} limit={15} onPage={setUserPage} />
          </div>
        )}

      </main>

      {confirm && (
        <ConfirmModal
          msg={confirm.msg}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

// ── pagination ──────────────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPage }) {
  const pages = Math.ceil(total / limit)
  if (pages <= 1) return null
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
      <button style={S.pageBtn} disabled={page === 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
      <span style={{ fontSize: 13, color: "#64748b" }}>Page {page} of {pages}</span>
      <button style={S.pageBtn} disabled={page === pages} onClick={() => onPage(page + 1)}>Next ›</button>
    </div>
  )
}

// ── styles ──────────────────────────────────────────────────────────────────
const S = {
  root:          { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  sidebar:       { background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.2s", overflow: "hidden" },
  menuBtn:       { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 },
  navItem:       { display: "flex", alignItems: "center", width: "100%", padding: "13px 20px", background: "none", border: "none", color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left", whiteSpace: "nowrap", transition: "background 0.15s" },
  navActive:     { background: "#1e293b", color: "white" },
  main:          { flex: 1, padding: "28px 32px", overflowY: "auto" },
  pageTitle:     { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" },
  statsGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 },
  section:       { background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sectionTitle:  { fontSize: 14, fontWeight: 700, color: "#334155", margin: "0 0 14px", display: "flex", alignItems: "center" },
  recentRow:     { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" },
  userDot:       { width: 28, height: 28, borderRadius: "50%", background: "#3b82f6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  tableWrap:     { overflowX: "auto", background: "white", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table:         { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead:         { background: "#f8fafc" },
  th:            { padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" },
  tr:            { borderTop: "1px solid #f1f5f9" },
  td:            { padding: "12px 14px", color: "#334155", verticalAlign: "middle" },
  searchWrap:    { position: "relative", flex: 1, maxWidth: 340 },
  searchIcon:    { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" },
  searchInput:   { width: "100%", padding: "10px 12px 10px 34px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", margin: 0 },
  select:        { padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, background: "white", outline: "none", cursor: "pointer" },
  addBtn:        { display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  cancelBtn:     { display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  iconActionBtn: (c) => ({ background: c + "18", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: c, display: "flex", alignItems: "center" }),
  label:         { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 },
  formInput:     { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", margin: 0, background: "white" },
  pageBtn:       { padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" },
}
