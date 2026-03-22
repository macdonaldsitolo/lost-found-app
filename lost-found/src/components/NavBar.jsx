import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiMenu, FiX, FiHome, FiLogIn, FiLogOut, FiPackage, FiShield, FiGlobe, FiUser } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

// ── Malawi flag as inline SVG ─────────────────────────────────────────────
function MalawiFlag({ size = 20 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2, flexShrink: 0 }}>
      {/* Black stripe */}
      <rect x="0" y="0"    width="30" height="6.67" fill="#000000"/>
      {/* Red stripe */}
      <rect x="0" y="6.67" width="30" height="6.67" fill="#CE1126"/>
      {/* Green stripe */}
      <rect x="0" y="13.33" width="30" height="6.67" fill="#339E35"/>
      {/* Rising sun (simplified) */}
      <circle cx="15" cy="5" r="3.2" fill="#CE1126" opacity="0.9"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const r = Math.PI * deg / 180
        const x1 = 15 + 3.5 * Math.cos(r), y1 = 5 + 3.5 * Math.sin(r)
        const x2 = 15 + 5   * Math.cos(r), y2 = 5 + 5   * Math.sin(r)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CE1126" strokeWidth="0.8" opacity="0.9"/>
      })}
    </svg>
  )
}

const LANGUAGES = [
  { code: "en", label: "English",  Icon: () => <FiGlobe size={18} color="#6e6e73" /> },
  { code: "ny", label: "Chichewa", Icon: () => <MalawiFlag size={22} /> },
]

export default function Navbar({ lang, setLang }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const isHome  = location.pathname === "/"
  const close   = () => { setMenuOpen(false); setLangOpen(false) }
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]
  const initials = user ? `${user.firstName?.[0]||""}${user.lastName?.[0]||""}`.toUpperCase() : ""

  return (
    <>
      <nav className="navbar">
        {/* Home button */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 14, cursor: "pointer",
            fontWeight: 600, fontSize: 14, transition: "0.2s",
            background:  isHome ? "#0a4d8c" : "white",
            color:       isHome ? "white"   : "#0a4d8c",
            border:      isHome ? "none"    : "1.5px solid #0a4d8c",
          }}>
            <FiHome size={15} /><span>Home</span>
          </button>
        </Link>

        {/* Brand */}
        <Link to="/" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: "#0a4d8c", fontSize: 17 }}>
            🔍 Lost &amp; Found
          </h3>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Language picker */}
          <div style={{ position: "relative" }}>
            <button style={S.iconBtn}
              onClick={() => { setLangOpen(p => !p); setMenuOpen(false) }}
              title="Switch language"
              aria-label="Switch language">
              <current.Icon />
            </button>

            {langOpen && (
              <>
                <div style={S.backdrop} onClick={() => setLangOpen(false)} />
                <div style={{ ...S.dropdown, right: 0, minWidth: 160 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code}
                      style={{ ...S.dropItem, fontWeight: l.code === lang ? 700 : 400, color: l.code === lang ? "#0a4d8c" : "#1c1c1e" }}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}>
                      <l.Icon />
                      <span style={{ marginLeft: 8 }}>{l.label}</span>
                      {l.code === lang && <span style={{ marginLeft: "auto", color: "#0a4d8c", fontSize: 13 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Login button (guests) */}
          {!user && (
            <Link to="/login">
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 14, border: "none", background: "#0a4d8c", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                <FiLogIn size={15} /><span>Log in</span>
              </button>
            </Link>
          )}

          {/* Hamburger */}
          <button style={S.iconBtn} onClick={() => { setMenuOpen(p => !p); setLangOpen(false) }}>
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Side drawer */}
      {menuOpen && (
        <>
          <div style={S.backdrop} onClick={close} />
          <div style={S.drawer}>

            {user ? (
              <div style={S.profileStrip}>
                {user.avatar
                  ? <img src={user.avatar} alt="" style={S.avatar} />
                  : <div style={S.avatarInitials}>{initials}</div>}
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

            <DrawerBtn icon={<FiHome size={18}/>}    label="Home"       onClick={() => { navigate("/"); close() }} />

            {user ? (
              <>
                <DrawerBtn icon={<FiPackage size={18}/>} label="My Reports" onClick={() => { navigate("/my-posts", { state: { tab: "items"  } }); close() }} />
                <DrawerBtn icon={<FiShield  size={18}/>} label="My Claims"  onClick={() => { navigate("/my-posts", { state: { tab: "claims" } }); close() }} />
              </>
            ) : (
              <DrawerBtn icon={<FiLogIn size={18}/>} label="Log in" onClick={() => { navigate("/login"); close() }} />
            )}

            <div style={S.divider} />
            <p style={S.sectionLabel}>Info</p>
            <DrawerBtn label="About Us"         onClick={() => { navigate("/about");   close() }} />
            <DrawerBtn label="Terms & Conditions" onClick={() => { navigate("/terms"); close() }} />
            <DrawerBtn label="Support"           onClick={() => { navigate("/support"); close() }} />

            <div style={S.divider} />
            <p style={S.sectionLabel}>Language</p>
            {LANGUAGES.map(l => (
              <button key={l.code}
                style={{ ...S.dropItem, fontWeight: l.code === lang ? 700 : 400, color: l.code === lang ? "#0a4d8c" : "#1c1c1e" }}
                onClick={() => { setLang(l.code); close() }}>
                <l.Icon />
                <span style={{ marginLeft: 8 }}>{l.label}</span>
                {l.code === lang && <span style={{ marginLeft: "auto", color: "#0a4d8c" }}>✓</span>}
              </button>
            ))}

            {user && (
              <>
                <div style={{ ...S.divider, marginTop: "auto" }} />
                <button style={{ ...S.dropItem, color: "#c0392b" }}
                  onClick={() => { logout(); navigate("/"); close() }}>
                  <FiLogOut size={17} /> <span style={{ marginLeft: 8 }}>Log out</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

function DrawerBtn({ icon, label, onClick }) {
  return (
    <button style={S.dropItem} onClick={onClick}>
      {icon && <span style={{ width: 18, display: "flex", alignItems: "center" }}>{icon}</span>}
      <span style={{ marginLeft: icon ? 10 : 28 }}>{label}</span>
    </button>
  )
}

const S = {
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
  dropItem:      { display: "flex", alignItems: "center", width: "100%", padding: "12px 20px", background: "none", border: "none", textAlign: "left", fontSize: 14, cursor: "pointer", color: "#1c1c1e" },
  dropdown:      { position: "absolute", background: "white", borderRadius: 16, padding: "8px 0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200 },
}
