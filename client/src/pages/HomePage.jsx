import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import ArticleCard from '../components/ArticleCard'
import './HomePage.css'

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState({ regions: [], topics: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getArticles({ limit: 12 }),
      api.getCategories()
    ]).then(([artData, catData]) => {
      setArticles(artData.articles || [])
      setCategories(catData)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home animate-fade-in">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__hero-bg" />
        <div className="home__hero-content">
          <h1 className="home__hero-title">
            Global <span className="home__hero-accent">Geopolitics</span>
            <br />Intelligence
          </h1>
          <p className="home__hero-subtitle">
            AI-curated world news from 8+ trusted sources. Updated daily at 7:00 PM IST.
          </p>
          <div className="home__hero-stats">
            <div className="home__stat">
              <span className="home__stat-number">{categories.regions?.length || 6}</span>
              <span className="home__stat-label">Regions</span>
            </div>
            <div className="home__stat-divider" />
            <div className="home__stat">
              <span className="home__stat-number">{categories.topics?.length || 6}</span>
              <span className="home__stat-label">Topics</span>
            </div>
            <div className="home__stat-divider" />
            <div className="home__stat">
              <span className="home__stat-number">8+</span>
              <span className="home__stat-label">Sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Regions Quick Nav */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            <span className="home__section-icon">🌍</span>
            Browse by Region
          </h2>
          <Link to="/regions" className="home__section-link">View all →</Link>
        </div>
        <div className="home__regions-grid">
          {categories.regions?.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="home__region-card glass">
              <span className="home__region-icon">{cat.icon}</span>
              <span className="home__region-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Topics Quick Nav */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            <span className="home__section-icon">📋</span>
            Browse by Topic
          </h2>
          <Link to="/topics" className="home__section-link">View all →</Link>
        </div>
        <div className="home__topics-grid">
          {categories.topics?.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="home__topic-card glass">
              <span className="home__topic-icon">{cat.icon}</span>
              <span className="home__topic-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            <span className="home__section-icon">📰</span>
            Latest News
          </h2>
        </div>

        {loading ? (
          <div className="home__articles-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="home__articles-grid">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0} />
            ))}
          </div>
        ) : (
          <div className="home__empty">
            <div className="home__empty-icon">📡</div>
            <h3>No news articles yet</h3>
            <p>The AI engine will fetch and process news at the next scheduled run (7:00 PM IST). Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  )
}
