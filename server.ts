import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import {
  clarifyIdea,
  runAgentDebate,
  synthesizeBrandKit,
  askAgentsFollowUp,
  generateCustomBrandLogo,
  searchAndSummarizeCompetitors,
  generateFallbackClarification,
  generateFallbackDebate,
  generateFallbackBrandKit,
  generateFallbackQA,
} from './src/server/geminiService.js';
import { generateOgCardSvg } from './src/server/ogImageGenerator.js';
import { getPublicBrandKit } from './src/services/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
      platform: 'BrandBattle AI Intelligence Arena',
    });
  });

  // Stage 1: Clarify and dissect idea
  app.post('/api/clarify', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || typeof idea !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid idea string.' });
      }
      const clarified = await clarifyIdea(idea);
      res.json(clarified);
    } catch (err: any) {
      console.info('[BrandBattle Server] /api/clarify falling back gracefully.');
      const fallback = generateFallbackClarification(req.body?.idea || 'New Venture');
      res.json(fallback);
    }
  });

  // Stage 2: Run Multi-Agent Debate Arena
  app.post('/api/debate', async (req, res) => {
    try {
      const { idea, clarified } = req.body;
      if (!idea || !clarified) {
        return res.status(400).json({ error: 'Missing idea or clarified object.' });
      }
      const debate = await runAgentDebate(idea, clarified);
      res.json(debate);
    } catch (err: any) {
      console.info('[BrandBattle Server] /api/debate falling back gracefully.');
      const fallback = generateFallbackDebate(req.body?.idea || 'New Venture', req.body?.clarified);
      res.json(fallback);
    }
  });

  // Stage 3: Synthesize into Final Launch-Ready Brand Kit
  app.post('/api/synthesize', async (req, res) => {
    try {
      const { idea, clarified, debate } = req.body;
      if (!idea || !clarified || !debate) {
        return res.status(400).json({ error: 'Missing idea, clarified, or debate object.' });
      }
      const brandKit = await synthesizeBrandKit(idea, clarified, debate);
      res.json(brandKit);
    } catch (err: any) {
      console.info('[BrandBattle Server] /api/synthesize falling back gracefully.');
      const fallback = generateFallbackBrandKit(req.body?.idea || 'New Venture', req.body?.clarified, req.body?.debate);
      res.json(fallback);
    }
  });

  // Follow-up Q&A console
  app.post('/api/ask-agents', async (req, res) => {
    try {
      const { question, idea, brandKit, targetAgent } = req.body;
      if (!question || !brandKit) {
        return res.status(400).json({ error: 'Missing question or brandKit object.' });
      }
      const response = await askAgentsFollowUp(
        question,
        idea || '',
        brandKit,
        targetAgent || 'all'
      );
      res.json(response);
    } catch (err: any) {
      console.info('[BrandBattle Server] /api/ask-agents falling back gracefully.');
      const fallback = generateFallbackQA(req.body?.question || '', req.body?.brandKit, req.body?.targetAgent || 'all');
      res.json(fallback);
    }
  });

  // Stage 3: Generate visual logo placeholder using brand name & archetypes
  app.post('/api/generate-logo', async (req, res) => {
    try {
      const {
        brandName,
        archetype,
        style,
        colors,
        monogram,
        symbolDescription,
        themeName,
        background,
        seed,
      } = req.body;
      const logoResult = await generateCustomBrandLogo({
        brandName: brandName || 'Brand',
        archetype: archetype || 'The Functional Anchor',
        style: style || 'geometric',
        colors: colors || ['#07090e', '#06b6d4', '#fbbf24', '#ffffff'],
        monogram,
        symbolDescription,
        themeName,
        background,
        seed,
      });
      res.json(logoResult);
    } catch (err: any) {
      console.error('Error in /api/generate-logo:', err);
      res.status(500).json({ error: err.message || 'Failed to generate brand logo' });
    }
  });

  // Stage 3: Live Google Search grounding for top 3 competitors and market context
  app.post('/api/search-competitors', async (req, res) => {
    try {
      const { idea, brandName, customQuery, clarified } = req.body;
      if (!idea && !customQuery) {
        return res.status(400).json({ error: 'Missing idea or custom query for competitor search' });
      }
      const marketContext = await searchAndSummarizeCompetitors({
        idea: idea || customQuery || 'Startup concept',
        brandName: brandName || 'Our Startup',
        customQuery,
        existingClarified: clarified,
      });
      res.json(marketContext);
    } catch (err: any) {
      console.error('Error in /api/search-competitors:', err);
      res.status(500).json({ error: err.message || 'Failed to search competitors' });
    }
  });

  // Stage 3 & Public Share: Dynamic Open Graph 1200x630 Card Image
  app.get('/api/og-image', async (req, res) => {
    try {
      const shareId = (req.query.shareId as string) || '';
      let brandName = (req.query.brandName as string) || (req.query.title as string) || '';
      let pitch = (req.query.pitch as string) || (req.query.description as string) || '';
      let archetype = (req.query.archetype as string) || '';
      let theme = (req.query.theme as string) || '';
      let primaryColor = (req.query.color as string) || '';

      if (shareId) {
        try {
          const rec = await getPublicBrandKit(shareId);
          if (rec) {
            brandName = brandName || rec.brandName;
            pitch = pitch || rec.oneLinePitch;
            archetype = archetype || rec.brandKit?.namingOptions?.[0]?.archetype || 'STRATEGIC IDENTITY';
            theme = theme || rec.brandKit?.visualDirection?.themeName || 'Modern Kinetic';
            primaryColor = primaryColor || rec.brandKit?.visualDirection?.colorPalette?.[0]?.hex || '#06b6d4';
          }
        } catch (dbErr) {
          console.warn('Could not fetch Firestore record for OG image, using fallback:', dbErr);
        }
      }

      const svg = generateOgCardSvg({
        brandName: brandName || 'Brand Strategy Dossier',
        oneLinePitch: pitch || 'AI-crafted brand strategy arbitrated by Growth VC, Creative Director, and Brutal Skeptic.',
        archetype: archetype || 'Strategic Identity',
        themeName: theme || 'Modern Kinetic',
        colors: primaryColor ? [primaryColor, '#fbbf24', '#10b981'] : ['#06b6d4', '#fbbf24', '#10b981'],
      });

      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.send(svg);
    } catch (err: any) {
      console.error('Error generating OG image:', err);
      res.status(500).send('Error generating OG image');
    }
  });

  // Helper function to inject Open Graph tags into HTML
  function injectOpenGraphTags(html: string, options: {
    title: string;
    description: string;
    ogImageUrl: string;
    canonicalUrl: string;
    brandName: string;
  }): string {
    const { title, description, ogImageUrl, canonicalUrl, brandName } = options;
    let modified = html;

    // Replace <title>
    modified = modified.replace(
      /<title>.*?<\/title>/i,
      `<title>${title}</title>`
    );

    // Replace or inject meta description
    if (/<meta name="description"[^>]*>/i.test(modified)) {
      modified = modified.replace(
        /<meta name="description"[^>]*>/i,
        `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
      );
    }

    // Replace or inject og:title
    if (/<meta property="og:title"[^>]*>/i.test(modified)) {
      modified = modified.replace(
        /<meta property="og:title"[^>]*>/i,
        `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`
      );
    }

    // Replace or inject og:description
    if (/<meta property="og:description"[^>]*>/i.test(modified)) {
      modified = modified.replace(
        /<meta property="og:description"[^>]*>/i,
        `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`
      );
    }

    // Inject og:image, og:url, twitter tags
    const ogExtraTags = `
    <!-- Dynamic Open Graph & Twitter Social Cards -->
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/svg+xml" />
    <meta property="og:image:alt" content="${brandName.replace(/"/g, '&quot;')} Brand Strategy Dossier" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <link rel="canonical" href="${canonicalUrl}" />`;

    modified = modified.replace(/<\/head>/i, `${ogExtraTags}\n  </head>`);
    return modified;
  }

  // Vite middleware in dev or static files in production
  let viteServer: any = null;
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
  }

  // Stage 3 & Public Share: Open Graph Dynamic Meta Injection for Social Crawlers and Direct Shared URLs
  app.get(['/', '/share/:shareId'], async (req, res, next) => {
    const shareId = (req.query.shareId as string) || (req.query.kit as string) || req.params.shareId;
    const isCrawler = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|twitterbot|slackbot|discordbot|whatsapp|telegrambot|linkedinbot/i.test(
      req.headers['user-agent'] || ''
    );

    // If no shareId is present and not a crawler, pass through to regular Vite / static handling
    if (!shareId && !isCrawler) {
      return next();
    }

    try {
      let brandName = 'BrandBattle - Multi-Agent Brand Intelligence Platform';
      let pitch =
        'AI-powered brand strategy arena deploying specialized agent debate (Growth VC, Creative Director, Brutal Skeptic) to forge launch-ready startup brand kits.';
      let archetype = 'Strategic Identity';
      let theme = 'Modern Kinetic';
      let primaryColor = '#06b6d4';

      if (shareId) {
        try {
          const rec = await getPublicBrandKit(shareId);
          if (rec) {
            brandName = rec.brandName;
            pitch = rec.oneLinePitch;
            archetype = rec.brandKit?.namingOptions?.[0]?.archetype || archetype;
            theme = rec.brandKit?.visualDirection?.themeName || theme;
            primaryColor = rec.brandKit?.visualDirection?.colorPalette?.[0]?.hex || primaryColor;
          }
        } catch (dbErr) {
          console.warn('Could not fetch public record for meta tags:', dbErr);
        }
      }

      const templatePath = isProduction
        ? path.resolve(__dirname, 'dist/index.html')
        : path.resolve(__dirname, 'index.html');
      let html = await fs.readFile(templatePath, 'utf-8');

      if (!isProduction && viteServer) {
        html = await viteServer.transformIndexHtml(req.originalUrl || req.url, html);
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      const canonicalUrl = shareId ? `${baseUrl}/?shareId=${shareId}` : baseUrl;

      const ogParams = new URLSearchParams({
        brandName,
        pitch,
        archetype,
        theme,
        color: primaryColor,
      });
      if (shareId) ogParams.set('shareId', shareId);
      const ogImageUrl = `${baseUrl}/api/og-image?${ogParams.toString()}`;

      const finalHtml = injectOpenGraphTags(html, {
        title: shareId ? `${brandName} – Brand Strategy Dossier | BrandBattle` : brandName,
        description: pitch,
        ogImageUrl,
        canonicalUrl,
        brandName,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(finalHtml);
    } catch (err) {
      console.error('Error injecting dynamic Open Graph tags:', err);
      return next();
    }
  });

  if (!isProduction && viteServer) {
    app.use(viteServer.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BrandBattle Server] Running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[BrandBattle Server] Port ${PORT} is already in use by another process.`);
      console.error(`Tip: You can change the port by setting PORT in .env (e.g. PORT=${PORT + 1}).`);
      process.exit(1);
    } else {
      console.error('[BrandBattle Server] Listen error:', err);
      process.exit(1);
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
