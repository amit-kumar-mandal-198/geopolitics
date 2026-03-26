const crypto = require('crypto');
const db = require('../db/init');

/**
 * Generate a content hash for deduplication
 */
function generateHash(title, content) {
  const normalized = (title + content)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Generate a URL-friendly slug from title
 */
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  
  // Append timestamp fragment for uniqueness
  const ts = Date.now().toString(36).slice(-4);
  return `${base}-${ts}`;
}

/**
 * Check if an article already exists (by content hash or very similar title)
 */
function isDuplicate(title, content) {
  const hash = generateHash(title, content);
  
  // Check exact content hash
  const existing = db.prepare('SELECT id FROM articles WHERE content_hash = ?').get(hash);
  if (existing) return true;

  // Check similar titles (simple approach: first 60 chars match)
  const titlePrefix = title.toLowerCase().slice(0, 60);
  const similar = db.prepare(
    "SELECT id FROM articles WHERE LOWER(SUBSTR(title, 1, 60)) = ? AND published_at > datetime('now', '-2 days')"
  ).get(titlePrefix);
  
  return !!similar;
}

/**
 * Store a processed article with its categories
 */
function storeArticle(article, categoryData) {
  const hash = generateHash(article.title, article.content || '');
  const slug = generateSlug(article.title);

  const insertArticle = db.prepare(`
    INSERT INTO articles (title, slug, summary, content, analysis, source_id, original_url, image_url, published_at, is_breaking, content_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCategory = db.prepare(
    'INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)'
  );

  const getCategoryId = db.prepare('SELECT id FROM categories WHERE slug = ?');

  const storeTransaction = db.transaction(() => {
    const result = insertArticle.run(
      article.title,
      slug,
      article.summary,
      article.content,
      article.analysis,
      article.source_id,
      article.original_url,
      article.image_url,
      article.published_at,
      article.is_breaking ? 1 : 0,
      hash
    );

    const articleId = result.lastInsertRowid;

    // Link to region categories
    if (categoryData.regions) {
      for (const regionSlug of categoryData.regions) {
        const cat = getCategoryId.get(regionSlug);
        if (cat) insertCategory.run(articleId, cat.id);
      }
    }

    // Link to topic categories
    if (categoryData.topics) {
      for (const topicSlug of categoryData.topics) {
        const cat = getCategoryId.get(topicSlug);
        if (cat) insertCategory.run(articleId, cat.id);
      }
    }

    return articleId;
  });

  return storeTransaction();
}

module.exports = { generateHash, generateSlug, isDuplicate, storeArticle };
