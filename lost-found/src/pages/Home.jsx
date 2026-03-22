import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FiAlertCircle, FiPlusCircle, FiUser, FiSearch,
  FiPhone, FiEdit, FiSmartphone, FiMonitor,
  FiCreditCard, FiBox, FiGift, FiChevronRight
} from "react-icons/fi"
import { getItemName, getTypeLabel, getLocationLabel, formatDate } from "../utils/itemHelpers"
const CAT_ICON = {
  phone:     <FiSmartphone size={36} color="#d1d5db" />,
  laptop:    <FiMonitor    size={36} color="#d1d5db" />,
  wallet:    <FiCreditCard size={36} color="#d1d5db" />,
  "id card": <FiCreditCard size={36} color="#d1d5db" />,
  person:    <FiUser       size={36} color="#d1d5db" />,
  other:     <FiBox        size={36} color="#d1d5db" />,
}

const TYPE_CONFIG = {
  lost:    { bg: "#fff0f0", color: "#c0392b" },
  found:   { bg: "#f0fff4", color: "#1a7a3c" },
  missing: { bg: "#fff8e1", color: "#b45309" },
  wanted:  { bg: "#eef2ff", color: "#0a4d8c" },
}

function Home() {
  const [items,   setItems]   = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/items`)
      .then(res => {
        // Only show active items on the homepage
        setItems(res.data.filter(i => i.status !== "resolved"))
      })
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="container">

      <div className="hero">
        <h2>Find What Was Lost</h2>
        <p>Connecting Malawians to recover their belongings faster.</p>
      </div>

      <div className="action-buttons">
        <Link to="/report-lost">
          <button className="action-btn"><FiAlertCircle /> Report Lost</button>
        </Link>
        <Link to="/report-found">
          <button className="action-btn"><FiPlusCircle /> Report Found</button>
        </Link>
        <Link to="/report-missing">
          <button className="action-btn"><FiUser /> Report Missing (Persons)</button>
        </Link>
        <Link to="/listings">
          <button className="action-btn"><FiSearch /> Search Items</button>
        </Link>
        <Link to="/claim-items">
          <button style={{ color: "#25D366" }} className="action-btn">
            <FiEdit /> Claim Items
          </button>
        </Link>
      </div>

      <h3><FiAlertCircle color="red" /> Top Reports</h3>

      <div className="grid">
        {items.length > 0 ? (
          items.map(item => {
            const tc       = TYPE_CONFIG[item.type] || TYPE_CONFIG.lost
            const catIcon  = CAT_ICON[item.category?.toLowerCase()] || <FiBox size={36} color="#d1d5db" />
            const hasReward = item.reward && item.reward.trim() !== ""

            return (
              <div className="card" key={item._id}
                onClick={() => navigate(`/item/${item._id}`)}
                style={{ cursor: "pointer" }}>

                {item.images?.length > 0 ? (
                  <img src={`${import.meta.env.VITE_API_URL}/uploads/${item.images[0]}`} alt="" />
                ) : (
                  <div style={{ height: "180px", background: "#f2f3f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {catIcon}
                  </div>
                )}

                <div className="card-content">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span className="badge" style={{ background: tc.bg, color: tc.color }}>
                      {getTypeLabel(item)} – ({getItemName(item)})
                    </span>
                    <FiChevronRight size={16} color="#d1d5db" />
                  </div>

                  <h4 style={{ margin: "4px 0 0 8px", fontSize: "15px", fontWeight: "600", color: "#1c1c1e" }}>
                    {item.category || "Item"}
                  </h4>

                  {item.location && (
                    <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6e6e73", marginTop: "6px" }}>
                      <span style={{ width: "8px", height: "8px", backgroundColor: "#25D366", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                      <span>
                        {getLocationLabel(item)}
                        {item.date && ` on ${formatDate(item.date)}`}
                      </span>
                    </p>
                  )}

                  {hasReward && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "4px 10px", background: "#fff8e1", color: "#b45309", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #fde68a" }}>
                      <FiGift size={12} /><span>Reward offered</span>
                    </div>
                  )}

                  {item.phone1 && (
                    <a href={`tel:${item.phone1}`}
                      onClick={e => e.stopPropagation()}
                      style={{ textDecoration: "none", color: "#0a4d8c", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: "500", marginTop: "8px" }}>
                      <FiPhone size={14} />{item.phone1}
                    </a>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <p style={{ opacity: 0.7 }}>No reports yet</p>
        )}
      </div>
    </div>
  )
}

export default Home
