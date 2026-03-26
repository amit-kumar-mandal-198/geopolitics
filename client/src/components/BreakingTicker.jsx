import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import './BreakingTicker.css'

export default function BreakingTicker() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    api.getBreakingNews()
      .then(data => setArticles(data.articles || []))
      .catch(() => setArticles([]))
  }, [])

  if (articles.length === 0) {
    return (
      <div className="ticker">
        <div className="ticker__label">
          <span className="ticker__dot" />
          LIVE
        </div>
        <div className="ticker__track">
          <div className="ticker__content">
            <span className="ticker__item">Welcome to GeoScope — Your comprehensive geopolitics news platform. News updates daily at 7:00 PM IST.</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ticker">
      <div className="ticker__label">
        <span className="ticker__dot" />
        BREAKING
      </div>
      <div className="ticker__track">
        <div className="ticker__content">
          {[...articles, ...articles].map((article, i) => (
            <Link key={i} to={`/article/${article.slug}`} className="ticker__item">
              ⚡ {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
