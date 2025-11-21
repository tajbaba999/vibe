import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
    console.log("🚀 Testing Gemini API...");
    console.log("🔑 API Key found (starts with):", apiKey?.substring(0, 8) + "...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const prompt = `You are an expert full-stack developer. Generate a complete, working project based on this request: "create a simple react counter app"

RESPONSE FORMAT:
You MUST respond with ONLY a valid JSON object in this exact format:

{
  "name": "project-name",
  "description": "Brief description",
  "files": [
    {
      "path": "index.html",
      "content": "<code>",
      "language": "html"
    }
  ]
}

RULES:
1. Valid JSON only. No markdown blocks. No other text.
2. Include all necessary files (HTML, CSS, JS).
3. Use modern best practices.
4. Code must be complete and working.`;

    console.log("📤 Sending prompt to gemini-1.5-flash...");
    const startTime = Date.now();

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Response received in ${duration}s`);
        console.log("📄 Response length:", text.length);
        console.log("🔍 Preview:", text.substring(0, 200));

        try {
            JSON.parse(text);
            console.log("✅ Valid JSON received");
        } catch (e: any) {
            console.error("❌ Invalid JSON:", e.message);
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Body:", await error.response.text());
        }
    }
}

main();
