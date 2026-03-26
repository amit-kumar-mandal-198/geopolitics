import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import BreakingTicker from './components/BreakingTicker'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ArticlePage from './pages/ArticlePage'
import SearchPage from './pages/SearchPage'
import BookmarksPage from './pages/BookmarksPage'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <BreakingTicker />
      <div className="app__layout">
        <Sidebar />
        <main className="app__main container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/regions" element={<HomePage />} />
            <Route path="/topics" element={<HomePage />} />
            <Route path="*" element={
              <div className="home__empty" style={{ marginTop: '4rem' }}>
                <div className="home__empty-icon">🗺️</div>
                <h3>Page not found</h3>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}
