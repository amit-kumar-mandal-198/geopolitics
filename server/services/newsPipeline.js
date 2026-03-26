const { fetchAllFeeds } = require('./rssFetcher');
const { summarizeArticle, generateAnalysis, categorizeArticle, isBreakingNews } = require('./aiProcessor');
const { isDuplicate, storeArticle } = require('./deduplicator');

/**
 * Main news pipeline: Fetch → Deduplicate → AI Process → Store
 * Called by the cron scheduler and can be triggered manually
 */
async function runNewsPipeline(options = {}) {
  const { skipAI = false, maxArticles = 50 } = options;
  const startTime = Date.now();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  GeoScope News Pipeline — Starting');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`  AI Processing: ${skipAI ? 'DISABLED' : 'ENABLED'}`);
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

  // Step 2: Process each article
  const articlesToProcess = rawArticles.slice(0, maxArticles);

  for (const rawArticle of articlesToProcess) {
    try {
      // Skip if no title
      if (!rawArticle.title || rawArticle.title.length < 10) {
        continue;
      }

      // Step 2a: Deduplication check
      if (isDuplicate(rawArticle.title, rawArticle.content)) {
        duplicates++;
        continue;
      }

      processed++;
      console.log(`[Pipeline] Processing (${processed}/${articlesToProcess.length}): ${rawArticle.title.slice(0, 60)}...`);

      let summary = rawArticle.content?.slice(0, 300) || '';
      let analysis = null;
      let categories = { regions: [], topics: [] };
      let breaking = false;

      if (!skipAI && process.env.GEMINI_API_KEY) {
        // Step 2b: AI Categorization
        categories = await categorizeArticle(rawArticle.title, rawArticle.content);

        // Step 2c: AI Summary
        summary = await summarizeArticle(rawArticle.title, rawArticle.content);

        // Step 2d: Generate analysis (only for first 10 articles to save API quota)
        if (processed <= 10) {
          analysis = await generateAnalysis(rawArticle.title, rawArticle.content, summary);
        }

        // Step 2e: Breaking news detection
        breaking = await isBreakingNews(rawArticle.title, rawArticle.content);
      }

      // Step 3: Store the article
      storeArticle({
        title: rawArticle.title,
        summary: summary,
        content: rawArticle.content,
        analysis: analysis,
        source_id: rawArticle.source_id,
        original_url: rawArticle.original_url,
        image_url: rawArticle.image_url,
        published_at: rawArticle.published_at,
        is_breaking: breaking,
      }, categories);

      stored++;
    } catch (err) {
      console.error(`[Pipeline] Error processing article:`, err.message);
      errors++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  GeoScope News Pipeline — Complete');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Duration: ${duration}s`);
  console.log(`  Fetched:    ${rawArticles.length}`);
  console.log(`  Processed:  ${processed}`);
  console.log(`  Duplicates: ${duplicates}`);
  console.log(`  Stored:     ${stored}`);
  console.log(`  Errors:     ${errors}`);
  console.log('═══════════════════════════════════════════════════\n');

  return {
    success: true,
    stats: { fetched: rawArticles.length, processed, duplicates, stored, errors, duration }
  };
}

module.exports = { runNewsPipeline };
