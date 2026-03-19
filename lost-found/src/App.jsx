import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import ReportLost from "./pages/ReportLost"
import ReportFound from "./pages/ReportFound"
import Listings from "./pages/Listings"
import Navbar from "./components/NavBar"
import ReportMissing from "./pages/ReportMissing"
import ClaimItems from "./pages/ClaimItems"

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/report-missing" element={<ReportMissing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/claim-items" element={<ClaimItems />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App