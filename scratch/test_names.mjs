import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).listModels();
    // Note: listModels is not on the model object, it's on the client or similar?
    // Actually in the latest SDK it's a bit different.
    // Let's try the direct fetch or check documentation if I could.
    // But I'll just try a few common names.
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Simplified test
async function testModel(name) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: name });
    const result = await model.generateContent("Hi");
    console.log(name, "OK");
  } catch (e) {
    console.log(name, "FAIL:", e.message);
  }
}

async function run() {
  await testModel("gemini-1.5-flash-latest");
  await testModel("gemini-1.5-pro");
  await testModel("gemini-2.0-flash-exp");
}

run();
