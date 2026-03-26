import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../utils/api'
import './Sidebar.css'

export default function Sidebar() {
  const [categories, setCategories] = useState({ regions: [], topics: [] })
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error)
  }, [])

  return (
    <aside className={`sidebar glass ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <button className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {collapsed 
            ? <path d="M9 18l6-6-6-6"/>
            : <path d="M15 18l-6-6 6-6"/>
          }
        </svg>
      </button>

      {!collapsed && (
        <div className="sidebar__content">
          <div className="sidebar__section">
            <h3 className="sidebar__heading">
              <span className="sidebar__heading-icon">🌍</span>
              Regions
            </h3>
            <ul className="sidebar__list">
              {categories.regions.map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`sidebar__item ${location.pathname === `/category/${cat.slug}` ? 'sidebar__item--active' : ''}`}
                  >
                    <span className="sidebar__item-icon">{cat.icon}</span>
                    <span className="sidebar__item-name">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar__divider" />

          <div className="sidebar__section">
            <h3 className="sidebar__heading">
              <span className="sidebar__heading-icon">📋</span>
              Topics
            </h3>
            <ul className="sidebar__list">
              {categories.topics.map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`sidebar__item ${location.pathname === `/category/${cat.slug}` ? 'sidebar__item--active' : ''}`}
                  >
                    <span className="sidebar__item-icon">{cat.icon}</span>
                    <span className="sidebar__item-name">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  )
}
