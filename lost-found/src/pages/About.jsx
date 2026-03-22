import { FiArrowLeft, FiMail, FiPhone, FiGlobe, FiGithub, FiLinkedin, FiCode, FiDatabase, FiSmartphone, FiTrendingUp, FiUsers, FiHeart, FiSearch, FiShield } from "react-icons/fi"
import { useNavigate, Link } from "react-router-dom"

// ── CEO / Team data ────────────────────────────────────────────────────────
const TEAM = [
  {
    name:    "Macdonald Charles Sitolo",
    role:    "Founder & CEO",
    summary: "An analytical ICT professional and the driving force behind New School Technology Malawi. Macdonald specialises in full-stack development, data analysis, and systems design — with a strong belief that technology, built thoughtfully, can solve the real problems Malawians face every day.",
    skills:  ["React / React Native", "Node.js", "Python & ML", "SQL & Data Analysis", "Power BI", "System & Network Admin"],
    links: {
      email:     "sitolomacdonald@gmail.com",
      phone:     "+265 995 108 166",
      portfolio: "macdonald-three.vercel.app",
      github:    "https://github.com/macdonaldsitolo",
      linkedin:  "https://linkedin.com/in/macdonald-sitolo",
    },
    // Replace this src with the actual CEO image path once uploaded
    photo:   null,
    isFounder: true,
  },
]

// ── Company values ─────────────────────────────────────────────────────────
const VALUES = [
  { icon: <FiHeart   size={20} color="#c0392b" />, bg: "#fff0f0", title: "Community First",     body: "Every system we build puts people at the centre. Technology is only as good as the lives it improves." },
  { icon: <FiCode    size={20} color="#0a4d8c" />, bg: "#eef2ff", title: "Non-Conventional",    body: "We do not follow the template. We build for Malawi, with Malawi's context, culture, and challenges in mind." },
  { icon: <FiShield  size={20} color="#1a7a3c" />, bg: "#f0fff4", title: "Free & Open",         body: "Core services must be free. Digital tools should not be a privilege. We build for accessibility." },
  { icon: <FiTrendingUp size={20} color="#b45309" />, bg: "#fff8e1", title: "Vision 2063 Aligned", body: "Our work directly supports Malawi's goal of becoming a productive, competitive, and inclusive middle-income country." },
]

// ── What we do ─────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: <FiCode size={18} color="#0a4d8c" />,       label: "Web & Systems Development" },
  { icon: <FiSmartphone size={18} color="#0a4d8c" />, label: "Mobile App Development" },
  { icon: <FiDatabase size={18} color="#0a4d8c" />,   label: "Data Analysis & Automation" },
  { icon: <FiTrendingUp size={18} color="#0a4d8c" />, label: "Agricultural & Economic Tech" },
  { icon: <FiUsers size={18} color="#0a4d8c" />,      label: "ICT Consultancy" },
  { icon: <FiSearch size={18} color="#0a4d8c" />,     label: "Digital Literacy & Training" },
]

// ══════════════════════════════════════════════════════════════════════════
export default function About() {
  const navigate = useNavigate()

  return (
    <div style={S.page}>
      <div style={S.container}>

        <button style={S.back} onClick={() => navigate(-1)}>
          <FiArrowLeft size={17} /> Back
        </button>

        {/* ── Company hero ── */}
        <div style={S.hero}>
          <div style={S.heroLogo}>
            <span style={{ fontSize: 36 }}>💡</span>
          </div>
          <h1 style={S.heroTitle}>New School Technology Malawi</h1>
          <p style={S.heroTag}>
            A non-conventional ICT company building digital solutions for Malawi's people, agriculture, economy, and society.
          </p>
          <div style={S.heroBadges}>
            <span style={S.badge}>Est. Malawi</span>
            <span style={S.badge}>Vision 2063</span>
            <span style={S.badge}>Open to Opportunities</span>
          </div>
        </div>

        {/* ── Office / group photo placeholder ── */}
        <div style={S.officePhoto}>
          <div style={S.photoPlaceholder}>
            <FiUsers size={36} color="#c8d3e0" />
            <p style={S.photoHint}>Company / Team Photo</p>
            <span style={S.photoSub}>Replace this with your office or group photo</span>
          </div>
        </div>

        {/* ── Who we are ── */}
        <div style={S.card}>
          <h2 style={S.h2}>Who We Are</h2>
          <p style={S.body}>
            New School Technology Malawi is not your typical ICT company. We are a technology company built in Malawi, for Malawi — thinking and operating like a Malawian Meta. We do not just build apps; we build systems that solve real problems: agricultural challenges, economic barriers, social inefficiencies, and the everyday friction that comes from living in a country still transitioning to digital.
          </p>
          <p style={S.body}>
            Lost & Found Malawi is one of our flagship products — a free, community-driven platform connecting Malawians to recover their lost belongings and reunite missing persons with their families. It is proof that technology, built thoughtfully and accessibly, can make a meaningful difference.
          </p>
          <p style={S.body}>
            Our broader mission is to make Malawi paperless, increase digital literacy across all sectors, and develop systems that directly contribute to the Malawi Vision 2063 — helping the country become a productive, competitive, and inclusive middle-income nation.
          </p>
        </div>

        {/* ── What we do ── */}
        <div style={S.card}>
          <h2 style={S.h2}>What We Do</h2>
          <div style={S.servicesGrid}>
            {SERVICES.map(s => (
              <div key={s.label} style={S.serviceItem}>
                {s.icon}
                <span style={S.serviceLabel}>{s.label}</span>
              </div>
            ))}
          </div>
          <p style={{ ...S.body, marginTop: 14 }}>
            We are open to collaboration, contracts, and partnerships — from government institutions and NGOs to private businesses and startups. If you have a problem that technology can solve, we want to hear about it.
          </p>
        </div>



        {/* ── Lost & Found Malawi ── */}
        <div style={{ ...S.card, background: "linear-gradient(135deg, #0a4d8c 0%, #1a6bbf 100%)", color: "white", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>🔍</span>
            <div>
              <h2 style={{ ...S.h2, color: "white", margin: 0 }}>Lost & Found Malawi</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>Our flagship platform — free for everyone</p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, margin: "0 0 16px" }}>
            Lost & Found Malawi is a free, community-driven digital platform built to solve one of the most frustrating everyday problems in Malawi — losing something and having no way to find it. Whether it is a phone, a wallet, an ID card, a laptop, or a missing person, our platform connects the people of Malawi so that what is lost can be found.
          </p>

          {/* Mission */}
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Our Mission</p>
            <p style={{ fontSize: 14, color: "white", lineHeight: 1.6, margin: 0 }}>
              To make it effortless for every Malawian to report, find, and recover what they have lost — and to reunite missing persons with their families — using technology that is free, fast, and built for Malawi.
            </p>
          </div>

          {/* Goals */}
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Our Goals</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Build the largest free lost & found database in Malawi",
                "Reduce the time it takes to recover a lost item from days to hours",
                "Help reunite missing persons and vulnerable individuals with their families",
                "Increase digital trust and participation across all districts of Malawi",
                "Prove that technology built in Malawi, for Malawi, can work at scale",
              ].map((goal, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.5 }}>{goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "14px 16px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Platform Values</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { emoji: "🆓", label: "Always Free",        desc: "Reporting and searching will never cost anything" },
                { emoji: "🤝", label: "Community Driven",   desc: "Built by Malawians, powered by Malawians" },
                { emoji: "🔒", label: "Safe & Ethical",     desc: "No rewards for found persons. No data selling." },
                { emoji: "📍", label: "Built for Malawi",   desc: "Every feature designed for the Malawian context" },
              ].map(v => (
                <div key={v.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ fontSize: 18, margin: "0 0 4px" }}>{v.emoji}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "white", margin: "0 0 3px" }}>{v.label}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.4 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Company Values ── */}
        <h2 style={{ ...S.h2, padding: "0 2px", marginBottom: 12 }}>New School Technology — What We Stand For</h2>
        <div style={S.valuesGrid}>
          {VALUES.map(v => (
            <div key={v.title} style={{ ...S.valueCard, background: v.bg }}>
              <div style={S.valueIcon}>{v.icon}</div>
              <p style={S.valueTitle}>{v.title}</p>
              <p style={S.valueBody}>{v.body}</p>
            </div>
          ))}
        </div>

        {/* ── Contact ── */}
        <div style={S.card}>
          <h2 style={S.h2}>Get In Touch</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>
            Whether you are looking to hire, collaborate, commission a system, or just want to talk tech — we are always open.
          </p>

          <div style={S.contactRow}>
            <a href="mailto:sitolomacdonald@gmail.com" style={S.contactItem}>
              <div style={{ ...S.contactIcon, background: "#eef2ff" }}>
                <FiMail size={18} color="#0a4d8c" />
              </div>
              <div>
                <p style={S.contactLabel}>Email</p>
                <p style={S.contactVal}>sitolomacdonald@gmail.com</p>
              </div>
            </a>

            <a href="tel:+265995108166" style={S.contactItem}>
              <div style={{ ...S.contactIcon, background: "#f0fff4" }}>
                <FiPhone size={18} color="#1a7a3c" />
              </div>
              <div>
                <p style={S.contactLabel}>Phone / WhatsApp</p>
                <p style={S.contactVal}>+265 995 108 166</p>
              </div>
            </a>

            <a href="https://macdonald-three.vercel.app" target="_blank" rel="noreferrer" style={S.contactItem}>
              <div style={{ ...S.contactIcon, background: "#fff8e1" }}>
                <FiGlobe size={18} color="#b45309" />
              </div>
              <div>
                <p style={S.contactLabel}>Portfolio</p>
                <p style={S.contactVal}>macdonald-three.vercel.app</p>
              </div>
            </a>

            <a href="https://github.com/macdonaldsitolo" target="_blank" rel="noreferrer" style={S.contactItem}>
              <div style={{ ...S.contactIcon, background: "#f2f3f7" }}>
                <FiGithub size={18} color="#1c1c1e" />
              </div>
              <div>
                <p style={S.contactLabel}>GitHub</p>
                <p style={S.contactVal}>github.com/macdonaldsitolo</p>
              </div>
            </a>

            <a href="https://linkedin.com/in/macdonald-sitolo" target="_blank" rel="noreferrer" style={S.contactItem}>
              <div style={{ ...S.contactIcon, background: "#e8f4fd" }}>
                <FiLinkedin size={18} color="#0077b5" />
              </div>
              <div>
                <p style={S.contactLabel}>LinkedIn</p>
                <p style={S.contactVal}>linkedin.com/in/macdonald-sitolo</p>
              </div>
            </a>

            <div style={{ ...S.contactItem, cursor: "default" }}>
              <div style={{ ...S.contactIcon, background: "#fff0f0" }}>
                <span style={{ fontSize: 18 }}>📍</span>
              </div>
              <div>
                <p style={S.contactLabel}>Location</p>
                <p style={S.contactVal}>P.O Box 23, Zomba, Malawi</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={S.cta}>
          <Link to="/support" style={{ textDecoration: "none", flex: 1 }}>
            <button style={S.ctaBtn}>Send a Message</button>
          </Link>
        </div>

      </div>
    </div>
  )
}

const S = {
  page:         { backgroundColor: "#f2f2f7", minHeight: "100vh", paddingBottom: 60 },
  container:    { maxWidth: 640, margin: "0 auto", padding: "20px 18px" },
  back:         { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#0a4d8c", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "4px 0", marginBottom: 20 },

  // Hero
  hero:         { textAlign: "center", padding: "24px 0 20px" },
  heroLogo:     { width: 72, height: 72, borderRadius: 22, background: "#0a4d8c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" },
  heroTitle:    { fontSize: 22, fontWeight: 800, color: "#1c1c1e", margin: "0 0 8px", lineHeight: 1.3 },
  heroTag:      { fontSize: 14, color: "#6e6e73", lineHeight: 1.6, margin: "0 0 14px" },
  heroBadges:   { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  badge:        { fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "#eef2ff", color: "#0a4d8c" },

  // Office photo
  officePhoto:  { marginBottom: 16 },
  photoPlaceholder: { height: 180, background: "white", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "2px dashed #e5e7eb" },
  photoHint:    { fontWeight: 600, fontSize: 14, color: "#9ca3af", margin: 0 },
  photoSub:     { fontSize: 11, color: "#c8d3e0" },

  // Cards
  card:         { background: "white", borderRadius: 20, padding: "18px 18px 20px", marginBottom: 16, boxShadow: "0 3px 10px rgba(0,0,0,0.06)" },
  h2:           { fontSize: 16, fontWeight: 700, color: "#1c1c1e", margin: "0 0 12px" },
  body:         { fontSize: 14, color: "#4b5563", lineHeight: 1.7, margin: "0 0 10px" },

  // Services
  servicesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  serviceItem:  { display: "flex", alignItems: "center", gap: 10, background: "#f2f3f7", borderRadius: 12, padding: "10px 12px" },
  serviceLabel: { fontSize: 13, fontWeight: 600, color: "#1c1c1e" },

  // Team
  memberCard:   { background: "white", borderRadius: 20, padding: "18px", marginBottom: 14, boxShadow: "0 3px 10px rgba(0,0,0,0.06)", display: "flex", gap: 16, alignItems: "flex-start" },
  memberPhotoWrap: { position: "relative", flexShrink: 0 },
  memberPhoto:  { width: 80, height: 80, borderRadius: 18, objectFit: "cover" },
  memberPhotoPlaceholder: { width: 80, height: 80, borderRadius: 18, background: "#f2f3f7", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #e5e7eb" },
  founderBadge: { position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: "#0a4d8c", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" },
  memberInfo:   { flex: 1, minWidth: 0 },
  memberName:   { fontWeight: 800, fontSize: 15, color: "#1c1c1e", margin: "0 0 2px" },
  memberRole:   { fontSize: 12, fontWeight: 700, color: "#0a4d8c", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" },
  memberBio:    { fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: "0 0 10px" },
  skillsWrap:   { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  skillChip:    { fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#f2f3f7", color: "#6e6e73" },
  memberLinks:  { display: "flex", flexWrap: "wrap", gap: 6 },
  memberLink:   { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#0a4d8c", textDecoration: "none", background: "#eef2ff", padding: "4px 10px", borderRadius: 20 },

  // Team slot
  teamSlot:     { background: "white", borderRadius: 20, padding: "16px 18px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "2px dashed #e5e7eb" },
  teamSlotInner:{ display: "flex", alignItems: "center", gap: 14 },

  // Values
  valuesGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  valueCard:    { borderRadius: 16, padding: "16px 14px" },
  valueIcon:    { marginBottom: 8 },
  valueTitle:   { fontWeight: 700, fontSize: 13, color: "#1c1c1e", margin: "0 0 6px" },
  valueBody:    { fontSize: 12, color: "#6e6e73", lineHeight: 1.5, margin: 0 },

  // Contact
  contactRow:   { display: "flex", flexDirection: "column", gap: 12 },
  contactItem:  { display: "flex", alignItems: "center", gap: 14, textDecoration: "none" },
  contactIcon:  { width: 44, height: 44, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  contactLabel: { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 },
  contactVal:   { fontSize: 13, fontWeight: 600, color: "#1c1c1e", margin: "2px 0 0" },

  // CTA
  cta:          { display: "flex", gap: 12, marginTop: 8 },
  ctaBtn:       { width: "100%", padding: "15px 0", borderRadius: 18, border: "none", background: "#0a4d8c", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" },
}
