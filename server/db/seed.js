const db = require('./init');

const categories = [
  // Regions
  { name: 'Asia', slug: 'asia', type: 'region', icon: '🌏', order: 1 },
  { name: 'Europe', slug: 'europe', type: 'region', icon: '🌍', order: 2 },
  { name: 'Middle East & North Africa', slug: 'middle-east', type: 'region', icon: '🕌', order: 3 },
  { name: 'Americas', slug: 'americas', type: 'region', icon: '🌎', order: 4 },
  { name: 'Sub-Saharan Africa', slug: 'sub-saharan-africa', type: 'region', icon: '🌍', order: 5 },
  { name: 'Oceania & Pacific', slug: 'oceania', type: 'region', icon: '🏝️', order: 6 },
  // Topics
  { name: 'Diplomacy & Foreign Relations', slug: 'diplomacy', type: 'topic', icon: '🤝', order: 1 },
  { name: 'Conflicts & Security', slug: 'conflicts', type: 'topic', icon: '⚔️', order: 2 },
  { name: 'Trade & Economy', slug: 'trade-economy', type: 'topic', icon: '📊', order: 3 },
  { name: 'Elections & Politics', slug: 'elections', type: 'topic', icon: '🗳️', order: 4 },
  { name: 'Climate & Environment', slug: 'climate', type: 'topic', icon: '🌱', order: 5 },
  { name: 'Technology & Cyber', slug: 'technology', type: 'topic', icon: '💻', order: 6 },
];

const sources = [
  { name: 'NDTV World', url: 'https://www.ndtv.com/world-news', rss_url: 'https://feeds.feedburner.com/ndtvnews-world-news', type: 'rss' },
  { name: 'BBC World', url: 'https://www.bbc.com/news/world', rss_url: 'https://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com', rss_url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world', rss_url: 'https://www.theguardian.com/world/rss', type: 'rss' },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com', rss_url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', type: 'rss' },
  { name: 'CNBC World', url: 'https://www.cnbc.com/world', rss_url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', type: 'rss' },
  { name: 'France24', url: 'https://www.france24.com', rss_url: 'https://www.france24.com/en/rss', type: 'rss' },
  { name: 'DW News', url: 'https://www.dw.com', rss_url: 'https://rss.dw.com/rdf/rss-en-world', type: 'rss' },
];

// Seed categories
const insertCategory = db.prepare(
  'INSERT OR IGNORE INTO categories (name, slug, type, icon, display_order) VALUES (?, ?, ?, ?, ?)'
);

const insertSource = db.prepare(
  'INSERT OR IGNORE INTO sources (name, url, rss_url, type) VALUES (?, ?, ?, ?)'
);

const seedAll = db.transaction(() => {
  for (const cat of categories) {
    insertCategory.run(cat.name, cat.slug, cat.type, cat.icon, cat.order);
  }
  for (const src of sources) {
    insertSource.run(src.name, src.url, src.rss_url, src.type);
  }
});

seedAll();

const catCount = db.prepare('SELECT count(*) as c FROM categories').get();
const srcCount = db.prepare('SELECT count(*) as c FROM sources').get();
console.log(`Seeded: ${catCount.c} categories, ${srcCount.c} sources`);
