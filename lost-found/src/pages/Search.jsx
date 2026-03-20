import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import {
  FiSearch, FiX, FiPhone, FiFilter, FiAlertCircle,
  FiSliders, FiShield, FiSmartphone, FiMonitor, FiTablet
} from "react-icons/fi"

const getExtra = (item) => {
  try {
    return typeof item.extraFields === "string"
      ? JSON.parse(item.extraFields)
      : item.extraFields || {}
  } catch { return {} }
}

const getItemName = (item) => {
  const extra = getExtra(item)
  const cat   = item.category?.toLowerCase()
  if (cat === "person")  { if (extra.personName && extra.age) return `${extra.personName}, ${extra.age}`; if (extra.personName) return extra.personName }
  if (cat === "phone")   { if (extra.phoneName && extra.model) return `${extra.phoneName} ${extra.model}`; if (extra.phoneName) return extra.phoneName; if (extra.model) return extra.model }
  if (cat === "laptop")  { if (extra.brand && extra.model) return `${extra.brand} ${extra.model}`; if (extra.brand) return extra.brand; if (extra.model) return extra.model }
  if (cat === "wallet")  { if (extra.brand && extra.color) return `${extra.brand} (${extra.color})`; if (extra.brand) return extra.brand; if (extra.color) return extra.color }
  if (cat === "id card") { if (extra.type) return extra.type }
  if (cat === "other")   { if (extra.itemName) return extra.itemName }
  return item.category || "Item"
}

const getTypeLabel = (item) => {
  const map = { lost: "Lost", found: "Found", missing: "Missing", wanted: "Wanted" }
  return map[item.type] || "Item"
}

const formatDate = (d) => {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const getLocationLabel = (item) => {
  const extra = getExtra(item)
  if (item.type === "lost" || item.type === "missing") return `Last seen in ${item.location}`
  if (item.type === "found") return `Found at ${item.location}`
  if (item.type === "wanted") return extra.homeDistrict ? `From ${extra.homeDistrict}` : "Wanted person"
  return item.location
}

const getClaimDeviceName = (c) => {
  if (c.deviceName) return c.deviceName
  if (c.brand && c.model) return `${c.brand} ${c.model}`
  if (c.brand) return c.brand
  if (c.model) return c.model
  return c.category || "Device"
}

const TYPE_COLORS = {
  lost:    { bg: "#fff0f0", color: "#c0392b", border: "#fcd0d0" },
  found:   { bg: "#f0fff4", color: "#1a7a3c", border: "#b7ebca" },
  missing: { bg: "#fff8e1", color: "#b45309", border: "#fde68a" },
  wanted:  { bg: "#eef2ff", color: "#0a4d8c", border: "#c7d7f9" },
  claim:   { bg: "#f0f7ff", color: "#007aff", border: "#bdd9fc" },
}

const CLAIM_STATUS = {
  pending:  { bg: "#fff8e1", color: "#b45309", border: "#fde68a", label: "Pending"  },
  verified: { bg: "#f0fff4", color: "#1a7a3c", border: "#b7ebca", label: "Verified" },
  rejected: { bg: "#fff0f0", color: "#c0392b", border: "#fcd0d0", label: "Rejected" },
}

const ALL_TYPES      = ["lost", "found", "missing", "wanted", "claim"]
const ALL_CATEGORIES = ["Person", "Phone", "Laptop", "Tablet", "Wallet", "ID Card", "Other"]

export default function Search() {
  const [items,       setItems]       = useState([])
  const [claims,      setClaims]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState("")
  const [activeTypes, setActiveTypes] = useState([])
  const [activeCats,  setActiveCats]  = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy,      setSortBy]      = useState("newest")

 useEffect(() => {
  Promise.allSettled([
    axios.get("http://localhost:5000/api/items"),
    axios.get("http://localhost:5000/api/claims"),
  ]).then(([itemsResult, claimsResult]) => {
    if (itemsResult.status  === "fulfilled") setItems(itemsResult.value.data)
    else console.error("Items fetch failed:", itemsResult.reason)

    if (claimsResult.status === "fulfilled") setClaims(claimsResult.value.data)
    else console.warn("Claims not available yet:", claimsResult.reason)
  }).finally(() => setLoading(false))
}, [])

  const toggleType = (t) => setActiveTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  const toggleCat  = (c) => setActiveCats(p  => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const clearAll   = () => { setQuery(""); setActiveTypes([]); setActiveCats([]); setSortBy("newest") }
  const hasFilters = query || activeTypes.length || activeCats.length || sortBy !== "newest"

  const normalisedClaims = useMemo(() =>
    claims.map(c => ({
      _id: c._id, _isClaim: true, type: "claim", category: c.category, _claim: c, date: c.createdAt,
      _searchText: [getClaimDeviceName(c), c.category, c.brand, c.model, c.color, c.specs].filter(Boolean).join(" ").toLowerCase()
    })), [claims])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const claimOnly = activeTypes.length > 0 && activeTypes.every(t => t === "claim")
    const noClaimFilter = activeTypes.length === 0 || activeTypes.includes("claim")

    let filteredItems = claimOnly ? [] : [...items]
    if (q) filteredItems = filteredItems.filter(i =>
      getItemName(i).toLowerCase().includes(q) ||
      (i.category || "").toLowerCase().includes(q) ||
      (i.location  || "").toLowerCase().includes(q))
    if (activeTypes.length && !claimOnly)
      filteredItems = filteredItems.filter(i => activeTypes.includes(i.type))
    if (activeCats.length)
      filteredItems = filteredItems.filter(i =>
        activeCats.map(c => c.toLowerCase()).includes((i.category || "").toLowerCase()))

    let filteredClaims = noClaimFilter ? [...normalisedClaims] : []
    if (q) filteredClaims = filteredClaims.filter(c => c._searchText.includes(q))
    if (activeCats.length)
      filteredClaims = filteredClaims.filter(c =>
        activeCats.map(x => x.toLowerCase()).includes((c.category || "").toLowerCase()))

    return [...filteredItems, ...filteredClaims].sort((a, b) => {
      const da = new Date(a.date), db = new Date(b.date)
      if (sortBy === "newest") return db - da
      if (sortBy === "oldest") return da - db
      if (sortBy === "az") {
        const na = a._isClaim ? getClaimDeviceName(a._claim) : getItemName(a)
        const nb = b._isClaim ? getClaimDeviceName(b._claim) : getItemName(b)
        return na.localeCompare(nb)
      }
      return 0
    })
  }, [items, normalisedClaims, query, activeTypes, activeCats, sortBy])

  return (
    <div className="container">

      <div className="hero search-hero">
        <h2>Search Reports</h2>
        <p>Find lost items, missing persons, found things, or claimed gadgets.</p>
      </div>

      <div className="search-bar-wrap">
        <FiSearch className="search-icon" size={18} />
        <input className="search-input" type="text" placeholder="Search by name, category, or location…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button className="search-clear" onClick={() => setQuery("")}><FiX size={16} /></button>}
        <button className={`filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(p => !p)}>
          <FiSliders size={15} /> Filters
          {(activeTypes.length + activeCats.length) > 0 && (
            <span className="filter-badge">{activeTypes.length + activeCats.length}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <p className="section-title" style={{ marginBottom: 8 }}><FiFilter size={13} style={{ marginRight: 5 }} />Type</p>
          <div className="type-row" style={{ marginBottom: 16 }}>
            {ALL_TYPES.map(t => (
              <button key={t} className={`type-btn ${activeTypes.includes(t) ? "active" : ""}`} onClick={() => toggleType(t)}>
                {t === "claim" ? "🛡 Claimed" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <p className="section-title" style={{ marginBottom: 8 }}>Category</p>
          <div className="type-row" style={{ marginBottom: 16 }}>
            {ALL_CATEGORIES.map(c => (
              <button key={c} className={`type-btn ${activeCats.includes(c) ? "active" : ""}`} onClick={() => toggleCat(c)}>{c}</button>
            ))}
          </div>
          <p className="section-title" style={{ marginBottom: 8 }}>Sort by</p>
          <div className="type-row">
            {[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }, { value: "az", label: "A → Z" }].map(opt => (
              <button key={opt.value} className={`type-btn ${sortBy === opt.value ? "active" : ""}`} onClick={() => setSortBy(opt.value)}>{opt.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="results-meta">
        <span>{loading ? "Loading…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}</span>
        {hasFilters && <button className="clear-all-btn" onClick={clearAll}><FiX size={13} /> Clear all</button>}
      </div>

      {(activeTypes.length > 0 || activeCats.length > 0) && (
        <div className="chip-row">
          {activeTypes.map(t => <button key={t} className="chip" onClick={() => toggleType(t)}>{t} <FiX size={11} /></button>)}
          {activeCats.map(c  => <button key={c} className="chip" onClick={() => toggleCat(c)}>{c} <FiX size={11} /></button>)}
        </div>
      )}

      {loading ? (
        <div className="search-loading"><div className="spinner" /><p>Loading…</p></div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <FiAlertCircle size={40} color="#cbd5e1" />
          <p>No results found.</p>
          <span>Try different keywords or clear your filters.</span>
          {hasFilters && <button className="submit-btn" style={{ marginTop: 14, width: "auto", padding: "10px 24px" }} onClick={clearAll}>Clear filters</button>}
        </div>
      ) : (
        <div className="grid">
          {results.map(result => {
            if (result._isClaim) {
              const claim = result._claim
              const tc = TYPE_COLORS.claim
              const sc = CLAIM_STATUS[claim.status] || CLAIM_STATUS.pending
              const CatIcon = claim.category === "Laptop" ? FiMonitor : claim.category === "Tablet" ? FiTablet : FiSmartphone
              return (
                <div className="card" key={`claim-${claim._id}`}>
                  {claim.images && claim.images.length > 0
                    ? <img src={`http://localhost:5000/uploads/${claim.images[0]}`} alt="" />
                    : <div className="card-no-image" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><CatIcon size={36} color="#d1d5db" /></div>}
                  <div className="card-content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span className="badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                        <FiShield size={11} style={{ marginRight: 3 }} />Claimed — {getClaimDeviceName(claim)}
                      </span>
                      <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11 }}>{sc.label}</span>
                    </div>
                    <h4 style={{ margin: "4px 0 0 8px", fontSize: 15, fontWeight: 600, color: "#1c1c1e", display: "flex", alignItems: "center", gap: 6 }}>
                      <CatIcon size={14} /> {claim.category}{claim.color ? ` · ${claim.color}` : ""}{claim.storage ? ` · ${claim.storage}` : ""}
                    </h4>
                    <p style={{ fontSize: 12, color: "#6e6e73", marginTop: 5, marginLeft: 8 }}>
                      {claim.imei ? `IMEI: ${claim.imei.slice(0, 6)}••••••••` : claim.serial ? `S/N: ${claim.serial.slice(0, 5)}•••••` : ""}
                    </p>
                    {claim.phone1 && (
                      <a href={`tel:${claim.phone1}`} style={{ textDecoration: "none", color: "#0a4d8c", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, marginTop: 6, marginLeft: 8 }}>
                        <FiPhone size={14} />{claim.phone1}
                      </a>
                    )}
                  </div>
                </div>
              )
            }

            const tc = TYPE_COLORS[result.type] || TYPE_COLORS.lost
            return (
              <div className="card" key={result._id}>
                {result.images && result.images.length > 0
                  ? <img src={`http://localhost:5000/uploads/${result.images[0]}`} alt="" />
                  : <div className="card-no-image" />}
                <div className="card-content">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span className="badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {getTypeLabel(result)} – ({getItemName(result)})
                    </span>
                    {result.phone1 && (
                      <a href={`tel:${result.phone1}`} style={{ textDecoration: "none", color: "#0a4d8c", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500 }}>
                        <FiPhone size={14} />{result.phone1}
                      </a>
                    )}
                  </div>
                  <h4 style={{ margin: "4px 0 0 8px", fontSize: 15, fontWeight: 600, color: "#1c1c1e" }}>{result.category || "Item"}</h4>
                  {result.location && (
                    <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6e6e73", marginTop: 6 }}>
                      <span style={{ width: 8, height: 8, backgroundColor: "#25D366", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                      <span>{getLocationLabel(result)}{result.date && ` on ${formatDate(result.date)}`}</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
