const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db/init');
const articlesRouter = require('./routes/articles');
const categoriesRouter = require('./routes/categories');
const commentsRouter = require('./routes/comments');
const { startScheduler, getStatus } = require('./services/scheduler');
const { runNewsPipeline } = require('./services/newsPipeline');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow any localhost origin (different ports) and no-origin requests
    if (!origin || origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const catCount = db.prepare('SELECT count(*) as c FROM categories').get();
  const artCount = db.prepare('SELECT count(*) as c FROM articles').get();
  const scheduler = getStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      categories: catCount.c,
      articles: artCount.c
    },
    scheduler: {
      pipelineRunning: scheduler.isRunning
    }
  });
});

// Manual pipeline trigger
app.post('/api/pipeline/run', async (req, res) => {
  const { skipAI = false, maxArticles = 30 } = req.body || {};
  console.log('[API] Manual pipeline trigger received');
  
  // Run async — don't block the response
  runNewsPipeline({ skipAI, maxArticles })
    .then(result => console.log('[API] Pipeline complete:', JSON.stringify(result.stats)))
    .catch(err => console.error('[API] Pipeline error:', err.message));

  res.json({ message: 'Pipeline started', status: 'running' });
});

// Routes
app.use('/api/articles', articlesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/comments', commentsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`GeoScope API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Start the scheduler
  startScheduler();
  
  // Run initial fetch on startup if no articles exist
  const artCount = db.prepare('SELECT count(*) as c FROM articles').get();
  if (artCount.c === 0) {
    console.log('[Startup] No articles found — triggering initial fetch...');
    setTimeout(() => {
      runNewsPipeline({ skipAI: false, maxArticles: 30 })
        .then(result => console.log('[Startup] Initial fetch complete:', JSON.stringify(result.stats)))
        .catch(err => console.error('[Startup] Initial fetch error:', err.message));
    }, 2000);
  }
});

module.exports = app;
