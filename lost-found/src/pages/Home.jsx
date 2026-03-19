
import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  FiAlertCircle,
  FiPlusCircle,
  FiUser,
  FiSearch,
  FiPhone,
  FiEdit
} from "react-icons/fi"

function Home() {

  const [items, setItems] = useState([])

  useEffect(() => {
    axios.get("http://localhost:5000/api/items")
      .then((res) => {
        setItems(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // ✅ format date
  const formatDate = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  // ✅ parse extraFields safely
  const getExtra = (item) => {
    try {
      return typeof item.extraFields === "string"
        ? JSON.parse(item.extraFields)
        : item.extraFields || {}
    } catch {
      return {}
    }
  }

  // ✅ get actual item name
 const getItemName = (item) => {
  const extra = getExtra(item)
  const category = item.category?.toLowerCase()

  // 👤 PERSON
  if (category === "person") {
    if (extra.personName && extra.age) {
      return `${extra.personName} , ${extra.age}`
    }
    if (extra.personName) return extra.personName
  }

  // 📱 PHONE
  if (category === "phone") {
    if (extra.phoneName && extra.model) {
      return `${extra.phoneName} ${extra.model}`
    }
    if (extra.phoneName) return extra.phoneName
    if (extra.model) return extra.model
  }

  // 💻 LAPTOP
  if (category === "laptop") {
    if (extra.brand && extra.model) {
      return `${extra.brand} ${extra.model}`
    }
    if (extra.brand) return extra.brand
    if (extra.model) return extra.model
  }

  // 👛 WALLET
  if (category === "wallet") {
    if (extra.brand && extra.color) {
      return `${extra.brand} (${extra.color})`
    }
    if (extra.brand) return extra.brand
    if (extra.color) return extra.color
  }

  // 🪪 ID
  if (category === "id card") {
    if (extra.type) return extra.type
  }

  // 📦 OTHER
  if (category === "other") {
    if (extra.itemName) return extra.itemName
  }

  return item.category || "Item"
}

const getTypeLabel = (item) => {
  switch (item.type) {
    case "lost":
      return "Lost"
    case "found":
      return "Found"
    case "missing":
      return "Missing"
    case "wanted":
      return "Wanted"
    default:
      return "Item"
  }
}

  return (
    <div className="container">

      <div className="hero">
        <h2>Find What Was Lost</h2>
        <p>Connecting Malawians to recover their belongings faster.</p>
      </div>

      <div className="action-buttons">

        <Link to="/report-lost">
          <button className="action-btn">
            <FiAlertCircle /> Report Lost
          </button>
        </Link>

        <Link to="/report-found">
          <button className="action-btn">
            <FiPlusCircle /> Report Found
          </button>
        </Link>

        <Link to="/report-missing">
          <button className="action-btn">
            <FiUser /> Report Missing(Persons)
          </button>
        </Link>

        <Link to="/listings">
          <button className="action-btn">
            <FiSearch /> Search Items
          </button>
        </Link>

        <Link to="/claim-items">
          <button style={{color:"#25D366", textDecoration:"underline"}} className="action-btn">
            <FiEdit /> Claim Items
                 </button>
        </Link>

      </div>

      <h3><FiAlertCircle color="red"/> Top Reports</h3>

      <div className="grid">

        {items && items.length > 0 ? (
          items.map((item) => (

            <div className="card" key={item._id}>

              {/* Image */}
              {item.images && item.images.length > 0 ? (
                <img
                  src={`http://localhost:5000/uploads/${item.images[0]}`}
                  alt=""
                />
              ) : (
                <div style={{
                  height: "180px",
                  background: "#eee"
                }}></div>
              )}

              {/* Content */}
              <div className="card-content">

  {/* Top row */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  }}>

    {/* Left side: Lost - (Item Name) */}
    <span className="badge">
      {getTypeLabel(item)}{" "}
      {`- (${getItemName(item)})`}
    </span>

    {/* Right side: Phone */}
    {item.phone1 && (
      <a
        href={`tel:${item.phone1}`}
        style={{
          textDecoration: "none",
          color: "#0a4d8c",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "13px",
          fontWeight: "500"
        }}
      >
        <FiPhone size={14} />
        {item.phone1}
      </a>
    )}

  </div>

  {/* Category BELOW */}
  <h4 style={{
    margin: "4px 0 0 8px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#1c1c1e"
  }}>
    {item.category || "Item"}
  </h4>

  {/* Location + Date */}
  {item.location && (
    <p style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#6e6e73",
      marginTop: "6px"
    }}>

      <span style={{
        width: "8px",
        height: "8px",
        backgroundColor: "#25D366",
        borderRadius: "50%",
        display: "inline-block"
      }}></span>

      <span>
  {(() => {
  const extra = getExtra(item)

  if (item.type === "lost") {
    return `Last seen in ${item.location}`
  }

  if (item.type === "found") {
    return `Found at ${item.location}`
  }

  if (item.type === "missing") {
    return `Last seen in ${item.location}`
  }

  if (item.type === "wanted") {
    return extra.homeDistrict
      ? `From ${extra.homeDistrict} last seen on`
      : `Wanted person`
  }

  return item.location
})()}
  {item.date && ` on ${formatDate(item.date)}`}
</span>

    </p>
  )}

</div>

            </div>

          ))
        ) : (
          <p style={{ opacity: 0.7 }}>No reports yet</p>
        )}

      </div>

    </div>
  )
}

export default Home