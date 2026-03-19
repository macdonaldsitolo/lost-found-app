import { useState, useRef } from "react"
import {
  FiUpload,
  FiMapPin,
  FiUser,
  FiAlertCircle
} from "react-icons/fi"

import SubmitModal from "../components/SubmitModal"
import axios from "axios"


function ReportMissing() {

  const [personName, setPersonName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [outfit, setOutfit] = useState("")
  const [homeDistrict, setHomeDistrict] = useState("")

  const [name, setName] = useState("")
  const [phone1, setPhone1] = useState("")
  const [phone2, setPhone2] = useState("")
  const [images, setImages] = useState([])
  const [category, setCategory] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [description, setDescription] = useState("")
  const [reward, setReward] = useState("")
  const [hasReward, setHasReward] = useState(false)
  const [dateLost, setDateLost] = useState("")

  const locationRef = useRef(null)

  // ✅ IMAGE HANDLER
  const handleImages = (e) => {
    const files = Array.from(e.target.files)

    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))

    setImages(previews)
  }

  // ✅ SUBMIT FUNCTION
  const submit = async () => {

    // 🔒 VALIDATION
    if (!personName) {
      alert("Person name is required")
      return
    }

    if (!phone1) {
      alert("Phone number is required")
      return
    }

    if (!category || !["Missing", "Found", "Wanted"].includes(category)) {
      alert("Please select a valid type")
      return
    }

    // ✅ BUILD EXTRA FIELDS BASED ON TYPE
    let extraFields = {
      personName,
      age: age ? Number(age) : null,
      gender
    }

    if (category === "Missing" || category === "Found") {
      extraFields.outfit = outfit
    }

    if (category === "Wanted") {
      extraFields.homeDistrict = homeDistrict
    }

    // ✅ FORM DATA
    const formData = new FormData()

    formData.append("type", category.toLowerCase())
    formData.append("category", "person")
    formData.append("description", description || "")
    formData.append("location", locationRef.current?.value || "Unknown")
    formData.append("date", dateLost || new Date())

    formData.append("reward", hasReward ? reward : "")
    formData.append("name", name || "")
    formData.append("phone1", phone1)
    formData.append("phone2", phone2 || "")
   

    formData.append("extraFields", JSON.stringify(extraFields))

    images.forEach(img => {
      formData.append("images", img.file)
    })

    try {
      await axios.post(
        "http://localhost:5000/api/items",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      )

      setModalVisible(true)

    } catch (err) {
      console.error("❌ SUBMIT ERROR:", err.response?.data || err.message)
      alert("Error submitting report")
    }
  }

  const categories = [
    { name: "Missing", icon: <FiUser size={22} color="orange" /> },
    { name: "Found", icon: <FiUser size={22} color="green" /> },
    { name: "Wanted", icon: <FiAlertCircle size={22} color="red" /> },
  ]

  const getRewardText = () => {
    if (category === "Found") return "I will require a reward"
    return "I will offer a reward"
  }

  return (
    <div style={styles.screen}>

      <div style={styles.container}>

        <h2 style={styles.title}>Report Person</h2>

        {/* IMAGE */}
        <label style={styles.photoCard}>
          {images.length > 0 ? (
            <img src={images[0].url} alt="" style={styles.photoPreview} />
          ) : (
            <>
              <FiUpload size={28} color="#6e6e73" />
              <p style={{ marginTop: 10 }}>Tap to Upload Photo</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            style={{ display: "none" }}
          />
        </label>

        {/* TYPE */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Type</p>

          <div style={styles.categoryGrid}>
            {categories.map((item) => (
              <div
                key={item.name}
                onClick={() => setCategory(item.name)}
                style={{
                  ...styles.categoryCard,
                  backgroundColor: category === item.name ? "#007aff" : "white",
                  color: category === item.name ? "white" : "#1c1c1e"
                }}
              >
                {item.icon}
                <span style={{ marginTop: 6 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PERSON INFO */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Person Name</p>
          <input
            style={styles.input}
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <input
            style={styles.inputHalf}
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <select
            style={styles.inputHalf}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        {/* CONDITIONAL FIELDS */}
        {(category === "Missing" || category === "Found") && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>What were they wearing?</p>
            <input
              style={styles.input}
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
            />
          </div>
        )}

        {category === "Wanted" && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Home District</p>
            <input
              style={styles.input}
              value={homeDistrict}
              onChange={(e) => setHomeDistrict(e.target.value)}
            />
          </div>
        )}

        {/* LOCATION */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>
            {category === "Found"
              ? "Where was the person found?"
              : "Last Seen Location"}
          </p>

          <div style={styles.locationWrapper}>
            <FiMapPin />
            <input ref={locationRef} style={styles.locationInput} />
          </div>
        </div>

        {/* DATE */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Date</p>
          <input
            type="date"
            style={styles.inputHalf}
            value={dateLost}
            onChange={(e) => setDateLost(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Special Description</p>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* CONTACT */}
        <input
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Phone Number *"
          value={phone1}
          onChange={(e) => setPhone1(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Second Phone"
          value={phone2}
          onChange={(e) => setPhone2(e.target.value)}
        />

        {/* REWARD */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Reward</p>

          <div style={styles.rewardToggle}>
            <input
              type="checkbox"
              checked={hasReward}
              onChange={() => setHasReward(!hasReward)}
            />
            <span style={{ marginLeft: 10 }}>
              {getRewardText()}
            </span>
          </div>

          {hasReward && (
            <textarea
              style={{ ...styles.textarea, marginTop: 12 }}
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.footerInner}>
          <button onClick={submit} style={styles.submitBtn}>
            Submit Report
          </button>
        </div>
      </div>

      <SubmitModal
        visible={modalVisible}
        type={category.toLowerCase()}
        category="person"
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
  input:{width:"100%",padding:"14px",borderRadius:"16px",border:"none",backgroundColor:"white",fontSize:"14px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)",marginBottom:"12px"},
  row:{display:"flex",gap:"12px"},
  inputHalf:{flex:1,padding:"14px",borderRadius:"16px",border:"none",backgroundColor:"white",fontSize:"14px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  locationWrapper:{display:"flex",alignItems:"center",gap:"8px",backgroundColor:"white",padding:"14px",borderRadius:"16px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  locationInput:{border:"none",outline:"none",width:"100%",fontSize:"14px"},
  textarea:{width:"100%",padding:"14px",borderRadius:"18px",border:"none",backgroundColor:"white",minHeight:"100px",fontSize:"14px",boxShadow:"0 6px 15px rgba(0,0,0,0.04)"},
  rewardToggle:{display:"flex",alignItems:"center",fontSize:"14px"},
  footer:{position:"fixed",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",backgroundColor:"#f2f2f7",padding:"16px"},
  footerInner:{width:"100%",maxWidth:"480px"},
  submitBtn:{width:"100%",padding:"18px",borderRadius:"28px",border:"none",backgroundColor:"#007aff",color:"white",fontSize:"16px",fontWeight:600,cursor:"pointer",boxShadow:"0 10px 25px rgba(0,122,255,0.3)"}
}

export default ReportMissing