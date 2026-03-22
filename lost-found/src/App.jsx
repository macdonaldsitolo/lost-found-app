import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, createContext, useContext } from "react"
import { AuthProvider }      from "./context/AuthContext"
import { AdminAuthProvider } from "./context/AdminAuthContext"
import ProtectedRoute        from "./components/ProtectedRoute"
import AdminRoute            from "./components/AdminRoute"
import Navbar                from "./components/navbar"

import Home          from "./pages/Home"
import Search        from "./pages/Search"
import ItemDetail    from "./pages/ItemDetail"
import EditReport    from "./pages/EditReport"
import Login         from "./pages/Login"
import Register      from "./pages/Register"
import MyPosts       from "./pages/MyPosts"
import ReportLost    from "./pages/ReportLost"
import ReportFound   from "./pages/ReportFound"
import ReportMissing from "./pages/ReportMissing"
import ClaimGadget   from "./pages/ClaimGadget"
import AdminLogin    from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"

// Static pages
import About   from "./pages/About"
import Terms   from "./pages/Terms"
import Support from "./pages/Support"

export const LangContext = createContext({ lang: "en", setLang: () => {} })
export const useLang = () => useContext(LangContext)

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("lf_lang") || "en")

  const handleSetLang = (code) => {
    setLang(code)
    localStorage.setItem("lf_lang", code)
  }

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang }}>
      <AdminAuthProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin — no Navbar */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

              {/* Main app — with Navbar */}
              <Route path="/*" element={
                <>
                  <Navbar lang={lang} setLang={handleSetLang} />
                  <Routes>
                    <Route path="/"          element={<Home />} />
                    <Route path="/listings"  element={<Search />} />
                    <Route path="/item/:id"  element={<ItemDetail />} />
                    <Route path="/login"     element={<Login />} />
                    <Route path="/register"  element={<Register />} />

                    {/* Static pages */}
                    <Route path="/about"   element={<About />} />
                    <Route path="/terms"   element={<Terms />} />
                    <Route path="/support" element={<Support />} />

                    {/* Protected */}
                    <Route path="/report-lost"    element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
                    <Route path="/report-found"   element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
                    <Route path="/report-missing" element={<ProtectedRoute><ReportMissing /></ProtectedRoute>} />
                    <Route path="/claim-items"    element={<ProtectedRoute><ClaimGadget /></ProtectedRoute>} />
                    <Route path="/my-posts"       element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
                    <Route path="/edit-item/:id"  element={<ProtectedRoute><EditReport /></ProtectedRoute>} />
                  </Routes>
                </>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AdminAuthProvider>
    </LangContext.Provider>
  )
}
