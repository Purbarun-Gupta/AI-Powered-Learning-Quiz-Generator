const express = require("express");
const multer = require("multer");
const fs = require("fs");

// 🚨 ALTERNATIVE FIX: Switching from 'pdf-parse' to 'pdf-extraction'
// The previous fix failed due to a complex Node/OS environment conflict.
// 'pdf-extraction' is a reliable, promise-based alternative.
// !!! NOTE: You must run 'npm install pdf-extraction' !!!
const extract = require("pdf-extraction");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// 🔑 Initialize Gemini client (API key from .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ⚙️ Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🧹 Helper: safely parse JSON, fix minor issues
function safeJSONParse(str) {
  try {
    // Remove code fences and trim
    const cleaned = str.replace(/```json/i, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("Warning: Could not parse JSON, returning raw string.");
    return null;
  }
}

// 🧠 Helper: generate quiz from PDF text using Gemini
async function generateQuizFromPDF(filePath) {
  // Extract text from PDF
  const fileBuffer = fs.readFileSync(filePath);
  // 👇 Using 'pdf-extraction' now
  const pdfData = await extract(fileBuffer); 
  const pdfText = pdfData.text;

  // Call Gemini API
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
  You are a quiz generator AI.
  Based on the following study material extracted from a PDF, create a JSON quiz with:
  - title
  - 5 multiple choice questions (each with 4 options)
  - and one correct answer per question.

  Return ONLY valid JSON (no Markdown, no explanations) in this format:
  {
    "title": "Quiz Title",
    "questions": [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "answer": "Correct Option"
      }
    ]
  }

  PDF Content:
  ${pdfText.slice(0, 4000)}
  `;

  const result = await model.generateContent(prompt);
  const textResponse = await result.response.text();

  const quiz = safeJSONParse(textResponse);

  if (!quiz) {
    throw new Error("Invalid response from Gemini");
  }

  return quiz;
}

// 📩 POST /api/uploadquiz
router.post("/upload", upload.single("myfile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    console.log("Generating quiz from:", filePath);
    const quiz = await generateQuizFromPDF(filePath);

    res.json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

module.exports = router;
