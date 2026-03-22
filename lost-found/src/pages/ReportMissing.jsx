import { useState, useEffect } from "react"
import { FiUpload, FiUser, FiAlertCircle } from "react-icons/fi"
import SubmitModal   from "../components/SubmitModal"

import axios         from "axios"
import { useAuth }   from "../context/AuthContext"
import useValidation from "../hooks/useValidation"
import FieldError    from "../components/FieldError"
import {
  validatePhone, validatePastDate, validateName,
  validateRequired, validatePersonAge
} from "../utils/validators"

function ReportMissing() {
  const { user } = useAuth()

  const [personName,   setPersonName]   = useState("")
  const [age,          setAge]          = useState("")
  const [gender,       setGender]       = useState("")
  const [outfit,       setOutfit]       = useState("")
  const [homeDistrict, setHomeDistrict] = useState("")
  const [phone1,       setPhone1]       = useState(user?.phone || "")
  const [phone2,       setPhone2]       = useState("")
  const [images,       setImages]       = useState([])
  const [category,     setCategory]     = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [submittedId,  setSubmittedId]  = useState(null)
  const [description,  setDescription]  = useState("")
  const [reward,       setReward]       = useState("")
  const [hasReward,    setHasReward]    = useState(false)
  const [dateLost,     setDateLost]     = useState("")
  const [location,     setLocation]     = useState("")
  const [submitting,   setSubmitting]   = useState(false)

  // ── Inline age error — revalidates when age OR date changes ──────────────
  const [ageError, setAgeError] = useState(null)

  useEffect(() => {
    // Only run cross-check when at least age has a value
    if (!age) { setAgeError(null); return }
    setAgeError(validatePersonAge(age, dateLost, false))
  }, [age, dateLost])

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files.map(file => ({ file, url: URL.createObjectURL(file) })))
  }

  const { errors, touched, validateAll } = useValidation({
    category:   () => validateRequired(category, "Type"),
    personName: () => validateName(personName, "Person name"),
    age:        () => validatePersonAge(age, dateLost, false),
    phone1:     () => validatePhone(phone1),
    phone2:     () => validatePhone(phone2, false),
    date:       () => validatePastDate(dateLost, false),
  })

  const submit = async () => {
    if (ageError) return   // block if inline age error is active
    if (!validateAll()) return

    const extraFields = {
      personName,
      age:          age ? Number(age) : null,
      gender,
      outfit:       (category === "Missing" || category === "Found") ? outfit : undefined,
      homeDistrict: category === "Wanted" ? homeDistrict : undefined,
    }

    const formData = new FormData()
    formData.append("type",        category.toLowerCase())
    formData.append("category",    "person")
    formData.append("description", description || "")
    formData.append("location",    location || "Unknown")
    formData.append("date",        dateLost || new Date().toISOString())
    formData.append("reward",      category !== "Found" && hasReward ? reward : "")
    formData.append("phone1",      phone1)
    formData.append("phone2",      phone2)
    formData.append("extraFields", JSON.stringify(extraFields))
    images.forEach(img => formData.append("images", img.file))

    setSubmitting(true)
    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/items', formData, {
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

  const types = [
    { name: "Missing", icon: <FiUser        size={20} color="orange" /> },
    { name: "Found",   icon: <FiUser        size={20} color="green"  /> },
    { name: "Wanted",  icon: <FiAlertCircle size={20} color="red"    /> },
  ]

  return (
    <div style={S.screen}>
      <div style={S.container}>
        <h2 style={S.title}>Report Person</h2>

        {/* Photo */}
        <label style={S.photoCard}>
          {images.length > 0
            ? <img src={images[0].url} alt="" style={S.photoPreview} />
            : <><FiUpload size={24} color="#9ca3af" /><span style={S.photoHint}>Upload photo</span></>}
          <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
        </label>

        {/* Type */}
        <div style={S.row}>
          {types.map(t => (
            <button key={t.name} type="button"
              onClick={() => setCategory(t.name)}
              style={{ ...S.typeBtn, ...(category === t.name ? S.typeBtnActive : {}) }}>
              {t.icon}
              <span>{t.name}</span>
            </button>
          ))}
        </div>
        <FieldError error={errors.category} touched={touched.category} />

        {/* Person name */}
        <div style={S.field}>
          <label style={S.label}>Person name *</label>
          <input style={S.input} value={personName} placeholder="Full name"
            onChange={e => setPersonName(e.target.value)} />
          <FieldError error={errors.personName} touched={touched.personName} />
        </div>

        {/* Age + gender row */}
        <div style={S.twoCol}>
          <div style={S.field}>
            <label style={S.label}>Age</label>
            <input style={S.input} type="number" min="1" max="120" placeholder="e.g. 25"
              value={age} onChange={e => setAge(e.target.value)} />
            {/* inline — shows immediately when age+date are both filled */}
            {ageError && <p style={{ fontSize: 12, color: "#e53e3e", marginTop: 4 }}>{ageError}</p>}
          </div>
          <div style={S.field}>
            <label style={S.label}>Gender</label>
            <select style={S.input} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
        </div>

        {/* Outfit — Missing + Found */}
        {(category === "Missing" || category === "Found") && (
          <div style={S.field}>
            <label style={S.label}>What were they wearing?</label>
            <input style={S.input} value={outfit} placeholder="Describe clothing…"
              onChange={e => setOutfit(e.target.value)} />
          </div>
        )}

        {/* Home district — Wanted */}
        {category === "Wanted" && (
          <div style={S.field}>
            <label style={S.label}>Home district</label>
            <input style={S.input} value={homeDistrict}
              onChange={e => setHomeDistrict(e.target.value)} />
          </div>
        )}

        {/* Location */}
        <div style={S.field}>
          <label style={S.label}>
            {category === "Found" ? "Where found?" : "Last seen location"}
          </label>
          <input style={S.input} placeholder="e.g. Blantyre, Area 25, Lilongwe CBD…" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        {/* Date */}
        <div style={S.field}>
          <label style={S.label}>Date</label>
          <input type="date" style={{ ...S.input, width: "auto" }}
            value={dateLost}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setDateLost(e.target.value)} />
          <FieldError error={errors.date} touched={touched.date} />
        </div>

        {/* Description */}
        <div style={S.field}>
          <label style={S.label}>Description</label>
          <textarea style={S.textarea} value={description}
            placeholder="Height, build, identifying marks, last known activities…"
            onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Contact */}
        <div style={S.twoCol}>
          <div style={S.field}>
            <label style={S.label}>Phone * {user?.phone && <span style={S.prefill}>pre-filled</span>}</label>
            <input style={S.input} type="tel" value={phone1}
              onChange={e => setPhone1(e.target.value)} />
            <FieldError error={errors.phone1} touched={touched.phone1} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Second phone</label>
            <input style={S.input} type="tel" value={phone2}
              onChange={e => setPhone2(e.target.value)} />
            <FieldError error={errors.phone2} touched={touched.phone2} />
          </div>
        </div>

        {/* Reward — hidden for Found persons */}
        {category !== "Found" && (
          <div style={S.field}>
            <label style={S.checkLabel}>
              <input type="checkbox" checked={hasReward} onChange={() => setHasReward(!hasReward)} />
              <span>Offer a reward</span>
            </label>
            {hasReward && (
              <textarea style={{ ...S.textarea, marginTop: 8 }}
                placeholder="Describe the reward…"
                value={reward} onChange={e => setReward(e.target.value)} />
            )}
          </div>
        )}

      </div>

      <div style={S.footer}>
        <button onClick={submit} disabled={submitting}
          style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </div>

      <SubmitModal visible={modalVisible}
        type={category ? category.toLowerCase() : "missing"}
        category="person"
        itemId={submittedId}
        onClose={() => setModalVisible(false)} />
    </div>
  )
}

const S = {
  screen:       { backgroundColor: "#f2f2f7", minHeight: "100vh" },
  container:    { maxWidth: 520, margin: "0 auto", padding: "24px 18px 100px" },
  title:        { fontSize: 22, fontWeight: 700, color: "#1c1c1e", marginBottom: 18 },
  photoCard:    { height: 120, borderRadius: 16, backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", gap: 8 },
  photoPreview: { width: "100%", height: "100%", objectFit: "cover" },
  photoHint:    { fontSize: 13, color: "#9ca3af" },
  row:          { display: "flex", gap: 10, marginBottom: 4 },
  typeBtn:      { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 6px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6e6e73", transition: "0.15s" },
  typeBtnActive:{ background: "#0a4d8c", borderColor: "#0a4d8c", color: "white" },
  twoCol:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field:        { marginBottom: 14 },
  label:        { display: "block", fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" },
  prefill:      { fontSize: 10, background: "#eef2ff", color: "#0a4d8c", padding: "1px 6px", borderRadius: 8, marginLeft: 6, fontWeight: 600, textTransform: "none" },
  input:        { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, background: "white", outline: "none", boxSizing: "border-box", color: "#1c1c1e" },
  textarea:     { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, background: "white", outline: "none", minHeight: 80, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", color: "#1c1c1e" },
  checkLabel:   { display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", color: "#1c1c1e" },
  footer:       { position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 18px", background: "#f2f2f7", display: "flex", justifyContent: "center" },
  submitBtn:    { width: "100%", maxWidth: 520, padding: 16, borderRadius: 24, border: "none", background: "#007aff", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(0,122,255,0.3)" },
}

export default ReportMissing
