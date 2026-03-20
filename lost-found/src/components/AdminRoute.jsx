import { Navigate } from "react-router-dom"
import { useAdminAuth } from "../context/AdminAuthContext"

export default function AdminRoute({ children }) {
  const { admin } = useAdminAuth()
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}
