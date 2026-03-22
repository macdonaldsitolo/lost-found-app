import { Navigate } from "react-router-dom"
import { useAdminAuth } from "../context/AdminAuthContext"

export default function AdminRoute({ children }) {
  const { admin, loading } = useAdminAuth()

  // While validating token with server, show nothing (prevents flash)
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0f172a"
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #1e293b",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
      </div>
    )
  }

  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}
