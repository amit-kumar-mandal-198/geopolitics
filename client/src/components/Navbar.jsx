import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="navbar glass">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">🌐</span>
          <span className="navbar__title">
            Geo<span className="navbar__title-accent">Scope</span>
          </span>
        </Link>

        <div className={`navbar__center ${menuOpen ? 'navbar__center--open' : ''}`}>
          <Link to="/" className="navbar__link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/regions" className="navbar__link" onClick={() => setMenuOpen(false)}>Regions</Link>
          <Link to="/topics" className="navbar__link" onClick={() => setMenuOpen(false)}>Topics</Link>
          <Link to="/bookmarks" className="navbar__link" onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Saved
          </Link>
        </div>

        <form className="navbar__search" onSubmit={handleSearch}>
          <svg className="navbar__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Search global news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-input"
          />
        </form>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`navbar__hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`navbar__hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`navbar__hamburger-line ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>
    </nav>
  )
}
