import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large limit for image uploads/base64
app.use(express.json({ limit: '50mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Stylist Assistant Endpoint
app.post('/api/gemini-assistant', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages body. Must be an array of chat messages.' });
    }

    // Map messages to the format expected by GoogleGenAI
    // The SDK expects chat messages in { role: 'user' | 'model', parts: [{ text: '...' }] } or simple text formats
    // Let's build a clean system instruction that gives the model its "Bijora Jewellers AI Stylist" persona!
    const systemInstruction = `You are "Bijora AI Stylist", a highly sophisticated, prestigious, and extremely helpful AI shopping assistant and styling consultant for Bijora Online Jewelry.
Your role:
1. Help customers choose the perfect jewelry based on their occasion (weddings, anniversaries, daily wear, corporate, festivals like Eid, Puja, weddings).
2. Answer complex design queries, explain gemstone qualities (diamond cuts, emerald clarity, natural pearls, 18k vs 22k gold).
3. Recommend specific products from Bijora's catalog (Rings, Necklaces, Earrings, Bracelets, Jewellery Sets, Anklets).
4. Provide styling suggestions (e.g. what pairs well with a traditional crimson Saree, an elegant black evening gown, or modern fusion wear).
5. Communicate with a warm, luxurious, yet humble and welcoming tone.
6. Support bilingual styling advice in both English and Bangla as requested by the user, representing the cultural heritage of Bengal and worldwide jewelry lovers.

When answering, be incredibly knowledgeable about traditional and modern South Asian and global jewelry crafts. Maintain deep professional elegance. Do NOT output markdown code blocks unless necessary, make the text read beautifully.`;

    // Map history
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Generate content using gemini-3.1-pro-preview with HIGH thinking config
    // Note: Thinking level configuration is set to HIGH as requested
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    const replyText = response.text || 'I apologize, I am unable to generate styling advice at this moment. Please try again.';
    
    res.json({
      role: 'assistant',
      content: replyText
    });
  } catch (error: any) {
    console.error('Gemini Assistant Error:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with AI Stylist', 
      details: error.message || error 
    });
  }
});

// Integrate Vite Dev Server Middleware or Serve Built Assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    // Serve static files from production build directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static files from', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bijora server running on http://localhost:${PORT}`);
  });
}

startServer();
