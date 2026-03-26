import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isBookmarked, toggleBookmark } from '../utils/bookmarks'
import './ArticleCard.css'

export default function ArticleCard({ article, featured = false }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked(article.slug))

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleBookmark(article)
    setBookmarked(added)
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Link to={`/article/${article.slug}`} className={`article-card ${featured ? 'article-card--featured' : ''}`}>
      {article.image_url && (
        <div className="article-card__image-wrap">
          <img
            src={article.image_url}
            alt={article.title}
            className="article-card__image"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          {article.is_breaking ? (
            <span className="badge badge--breaking article-card__badge">⚡ Breaking</span>
          ) : null}
        </div>
      )}

      <div className="article-card__body">
        <div className="article-card__meta">
          {article.source_name && (
            <span className="article-card__source">{article.source_name}</span>
          )}
          <span className="article-card__time">{timeAgo(article.published_at)}</span>
        </div>

        <h3 className={`article-card__title ${featured ? '' : 'truncate-2'}`}>
          {article.title}
        </h3>

        {article.summary && (
          <p className={`article-card__summary ${featured ? 'truncate-3' : 'truncate-2'}`}>
            {article.summary}
          </p>
        )}

        <div className="article-card__footer">
          <div className="article-card__categories">
            {(article.category_names || []).slice(0, 2).map((name, i) => (
              <span key={i} className="badge badge--region">{name}</span>
            ))}
          </div>

          <button
            className={`article-card__bookmark ${bookmarked ? 'article-card__bookmark--active' : ''}`}
            onClick={handleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}
