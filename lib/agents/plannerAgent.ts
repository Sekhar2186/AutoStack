import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function plannerAgent(userQuery: string, previousPath?: string) {
    const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
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
      { "name": "HomePage", "route": "/", "interactions": ["search", "filter"] },
      { "name": "AboutPage", "route": "/about" }
  ],
  "frontendComponents": ["component1","component2"],
  "backendRoutes": ["route1","route2"],
  "databaseModels": ["model1","model2"],
  "features": ["feature1","feature2"],
  "interactionNotes": "High level notes on how components should interact"
}

Rules:
- Return only JSON.
- Do not include explanations.
- Do not include markdown.
- Components should be simple names.
- CRITICAL ROUTING RULE: If you define a component that implies a page view , you MUST create a corresponding entry in \`frontendPages\`. Every navigable view requires a page route .
- CRITICAL: Provide a COMPLETE list of \`frontendPages\` and \`frontendComponents\`. If an app needs a Dashboard, Login, Signup, and Settings, list ALL of them. Do not skip essential pages or components.
- If existing project context is provided, ensure the new plan is compatible with it.
 `
    let promptParts = Instruction + "\n\nUser request: " + userQuery;

    if (previousPath) {
        promptParts += `\n\nExisting project is located at: ${previousPath}. Please maintain architectural consistency.`;
    }

    /*const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    { text: promptParts }
                ]
            }
        ]
    });

    const text = result.response.text();*/

    const text = await generateAI("gemini", [promptParts]);

    try {
        return safeJsonParse(text);
    } catch (error) {
        console.error("JSON parse failed in plannerAgent. Raw text snippet:", text.slice(0, 200));
        throw error;
    }
}

