import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import ArticleCard from '../components/ArticleCard'
import './CategoryPage.css'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [articles, setArticles] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getCategoryArticles(slug)
      .then(data => {
        setCategory(data.category)
        setArticles(data.articles || [])
        setPagination(data.pagination || {})
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  const loadMore = () => {
    if (pagination.page >= pagination.pages) return
    api.getCategoryArticles(slug, pagination.page + 1)
      .then(data => {
        setArticles(prev => [...prev, ...(data.articles || [])])
        setPagination(data.pagination || {})
      })
  }

  return (
    <div className="category-page animate-fade-in">
      <header className="category-page__header">
        {category && (
          <>
            <span className="category-page__icon">{category.icon}</span>
            <h1 className="category-page__title">{category.name}</h1>
            <span className="badge badge--region">{category.type}</span>
          </>
        )}
      </header>

      {loading ? (
        <div className="category-page__grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="category-page__grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {pagination.page < pagination.pages && (
            <div className="category-page__load-more">
              <button onClick={loadMore} className="btn btn--outline">
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="home__empty">
          <div className="home__empty-icon">📡</div>
          <h3>No articles in this category yet</h3>
          <p>News for this category will appear after the next AI update at 7:00 PM IST.</p>
        </div>
      )}
    </div>
  )
}
