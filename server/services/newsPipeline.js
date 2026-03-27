const { fetchAllFeeds } = require('./rssFetcher');
const { summarizeArticle, generateAnalysis, categorizeArticle, isBreakingNews } = require('./aiProcessor');
const { categorizeByKeywords } = require('./keywordCategorizer');
const { isDuplicate, storeArticle } = require('./deduplicator');

/**
 * Main news pipeline: Fetch → Deduplicate → Categorize → AI Process → Store
 * Keyword categorization ALWAYS runs (no AI needed)
 * AI processing is optional and enhances summaries/analysis when available
 */
async function runNewsPipeline(options = {}) {
  const { skipAI = false, maxArticles = 50 } = options;
  const startTime = Date.now();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  GeoScope News Pipeline — Starting');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`  AI Processing: ${skipAI ? 'DISABLED' : 'ENABLED'}`);
  console.log(`  Keyword Categorization: ALWAYS ON`);
  console.log('');

  // Step 1: Fetch all RSS feeds
  let rawArticles;
  try {
    rawArticles = await fetchAllFeeds();
  } catch (err) {
    console.error('[Pipeline] Fatal error fetching feeds:', err.message);
    return { success: false, error: err.message };
  }

  let processed = 0;
  let duplicates = 0;
  let errors = 0;
  let stored = 0;
  let categorized = 0;

  // Step 2: Process each article
  const articlesToProcess = rawArticles.slice(0, maxArticles);

  for (const rawArticle of articlesToProcess) {
    try {
      if (!rawArticle.title || rawArticle.title.length < 10) continue;

      // Step 2a: Deduplication check
      if (isDuplicate(rawArticle.title, rawArticle.content)) {
        duplicates++;
        continue;
      }

      processed++;
      console.log(`[Pipeline] Processing (${processed}/${articlesToProcess.length}): ${rawArticle.title.slice(0, 60)}...`);

      let summary = rawArticle.content?.slice(0, 300) || '';
      let analysis = null;
      let breaking = false;

      // Step 2b: ALWAYS categorize by keywords (no AI needed)
      let categories = categorizeByKeywords(rawArticle.title, rawArticle.content || '');
      if (categories.regions.length > 0 || categories.topics.length > 0) {
        categorized++;
      }

      // Step 2c: AI enhancement (optional)
      if (!skipAI && process.env.GEMINI_API_KEY) {
        try {
          const aiCats = await categorizeArticle(rawArticle.title, rawArticle.content);
          if (aiCats.regions?.length) categories.regions = [...new Set([...categories.regions, ...aiCats.regions])];
          if (aiCats.topics?.length) categories.topics = [...new Set([...categories.topics, ...aiCats.topics])];
        } catch (e) {}

        try {
          const aiSummary = await summarizeArticle(rawArticle.title, rawArticle.content);
          if (aiSummary && !aiSummary.endsWith('...')) summary = aiSummary;
        } catch (e) {}

        if (processed <= 10) {
          try { analysis = await generateAnalysis(rawArticle.title, rawArticle.content, summary); } catch (e) {}
        }

        try { breaking = await isBreakingNews(rawArticle.title, rawArticle.content); } catch (e) {}
      }

      // Keyword-based breaking detection fallback
      if (!breaking) {
        const bk = ['breaking', 'urgent', 'just in', 'killed', 'attack', 'war ', 'invasion', 'crisis', 'emergency', 'massacre'];
        breaking = bk.some(kw => rawArticle.title.toLowerCase().includes(kw));
      }

      // Step 3: Store
      storeArticle({
        title: rawArticle.title,
        summary,
        content: rawArticle.content,
        analysis,
        source_id: rawArticle.source_id,
        original_url: rawArticle.original_url,
        image_url: rawArticle.image_url,
        published_at: rawArticle.published_at,
        is_breaking: breaking,
      }, categories);

      stored++;
    } catch (err) {
      console.error(`[Pipeline] Error:`, err.message);
      errors++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  GeoScope News Pipeline — Complete');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Duration:     ${duration}s`);
  console.log(`  Fetched:      ${rawArticles.length}`);
  console.log(`  Processed:    ${processed}`);
  console.log(`  Duplicates:   ${duplicates}`);
  console.log(`  Categorized:  ${categorized}`);
  console.log(`  Stored:       ${stored}`);
  console.log(`  Errors:       ${errors}`);
  console.log('═══════════════════════════════════════════════════\n');

  return {
    success: true,
    stats: { fetched: rawArticles.length, processed, duplicates, categorized, stored, errors, duration }
  };
}

module.exports = { runNewsPipeline };
