const express = require('express');
const router = express.Router();
const db = require('../db/init');

// GET /api/articles — List articles with pagination, filters, search
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20, category, region, topic, search, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT a.*, s.name as source_name,
        GROUP_CONCAT(DISTINCT c.slug) as category_slugs,
        GROUP_CONCAT(DISTINCT c.name) as category_names
      FROM articles a
      LEFT JOIN sources s ON a.source_id = s.id
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      LEFT JOIN categories c ON ac.category_id = c.id
    `;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }
    if (region) {
      conditions.push("c.slug = ? AND c.type = 'region'");
      params.push(region);
    }
    if (topic) {
      conditions.push("c.slug = ? AND c.type = 'topic'");
      params.push(topic);
    }
    if (date_from) {
      conditions.push('a.published_at >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('a.published_at <= ?');
      params.push(date_to);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY a.id ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const articles = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT count(DISTINCT a.id) as total FROM articles a';
    if (category || region || topic) {
      countQuery += ' LEFT JOIN article_categories ac ON a.id = ac.article_id LEFT JOIN categories c ON ac.category_id = c.id';
      const countConditions = conditions.slice(0, -2); // remove limit/offset conditions
      if (countConditions.length > 0) {
        countQuery += ' WHERE ' + countConditions.join(' AND ');
      }
    }
    const countParams = params.slice(0, -2);
    const total = db.prepare(countQuery).get(...countParams);

    res.json({
      articles: articles.map(a => ({
        ...a,
        categories: a.category_slugs ? a.category_slugs.split(',') : [],
        category_names: a.category_names ? a.category_names.split(',') : []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.total,
        pages: Math.ceil(total.total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/search — Full-text search via FTS5
router.get('/search', (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchQuery = q.replace(/[^\w\s]/g, '').trim();

    const articles = db.prepare(`
      SELECT a.*, s.name as source_name,
        GROUP_CONCAT(DISTINCT c.slug) as category_slugs,
        GROUP_CONCAT(DISTINCT c.name) as category_names
      FROM articles_fts fts
      JOIN articles a ON fts.rowid = a.id
      LEFT JOIN sources s ON a.source_id = s.id
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE articles_fts MATCH ?
      GROUP BY a.id
      ORDER BY rank
      LIMIT ? OFFSET ?
    `).all(searchQuery, parseInt(limit), offset);

    res.json({
      articles: articles.map(a => ({
        ...a,
        categories: a.category_slugs ? a.category_slugs.split(',') : [],
        category_names: a.category_names ? a.category_names.split(',') : []
      })),
      query: q
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/articles/breaking — Breaking news
router.get('/breaking', (req, res) => {
  try {
    const articles = db.prepare(`
      SELECT a.*, s.name as source_name
      FROM articles a
      LEFT JOIN sources s ON a.source_id = s.id
      WHERE a.is_breaking = 1
      ORDER BY a.published_at DESC
      LIMIT 10
    `).all();

    res.json({ articles });
  } catch (err) {
    console.error('Error fetching breaking news:', err);
    res.status(500).json({ error: 'Failed to fetch breaking news' });
  }
});

// GET /api/articles/:slug — Single article
router.get('/:slug', (req, res) => {
  try {
    const article = db.prepare(`
      SELECT a.*, s.name as source_name, s.url as source_url,
        GROUP_CONCAT(DISTINCT c.slug) as category_slugs,
        GROUP_CONCAT(DISTINCT c.name) as category_names,
        GROUP_CONCAT(DISTINCT c.icon) as category_icons
      FROM articles a
      LEFT JOIN sources s ON a.source_id = s.id
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.slug = ?
      GROUP BY a.id
    `).get(req.params.slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get related articles (same categories)
    const related = db.prepare(`
      SELECT DISTINCT a.id, a.title, a.slug, a.summary, a.image_url, a.published_at, s.name as source_name
      FROM articles a
      LEFT JOIN sources s ON a.source_id = s.id
      JOIN article_categories ac ON a.id = ac.article_id
      WHERE ac.category_id IN (
        SELECT category_id FROM article_categories WHERE article_id = ?
      ) AND a.id != ?
      ORDER BY a.published_at DESC
      LIMIT 5
    `).all(article.id, article.id);

    res.json({
      article: {
        ...article,
        categories: article.category_slugs ? article.category_slugs.split(',') : [],
        category_names: article.category_names ? article.category_names.split(',') : [],
        category_icons: article.category_icons ? article.category_icons.split(',') : []
      },
      related
    });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

module.exports = router;
