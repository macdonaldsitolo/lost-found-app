import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiHome, FiShare2 } from "react-icons/fi"
import kindnessIcon from "../assets/kindness.svg"



function SubmitModal({ visible, type, category, onClose }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (visible) {
      setLoading(true)
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  // Determine message
  let message = ""
  if (category === "Person") {
    if (type === "lost") {
      message = "You reported a missing person. The right people will be notified. Stay calm."
    } else {
      message = "Thank you for helping. We'll make sure the missing person is reunited safely."
    }
  } else {
    if (type === "lost") {
      message = "Don't worry. The community will help you find your item."
    } else {
      message = "You did a kind thing. We'll help reunite this item with its owner."
    }
  }

  // Share function using Web Share API
  const handleShare = async () => {
    const shareData = {
      title: "Lost & Found Malawi",
      text: `Check this item report on Lost & Found Malawi!`,
      url: window.location.href
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error("Share failed:", err)
      }
    } else {
      // fallback: copy link
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied! Share it manually.")
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {loading ? (
          <>
            <div style={styles.loader}></div>
            <p>Submitting your report...</p>
          </>
        ) : (
          <>
            <div style={styles.animation}>
              <img src={kindnessIcon} alt="Kindness" style={{ width: "100%" }} />
            </div>
            <p style={{ marginBottom: 20 }}>{message}</p>

            <div style={styles.buttons}>
              <button
                style={styles.homeBtn}
                onClick={() => {
                  onClose()
                  navigate("/")  // navigates to homepage
                }}
              >
                <FiHome style={{ marginRight: 6 }} /> Go Home
              </button>

              <button style={styles.shareBtn} onClick={handleShare}>
                <FiShare2 style={{ marginRight: 6 }} /> Share
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    width: "280px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #eee",
    borderTop: "4px solid #007aff",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite"
  },
  animation: {
    width: "120px",
    margin: "0 auto 10px"
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px"
  },
  homeBtn: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 0",
    borderRadius: "22px",
    border: "none",
    backgroundColor: "#007aff",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "0.2s"
  },
  shareBtn: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 0",
    borderRadius: "22px",
    border: "none",
    backgroundColor: "#007aff",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "0.2s"
  }
}

export default SubmitModal