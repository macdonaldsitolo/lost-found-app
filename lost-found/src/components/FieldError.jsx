// ── FieldError.jsx ────────────────────────────────────────────────────────
// Tiny component: shows an error message below a field when touched.
// errorStyle and inputStyle are exported so every form can apply
// the red-border highlight consistently.

export default function FieldError({ error, touched }) {
  if (!touched || !error) return null
  return (
    <p style={{
      margin: "-8px 0 10px 4px",
      fontSize: 12,
      color: "#c0392b",
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}>
      ⚠ {error}
    </p>
  )
}

// Apply to any <input> / <select> / <textarea> when there's an error
export function inputErrorStyle(error, touched, baseStyle = {}) {
  return {
    ...baseStyle,
    borderColor: touched && error ? "#e53e3e" : undefined,
    boxShadow:   touched && error ? "0 0 0 3px rgba(229,62,62,0.12)" : undefined,
  }
}
