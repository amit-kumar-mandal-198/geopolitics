import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBookmarks, removeBookmark } from '../utils/bookmarks'
import './BookmarksPage.css'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => {
    setBookmarks(getBookmarks())
  }, [])

  const handleRemove = (slug) => {
    removeBookmark(slug)
    setBookmarks(getBookmarks())
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  return (
    <div className="bookmarks-page animate-fade-in">
      <header className="bookmarks-page__header">
        <h1 className="bookmarks-page__title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--accent-gold)" stroke="var(--accent-gold)" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Saved Articles
        </h1>
        <p className="bookmarks-page__count">{bookmarks.length} articles saved</p>
      </header>

      {bookmarks.length > 0 ? (
        <div className="bookmarks-page__list">
          {bookmarks.map(bm => (
            <div key={bm.slug} className="bookmarks-page__item glass">
              <Link to={`/article/${bm.slug}`} className="bookmarks-page__item-content">
                <div className="bookmarks-page__item-text">
                  <h3 className="bookmarks-page__item-title truncate-2">{bm.title}</h3>
                  {bm.summary && (
                    <p className="bookmarks-page__item-summary truncate-2">{bm.summary}</p>
                  )}
                  <div className="bookmarks-page__item-meta">
                    <span className="bookmarks-page__item-source">{bm.source_name}</span>
                    <span>{timeAgo(bm.published_at)}</span>
                  </div>
                </div>
              </Link>
              <button
                className="bookmarks-page__remove"
                onClick={() => handleRemove(bm.slug)}
                aria-label="Remove bookmark"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="home__empty">
          <div className="home__empty-icon">📑</div>
          <h3>No saved articles</h3>
          <p>Click the bookmark icon on any article to save it for later.</p>
          <Link to="/" className="btn btn--outline" style={{ marginTop: '16px', display: 'inline-block' }}>Browse News</Link>
        </div>
      )}
    </div>
  )
}
