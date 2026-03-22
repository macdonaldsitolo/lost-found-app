import { FiArrowLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div style={S.page}>
      <div style={S.container}>
        <button style={S.back} onClick={() => navigate(-1)}>
          <FiArrowLeft size={17} /> Back
        </button>

        <h1 style={S.h1}>Terms & Conditions</h1>
        <p style={S.updated}>Last updated: March 2026</p>

        <Section title="1. Acceptance of Terms">
          By using Lost & Found Malawi, you agree to these Terms & Conditions. If you do not agree, please do not use the platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.
        </Section>

        <Section title="2. Who Can Use the Platform">
          Lost & Found Malawi is open to any person in Malawi or with a connection to Malawi. You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.
        </Section>

        <Section title="3. Posting Reports">
          When posting a lost, found, or missing person report, you must ensure the information is accurate and truthful. You may not post false reports, spam, or content that is misleading, offensive, or harmful. Reports may be removed if they violate these terms. We reserve the right to remove any content at our discretion.
        </Section>

        <Section title="4. Claiming Items">
          Claiming an item requires you to provide proof of ownership such as IMEI numbers, serial numbers, or other identifying information. Submitting a false claim is a violation of these terms and may result in your account being suspended. Lost & Found Malawi does not verify claims — this service connects claimants with item holders.
        </Section>

        <Section title="5. Found Persons — No Reward Allowed">
          If you report a found person, you may not request a monetary reward for returning them to their family. This is a safety and ethical policy. Any found person report containing a reward demand will be removed. Reports of missing and wanted persons may include reward offers.
        </Section>

        <Section title="6. Privacy">
          Your personal information (name, email, phone) is used solely for the purpose of facilitating lost & found reports and account management. We do not sell your data to third parties. Phone numbers and contact details you include in reports will be visible to the public — only share what you are comfortable sharing publicly.
        </Section>

        <Section title="7. Limitation of Liability">
          Lost & Found Malawi is a platform connecting people — we are not responsible for the outcome of any lost/found situation, claim dispute, or interaction between users. We do not guarantee that any item will be found or returned.
        </Section>

        <Section title="8. Contact">
          For questions about these terms, contact us at <a href="mailto:support@lostfound.mw" style={{ color: "#0a4d8c" }}>support@lostfound.mw</a>.
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1c1c1e", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7, margin: 0 }}>{children}</p>
    </div>
  )
}

const S = {
  page:      { backgroundColor: "#f2f2f7", minHeight: "100vh", padding: "0 0 60px" },
  container: { maxWidth: 640, margin: "0 auto", padding: "20px 20px" },
  back:      { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#0a4d8c", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "4px 0", marginBottom: 20 },
  h1:        { fontSize: 24, fontWeight: 700, color: "#1c1c1e", margin: "0 0 6px" },
  updated:   { fontSize: 12, color: "#9ca3af", marginBottom: 28 },
}
