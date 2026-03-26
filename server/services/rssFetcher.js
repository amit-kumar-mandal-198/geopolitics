const RssParser = require('rss-parser');
const db = require('../db/init');

const parser = new RssParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'GeoScope/1.0 News Aggregator'
  }
});

/**
 * Fetch articles from all active RSS sources
 * @returns {Array} Array of raw article objects
 */
async function fetchAllFeeds() {
  const sources = db.prepare('SELECT * FROM sources WHERE active = 1 AND rss_url IS NOT NULL').all();
  const allArticles = [];

  console.log(`[RSS] Fetching from ${sources.length} sources...`);

  for (const source of sources) {
    try {
      console.log(`[RSS] Fetching: ${source.name} (${source.rss_url})`);
      const feed = await parser.parseURL(source.rss_url);
      
      const articles = (feed.items || []).slice(0, 15).map(item => ({
        title: cleanText(item.title || ''),
        content: cleanText(item.contentSnippet || item.content || item.summary || ''),
        original_url: item.link || '',
        image_url: extractImage(item),
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        source_id: source.id,
        source_name: source.name,
      }));

      allArticles.push(...articles);
      console.log(`[RSS] ${source.name}: ${articles.length} articles`);
    } catch (err) {
      console.error(`[RSS] Error fetching ${source.name}:`, err.message);
    }
  }

  console.log(`[RSS] Total fetched: ${allArticles.length} articles`);
  return allArticles;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // strip HTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(item) {
  // Try media:content, enclosure, or content for images
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }
  // Try to extract from content HTML
  const match = (item.content || '').match(/<img[^>]+src=["']([^"']+)["']/);
  if (match) return match[1];
  return null;
}

module.exports = { fetchAllFeeds };
