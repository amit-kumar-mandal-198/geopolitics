// Bookmark utilities using localStorage

const BOOKMARKS_KEY = 'geoscope_bookmarks';

export function getBookmarks() {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(slug) {
  return getBookmarks().some(b => b.slug === slug);
}

export function toggleBookmark(article) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex(b => b.slug === article.slug);
  
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.unshift({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      image_url: article.image_url,
      source_name: article.source_name,
      published_at: article.published_at,
      savedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return idx < 0; // returns true if added, false if removed
}

export function removeBookmark(slug) {
  const bookmarks = getBookmarks().filter(b => b.slug !== slug);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}
