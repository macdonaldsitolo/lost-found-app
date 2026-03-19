import { useState, useEffect, useRef } from "react"
import {
  FiUpload,
  FiSmartphone,
  FiMonitor,
  FiCreditCard,
  FiBox,
  FiMapPin
} from "react-icons/fi"

import SubmitModal from "../components/SubmitModal"
import axios from "axios"


function ReportLost() {
  const [extraFields, setExtraFields] = useState({})
  const [name, setName] = useState("")
  const [phone1, setPhone1] = useState("")
  const [phone2, setPhone2] = useState("")
  const [images, setImages] = useState([])
  const [category, setCategory] = useState("")
  const [hasReward, setHasReward] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [description, setDescription] = useState("")
  const [reward, setReward] = useState("")
  const [dateLost, setDateLost] = useState("")

  const locationRef = useRef(null)

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))
    setImages(previews)
  }

const handleExtraChange = (key, value) => {
  setExtraFields(prev => ({
    ...prev,
    [key]: value
  }))
}

  const submit = async () => {

  if (!phone1) {
    alert("Phone number is required")
    return
  }

  if (!category) {
    alert("Please select a category")
    return
  }

  // ✅ CREATE PROPER ITEM NAME
  let itemName = ""

  if (category === "Phone") {
    itemName = extraFields.phoneName || "Phone"
  } else if (category === "Laptop") {
    itemName = `${extraFields.brand || ""} ${extraFields.model || ""}`.trim()
  } else if (category === "Wallet") {
    itemName = `${extraFields.color || ""} Wallet`.trim()
  } else if (category === "ID Card") {
    itemName = extraFields.idType || "ID Card"
  } else if (category === "Other") {
    itemName = extraFields.itemName || "Item"
  }

  const finalExtraFields = {
    ...extraFields,
    itemName // ✅ THIS IS THE FIX
  }

  const formData = new FormData()

  formData.append("type", "lost")
  formData.append("category", category)
  formData.append("description", description)
  formData.append("location", locationRef.current?.value || "")
  formData.append("date", dateLost)
  formData.append("reward", reward)
  formData.append("name", name)
  formData.append("phone1", phone1)
  formData.append("phone2", phone2)

  images.forEach(img => {
    formData.append("images", img.file)
  })
  formData.append("extraFields", JSON.stringify(finalExtraFields))


  try {
    await axios.post(
      "http://localhost:5000/api/items",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    setModalVisible(true)

  } catch (err) {
    console.error(err)
    alert("Error submitting report")
  }
}

  const categories = [
    { name: "Phone", icon: <FiSmartphone size={22} /> },
    { name: "Laptop", icon: <FiMonitor size={22} /> },
    { name: "Wallet", icon: <FiCreditCard size={22} /> },
    { name: "ID Card", icon: <FiCreditCard size={22} /> },
    { name: "Other", icon: <FiBox size={22} /> }
  ]

  return (
    <div style={styles.screen}>

      <div style={styles.container}>

        <h2 style={styles.title}>Report Lost Item</h2>

        <label style={styles.photoCard}>
          {images.length > 0 ? (
            <img src={images[0].url} alt="" style={styles.photoPreview} />
          ) : (
            <>
              <FiUpload size={28} color="#6e6e73" />
              <p style={{ marginTop: 10 }}>Tap to Upload Photos</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImages}
            style={{ display: "none" }}
          />
        </label>

        <div style={styles.section}>
          <p style={styles.sectionTitle}>Category</p>

          <div style={styles.categoryGrid}>
            {categories.map((item) => (
              <div
                key={item.name}
                onClick={() => setCategory(item.name)}
                style={{
                  ...styles.categoryCard,
                  backgroundColor:
                    category === item.name ? "#007aff" : "white",
                  color:
                    category === item.name ? "white" : "#1c1c1e"
                }}
              >
                {item.icon}
                <span style={{ marginTop: 6 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
        {category === "Phone" && (
  <div style={styles.section}>
    <p style={styles.sectionTitle}>Phone Details</p>

    <input placeholder="Phone Name (e.g. iPhone 11)"
      onChange={(e)=>handleExtraChange("phoneName", e.target.value)} />

    <input placeholder="Model"
      onChange={(e)=>handleExtraChange("model", e.target.value)} />

    <input placeholder="IMEI (optional)"
      onChange={(e)=>handleExtraChange("imei", e.target.value)} />

    <input placeholder="MAC Address (optional)"
      onChange={(e)=>handleExtraChange("mac", e.target.value)} />

    <textarea placeholder="Specifications"
      style={styles.textarea}
      onChange={(e)=>handleExtraChange("specs", e.target.value)} />
  </div>
)}

{category === "Laptop" && (
  <div style={styles.section}>
    <p style={styles.sectionTitle}>Laptop Details</p>

    <input placeholder="Brand (e.g. HP, Dell)"
      onChange={(e)=>handleExtraChange("brand", e.target.value)} />

    <input placeholder="Model"
      onChange={(e)=>handleExtraChange("model", e.target.value)} />

    <input placeholder="Serial Number"
      onChange={(e)=>handleExtraChange("serial", e.target.value)} />

    <textarea placeholder="Specifications"
      style={styles.textarea}
      onChange={(e)=>handleExtraChange("specs", e.target.value)} />
  </div>
)}

{category === "Wallet" && (
  <div style={styles.section}>
    <p style={styles.sectionTitle}>Wallet Details</p>

    <input placeholder="Color"
      onChange={(e)=>handleExtraChange("color", e.target.value)} />

    <input placeholder="Brand"
      onChange={(e)=>handleExtraChange("brand", e.target.value)} />

    <textarea placeholder="Contents (IDs, cash, cards...)"
      style={styles.textarea}
      onChange={(e)=>handleExtraChange("contents", e.target.value)} />
  </div>
)}

{category === "ID Card" && (
  <div style={styles.section}>
    <p style={styles.sectionTitle}>ID Details</p>

    <select
      onChange={(e)=>handleExtraChange("idType", e.target.value)}
      style={styles.inputHalf}
    >
      <option value="">Select ID Type</option>
      <option>National ID</option>
      <option>School ID</option>
      <option>MANEB</option>
      <option>Passport</option>
      <option>Driver's Licence</option>
    </select>

    <input placeholder="Full Name on ID"
      onChange={(e)=>handleExtraChange("fullName", e.target.value)} />

    <input placeholder="First digits of ID number"
      onChange={(e)=>handleExtraChange("idNumberStart", e.target.value)} />
  </div>
)}

{category === "Other" && (
  <div style={styles.section}>
    <p style={styles.sectionTitle}>Item Details</p>

    <input placeholder="Item Name"
      onChange={(e)=>handleExtraChange("itemName", e.target.value)} />

    <textarea placeholder="Item Specifications"
      style={styles.textarea}
      onChange={(e)=>handleExtraChange("specs", e.target.value)} />
  </div>
)}


        <div style={styles.section}>
          <p style={styles.sectionTitle}>Where Was It Lost?</p>

          <div style={styles.locationWrapper}>
            <FiMapPin style={{ marginRight: 8 }} />
            <input
              ref={locationRef}
              type="text"
              placeholder="Type in the location you lost it..."
              style={styles.locationInput}
            />
          </div>
        </div>

        <div style={styles.section}>
          <p style={styles.sectionTitle}>When Was It Lost?</p>

          <div style={styles.row}>
            <input type="date"
  style={styles.inputHalf}
  value={dateLost}
  onChange={(e)=>setDateLost(e.target.value)}
/>
            <input type="time" style={styles.inputHalf} />
          </div>
        </div>

        <div style={styles.section}>
          <p style={styles.sectionTitle}>Special Description</p>
          <textarea
  placeholder="Describe the item in your own words..."
  style={styles.textarea}
  value={description}
  onChange={(e)=>setDescription(e.target.value)}
/>
        </div>

        <input
  type="text"
  placeholder="Your Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<input
  type="tel"
  placeholder="Phone Number *"
  value={phone1}
  onChange={(e) => setPhone1(e.target.value)}
/>

<input
  type="tel"
  placeholder="Second Phone Number"
  value={phone2}
  onChange={(e) => setPhone2(e.target.value)}
/>

        <div style={styles.section}>
          <p style={styles.sectionTitle}>Reward</p>

          <div style={styles.rewardToggle}>
            <input
              type="checkbox"
              checked={hasReward}
              onChange={() => setHasReward(!hasReward)}
            />
            <span style={{ marginLeft: 10 }}>
              I will offer a reward
            </span>
          </div>

          {hasReward && (
            <textarea
  placeholder="Describe the reward (optional)"
  style={{ ...styles.textarea, marginTop: 12 }}
  value={reward}
  onChange={(e)=>setReward(e.target.value)}
/>
          )}
        </div>

        

      </div>

      <div style={styles.footer}>
        <div style={styles.footerInner}>
          <button onClick={submit} style={styles.submitBtn}>
            Submit Report
          </button>
        </div>
      </div>
    
      <SubmitModal
        visible={modalVisible}
        type="lost"
         category={category}
        onClose={() => setModalVisible(false)}
      />

    </div>
  )
}

const styles = {
  screen:{backgroundColor:"#f2f2f7",minHeight:"100vh",display:"flex",justifyContent:"center"},
  container:{width:"100%",maxWidth:"480px",padding:"30px 20px 120px"},
  title:{fontSize:"24px",fontWeight:600,marginBottom:"25px"},
  photoCard:{height:"180px",borderRadius:"22px",backgroundColor:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",marginBottom:"30px",boxShadow:"0 8px 20px rgba(0,0,0,0.05)"},
  photoPreview:{width:"100%",height:"100%",objectFit:"cover"},
  section:{marginBottom:"28px"},
  sectionTitle:{fontSize:"14px",color:"#6e6e73",marginBottom:"12px"},
  categoryGrid:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"12px"},
  categoryCard:{padding:"16px 10px",borderRadius:"18px",backgroundColor:"white",display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",fontSize:"13px",fontWeight:500,boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  locationWrapper:{display:"flex",alignItems:"center",backgroundColor:"white",padding:"14px",borderRadius:"16px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  locationInput:{border:"none",outline:"none",width:"100%",fontSize:"14px"},
  row:{display:"flex",gap:"12px"},
  inputHalf:{flex:1,padding:"14px",borderRadius:"16px",border:"none",backgroundColor:"white",fontSize:"14px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  rewardToggle:{display:"flex",alignItems:"center",fontSize:"14px"},
  textarea:{width:"100%",padding:"14px",borderRadius:"18px",border:"none",backgroundColor:"white",minHeight:"100px",fontSize:"14px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  footer:{position:"fixed",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",backgroundColor:"#f2f2f7",padding:"16px"},
  footerInner:{width:"100%",maxWidth:"480px"},
  submitBtn:{width:"100%",padding:"18px",borderRadius:"28px",border:"none",backgroundColor:"#007aff",color:"white",fontSize:"16px",fontWeight:600,cursor:"pointer",boxShadow:"0 10px 25px rgba(0,122,255,0.3)"}
}

export default ReportLost