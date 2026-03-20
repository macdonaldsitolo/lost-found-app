import { useState, useRef } from "react"
import {
  FiUpload,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiMapPin
} from "react-icons/fi"
import SubmitModal from "../components/SubmitModal"
import axios from "axios"

// ─────────────────────────────────────────────────────────────────────────────

const categories = [
  { name: "Phone",  icon: <FiSmartphone size={22} /> },
  { name: "Laptop", icon: <FiMonitor    size={22} /> },
  { name: "Tablet", icon: <FiTablet     size={22} /> },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function ClaimGadget() {
  const [category,    setCategory]    = useState("")
  const [fields,      setFields]      = useState({})
  const [images,      setImages]      = useState([])
  const [phone1,      setPhone1]      = useState("")
  const [phone2,      setPhone2]      = useState("")
  const [claimantName, setClaimantName] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  const set = (key, val) => setFields(prev => ({ ...prev, [key]: val }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files.map(file => ({ file, url: URL.createObjectURL(file) })))
  }

  const submit = async () => {
    if (!phone1)    { alert("Phone number is required"); return }
    if (!category)  { alert("Please select a device category"); return }

    // require at least IMEI or serial as proof
    const hasProof =
      (category === "Phone"  && (fields.imei   || fields.imei2)) ||
      (category === "Laptop" && fields.serial) ||
      (category === "Tablet" && (fields.imei || fields.serial))

    if (!hasProof) {
      alert(
        category === "Phone"
          ? "Please enter at least one IMEI number"
          : "Please enter the serial number"
      )
      return
    }

    const formData = new FormData()
    formData.append("category",     category)
    formData.append("deviceName",   fields.deviceName  || "")
    formData.append("brand",        fields.brand       || "")
    formData.append("model",        fields.model       || "")
    formData.append("color",        fields.color       || "")
    formData.append("storage",      fields.storage     || "")
    formData.append("specs",        fields.specs       || "")
    formData.append("imei",         fields.imei        || "")
    formData.append("imei2",        fields.imei2       || "")
    formData.append("serial",       fields.serial      || "")
    formData.append("claimantName", claimantName)
    formData.append("phone1",       phone1)
    formData.append("phone2",       phone2)
    images.forEach(img => formData.append("images", img.file))

    try {
      await axios.post("http://localhost:5000/api/claims", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setModalVisible(true)
    } catch (err) {
      console.error(err)
      alert("Error submitting claim")
    }
  }

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.screen}>
      <div style={styles.container}>

        <h2 style={styles.title}>Claim a Gadget</h2>
        <p style={styles.subtitle}>
          Prove ownership of a lost phone, laptop, or tablet using its IMEI or serial number.
        </p>

        {/* ── Photo upload ── */}
        <label style={styles.photoCard}>
          {images.length > 0 ? (
            <img src={images[0].url} alt="" style={styles.photoPreview} />
          ) : (
            <>
              <FiUpload size={28} color="#6e6e73" />
              <p style={{ marginTop: 10, color: "#6e6e73", fontSize: 14 }}>
                Upload proof photo (receipt, box, etc.)
              </p>
            </>
          )}
          <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
        </label>

        {/* ── Category ── */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Device Type</p>
          <div style={styles.categoryGrid}>
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => { setCategory(cat.name); setFields({}) }}
                style={{
                  ...styles.categoryCard,
                  backgroundColor: category === cat.name ? "#007aff" : "white",
                  color:           category === cat.name ? "white"   : "#1c1c1e"
                }}
              >
                {cat.icon}
                <span style={{ marginTop: 6 }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Phone fields ── */}
        {category === "Phone" && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Phone Details</p>

            <input
              placeholder="Device name (e.g. iPhone 14 Pro)"
              onChange={e => set("deviceName", e.target.value)}
            />
            <input
              placeholder="Brand (e.g. Apple, Samsung)"
              onChange={e => set("brand", e.target.value)}
            />
            <input
              placeholder="Model"
              onChange={e => set("model", e.target.value)}
            />
            <div style={styles.row}>
              <input
                placeholder="Color"
                style={styles.inputHalf}
                onChange={e => set("color", e.target.value)}
              />
              <input
                placeholder="Storage (e.g. 128GB)"
                style={styles.inputHalf}
                onChange={e => set("storage", e.target.value)}
              />
            </div>
            <textarea
              placeholder="Other specs (screen size, features…)"
              style={styles.textarea}
              onChange={e => set("specs", e.target.value)}
            />

            {/* Proof of ownership */}
            <div style={styles.proofBox}>
              <p style={styles.proofTitle}>📋 Proof of Ownership</p>
              <p style={styles.proofHint}>
                Dial <strong>*#06#</strong> to find your IMEI. At least one is required.
              </p>
              <input
                placeholder="IMEI 1 *"
                onChange={e => set("imei", e.target.value)}
              />
              <input
                placeholder="IMEI 2 (dual-SIM)"
                onChange={e => set("imei2", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Laptop fields ── */}
        {category === "Laptop" && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Laptop Details</p>

            <input
              placeholder="Device name (e.g. MacBook Air M2)"
              onChange={e => set("deviceName", e.target.value)}
            />
            <input
              placeholder="Brand (e.g. HP, Dell, Apple)"
              onChange={e => set("brand", e.target.value)}
            />
            <input
              placeholder="Model"
              onChange={e => set("model", e.target.value)}
            />
            <div style={styles.row}>
              <input
                placeholder="Color"
                style={styles.inputHalf}
                onChange={e => set("color", e.target.value)}
              />
              <input
                placeholder="Storage (e.g. 512GB SSD)"
                style={styles.inputHalf}
                onChange={e => set("storage", e.target.value)}
              />
            </div>
            <textarea
              placeholder="Other specs (RAM, processor, screen size…)"
              style={styles.textarea}
              onChange={e => set("specs", e.target.value)}
            />

            <div style={styles.proofBox}>
              <p style={styles.proofTitle}>📋 Proof of Ownership</p>
              <p style={styles.proofHint}>
                Find the serial on a sticker under the laptop or in System Info. Required.
              </p>
              <input
                placeholder="Serial Number *"
                onChange={e => set("serial", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Tablet fields ── */}
        {category === "Tablet" && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Tablet Details</p>

            <input
              placeholder="Device name (e.g. iPad Air 5)"
              onChange={e => set("deviceName", e.target.value)}
            />
            <input
              placeholder="Brand (e.g. Apple, Samsung)"
              onChange={e => set("brand", e.target.value)}
            />
            <input
              placeholder="Model"
              onChange={e => set("model", e.target.value)}
            />
            <div style={styles.row}>
              <input
                placeholder="Color"
                style={styles.inputHalf}
                onChange={e => set("color", e.target.value)}
              />
              <input
                placeholder="Storage (e.g. 64GB)"
                style={styles.inputHalf}
                onChange={e => set("storage", e.target.value)}
              />
            </div>
            <textarea
              placeholder="Other specs (cellular, Wi-Fi only, screen size…)"
              style={styles.textarea}
              onChange={e => set("specs", e.target.value)}
            />

            <div style={styles.proofBox}>
              <p style={styles.proofTitle}>📋 Proof of Ownership</p>
              <p style={styles.proofHint}>
                Enter IMEI (cellular tablets: dial *#06#) or serial number. At least one required.
              </p>
              <input
                placeholder="IMEI (if cellular)"
                onChange={e => set("imei", e.target.value)}
              />
              <input
                placeholder="Serial Number"
                onChange={e => set("serial", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Claimant contact ── */}
        {category && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Your Contact Details</p>
            <input
              type="text"
              placeholder="Your Name"
              value={claimantName}
              onChange={e => setClaimantName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={phone1}
              onChange={e => setPhone1(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Second Phone Number"
              value={phone2}
              onChange={e => setPhone2(e.target.value)}
            />
          </div>
        )}

      </div>

      {/* ── Fixed submit footer ── */}
      <div style={styles.footer}>
        <div style={styles.footerInner}>
          <button onClick={submit} style={styles.submitBtn}>
            Submit Claim
          </button>
        </div>
      </div>

      <SubmitModal
        visible={modalVisible}
        type="claim"
        category={category}
        onClose={() => setModalVisible(false)}
      />
    </div>
  )
}

// ── styles (identical pattern to ReportLost) ─────────────────────────────────
const styles = {
  screen:       { backgroundColor: "#f2f2f7", minHeight: "100vh", display: "flex", justifyContent: "center" },
  container:    { width: "100%", maxWidth: "480px", padding: "30px 20px 120px" },
  title:        { fontSize: "24px", fontWeight: 600, marginBottom: "6px" },
  subtitle:     { fontSize: "14px", color: "#6e6e73", marginBottom: "24px", lineHeight: 1.5 },
  photoCard:    { height: "160px", borderRadius: "22px", backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: "28px", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" },
  photoPreview: { width: "100%", height: "100%", objectFit: "cover" },
  section:      { marginBottom: "28px" },
  sectionTitle: { fontSize: "14px", color: "#6e6e73", marginBottom: "12px" },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  categoryCard: { padding: "16px 10px", borderRadius: "18px", backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", fontSize: "13px", fontWeight: 500, boxShadow: "0 6px 15px rgba(0,0,0,0.04)" },
  row:          { display: "flex", gap: "12px" },
  inputHalf:    { flex: 1, padding: "14px", borderRadius: "16px", border: "none", backgroundColor: "white", fontSize: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.04)" },
  textarea:     { width: "100%", padding: "14px", borderRadius: "18px", border: "none", backgroundColor: "white", minHeight: "90px", fontSize: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.04)", resize: "vertical" },
  proofBox:     { backgroundColor: "#eef6ff", borderRadius: "18px", padding: "16px", marginTop: "8px" },
  proofTitle:   { fontWeight: 600, fontSize: "14px", marginBottom: "4px", color: "#0a4d8c" },
  proofHint:    { fontSize: "12px", color: "#6e6e73", marginBottom: "12px", lineHeight: 1.4 },
  footer:       { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", backgroundColor: "#f2f2f7", padding: "16px" },
  footerInner:  { width: "100%", maxWidth: "480px" },
  submitBtn:    { width: "100%", padding: "18px", borderRadius: "28px", border: "none", backgroundColor: "#007aff", color: "white", fontSize: "16px", fontWeight: 600, cursor: "pointer", boxShadow: "0 10px 25px rgba(0,122,255,0.3)" }
}
