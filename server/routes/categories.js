const express = require('express');
const router = express.Router();
const db = require('../db/init');

// GET /api/categories — All categories grouped by type
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(
      'SELECT * FROM categories ORDER BY type, display_order'
    ).all();

    const grouped = {
      regions: categories.filter(c => c.type === 'region'),
      topics: categories.filter(c => c.type === 'topic')
    };

    res.json(grouped);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug — Single category info
router.get('/:slug', (req, res) => {
  try {
    const category = db.prepare(
      'SELECT * FROM categories WHERE slug = ?'
    ).get(req.params.slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// GET /api/categories/:slug/articles — Articles in a category
router.get('/:slug/articles', (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const category = db.prepare(
      'SELECT * FROM categories WHERE slug = ?'
    ).get(req.params.slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const articles = db.prepare(`
      SELECT a.*, s.name as source_name
      FROM articles a
      LEFT JOIN sources s ON a.source_id = s.id
      JOIN article_categories ac ON a.id = ac.article_id
      WHERE ac.category_id = ?
      ORDER BY a.published_at DESC
      LIMIT ? OFFSET ?
    `).all(category.id, parseInt(limit), offset);

    const total = db.prepare(`
      SELECT count(*) as c FROM article_categories WHERE category_id = ?
    `).get(category.id);

    res.json({
      category,
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.c,
        pages: Math.ceil(total.c / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching category articles:', err);
    res.status(500).json({ error: 'Failed to fetch category articles' });
  }
});

module.exports = router;
