// ── PhoneInput.jsx ────────────────────────────────────────────────────────
// Phone input that always starts with +265.
// The country code is displayed but cannot be deleted.
//
// Props:
//   value       — full value including +265 prefix
//   onChange    — receives the full value string
//   onBlur      — optional, called when field blurs
//   placeholder — subscriber number hint (default: "991 234 567")
//   error       — string | null
//   touched     — bool
//   style       — overrides for the outer wrapper

import FieldError, { inputErrorStyle } from "./FieldError"
import { MALAWI_CODE } from "../utils/validators"

export default function PhoneInput({
  value, onChange, onBlur, placeholder = "991 234 567",
  error, touched, style = {}
}) {
  // Subscriber part only (strip the country code for the visible input)
  const subscriber = (value || "").startsWith(MALAWI_CODE)
    ? (value || "").slice(MALAWI_CODE.length)
    : (value || "")

  const handleChange = (e) => {
    let raw = e.target.value
    // Strip any leading zeros or accidental re-typing of 265
    raw = raw.replace(/^0+/, "").replace(/^\+?265/, "")
    onChange(MALAWI_CODE + raw)
  }

  const handleKeyDown = (e) => {
    // Prevent backspace from eating into the country code
    const input = e.target
    if (e.key === "Backspace" && input.selectionStart === 0 && input.selectionEnd === 0) {
      e.preventDefault()
    }
  }

  return (
    <div style={{ ...wrapStyle, ...style }}>
      {/* Locked prefix */}
      <span style={prefixStyle}>{MALAWI_CODE}</span>

      <input
        type="tel"
        value={subscriber}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        style={inputErrorStyle(error, touched, inputStyle)}
      />

      <FieldError error={error} touched={touched} />
    </div>
  )
}

const wrapStyle = {
  position: "relative",
  marginBottom: 12,
}

const prefixStyle = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 15,
  fontWeight: 600,
  color: "#0a4d8c",
  pointerEvents: "none",
  userSelect: "none",
  zIndex: 1,
}

const inputStyle = {
  width: "100%",
  padding: "14px 14px 14px 62px",   // extra left padding for the prefix
  borderRadius: 16,
  border: "1.5px solid #e5e7eb",
  fontSize: 15,
  background: "white",
  outline: "none",
  boxSizing: "border-box",
  margin: 0,
}
