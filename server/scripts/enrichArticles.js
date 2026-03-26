/**
 * AI Re-enrichment Script
 * 
 * Run this when Gemini API quota resets to retroactively add:
 * - AI summaries
 * - AI categorization (region/topic)
 * - In-depth analysis
 * - Breaking news detection
 * 
 * Usage: node scripts/enrichArticles.js
 */

require('dotenv').config();
const db = require('../db/init');
const { summarizeArticle, generateAnalysis, categorizeArticle, isBreakingNews } = require('../services/aiProcessor');

async function enrichArticles() {
  // Find articles without AI summaries (fallback summaries end with "...")
  const articles = db.prepare(`
    SELECT a.id, a.title, a.content, a.summary, a.slug
    FROM articles a
    WHERE a.analysis IS NULL
    ORDER BY a.published_at DESC
    LIMIT 30
  `).all();

  console.log(`Found ${articles.length} articles to enrich\n`);

  const insertCategory = db.prepare(
    'INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)'
  );
  const getCategoryId = db.prepare('SELECT id FROM categories WHERE slug = ?');

  let enriched = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      console.log(`[${enriched + 1}/${articles.length}] ${article.title.slice(0, 60)}...`);

      // Categorize
      const categories = await categorizeArticle(article.title, article.content || '');
      if (categories.regions) {
        for (const slug of categories.regions) {
          const cat = getCategoryId.get(slug);
          if (cat) insertCategory.run(article.id, cat.id);
        }
      }
      if (categories.topics) {
        for (const slug of categories.topics) {
          const cat = getCategoryId.get(slug);
          if (cat) insertCategory.run(article.id, cat.id);
        }
      }

      // Summarize
      const summary = await summarizeArticle(article.title, article.content || '');

      // Generate analysis (only for first 15 to save quota)
      let analysis = null;
      if (enriched < 15) {
        analysis = await generateAnalysis(article.title, article.content || '', summary);
      }

      // Breaking news detection
      const breaking = await isBreakingNews(article.title, article.content || '');

      // Update article
      db.prepare(`
        UPDATE articles 
        SET summary = ?, analysis = ?, is_breaking = ?
        WHERE id = ?
      `).run(summary, analysis, breaking ? 1 : 0, article.id);

      enriched++;
      console.log(`  ✓ Categories: ${JSON.stringify(categories)}`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message.slice(0, 80)}`);
      errors++;
      
      if (err.message.includes('429') || err.message.includes('quota')) {
        console.log('\nQuota exhausted — stopping. Try again later.');
        break;
      }
    }
  }

  console.log(`\nDone: ${enriched} enriched, ${errors} errors`);
  process.exit(0);
}

enrichArticles();
