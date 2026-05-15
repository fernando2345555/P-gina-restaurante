import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API Route for Gemini (Proxying to keep keys safe)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Eres el asistente virtual de Zenith Grill, un restaurante de parrilla argentina y BBQ.
        Contexto del restaurante: ${JSON.stringify(context)}
        
        Responde de manera elegante, amable y profesional. 
        Usuario pregunta: ${message}
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      res.json({ text: response.text() });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Health check for Vercel/CloudRun
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Zenith Backend running on http://localhost:${PORT}`);
  });
}

startServer();
