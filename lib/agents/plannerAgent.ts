import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function plannerAgent(userQuery: string, previousPath?: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });
    const Instruction = `
    you are a senior software engineer and senior architecture planner with good skills in system design and software architecture planner.

    your task is to take user query and generate a detailed software architecture planner for the user query.

    the output should be in the valid json format.
    the json format should have the following fields.
    Use EXACTLY this format:
    {
  "appName": "string",
  "frontendPages": [
      { "name": "HomePage", "route": "/" },
      { "name": "AboutPage", "route": "/about" }
  ],
  "frontendComponents": ["component1","component2"],
  "backendRoutes": ["route1","route2"],
  "databaseModels": ["model1","model2"],
  "features": ["feature1","feature2"]
}

Rules:
- Return only JSON.
- Do not include explanations.
- Do not include markdown.
- Components should be simple names.
- If existing project context is provided, ensure the new plan is compatible with it.
 `
    let promptParts = Instruction + "\n\nUser request: " + userQuery;

    if (previousPath) {
        promptParts += `\n\nExisting project is located at: ${previousPath}. Please maintain architectural consistency.`;
    }

    const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    { text: promptParts }
                ]
            }
        ]
    });

    const text = result.response.text();

    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}

