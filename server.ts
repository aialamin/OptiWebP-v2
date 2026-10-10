import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON body parsing for base64 image data
app.use(express.json({ limit: '30mb' }));

// Server-side Google GenAI initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route: Generate SEO-optimized Title, Alt Text, Caption, and Description for images
app.post('/api/ai/seo-metadata', async (req, res) => {
  try {
    const { imageBase64, mimeType, currentName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please verify your environment secrets.',
      });
    }

    // Clean base64 if it includes prefix data URL
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: `You are an elite Search Engine Optimization (SEO) & WordPress Content Strategist.
Analyze this image thoroughly and formulate the highest quality, ranking-optimized image metadata for websites, Google Image Search, WordPress media libraries, and accessibility screen readers.
The current source filename is "${currentName || 'image.webp'}".

Please generate:
1. SEO Title: Highly relevant, human-readable, click-optimized title (under 60 characters).
2. Alt Text: Descriptive, accessible for screen readers, targeting Google image search intent naturally without keyword stuffing (under 125 characters).
3. Caption: Engaging editorial caption suitable for displaying beneath the image in blog posts or website cards.
4. Description: Detailed 2-3 sentence semantic summary explaining objects, lighting, textures, scene context, and relevance for search indexing.
5. Keywords: 5-8 high-intent semantic search keywords/tags.
6. Suggested File Name: Clean, lowercase, hyphen-separated SEO filename ending in .webp (e.g. scenic-alpine-mountain-lake.webp).`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'SEO title for the image (under 60 characters)',
            },
            altText: {
              type: Type.STRING,
              description: 'Accessible and SEO-rich alt text (under 125 characters)',
            },
            caption: {
              type: Type.STRING,
              description: 'Engaging caption for web readers',
            },
            description: {
              type: Type.STRING,
              description: 'Comprehensive 2-3 sentence image description for metadata',
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '5-8 target SEO keywords/tags',
            },
            suggestedFileName: {
              type: Type.STRING,
              description: 'Clean lowercase hyphen-separated filename ending in .webp',
            },
          },
          required: [
            'title',
            'altText',
            'caption',
            'description',
            'keywords',
            'suggestedFileName',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating image SEO metadata:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while generating SEO metadata with Gemini.',
    });
  }
});

// Mount Vite middleware in development; serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
