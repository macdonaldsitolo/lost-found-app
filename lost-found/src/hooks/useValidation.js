// ── useValidation.js ──────────────────────────────────────────────────────
// Validates only on submit (validateAll).
// touch() is kept so existing form code doesn't break but does nothing.

import { useState, useCallback } from "react"

export default function useValidation(rules) {
  const [errors, setErrors] = useState({})

  // no-op — kept for API compatibility so forms don't need to change
  const touch = useCallback(() => {}, [])

  // Run all rules on submit — returns true if all pass
  const validateAll = useCallback(() => {
    const newErrors = {}
    Object.keys(rules).forEach(name => {
      newErrors[name] = rules[name]()
    })
    setErrors(newErrors)
    return Object.values(newErrors).every(e => !e)
  }, [rules])

  const clearError = useCallback((name) => {
    setErrors(prev => ({ ...prev, [name]: null }))
  }, [])

  // touched is always true so FieldError shows errors after validateAll
  const touched = new Proxy({}, { get: () => true })

  return { errors, touched, touch, validateAll, clearError }
}
