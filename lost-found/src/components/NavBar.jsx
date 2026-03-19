import { Link } from "react-router-dom"
import { FiHome, FiList } from "react-icons/fi"

function Navbar() {
  return (
    <nav className="navbar">
      <h3>Lost - Found Malawi</h3>

      <div>
        <Link to="/">
          <FiHome /> Home
        </Link>

        <Link to="/listings">
          <FiList /> Listings
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
