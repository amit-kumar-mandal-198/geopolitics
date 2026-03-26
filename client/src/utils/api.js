const API_BASE = 'http://localhost:3001/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Articles
  getArticles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/articles${qs ? `?${qs}` : ''}`);
  },
  getArticle: (slug) => fetchApi(`/articles/${slug}`),
  getBreakingNews: () => fetchApi('/articles/breaking'),
  searchArticles: (q, page = 1) => fetchApi(`/articles/search?q=${encodeURIComponent(q)}&page=${page}`),

  // Categories
  getCategories: () => fetchApi('/categories'),
  getCategoryArticles: (slug, page = 1) => fetchApi(`/categories/${slug}/articles?page=${page}`),

  // Comments
  getComments: (articleSlug) => fetchApi(`/comments/${articleSlug}`),
  postComment: (articleSlug, data) => fetchApi(`/comments/${articleSlug}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Health
  health: () => fetchApi('/health'),
};

export default api;
