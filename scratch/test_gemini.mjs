import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
  console.log("Testing model:", modelName);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, are you gemini 2.5?");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testModel();
