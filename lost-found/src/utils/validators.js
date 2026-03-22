// ── validators.js ─────────────────────────────────────────────────────────

export function validatePhone(value, required = true) {
  const v = (value || "").trim()
  if (!v) return required ? "Phone number is required" : null
  if (!/^\+?[0-9]+$/.test(v)) return "Phone number can only contain numbers and a leading +"
  if (v.replace("+", "").length < 7) return "Phone number is too short"
  if (v.length > 15) return "Phone number cannot exceed 15 characters"
  return null
}

export function validateEmail(value, required = true) {
  const v = (value || "").trim()
  if (!v) return required ? "Email is required" : null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address"
  return null
}

export function validateName(value, label = "Name", required = true) {
  const v = (value || "").trim()
  if (!v) return required ? `${label} is required` : null
  if (v.length < 2) return `${label} must be at least 2 characters`
  if (/[0-9]/.test(v)) return `${label} cannot contain numbers`
  if (/[^a-zA-Z\s\-']/.test(v)) return `${label} cannot contain special characters`
  return null
}

export function validatePassword(value, required = true) {
  const v = value || ""
  if (!v) return required ? "Password is required" : null
  if (v.length < 6) return "Password must be at least 6 characters"
  if (!/\d/.test(v)) return "Password must include at least one number"
  return null
}

export function validateIMEI(value, required = true) {
  const v = (value || "").replace(/\s/g, "")
  if (!v) return required ? "IMEI is required" : null
  if (!/^\d{15}$/.test(v)) return "IMEI must be exactly 15 digits"
  return null
}

export function validatePastDate(value, required = false) {
  if (!value) return required ? "Date is required" : null
  const d = new Date(value)
  if (isNaN(d.getTime())) return "Enter a valid date"
  if (d > new Date()) return "Date cannot be in the future"
  return null
}

export function validateRequired(value, label = "This field") {
  return (value || "").trim() ? null : `${label} is required`
}

// ── Person age validation ──────────────────────────────────────────────────
// Age must be a positive whole number ≤ 120.
// If a report date is also provided, cross-checks that the person
// could actually have been born (birth year must be ≥ 1900 and not future).
export function validatePersonAge(age, dateLost, required = false) {
  if (!age && !required) return null
  const n = Number(age)
  if (!age || isNaN(n)) return required ? "Age is required" : null
  if (!Number.isInteger(n)) return "Age must be a whole number"
  if (n <= 0)   return "Age must be at least 1"
  if (n > 120)  return "Please enter a valid age (max 120)"

  // Cross-check with report date:
  // A person aged N in the current year was born in (currentYear - N).
  // The report date must be AFTER that birth year — they must exist by then.
  if (dateLost) {
    const reportYear  = new Date(dateLost).getFullYear()
    if (!isNaN(reportYear)) {
      const currentYear = new Date().getFullYear()
      const birthYear   = currentYear - n
      if (reportYear < birthYear)
        return `A ${n}-year-old today was born in ${birthYear} — they did not exist in ${reportYear}`
    }
  }

  return null
}
