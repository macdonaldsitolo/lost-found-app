import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FiMenu, FiX, FiHome, FiLogIn, FiLogOut,
  FiPackage, FiShield, FiGlobe, FiUser
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

// ── supported languages ──────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "ny", label: "Chichewa", flag: "🇲🇼" },
]

export default function Navbar({ lang, setLang }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const close = () => { setMenuOpen(false); setLangOpen(false) }

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : ""

  return (
    <>
      <nav className="navbar">
        {/* Left: Home button */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={S.navBtn}>
            <FiHome size={15} />
            <span style={S.navBtnText}>Home</span>
          </button>
        </Link>

        {/* Centre: brand */}
        <Link to="/" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: "#0a4d8c", fontSize: 17 }}>
            🔍 Lost &amp; Found
          </h3>
        </Link>

        {/* Right: language + login/menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Language picker */}
          <div style={{ position: "relative" }}>
            <button
              style={S.iconBtn}
              onClick={() => { setLangOpen(p => !p); setMenuOpen(false) }}
              title="Switch language"
            >
              <FiGlobe size={18} />
            </button>

            {langOpen && (
              <>
                <div style={S.backdrop} onClick={() => setLangOpen(false)} />
                <div style={{ ...S.dropdown, right: 0, minWidth: 150 }}>
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      style={{
                        ...S.dropItem,
                        fontWeight: l.code === lang ? 700 : 400,
                        color: l.code === lang ? "#0a4d8c" : "#1c1c1e",
                      }}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                    >
                      <span style={{ fontSize: 18 }}>{l.flag}</span> {l.label}
                      {l.code === lang && <span style={{ marginLeft: "auto", color: "#0a4d8c" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Not logged in → Login button */}
          {!user && (
            <Link to="/login">
              <button style={S.navBtn}>
                <FiLogIn size={15} />
                <span style={S.navBtnText}>Log in</span>
              </button>
            </Link>
          )}

          {/* Hamburger menu (always visible) */}
          <button
            style={S.iconBtn}
            onClick={() => { setMenuOpen(p => !p); setLangOpen(false) }}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Side drawer ────────────────────────────────────────────────────── */}
      {menuOpen && (
        <>
          <div style={S.backdrop} onClick={close} />
          <div style={S.drawer}>

            {/* User profile strip (if logged in) */}
            {user ? (
              <div style={S.profileStrip}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={S.avatar} />
                ) : (
                  <div style={S.avatarInitials}>{initials}</div>
                )}
                <div>
                  <p style={S.profileName}>{user.firstName} {user.lastName}</p>
                  <p style={S.profileEmail}>{user.email}</p>
                </div>
              </div>
            ) : (
              <div style={S.profileStrip}>
                <div style={{ ...S.avatarInitials, background: "#e5e7eb" }}>
                  <FiUser size={22} color="#9ca3af" />
                </div>
                <div>
                  <p style={S.profileName}>Guest</p>
                  <p style={S.profileEmail}>Not signed in</p>
                </div>
              </div>
            )}

            <div style={S.divider} />

            {/* Navigation items */}
            <DrawerItem icon={<FiHome size={18} />} label="Home" to="/" onClick={close} />

            {user ? (
              <>
                <DrawerItem
                  icon={<FiPackage size={18} />}
                  label="My Reports"
                  to="/my-posts"
                  tab="items"
                  onClick={close}
                />
                <DrawerItem
                  icon={<FiShield size={18} />}
                  label="My Claims"
                  to="/my-posts"
                  tab="claims"
                  onClick={(tab) => { navigate("/my-posts", { state: { tab } }); close() }}
                  isTabNav
                />
              </>
            ) : (
              <>
                <DrawerItem icon={<FiLogIn size={18} />} label="Log in" to="/login" onClick={close} />
              </>
            )}

            <div style={S.divider} />

            {/* Language section */}
            <p style={S.sectionLabel}>Language</p>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                style={{
                  ...S.dropItem,
                  fontWeight: l.code === lang ? 700 : 400,
                  color: l.code === lang ? "#0a4d8c" : "#1c1c1e",
                }}
                onClick={() => { setLang(l.code); close() }}
              >
                <span style={{ fontSize: 18 }}>{l.flag}</span> {l.label}
                {l.code === lang && <span style={{ marginLeft: "auto", color: "#0a4d8c" }}>✓</span>}
              </button>
            ))}

            {/* Logout at bottom */}
            {user && (
              <>
                <div style={{ ...S.divider, marginTop: "auto" }} />
                <button
                  style={{ ...S.dropItem, color: "#c0392b", marginTop: 4 }}
                  onClick={() => { logout(); navigate("/"); close() }}
                >
                  <FiLogOut size={17} /> Log out
                </button>
              </>
            )}

          </div>
        </>
      )}
    </>
  )
}

// ── helper component ──────────────────────────────────────────────────────────
function DrawerItem({ icon, label, to, onClick, tab, isTabNav }) {
  const navigate = useNavigate()
  const handleClick = () => {
    if (isTabNav) {
      onClick(tab)
    } else {
      navigate(to)
      onClick()
    }
  }
  return (
    <button style={S.dropItem} onClick={handleClick}>
      {icon} {label}
    </button>
  )
}

// ── styles ────────────────────────────────────────────────────────────────────
const S = {
  navBtn:        { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 14, border: "none", background: "#0a4d8c", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  navBtnText:    { display: "inline" },
  iconBtn:       { background: "none", border: "none", cursor: "pointer", color: "#0a4d8c", display: "flex", alignItems: "center", padding: 6, borderRadius: 10 },
  backdrop:      { position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.25)" },
  drawer:        { position: "fixed", top: 0, right: 0, bottom: 0, width: 280, background: "white", zIndex: 200, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", padding: "20px 0 24px", overflowY: "auto" },
  profileStrip:  { display: "flex", alignItems: "center", gap: 12, padding: "0 20px 16px" },
  avatar:        { width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  avatarInitials:{ width: 48, height: 48, borderRadius: "50%", background: "#0a4d8c", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, flexShrink: 0 },
  profileName:   { fontWeight: 700, fontSize: 15, margin: 0, color: "#1c1c1e" },
  profileEmail:  { fontSize: 12, color: "#6e6e73", margin: "2px 0 0" },
  divider:       { height: 1, background: "#f2f3f7", margin: "8px 0" },
  sectionLabel:  { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 20px 4px" },
  dropItem:      { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 20px", background: "none", border: "none", textAlign: "left", fontSize: 15, cursor: "pointer", color: "#1c1c1e" },
  dropdown:      { position: "absolute", background: "white", borderRadius: 16, padding: "8px 0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200 },
}
