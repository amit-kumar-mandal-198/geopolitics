const express = require('express');
const router = express.Router();
const db = require('../db/init');

// GET /api/comments/:articleSlug — Get comments for an article
router.get('/:articleSlug', (req, res) => {
  try {
    const article = db.prepare('SELECT id FROM articles WHERE slug = ?').get(req.params.articleSlug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comments = db.prepare(`
      SELECT * FROM comments 
      WHERE article_id = ? 
      ORDER BY created_at DESC
    `).all(article.id);

    res.json({ comments, total: comments.length });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/comments/:articleSlug — Add a comment
router.post('/:articleSlug', (req, res) => {
  try {
    const { display_name, content } = req.body;

    // Validation
    if (!display_name || !display_name.trim()) {
      return res.status(400).json({ error: 'Display name is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    if (display_name.trim().length > 50) {
      return res.status(400).json({ error: 'Display name must be 50 characters or less' });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ error: 'Comment must be 2000 characters or less' });
    }

    const article = db.prepare('SELECT id FROM articles WHERE slug = ?').get(req.params.articleSlug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const result = db.prepare(
      'INSERT INTO comments (article_id, display_name, content) VALUES (?, ?, ?)'
    ).run(article.id, display_name.trim(), content.trim());

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ comment });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

module.exports = router;
