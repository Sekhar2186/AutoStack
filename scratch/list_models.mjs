import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
    // Note: The JS SDK doesn't have a direct 'listModels' on the genAI instance in some versions?
    // Actually, it's usually on the 'genAI' object or requires a direct fetch.
    
    // Let's use direct fetch to be sure.
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
