import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  FiSearch, FiX, FiPhone, FiFilter, FiAlertCircle,
  FiSliders, FiShield, FiSmartphone, FiMonitor,
  FiCreditCard, FiBox, FiUser, FiGift, FiChevronRight, FiTablet
} from "react-icons/fi"

// ── helpers ────────────────────────────────────────────────────────────────
const getExtra = (item) => {
  try { return typeof item.extraFields === "string" ? JSON.parse(item.extraFields) : item.extraFields || {} }
  catch { return {} }
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

const getTypeLabel = (item) => ({ lost:"Lost", found:"Found", missing:"Missing", wanted:"Wanted" }[item.type] || "Item")
const formatDate   = (d)    => d ? new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : ""

const getLocationLabel = (item) => {
  const extra = getExtra(item)
  if (item.type === "lost" || item.type === "missing") return `Last seen in ${item.location}`
  if (item.type === "found")  return `Found at ${item.location}`
  if (item.type === "wanted") return extra.homeDistrict ? `From ${extra.homeDistrict}` : "Wanted person"
  return item.location
}

const getClaimDeviceName = (c) => {
  if (c.deviceName)       return c.deviceName
  if (c.brand && c.model) return `${c.brand} ${c.model}`
  if (c.brand)            return c.brand
  if (c.model)            return c.model
  return c.category || "Device"
}

// ── placeholder icons ─────────────────────────────────────────────────────
const CAT_ICON = {
  phone:     <FiSmartphone size={36} color="#d1d5db" />,
  laptop:    <FiMonitor    size={36} color="#d1d5db" />,
  wallet:    <FiCreditCard size={36} color="#d1d5db" />,
  "id card": <FiCreditCard size={36} color="#d1d5db" />,
  person:    <FiUser       size={36} color="#d1d5db" />,
  other:     <FiBox        size={36} color="#d1d5db" />,
}

const TYPE_COLORS = {
  lost:    { bg:"#fff0f0", color:"#c0392b", border:"#fcd0d0", placeholderBg:"#fdf0f0" },
  found:   { bg:"#f0fff4", color:"#1a7a3c", border:"#b7ebca", placeholderBg:"#f0fdf4" },
  missing: { bg:"#fff8e1", color:"#b45309", border:"#fde68a", placeholderBg:"#fffbeb" },
  wanted:  { bg:"#eef2ff", color:"#0a4d8c", border:"#c7d7f9", placeholderBg:"#eff6ff" },
  claim:   { bg:"#f0f7ff", color:"#007aff", border:"#bdd9fc", placeholderBg:"#f0f7ff" },
}

const CLAIM_STATUS = {
  pending:  { bg:"#fff8e1", color:"#b45309", border:"#fde68a", label:"Pending"  },
  verified: { bg:"#f0fff4", color:"#1a7a3c", border:"#b7ebca", label:"Verified" },
  rejected: { bg:"#fff0f0", color:"#c0392b", border:"#fcd0d0", label:"Rejected" },
}

// items only (no claim in default filter list)
const ALL_TYPES      = ["lost", "found", "missing", "wanted"]
const ALL_CATEGORIES = ["Person", "Phone", "Laptop", "Wallet", "ID Card", "Other"]

// ══════════════════════════════════════════════════════════════════════════
export default function Search() {
  const navigate = useNavigate()

  const [items,        setItems]        = useState([])
  const [claims,       setClaims]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [query,        setQuery]        = useState("")
  const [activeTypes,  setActiveTypes]  = useState([])
  const [activeCats,   setActiveCats]   = useState([])
  const [showFilters,  setShowFilters]  = useState(false)
  const [sortBy,       setSortBy]       = useState("newest")
  const [searchClaims, setSearchClaims] = useState(false)  // claim filter toggle
  const [rewardOnly,   setRewardOnly]   = useState(false)

  useEffect(() => {
    Promise.allSettled([
      axios.get("http://localhost:5000/api/items"),
      axios.get("http://localhost:5000/api/claims"),
    ]).then(([ir, cr]) => {
      if (ir.status === "fulfilled") setItems(ir.value.data)
      if (cr.status === "fulfilled") setClaims(cr.value.data)
    }).finally(() => setLoading(false))
  }, [])

  const toggleType = (t) => setActiveTypes(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t])
  const toggleCat  = (c) => setActiveCats(p  => p.includes(c) ? p.filter(x=>x!==c) : [...p,c])

  const clearAll = () => {
    setQuery("")
    setActiveTypes([])
    setActiveCats([])
    setSortBy("newest")
    setSearchClaims(false)
    setRewardOnly(false)
  }

  const hasFilters = query || activeTypes.length || activeCats.length || sortBy !== "newest" || searchClaims || rewardOnly

  // ── normalise claims for search ────────────────────────────────────────
  const normalisedClaims = useMemo(() =>
    claims.map(c => ({
      _id:         c._id,
      _isClaim:    true,
      _claim:      c,
      type:        "claim",
      category:    c.category,
      date:        c.createdAt,
      // all searchable text joined — IMEI, serial, brand, model, device name, specs
      _searchText: [
        c.deviceName, c.brand, c.model, c.color,
        c.storage, c.specs, c.imei, c.imei2, c.serial,
        c.category, c.claimantName
      ].filter(Boolean).join(" ").toLowerCase()
    })), [claims])

  // ── combined filtered results ──────────────────────────────────────────
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    // ── regular items ──────────────────────────────────────────────────
    let filteredItems = [...items]

    if (q) filteredItems = filteredItems.filter(i =>
      getItemName(i).toLowerCase().includes(q) ||
      (i.category || "").toLowerCase().includes(q) ||
      (i.location  || "").toLowerCase().includes(q))

    if (activeTypes.length)
      filteredItems = filteredItems.filter(i => activeTypes.includes(i.type))

    if (activeCats.length)
      filteredItems = filteredItems.filter(i =>
        activeCats.map(c => c.toLowerCase()).includes((i.category || "").toLowerCase()))

    // ── claimed items: ONLY when searchClaims is on AND query is not empty ──
    // No query = no claim results (prevents showing all claims to everyone)
    if (rewardOnly)
      filteredItems = filteredItems.filter(i => i.reward && i.reward.trim() !== "")

    let filteredClaims = []
    if (searchClaims && q) {
      filteredClaims = normalisedClaims.filter(c => c._searchText.includes(q))

      // also apply category filter if set
      if (activeCats.length)
        filteredClaims = filteredClaims.filter(c =>
          activeCats.map(x => x.toLowerCase()).includes((c.category || "").toLowerCase()))
    }

    return [...filteredItems, ...filteredClaims].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date)
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date)
      if (sortBy === "az") {
        const na = a._isClaim ? getClaimDeviceName(a._claim) : getItemName(a)
        const nb = b._isClaim ? getClaimDeviceName(b._claim) : getItemName(b)
        return na.localeCompare(nb)
      }
      return 0
    })
  }, [items, normalisedClaims, query, activeTypes, activeCats, sortBy, searchClaims, rewardOnly])

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="container">

      <div className="hero search-hero">
        <h2>Search Reports</h2>
        <p>Find lost items, missing persons, or things already found.</p>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrap">
        <FiSearch className="search-icon" size={18} />
        <input className="search-input" type="text"
          placeholder="Search by name, category, location, IMEI…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && (
          <button className="search-clear" onClick={() => setQuery("")}>
            <FiX size={16} />
          </button>
        )}
        <button
          className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(p => !p)}>
          <FiSliders size={15} /> Filters
          {(activeTypes.length + activeCats.length + (searchClaims ? 1 : 0)) > 0 && (
            <span className="filter-badge">
              {activeTypes.length + activeCats.length + (searchClaims ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel">

          {/* Type */}
          <p className="section-title" style={{marginBottom:8}}>
            <FiFilter size={13} style={{marginRight:5}} />Type
          </p>
          <div className="type-row" style={{marginBottom:16}}>
            {ALL_TYPES.map(t => (
              <button key={t}
                className={`type-btn ${activeTypes.includes(t) ? "active" : ""}`}
                onClick={() => toggleType(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Category */}
          <p className="section-title" style={{marginBottom:8}}>Category</p>
          <div className="type-row" style={{marginBottom:16}}>
            {ALL_CATEGORIES.map(c => (
              <button key={c}
                className={`type-btn ${activeCats.includes(c) ? "active" : ""}`}
                onClick={() => toggleCat(c)}>{c}</button>
            ))}
          </div>

          {/* Claimed items toggle */}
          <p className="section-title" style={{marginBottom:8}}>Reward</p>
          <div className="type-row" style={{marginBottom:16}}>
            <button
              className={`type-btn ${rewardOnly ? "active" : ""}`}
              onClick={() => setRewardOnly(p => !p)}>
              <FiGift size={13} style={{marginRight:5}}/> With Reward
            </button>
          </div>

          <p className="section-title" style={{marginBottom:8}}>
            <FiShield size={13} style={{marginRight:5}} />Claimed Items
          </p>
          <div style={{marginBottom:16}}>
            <button
              className={`type-btn ${searchClaims ? "active" : ""}`}
              onClick={() => setSearchClaims(p => !p)}
              style={{display:"flex",alignItems:"center",gap:6}}>
              <FiShield size={13} />
              {searchClaims ? "Searching claimed items" : "Include claimed items in search"}
            </button>
            {searchClaims && !query && (
              <p style={{fontSize:12,color:"#9ca3af",marginTop:8}}>
                Type a search term above to find matching claimed items (IMEI, serial, brand, model…)
              </p>
            )}
          </div>

          {/* Sort */}
          <p className="section-title" style={{marginBottom:8}}>Sort by</p>
          <div className="type-row">
            {[
              {value:"newest", label:"Newest first"},
              {value:"oldest", label:"Oldest first"},
              {value:"az",     label:"A → Z"},
            ].map(opt => (
              <button key={opt.value}
                className={`type-btn ${sortBy === opt.value ? "active" : ""}`}
                onClick={() => setSortBy(opt.value)}>{opt.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Results meta */}
      <div className="results-meta">
        <span>
          {loading ? "Loading…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
        </span>
        {hasFilters && (
          <button className="clear-all-btn" onClick={clearAll}>
            <FiX size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Active chips */}
      {(activeTypes.length > 0 || activeCats.length > 0 || searchClaims) && (
        <div className="chip-row">
          {activeTypes.map(t => (
            <button key={t} className="chip" onClick={() => toggleType(t)}>
              {t} <FiX size={11} />
            </button>
          ))}
          {activeCats.map(c => (
            <button key={c} className="chip" onClick={() => toggleCat(c)}>
              {c} <FiX size={11} />
            </button>
          ))}
          {rewardOnly && (
            <button className="chip" onClick={() => setRewardOnly(false)}
              style={{background:"#fff8e1",color:"#b45309",border:"1px solid #fde68a",display:"flex",alignItems:"center",gap:4}}>
              <FiGift size={11}/> With reward <FiX size={11}/>
            </button>
          )}
          {searchClaims && (
            <button className="chip" onClick={() => setSearchClaims(false)}
              style={{background:"#f0f7ff",color:"#007aff",border:"1px solid #bdd9fc"}}>
              <FiShield size={11} /> Claimed items <FiX size={11} />
            </button>
          )}
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="search-loading">
          <div className="spinner" /><p>Loading…</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <FiAlertCircle size={40} color="#cbd5e1" />
          <p>No results found.</p>
          {searchClaims && !query
            ? <span>Type a search term to find matching claimed items.</span>
            : <span>Try different keywords or clear your filters.</span>}
          {hasFilters && (
            <button className="submit-btn"
              style={{marginTop:14,width:"auto",padding:"10px 24px"}}
              onClick={clearAll}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid">
          {results.map(result => {

            // ── Claim card ───────────────────────────────────────────────
            if (result._isClaim) {
              const claim = result._claim
              const tc    = TYPE_COLORS.claim
              const sc    = CLAIM_STATUS[claim.status] || CLAIM_STATUS.pending
              const CatIcon = claim.category === "Laptop" ? FiMonitor
                : claim.category === "Tablet" ? FiTablet : FiSmartphone

              return (
                <div className="card" key={`claim-${claim._id}`}>
                  {claim.images?.length > 0 ? (
                    <img src={`http://localhost:5000/uploads/${claim.images[0]}`} alt="" />
                  ) : (
                    <div className="card-no-image"
                      style={{display:"flex",alignItems:"center",justifyContent:"center",background:"#f2f3f7"}}>
                      <CatIcon size={36} color="#d1d5db" />
                    </div>
                  )}
                  <div className="card-content">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:6,flexWrap:"wrap"}}>
                      <span className="badge"
                        style={{background:tc.bg,color:tc.color,border:`1px solid ${tc.border}`,display:"flex",alignItems:"center",gap:4}}>
                        <FiShield size={11} /> Claimed — {getClaimDeviceName(claim)}
                      </span>
                      <span className="badge"
                        style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,fontSize:11}}>
                        {sc.label}
                      </span>
                    </div>
                    <h4 style={{margin:"4px 0 0 8px",fontSize:15,fontWeight:600,color:"#1c1c1e",display:"flex",alignItems:"center",gap:6}}>
                      <CatIcon size={14} />
                      {claim.category}
                      {claim.color   ? ` · ${claim.color}`   : ""}
                      {claim.storage ? ` · ${claim.storage}` : ""}
                    </h4>
                    <p style={{fontSize:12,color:"#6e6e73",marginTop:5,marginLeft:8}}>
                      {claim.imei
                        ? `IMEI: ${claim.imei.slice(0,6)}••••••••`
                        : claim.serial
                          ? `S/N: ${claim.serial.slice(0,5)}•••••`
                          : ""}
                    </p>
                    {claim.phone1 && (
                      <a href={`tel:${claim.phone1}`}
                        style={{textDecoration:"none",color:"#0a4d8c",display:"flex",alignItems:"center",gap:5,fontSize:13,fontWeight:500,marginTop:6,marginLeft:8}}>
                        <FiPhone size={14} />{claim.phone1}
                      </a>
                    )}
                  </div>
                </div>
              )
            }

            // ── Regular item card ────────────────────────────────────────
            const tc      = TYPE_COLORS[result.type] || TYPE_COLORS.lost
            const catKey  = result.category?.toLowerCase()
            const catIcon = CAT_ICON[catKey] || <FiBox size={36} color="#d1d5db" />
            const hasReward = result.reward && result.reward.trim() !== ""

            return (
              <div
                className="card"
                key={result._id}
                onClick={() => navigate(`/item/${result._id}`)}
                style={{ background: tc.placeholderBg || "#fafafa", border: `1px solid ${tc.border}` }}
              >
                {result.images?.length > 0 ? (
                  <img src={`http://localhost:5000/uploads/${result.images[0]}`} alt={getItemName(result)} />
                ) : (
                  <div className="card-placeholder" style={{ background: tc.bg, color: tc.color }}>
                    {catIcon}
                  </div>
                )}
                <div className="card-content" style={{ background: "white" }}>
                  <div className="card-top-row">
                    <span className="badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {getTypeLabel(result)} · {getItemName(result)}
                    </span>
                    <FiChevronRight size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
                  </div>
                  <p className="card-title">{result.category || "Item"}</p>
                  {result.location && (
                    <div className="card-location">
                      <span className="card-location-dot" />
                      <span>{getLocationLabel(result)}{result.date && ` · ${formatDate(result.date)}`}</span>
                    </div>
                  )}
                  {hasReward && (
                    <div className="card-reward">
                      <FiGift size={11} /><span>Reward offered</span>
                    </div>
                  )}
                  {result.phone1 && (
                    <a href={`tel:${result.phone1}`} className="card-phone" onClick={e => e.stopPropagation()}>
                      <FiPhone size={13} />{result.phone1}
                    </a>
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
