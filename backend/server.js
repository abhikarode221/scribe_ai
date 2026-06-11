require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const Post = require("./models/Post");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/auth");
const upload = require("./config/cloudinary");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ==============================
// 🛠️ MIDDLEWARE
// ==============================
app.use(express.json());
app.use(cors());

// ✅ YOUR REAL FRONTEND PATH
const distPath = path.join(__dirname, "../frontend/scribe_ai/dist");
app.use(express.static(distPath));

// ==============================
// 🗄️ DATABASE
// ==============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ==============================
// 📦 ROUTES
// ==============================

// 🔐 Protected post routes
app.use("/api/posts", postRoutes);


// 🔓 Auth routes
app.use("/api/auth", authRoutes);

// 📸 Upload route
app.post("/api/upload", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ imageUrl: req.file.path });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is ALIVE and ScribeAI is ready!" });
});

// ==============================
// 🤖 GEMINI (ADVANCED VERSION)
// ==============================
let activeModel = null;
let genAIInstance = null;

const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite-preview",
  "gemini-3-flash-preview",

  // 3.x
  "gemini-3-pro",
  "gemini-3-pro-preview",
  "gemini-3.1-pro",
  "gemini-3.1-pro-preview",
  "gemini-3-flash", 
  "gemini-3-deep-think",

  // 2.5
  "gemini-2.5-pro",
  "gemini-2.5-pro-preview",
  "gemini-2.5-flash-preview",
  "gemini-2.5-flash-lite-preview",

  // 2.0
  "gemini-2.0-pro",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-thinking-exp",
  "gemini-2.0-pro-exp",

  // 1.5
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro-experimental",
  "gemini-1.5-flash-latest",

  // 1.0
  "gemini-1.0-pro",
  "gemini-pro",
  "gemini-1.0-ultra",
  "gemini-1.0-nano",

  // nano
  "gemini-nano-1",
  "gemini-nano-2"
];

async function initializeGemini(apiKey) {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`⚡ Testing: ${modelName}`);

      const model = genAIInstance.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");

      if (result.response) {
        console.log(`✅ Using: ${modelName}`);
        activeModel = model;
        return;
      }
    } catch (err) {
      console.log(`❌ Failed: ${modelName}`);
    }
  }

  throw new Error("No Gemini models available");
}

async function generateAIContent(prompt, apiKey) {
  if (!activeModel) {
    await initializeGemini(apiKey);
  }

  try {
    const result = await activeModel.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.warn(`⚠️ Generation failed with active model: ${err.message}. Retrying fallback initialization...`);
    activeModel = null;
    await initializeGemini(apiKey);
    const result = await activeModel.generateContent(prompt);
    return result.response.text();
  }
}

// ==============================
// 🤖 AI SEO ROUTE
// ==============================
app.post("/api/ai/audit", protect, async (req, res) => {
  try {
    const { content } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!content) {
      return res.status(400).json({ error: "No content provided" });
    }

    const prompt = `You are an SEO expert. Return ONLY JSON:
{
  "metaTitle": "",
  "metaDescription": "",
  "tips": []
}
Content: ${content}`;
/*
const prompt = `
You are a senior SEO strategist with expertise in on-page optimization, search intent analysis, and SERP ranking.

Your task is to generate high-converting SEO metadata and actionable tips.

STRICT RULES:
- Return ONLY valid JSON. No explanations, no extra text.
- Follow the exact schema.
- Do not include markdown or comments.
- Ensure outputs are concise, human-readable, and optimized for CTR.

OUTPUT FORMAT:
{
  "metaTitle": string,
  "metaDescription": string,
  "tips": string[]
}

SEO REQUIREMENTS:
- metaTitle:
  - 50–60 characters
  - Include primary keyword naturally
  - Add a compelling hook (power words, numbers, or benefits)

- metaDescription:
  - 140–160 characters
  - Clear value proposition + call-to-action
  - Match search intent (informational / transactional / navigational)

- tips:
  - 5–8 actionable SEO recommendations
  - Focus on: keyword usage, headings, internal linking, readability, and CTR optimization
  - Each tip must be specific and practical (not generic advice)

CONTENT ANALYSIS INSTRUCTIONS:
- Identify the primary keyword and search intent from the content
- Optimize metadata accordingly
- Avoid keyword stuffing
- Prioritize clarity and engagement

CONTENT:
${content}
`;
*/

    const raw = await generateAIContent(prompt, apiKey);
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON response received from Gemini API");
    }
    const clean = raw.substring(start, end + 1).trim();
    res.json(JSON.parse(clean));

  } catch (err) {
    console.error("❌ AI Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// 🤖 AI WRITING ASSISTANT ROUTE
// ==============================
app.post("/api/ai/transform", protect, async (req, res) => {
  try {
    const { text, task, option } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    let prompt = "";
    if (task === "tone") {
      prompt = `You are a professional editor. Rewrite the following text to have a ${option || "professional"} tone. Keep the core meaning and details exactly the same, but change the style, flow, and vocabulary to sound clearly ${option || "professional"}. Return ONLY the rewritten text:
${text}`;
    } else if (task === "draft") {
      prompt = `You are a creative writer. Based on the topic or title "${text}", write a highly engaging, captivating introduction paragraph (about 3-4 sentences) that hooks the reader. Return ONLY the written paragraph, with no intro or outro remarks:`;
    } else if (task === "social") {
      prompt = `You are a social media marketer. Based on the article content below, generate a promotion kit containing:
1. A short, engaging newsletter email summary (under 150 words).
2. A punchy Twitter/X post with relevant hashtags (under 280 characters).
3. A professional LinkedIn post.

Return the response in structured JSON format EXACTLY like this:
{
  "newsletter": "newsletter copy",
  "twitter": "twitter post",
  "linkedin": "linkedin post"
}

Article Content:
${text}`;
    } else {
      return res.status(400).json({ error: "Invalid task type" });
    }

    const raw = await generateAIContent(prompt, apiKey);
    
    if (task === "social") {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("Invalid JSON response received from Gemini API");
      }
      const clean = raw.substring(start, end + 1).trim();
      res.json(JSON.parse(clean));
    } else {
      res.json({ result: raw.trim() });
    }

  } catch (err) {
    console.error("❌ AI Transform Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// 🔥 SEO INJECTION
// ==============================
app.get("/post/:slug", async (req, res) => {
  try {
    console.log(`Request Path: ${req.path}, Method: ${req.method}`);
    const post = await Post.findOne({ slug: req.params.slug });
    const indexPath = path.join(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("⚠️ Run npm run build first");
    }

    let html = fs.readFileSync(indexPath, "utf8");

    if (post) {
      html = html
        .replace(
          "<title>ScribeAI</title>",
          `<title>${post.seo?.metaTitle || post.title} | ScribeAI</title>`
        )
        .replace(
          'content="ScribeAI Description"',
          `content="${post.seo?.metaDescription || post.excerpt}"`
        );
    }

    res.send(html);

  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// ==============================
// ✅ STABLE CATCH-ALL (NO BUG)
// ==============================
app.use((req, res) => {
  const indexPath = path.join(distPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(
      "Frontend build not found. Run: cd frontend/scribe_ai && npm run build"
    );
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});