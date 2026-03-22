import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiArrowLeft, FiMapPin, FiSave } from "react-icons/fi"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import useValidation from "../hooks/useValidation"
import FieldError from "../components/FieldError"
import { validatePhone, validatePastDate } from "../utils/validators"

export default function EditReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item,        setItem]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [saved,       setSaved]       = useState(false)

  // editable fields
  const [description, setDescription] = useState("")
  const [location,    setLocation]    = useState("")
  const [date,        setDate]        = useState("")
  const [phone1,      setPhone1]      = useState("")
  const [phone2,      setPhone2]      = useState("")
  const [reward,      setReward]      = useState("")

  useEffect(() => {
    axios.get(`http://localhost:5000/api/items/${id}`)
      .then(res => {
        const i = res.data
        // Guard: only the owner can edit
        if (i.createdBy?._id !== user?.id && i.createdBy !== user?.id) {
          navigate(-1); return
        }
        setItem(i)
        setDescription(i.description || "")
        setLocation(i.location       || "")
        setDate(i.date ? i.date.split("T")[0] : "")
        setPhone1(i.phone1            || "")
        setPhone2(i.phone2            || "")
        setReward(i.reward            || "")
      })
      .catch(() => navigate(-1))
      .finally(() => setLoading(false))
  }, [id])

  const { errors, touched, validateAll } = useValidation({
    phone1: () => validatePhone(phone1),
    phone2: () => validatePhone(phone2, false),
    date:   () => validatePastDate(date, false),
  })

  const submit = async () => {
    if (!validateAll()) return
    setSubmitting(true)
    try {
      await axios.patch(`http://localhost:5000/api/items/${id}`, {
        description, location, date, phone1, phone2, reward
      })
      setSaved(true)
      setTimeout(() => navigate(`/item/${id}`), 1200)
    } catch (err) {
      alert(err?.response?.data?.message || "Error saving changes")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
    </div>
  )

  if (!item) return null

  return (
    <div style={S.screen}>
      <div style={S.container}>

        {/* Header */}
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <FiArrowLeft size={18} />
          </button>
          <h2 style={S.title}>Edit Report</h2>
          <div style={{ width: 36 }} />
        </div>

        {/* Non-editable info */}
        <div style={S.infoChips}>
          <span style={S.chip}>{item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}</span>
          <span style={S.chip}>{item.category}</span>
          <span style={{ ...S.chip, color: "#9ca3af" }}>ID and category cannot be changed</span>
        </div>

        {/* Description */}
        <div style={S.section}>
          <p style={S.label}>Description</p>
          <textarea style={S.textarea}
            placeholder="Describe the item…"
            value={description}
            onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Location */}
        <div style={S.section}>
          <p style={S.label}>Location</p>
          <input type="text" placeholder="e.g. Blantyre, Area 25, Lilongwe CBD…" value={location} onChange={e => setLocation(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Date */}
        <div style={S.section}>
          <p style={S.label}>Date</p>
          <input type="date" style={S.dateInput}
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setDate(e.target.value)} />
          <FieldError error={errors.date} touched={touched.date} />
        </div>

        {/* Phones */}
        <div style={S.section}>
          <p style={S.label}>Contact numbers</p>
          <input type="tel" placeholder="Primary phone *"
            value={phone1} onChange={e => setPhone1(e.target.value)} />
          <FieldError error={errors.phone1} touched={touched.phone1} />
          <input type="tel" placeholder="Second phone (optional)"
            value={phone2} onChange={e => setPhone2(e.target.value)} style={{ marginTop: 8 }} />
          <FieldError error={errors.phone2} touched={touched.phone2} />
        </div>

        {/* Reward */}
        <div style={S.section}>
          <p style={S.label}>Reward (optional)</p>
          <textarea style={S.textarea}
            placeholder="Describe the reward, or leave blank…"
            value={reward}
            onChange={e => setReward(e.target.value)} />
        </div>

      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div style={S.footerInner}>
          <button onClick={submit} disabled={submitting || saved}
            style={{
              ...S.saveBtn,
              opacity: submitting ? 0.7 : 1,
              background: saved ? "#25D366" : "#007aff"
            }}>
            {saved ? "✓ Saved!" : submitting ? "Saving…" : <><FiSave size={16} style={{ marginRight: 8 }} />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

const S = {
  screen:      { backgroundColor: "#f2f2f7", minHeight: "100vh" },
  container:   { maxWidth: 480, margin: "0 auto", padding: "20px 18px 120px" },
  center:      { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner:     { width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #0a4d8c", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  header:      { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn:     { background: "none", border: "none", cursor: "pointer", color: "#0a4d8c", padding: 4, display: "flex" },
  title:       { fontSize: 20, fontWeight: 700, color: "#1c1c1e", margin: 0 },
  infoChips:   { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  chip:        { fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#f2f3f7", color: "#6e6e73" },
  section:     { marginBottom: 22 },
  label:       { fontSize: 13, color: "#6e6e73", marginBottom: 8, fontWeight: 500 },
  textarea:    { width: "100%", padding: "14px", borderRadius: 16, border: "none", backgroundColor: "white", minHeight: 90, fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", resize: "vertical", boxSizing: "border-box" },
  dateInput:   { padding: "12px 14px", borderRadius: 14, border: "1.5px solid #e5e7eb", fontSize: 14, backgroundColor: "white", outline: "none" },
  footer:      { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", background: "#f2f2f7", padding: 16 },
  footerInner: { width: "100%", maxWidth: 480 },
  saveBtn:     { width: "100%", padding: 18, borderRadius: 28, border: "none", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s" },
}
