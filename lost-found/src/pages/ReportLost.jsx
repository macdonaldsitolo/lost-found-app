import { useState } from "react"
import { FiUpload, FiSmartphone, FiMonitor, FiCreditCard, FiBox } from "react-icons/fi"
import SubmitModal   from "../components/SubmitModal"

import axios         from "axios"
import { useAuth }   from "../context/AuthContext"
import useValidation from "../hooks/useValidation"
import FieldError    from "../components/FieldError"
import { validatePhone, validatePastDate, validateRequired, validateIMEI } from "../utils/validators"

const CATEGORIES = [
  { name: "Phone",   icon: <FiSmartphone size={18} /> },
  { name: "Laptop",  icon: <FiMonitor    size={18} /> },
  { name: "Wallet",  icon: <FiCreditCard size={18} /> },
  { name: "ID Card", icon: <FiCreditCard size={18} /> },
  { name: "Other",   icon: <FiBox        size={18} /> },
]

export default function ReportLost() {
  const { user } = useAuth()

  const [extra,        setExtra]        = useState({})
  const [phone1,       setPhone1]       = useState(user?.phone || "")
  const [phone2,       setPhone2]       = useState("")
  const [images,       setImages]       = useState([])
  const [category,     setCategory]     = useState("")
  const [hasReward,    setHasReward]    = useState(false)
  const [reward,       setReward]       = useState("")
  const [description,  setDescription]  = useState("")
  const [date,         setDate]         = useState("")
  const [location,     setLocation]     = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [submittedId,  setSubmittedId]  = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files.map(f => ({ file: f, url: URL.createObjectURL(f) })))
  }

  const set = (k, v) => setExtra(p => ({ ...p, [k]: v }))

  const { errors, touched, validateAll } = useValidation({
    category: () => validateRequired(category, "Category"),
    phone1:   () => validatePhone(phone1),
    phone2:   () => validatePhone(phone2, false),
    date:     () => validatePastDate(date, false),
    imei:     () => category === "Phone" && extra.imei ? validateIMEI(extra.imei, false) : null,
  })

  const submit = async () => {
    if (!validateAll()) return

    let itemName = ""
    if (category === "Phone")   itemName = extra.phoneName  || "Phone"
    if (category === "Laptop")  itemName = extra.laptopName || "Laptop"
    if (category === "Wallet")  itemName = `${extra.color || ""} Wallet`.trim()
    if (category === "ID Card") itemName = extra.idType     || "ID Card"
    if (category === "Other")   itemName = extra.itemName   || "Item"

    const fd = new FormData()
    fd.append("type",        "lost")
    fd.append("category",    category)
    fd.append("description", description)
    fd.append("location",    location)
    fd.append("date",        date)
    fd.append("reward",      reward)
    fd.append("phone1",      phone1)
    fd.append("phone2",      phone2)
    images.forEach(img => fd.append("images", img.file))
    fd.append("extraFields", JSON.stringify({ ...extra, itemName }))

    setSubmitting(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/items`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setSubmittedId(res.data.item._id)
      setModalVisible(true)
    } catch (err) {
      alert(err?.response?.data?.message || "Error submitting report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.screen}>
      <div style={S.container}>
        <h2 style={S.title}>Report Lost Item</h2>

        {/* Photo upload */}
        <label style={S.photoCard}>
          {images.length > 0
            ? <img src={images[0].url} alt="" style={S.photoPreview} />
            : <><FiUpload size={22} color="#9ca3af" /><span style={S.photoHint}>Upload photo</span></>}
          <input type="file" accept="image/*" onChange={handleImages} style={{ display: "none" }} />
        </label>

        {/* Category pills */}
        <div style={S.field}>
          <label style={S.label}>Category *</label>
          <div style={S.pills}>
            {CATEGORIES.map(c => (
              <button key={c.name} type="button"
                onClick={() => setCategory(c.name)}
                style={{ ...S.pill, ...(category === c.name ? S.pillActive : {}) }}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <FieldError error={errors.category} touched={touched.category} />
        </div>

        {/* ── Category-specific fields ── */}
        {category === "Phone" && (
          <div style={S.card}>
            <p style={S.cardTitle}>Phone Details</p>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.label}>Phone name</label>
                <input style={S.input} placeholder="e.g. Samsung Galaxy A54"
                  onChange={e => set("phoneName", e.target.value)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>IMEI (optional)</label>
                <input style={S.input} placeholder="15 digits"
                  onChange={e => set("imei", e.target.value)} />
                <FieldError error={errors.imei} touched={touched.imei} />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Other details</label>
              <input style={S.input} placeholder="Color, condition, marks…"
                onChange={e => set("specs", e.target.value)} />
            </div>
          </div>
        )}

        {category === "Laptop" && (
          <div style={S.card}>
            <p style={S.cardTitle}>Laptop Details</p>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.label}>Laptop name</label>
                <input style={S.input} placeholder="e.g. HP EliteBook 840"
                  onChange={e => set("laptopName", e.target.value)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Serial number</label>
                <input style={S.input} placeholder="Optional"
                  onChange={e => set("serial", e.target.value)} />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Other details</label>
              <input style={S.input} placeholder="Color, stickers, distinguishing marks…"
                onChange={e => set("specs", e.target.value)} />
            </div>
          </div>
        )}

        {category === "Wallet" && (
          <div style={S.card}>
            <p style={S.cardTitle}>Wallet Details</p>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.label}>Color</label>
                <input style={S.input} onChange={e => set("color", e.target.value)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Brand</label>
                <input style={S.input} placeholder="Optional"
                  onChange={e => set("brand", e.target.value)} />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Contents</label>
              <input style={S.input} placeholder="IDs, cash, cards…"
                onChange={e => set("contents", e.target.value)} />
            </div>
          </div>
        )}

        {category === "ID Card" && (
          <div style={S.card}>
            <p style={S.cardTitle}>ID Card Details</p>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.label}>ID type</label>
                <select style={S.input} onChange={e => set("idType", e.target.value)}>
                  <option value="">Select…</option>
                  <option>National ID</option>
                  <option>School ID</option>
                  <option>MANEB</option>
                  <option>Passport</option>
                  <option>Driver's Licence</option>
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Name on ID</label>
                <input style={S.input} onChange={e => set("fullName", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {category === "Other" && (
          <div style={S.card}>
            <p style={S.cardTitle}>Item Details</p>
            <div style={S.field}>
              <label style={S.label}>Item name</label>
              <input style={S.input} onChange={e => set("itemName", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Description</label>
              <input style={S.input} placeholder="Identifying details"
                onChange={e => set("specs", e.target.value)} />
            </div>
          </div>
        )}

        {/* Location + Date */}
        <div style={S.twoColField}>
          <div style={S.field}>
            <label style={S.label}>Where was it lost?</label>
            <input style={S.input} placeholder="e.g. Blantyre, Area 25, Lilongwe CBD…" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Date lost</label>
            <input type="date" style={{ ...S.input, width: "auto" }}
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => setDate(e.target.value)} />
            <FieldError error={errors.date} touched={touched.date} />
          </div>
        </div>

        {/* Description */}
        <div style={S.field}>
          <label style={S.label}>Additional description</label>
          <textarea style={S.textarea}
            placeholder="Any other details that could help identify the item…"
            value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Contact */}
        <div style={S.card}>
          <p style={S.cardTitle}>
            Contact {user?.phone && <span style={S.prefill}>pre-filled from account</span>}
          </p>
          <div style={S.twoCol}>
            <div style={S.field}>
              <label style={S.label}>Primary phone *</label>
              <input type="tel" style={S.input} value={phone1}
                onChange={e => setPhone1(e.target.value)} />
              <FieldError error={errors.phone1} touched={touched.phone1} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Second phone</label>
              <input type="tel" style={S.input} value={phone2}
                onChange={e => setPhone2(e.target.value)} />
              <FieldError error={errors.phone2} touched={touched.phone2} />
            </div>
          </div>
        </div>

        {/* Reward */}
        <div style={S.field}>
          <label style={S.checkLabel}>
            <input type="checkbox" checked={hasReward} onChange={() => setHasReward(!hasReward)} />
            <span>Offer a reward for this item</span>
          </label>
          {hasReward && (
            <textarea style={{ ...S.textarea, marginTop: 8 }}
              placeholder="Describe the reward…"
              value={reward} onChange={e => setReward(e.target.value)} />
          )}
        </div>

      </div>

      <div style={S.footer}>
        <button onClick={submit} disabled={submitting}
          style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </div>

      <SubmitModal visible={modalVisible} type="lost" category={category}
        itemId={submittedId} onClose={() => setModalVisible(false)} />
    </div>
  )
}

const S = {
  screen:       { backgroundColor: "#f2f2f7", minHeight: "100vh" },
  container:    { maxWidth: 560, margin: "0 auto", padding: "24px 18px 100px" },
  title:        { fontSize: 22, fontWeight: 700, color: "#1c1c1e", marginBottom: 18 },
  photoCard:    { height: 100, borderRadius: 14, backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", gap: 10 },
  photoPreview: { width: "100%", height: "100%", objectFit: "cover" },
  photoHint:    { fontSize: 13, color: "#9ca3af" },
  field:        { marginBottom: 14 },
  label:        { display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" },
  prefill:      { fontSize: 10, background: "#eef2ff", color: "#0a4d8c", padding: "1px 6px", borderRadius: 8, marginLeft: 8, fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  pills:        { display: "flex", flexWrap: "wrap", gap: 8 },
  pill:         { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 600, color: "#6e6e73", cursor: "pointer", transition: "0.15s" },
  pillActive:   { background: "#0a4d8c", borderColor: "#0a4d8c", color: "white" },
  card:         { background: "white", borderRadius: 16, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  cardTitle:    { fontSize: 13, fontWeight: 700, color: "#1c1c1e", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  twoCol:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  twoColField:  { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 0 },
  input:        { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "white", outline: "none", boxSizing: "border-box", color: "#1c1c1e" },
  textarea:     { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "white", outline: "none", minHeight: 72, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" },
  checkLabel:   { display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", color: "#1c1c1e" },
  footer:       { position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 18px", background: "#f2f2f7", display: "flex", justifyContent: "center" },
  submitBtn:    { width: "100%", maxWidth: 560, padding: 15, borderRadius: 22, border: "none", background: "#007aff", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,122,255,0.28)" },
}
