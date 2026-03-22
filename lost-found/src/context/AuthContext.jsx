import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)   // never initialise from storage directly
  const [loading, setLoading] = useState(true)

  // ── on mount: read token from storage and validate it with the server ──
  useEffect(() => {
    const stored = localStorage.getItem("lf_token")
    if (!stored) { setLoading(false); return }

    // Always verify with the server — don't trust storage alone
    axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${stored}` }
    })
      .then(res => {
        setToken(stored)
        setUser(res.data)
      })
      .catch(() => {
        // Token invalid / expired / tampered — clear everything
        localStorage.removeItem("lf_token")
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── global 401 interceptor ─────────────────────────────────────────────
  // If ANY request returns 401, force logout immediately
  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("lf_token")
          setToken(null)
          setUser(null)
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(id)
  }, [])

  // ── attach token to every request ─────────────────────────────────────
  useEffect(() => {
    const id = axios.interceptors.request.use(config => {
      const t = localStorage.getItem("lf_token")
      if (t) config.headers.Authorization = `Bearer ${t}`
      return config
    })
    return () => axios.interceptors.request.eject(id)
  }, [])

  const login = useCallback((userData, jwt) => {
    localStorage.setItem("lf_token", jwt)
    setToken(jwt)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("lf_token")
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
