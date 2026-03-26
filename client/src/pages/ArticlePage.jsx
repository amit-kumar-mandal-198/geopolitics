import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { isBookmarked, toggleBookmark } from '../utils/bookmarks'
import './ArticlePage.css'

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [comments, setComments] = useState([])
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({ display_name: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getArticle(slug),
      api.getComments(slug).catch(() => ({ comments: [] }))
    ]).then(([artData, comData]) => {
      setArticle(artData.article)
      setRelated(artData.related || [])
      setComments(comData.comments || [])
      setBookmarked(isBookmarked(slug))
    }).catch(console.error)
      .finally(() => setLoading(false))
    window.scrollTo(0, 0)
  }, [slug])

  const handleBookmark = () => {
    if (!article) return
    const added = toggleBookmark(article)
    setBookmarked(added)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentForm.display_name.trim() || !commentForm.content.trim()) return
    setSubmitting(true)
    try {
      const data = await api.postComment(slug, commentForm)
      setComments(prev => [data.comment, ...prev])
      setCommentForm({ display_name: '', content: '' })
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="article-page animate-fade-in">
        <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '32px' }} />
        <div className="skeleton" style={{ height: '200px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="article-page animate-fade-in">
        <div className="home__empty">
          <div className="home__empty-icon">🔍</div>
          <h3>Article not found</h3>
          <p>This article may have been removed or the URL is incorrect.</p>
          <Link to="/" className="btn btn--outline" style={{ marginTop: '16px', display: 'inline-block' }}>Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="article-page animate-fade-in">
      <article className="article-page__content">
        {/* Header */}
        <header className="article-page__header">
          <div className="article-page__categories">
            {(article.category_names || []).map((name, i) => (
              <span key={i} className="badge badge--region">
                {article.category_icons?.[i]} {name}
              </span>
            ))}
            {article.is_breaking && <span className="badge badge--breaking">⚡ Breaking</span>}
          </div>

          <h1 className="article-page__title">{article.title}</h1>

          <div className="article-page__meta">
            <span className="article-page__source">
              {article.source_name}
            </span>
            <span className="article-page__date">{formatDate(article.published_at)}</span>
            <button className={`article-page__bookmark ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {bookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </header>

        {/* Image */}
        {article.image_url && (
          <div className="article-page__hero-image">
            <img src={article.image_url} alt={article.title} onError={(e) => { e.target.style.display = 'none' }} />
          </div>
        )}

        {/* Summary */}
        {article.summary && (
          <div className="article-page__summary glass">
            <h2 className="article-page__summary-label">📋 AI Summary</h2>
            <p>{article.summary}</p>
          </div>
        )}

        {/* Full Analysis */}
        {article.analysis && (
          <div className="article-page__analysis">
            <h2 className="article-page__analysis-label">📝 In-Depth Analysis</h2>
            <div className="article-page__analysis-content" dangerouslySetInnerHTML={{ __html: article.analysis.replace(/\n/g, '<br/>') }} />
          </div>
        )}

        {/* Original content */}
        {article.content && !article.analysis && (
          <div className="article-page__body">
            <p>{article.content}</p>
          </div>
        )}

        {/* Source link */}
        {article.original_url && (
          <a href={article.original_url} target="_blank" rel="noopener noreferrer" className="article-page__source-link glass">
            Read original article on {article.source_name} →
          </a>
        )}
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="article-page__related">
          <h3 className="article-page__related-title">Related Stories</h3>
          <div className="article-page__related-grid">
            {related.map(rel => (
              <Link key={rel.id} to={`/article/${rel.slug}`} className="article-page__related-card glass">
                <h4 className="truncate-2">{rel.title}</h4>
                <span className="article-page__related-source">{rel.source_name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="article-page__comments">
        <h3 className="article-page__comments-title">
          💬 Comments ({comments.length})
        </h3>

        <form className="article-page__comment-form glass" onSubmit={handleSubmitComment}>
          <input
            type="text"
            placeholder="Your name"
            value={commentForm.display_name}
            onChange={e => setCommentForm(prev => ({ ...prev, display_name: e.target.value }))}
            className="article-page__comment-input"
            maxLength={50}
            required
            id="comment-name"
          />
          <textarea
            placeholder="Share your thoughts..."
            value={commentForm.content}
            onChange={e => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
            className="article-page__comment-textarea"
            rows={3}
            maxLength={2000}
            required
            id="comment-content"
          />
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="article-page__comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="article-page__comment glass">
              <div className="article-page__comment-header">
                <span className="article-page__comment-name">{comment.display_name}</span>
                <span className="article-page__comment-date">{formatDate(comment.created_at)}</span>
              </div>
              <p className="article-page__comment-body">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
