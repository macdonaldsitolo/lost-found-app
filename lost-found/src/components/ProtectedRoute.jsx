import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{
          width: 32, height: 32,
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #0a4d8c",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
      </div>
    )
  }

  if (!user) {
    // Save where they were trying to go so we can redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
