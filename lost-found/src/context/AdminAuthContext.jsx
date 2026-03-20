import { createContext, useContext, useState } from "react"

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const t = localStorage.getItem("lf_admin_token")
    const a = localStorage.getItem("lf_admin_user")
    return t && a ? JSON.parse(a) : null
  })

  const adminToken = () => localStorage.getItem("lf_admin_token")

  const adminLogin = (adminData, token) => {
    localStorage.setItem("lf_admin_token", token)
    localStorage.setItem("lf_admin_user", JSON.stringify(adminData))
    setAdmin(adminData)
  }

  const adminLogout = () => {
    localStorage.removeItem("lf_admin_token")
    localStorage.removeItem("lf_admin_user")
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
