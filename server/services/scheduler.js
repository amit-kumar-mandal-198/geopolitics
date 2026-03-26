const cron = require('node-cron');
const { runNewsPipeline } = require('./newsPipeline');

let isRunning = false;

/**
 * Schedule the news pipeline
 * - Main update: Daily at 7:00 PM IST (13:30 UTC)
 * - Breaking news check: Every 30 minutes (with skipAI, just fetch and basic store)
 */
function startScheduler() {
  // Daily 7 PM IST full pipeline with AI processing
  // IST is UTC+5:30, so 7:00 PM IST = 13:30 UTC = minute 30, hour 13
  cron.schedule('30 13 * * *', async () => {
    if (isRunning) {
      console.log('[Scheduler] Pipeline already running, skipping...');
      return;
    }
    isRunning = true;
    console.log('[Scheduler] Daily 7 PM IST update — starting full pipeline');
    try {
      await runNewsPipeline({ skipAI: false, maxArticles: 50 });
    } catch (err) {
      console.error('[Scheduler] Pipeline error:', err.message);
    }
    isRunning = false;
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('[Scheduler] Daily update scheduled for 7:00 PM IST');

  // Quick refresh every 2 hours (lighter, skip most AI to save quota)
  cron.schedule('0 */2 * * *', async () => {
    if (isRunning) return;
    isRunning = true;
    console.log('[Scheduler] Quick refresh — fetching latest news');
    try {
      await runNewsPipeline({ skipAI: false, maxArticles: 15 });
    } catch (err) {
      console.error('[Scheduler] Quick refresh error:', err.message);
    }
    isRunning = false;
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('[Scheduler] Quick refresh scheduled every 2 hours');
}

function getStatus() {
  return { isRunning };
}

module.exports = { startScheduler, getStatus };
