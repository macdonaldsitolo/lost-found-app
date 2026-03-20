import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem("lf_token") || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("lf_token")
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = (userData, jwt) => {
    localStorage.setItem("lf_token", jwt)
    setToken(jwt)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("lf_token")
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    const id = axios.interceptors.request.use(config => {
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
    return () => axios.interceptors.request.eject(id)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
