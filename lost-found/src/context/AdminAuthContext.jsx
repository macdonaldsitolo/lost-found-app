import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  // ── validate admin token on every mount / browser switch ──────────────
  useEffect(() => {
    const stored = localStorage.getItem("lf_admin_token")
    if (!stored) { setLoading(false); return }

    // Verify with server — don't trust storage alone
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` }
    })
      .then(res => setAdmin(res.data))
      .catch(() => {
        localStorage.removeItem("lf_admin_token")
        localStorage.removeItem("lf_admin_user")
        setAdmin(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const adminToken = () => localStorage.getItem("lf_admin_token")

  const adminLogin = useCallback((adminData, token) => {
    localStorage.setItem("lf_admin_token", token)
    localStorage.setItem("lf_admin_user", JSON.stringify(adminData))
    setAdmin(adminData)
  }, [])

  const adminLogout = useCallback(() => {
    localStorage.removeItem("lf_admin_token")
    localStorage.removeItem("lf_admin_user")
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminToken, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
