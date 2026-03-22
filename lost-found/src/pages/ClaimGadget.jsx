import { useState } from "react"
import { FiUpload, FiSmartphone, FiMonitor, FiTablet } from "react-icons/fi"
import SubmitModal from "../components/SubmitModal"
import axios from "axios"
import useValidation from "../hooks/useValidation"
import FieldError from "../components/FieldError"
import { validatePhone, validateIMEI, validateRequired } from "../utils/validators"


const categories = [
  { name: "Phone",  icon: <FiSmartphone size={22}/> },
  { name: "Laptop", icon: <FiMonitor    size={22}/> },
  { name: "Tablet", icon: <FiTablet     size={22}/> },
]

export default function ClaimGadget() {
  const [category,     setCategory]     = useState("")
  const [fields,       setFields]       = useState({})
  const [images,       setImages]       = useState([])
  const [phone1,       setPhone1]       = useState("")
  const [phone2,       setPhone2]       = useState("")
  const [claimantName, setClaimantName] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [submittedId, setSubmittedId] = useState(null)

  const set = (key, val) => setFields(prev => ({ ...prev, [key]: val }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files.map(file => ({ file, url: URL.createObjectURL(file) })))
  }

  const { errors, touched, validateAll } = useValidation({
    category: () => validateRequired(category, "Device type"),
    phone1:   () => validatePhone(phone1),
    phone2:   () => validatePhone(phone2, false),
    imei:     () => category === "Phone"
                      ? validateIMEI(fields.imei || "", true)
                      : category === "Tablet" && fields.imei
                        ? validateIMEI(fields.imei, false) : null,
    serial:   () => category === "Laptop"
                      ? validateRequired(fields.serial, "Serial number") : null,
  })

  const submit = async () => {
    if (!validateAll()) return

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

    setSubmitting(true)
    try {
      await axios.post("http://localhost:5000/api/claims", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
setModalVisible(true)   
setSubmittedId(claim.data.item._id)   // ← add this
 } catch (err) {
      alert(err?.response?.data?.message || "Error submitting claim")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.screen}>
      <div style={S.container}>
        <h2 style={S.title}>Claim a Gadget</h2>
        <p style={S.subtitle}>Prove ownership using IMEI or serial number.</p>

        <label style={S.photoCard}>
          {images.length > 0
            ? <img src={images[0].url} alt="" style={S.photoPreview}/>
            : <><FiUpload size={28} color="#6e6e73"/><p style={{marginTop:10,color:"#6e6e73",fontSize:14}}>Upload proof photo (receipt, box, etc.)</p></>}
          <input type="file" accept="image/*" multiple onChange={handleImages} style={{display:"none"}}/>
        </label>

        <div style={S.section}>
          <p style={S.sectionTitle}>Device Type *</p>
          <div style={S.categoryGrid}>
            {categories.map(cat => (
              <div key={cat.name}
                onClick={() => { setCategory(cat.name); setFields({}) }}
                style={{
                  ...S.categoryCard,
                  backgroundColor: category === cat.name ? "#007aff" : "white",
                  color:           category === cat.name ? "white"   : "#1c1c1e",
                  border: errors.category ? "1.5px solid #e53e3e" : "none",
                }}>
                {cat.icon}
                <span style={{marginTop:6}}>{cat.name}</span>
              </div>
            ))}
          </div>
          <FieldError error={errors.category} touched={touched.category} />
        </div>

        {category === "Phone" && (
          <div style={S.section}>
            <p style={S.sectionTitle}>Phone Details</p>
            <input placeholder="Device name (e.g. iPhone 14 Pro)" onChange={e => set("deviceName", e.target.value)}/>
            <input placeholder="Brand"  onChange={e => set("brand", e.target.value)}/>
            <input placeholder="Model"  onChange={e => set("model", e.target.value)}/>
            <div style={S.row}>
              <input placeholder="Color"   style={S.inputHalf} onChange={e => set("color",   e.target.value)}/>
              <input placeholder="Storage" style={S.inputHalf} onChange={e => set("storage", e.target.value)}/>
            </div>
            <textarea placeholder="Other specs…" style={S.textarea} onChange={e => set("specs", e.target.value)}/>
            <div style={S.proofBox}>
              <p style={S.proofTitle}>📋 Proof of Ownership</p>
              <p style={S.proofHint}>Dial <strong>*#06#</strong> to find your IMEI. Required.</p>
              <input placeholder="IMEI 1 * (15 digits)" onChange={e => set("imei",  e.target.value)}/>
              <FieldError error={errors.imei} touched={touched.imei} />
              <input placeholder="IMEI 2 (dual-SIM, optional)" onChange={e => set("imei2", e.target.value)}/>
            </div>
          </div>
        )}

        {category === "Laptop" && (
          <div style={S.section}>
            <p style={S.sectionTitle}>Laptop Details</p>
            <input placeholder="Device name (e.g. MacBook Air M2)" onChange={e => set("deviceName", e.target.value)}/>
            <input placeholder="Brand"  onChange={e => set("brand", e.target.value)}/>
            <input placeholder="Model"  onChange={e => set("model", e.target.value)}/>
            <div style={S.row}>
              <input placeholder="Color"   style={S.inputHalf} onChange={e => set("color",   e.target.value)}/>
              <input placeholder="Storage" style={S.inputHalf} onChange={e => set("storage", e.target.value)}/>
            </div>
            <textarea placeholder="Other specs…" style={S.textarea} onChange={e => set("specs", e.target.value)}/>
            <div style={S.proofBox}>
              <p style={S.proofTitle}>📋 Proof of Ownership</p>
              <p style={S.proofHint}>Find the serial on a sticker under the laptop or in System Info.</p>
              <input placeholder="Serial Number *" onChange={e => set("serial", e.target.value)}/>
              <FieldError error={errors.serial} touched={touched.serial} />
            </div>
          </div>
        )}

        {category === "Tablet" && (
          <div style={S.section}>
            <p style={S.sectionTitle}>Tablet Details</p>
            <input placeholder="Device name (e.g. iPad Air 5)" onChange={e => set("deviceName", e.target.value)}/>
            <input placeholder="Brand"  onChange={e => set("brand", e.target.value)}/>
            <input placeholder="Model"  onChange={e => set("model", e.target.value)}/>
            <div style={S.row}>
              <input placeholder="Color"   style={S.inputHalf} onChange={e => set("color",   e.target.value)}/>
              <input placeholder="Storage" style={S.inputHalf} onChange={e => set("storage", e.target.value)}/>
            </div>
            <textarea placeholder="Other specs…" style={S.textarea} onChange={e => set("specs", e.target.value)}/>
            <div style={S.proofBox}>
              <p style={S.proofTitle}>📋 Proof of Ownership</p>
              <p style={S.proofHint}>Enter IMEI (cellular tablets) or serial number.</p>
              <input placeholder="IMEI (if cellular)"  onChange={e => set("imei",   e.target.value)}/>
              <input placeholder="Serial Number"        onChange={e => set("serial", e.target.value)}/>
            </div>
          </div>
        )}

        {category && (
          <div style={S.section}>
            <p style={S.sectionTitle}>Your Contact Details</p>
            <input type="text" placeholder="Your Name (optional)"
              value={claimantName} onChange={e => setClaimantName(e.target.value)}/>
            <input type="tel" placeholder="Phone Number * (e.g. +265991234567)"
              value={phone1} onChange={e => setPhone1(e.target.value)}/>
            <FieldError error={errors.phone1} touched={touched.phone1} />
            <input type="tel" placeholder="Second Phone Number (optional)"
              value={phone2} onChange={e => setPhone2(e.target.value)}/>
            <FieldError error={errors.phone2} touched={touched.phone2} />
          </div>
        )}
      </div>

      <div style={S.footer}>
        <div style={S.footerInner}>
          <button onClick={submit} disabled={submitting}
            style={{...S.submitBtn, opacity: submitting ? 0.7 : 1}}>
            {submitting ? "Submitting…" : "Submit Claim"}
          </button>
        </div>
      </div>

      <SubmitModal itemId={submittedId} visible={modalVisible} type="claim" category={category}
        onClose={() => setModalVisible(false)}/>
    </div>
  )
}

const S = {
  screen:       { backgroundColor:"#f2f2f7", minHeight:"100vh", display:"flex", justifyContent:"center" },
  container:    { width:"100%", maxWidth:"480px", padding:"30px 20px 120px" },
  title:        { fontSize:"24px", fontWeight:600, marginBottom:"6px" },
  subtitle:     { fontSize:"14px", color:"#6e6e73", marginBottom:"24px", lineHeight:1.5 },
  photoCard:    { height:"160px", borderRadius:"22px", backgroundColor:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", marginBottom:"28px", boxShadow:"0 8px 20px rgba(0,0,0,0.05)" },
  photoPreview: { width:"100%", height:"100%", objectFit:"cover" },
  section:      { marginBottom:"28px" },
  sectionTitle: { fontSize:"14px", color:"#6e6e73", marginBottom:"12px" },
  categoryGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"12px" },
  categoryCard: { padding:"16px 10px", borderRadius:"18px", backgroundColor:"white", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", fontSize:"13px", fontWeight:500, boxShadow:"0 6px 15px rgba(0,0,0,0.04)", transition:"0.2s" },
  row:          { display:"flex", gap:"12px" },
  inputHalf:    { flex:1, padding:"14px", borderRadius:"16px", border:"none", backgroundColor:"white", fontSize:"14px", boxShadow:"0 6px 15px rgba(0,0,0,0.04)" },
  textarea:     { width:"100%", padding:"14px", borderRadius:"18px", border:"none", backgroundColor:"white", minHeight:"90px", fontSize:"14px", boxShadow:"0 6px 15px rgba(0,0,0,0.04)", resize:"vertical" },
  proofBox:     { backgroundColor:"#eef6ff", borderRadius:"18px", padding:"16px", marginTop:"8px" },
  proofTitle:   { fontWeight:600, fontSize:"14px", marginBottom:"4px", color:"#0a4d8c" },
  proofHint:    { fontSize:"12px", color:"#6e6e73", marginBottom:"12px", lineHeight:1.4 },
  footer:       { position:"fixed", bottom:0, left:0, right:0, display:"flex", justifyContent:"center", backgroundColor:"#f2f2f7", padding:"16px" },
  footerInner:  { width:"100%", maxWidth:"480px" },
  submitBtn:    { width:"100%", padding:"18px", borderRadius:"28px", border:"none", backgroundColor:"#007aff", color:"white", fontSize:"16px", fontWeight:600, cursor:"pointer", boxShadow:"0 10px 25px rgba(0,122,255,0.3)", transition:"0.2s" },
}
