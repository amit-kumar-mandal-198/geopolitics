import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import ArticleCard from '../components/ArticleCard'
import './SearchPage.css'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    api.searchArticles(query)
      .then(data => setArticles(data.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="search-page animate-fade-in">
      <header className="search-page__header">
        <h1 className="search-page__title">
          Search Results for "<span className="search-page__query">{query}</span>"
        </h1>
        <p className="search-page__count">{articles.length} results found</p>
      </header>

      {loading ? (
        <div className="category-page__grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="category-page__grid">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : query ? (
        <div className="home__empty">
          <div className="home__empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try different keywords or browse categories from the sidebar.</p>
        </div>
      ) : null}
    </div>
  )
}
