import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

let db: Database.Database;
try {
  db = new Database("rayeva.db");
  console.log("Database initialized successfully");
} catch (err) {
  console.error("Failed to initialize database:", err);
  // Fallback or exit
  process.exit(1);
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT,
    prompt TEXT,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    category TEXT,
    sub_category TEXT,
    tags TEXT,
    sustainability_filters TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    budget REAL,
    product_mix TEXT,
    cost_breakdown TEXT,
    impact_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper for AI Logging
function logAI(module: string, prompt: string, response: string) {
  try {
    const stmt = db.prepare("INSERT INTO ai_logs (module, prompt, response) VALUES (?, ?, ?)");
    stmt.run(module, prompt, response);
  } catch (err) {
    console.error("Failed to log AI action:", err);
  }
}

// Module 1: Store Product
app.post("/api/products", (req, res) => {
  console.log("Saving product:", req.body);
  const { name, description, result } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO products (name, description, category, sub_category, tags, sustainability_filters)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      name, 
      description, 
      result.primary_category, 
      result.sub_category, 
      JSON.stringify(result.seo_tags), 
      JSON.stringify(result.sustainability_filters)
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save product:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Module 2: Store Proposal
app.post("/api/proposals", (req, res) => {
  console.log("Saving proposal:", req.body);
  const { client_name, budget, result } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO proposals (client_name, budget, product_mix, cost_breakdown, impact_summary)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      client_name, 
      budget, 
      JSON.stringify(result.product_mix), 
      result.cost_breakdown, 
      result.impact_summary
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save proposal:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// AI Logging
app.post("/api/logs", (req, res) => {
  const { module, prompt, response } = req.body;
  logAI(module, prompt, response);
  res.json({ success: true });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get Logs
app.get("/api/logs", (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM ai_logs ORDER BY timestamp DESC LIMIT 50").all();
    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
