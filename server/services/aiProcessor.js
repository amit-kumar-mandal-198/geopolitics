const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try flash-lite first (higher free tier), fall back to flash
const modelPrimary = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Rate limiting
let lastRequestTime = 0;
const MIN_DELAY = 5000; // 12 requests per minute (safe under 15 RPM limit)
let consecutiveErrors = 0;
let aiDisabledUntil = 0;

async function rateLimitedRequest(prompt) {
  // If AI is temporarily disabled due to quota exhaustion, skip
  if (Date.now() < aiDisabledUntil) {
    throw new Error('AI temporarily disabled due to quota limits');
  }

  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_DELAY) {
    await new Promise(r => setTimeout(r, MIN_DELAY - elapsed));
  }
  lastRequestTime = Date.now();

  // Try with retry logic
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const model = attempt < 2 ? modelPrimary : modelFallback;
      const result = await model.generateContent(prompt);
      consecutiveErrors = 0; // Reset on success
      return result.response.text();
    } catch (err) {
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        consecutiveErrors++;
        
        // If too many consecutive errors, disable AI for a while
        if (consecutiveErrors >= 5) {
          const disableDuration = 60 * 1000; // 1 minute
          aiDisabledUntil = Date.now() + disableDuration;
          console.log(`[AI] Too many quota errors — disabling AI for ${disableDuration / 1000}s`);
          throw err;
        }

        // Wait with exponential backoff
        const waitTime = Math.min(30000, (attempt + 1) * 10000);
        console.log(`[AI] Rate limited, waiting ${waitTime / 1000}s (attempt ${attempt + 1}/3)...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw err;
      }
    }
  }
  throw new Error('AI request failed after 3 attempts');
}

/**
 * Generate a short summary for an article
 */
async function summarizeArticle(title, content) {
  try {
    const prompt = `Summarize this news article in 2-3 concise sentences. Focus on key facts, who is involved, and why it matters geopolitically. Do not use markdown formatting.

Title: ${title}
Content: ${content.slice(0, 2000)}

Summary:`;

    return await rateLimitedRequest(prompt);
  } catch (err) {
    console.error('[AI] Summary error:', err.message?.slice(0, 100));
    return content.slice(0, 300) + '...';
  }
}

/**
 * Generate an in-depth analysis/rewrite of the article
 */
async function generateAnalysis(title, content, summary) {
  try {
    const prompt = `Write a detailed geopolitical analysis of this news story in 3-5 paragraphs. Include:
- Background context
- Key stakeholders and their positions
- Geopolitical implications
- Potential future developments

Write in a professional journalism style. Do not use markdown formatting or headers.

Title: ${title}
Content: ${content.slice(0, 3000)}

Analysis:`;

    return await rateLimitedRequest(prompt);
  } catch (err) {
    console.error('[AI] Analysis error:', err.message?.slice(0, 100));
    return null;
  }
}

/**
 * Categorize an article into regions and topics
 * Returns { regions: string[], topics: string[] }
 */
async function categorizeArticle(title, content) {
  try {
    const prompt = `Categorize this news article. Respond ONLY with a JSON object, no other text.

Available regions: asia, europe, middle-east, americas, sub-saharan-africa, oceania
Available topics: diplomacy, conflicts, trade-economy, elections, climate, technology

Title: ${title}
Content: ${content.slice(0, 1500)}

Respond with JSON like: {"regions": ["asia"], "topics": ["diplomacy"]}
Only include categories that are clearly relevant. Response:`;

    const text = await rateLimitedRequest(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { regions: [], topics: [] };
  } catch (err) {
    console.error('[AI] Categorization error:', err.message?.slice(0, 100));
    return { regions: [], topics: [] };
  }
}

/**
 * Determine if an article should be marked as breaking news
 */
async function isBreakingNews(title, content) {
  try {
    const prompt = `Is this a breaking/urgent geopolitical news story? Consider: major conflicts, diplomatic crises, elections results, natural disasters, or significant policy changes. Respond with only "yes" or "no".

Title: ${title}
Content: ${content.slice(0, 500)}

Answer:`;

    const text = await rateLimitedRequest(prompt);
    return text.trim().toLowerCase().startsWith('yes');
  } catch (err) {
    return false;
  }
}

module.exports = { summarizeArticle, generateAnalysis, categorizeArticle, isBreakingNews };
