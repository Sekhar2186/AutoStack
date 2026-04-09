import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function routeAgent(blueprint: any, previousPath?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  /** const instruction = `
You are a backend developer using Next.js App Router.

Generate ONLY API routes based on the user request.

STRICT RULES:
- Use TypeScript (.ts)
- Use Next.js route handlers
- File path: app/api/<route>/route.ts
- Use NextRequest and NextResponse
- DO NOT use Express
- DO NOT use MongoDB or mongoose
- Use in-memory storage (arrays)
- Keep logic simple and clean

IMPORTANT:
- STRICTLY follow user request
- DO NOT generate Todo APIs unless asked

RETURN JSON:

{
 "routes": {
   "routeName.ts": "API route code"
 }
}
Rules:
- Return raw JSON only
- No markdown
- No explanations
`;
*/

  const instruction = `
Generate API routes ONLY if required.

RULES:
- Use Next.js route.ts format
- Use NextRequest, NextResponse
- No MongoDB unless required
- No todo logic unless asked

STRICT JSON RULES:
- Escape all quotes using \"
- Escape newlines using \\n
- Do NOT include markdown
- Return only valid JSON


Return JSON:

{
  "routeName.ts": "code"
}
`;
  let promptParts = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\n" + JSON.stringify(blueprint);

  if (previousPath) {
    promptParts += `\n\nExisting project is at: ${previousPath}. Ensure API routes are consistent with existing structure.`;
  }

  const result = await model.generateContent([promptParts]);

  const raw = result.response.text();

  // remove markdown blocks
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // extract JSON safely
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    console.error("RAW:", raw);
    throw new Error("Invalid JSON structure from routeAgent");
  }

  let jsonString = cleaned.slice(start, end + 1);

  // FIX ESCAPE ISSUES
  jsonString = jsonString
    .replace(/\\'/g, "'")
    // Avoid blindly replacing \n globally as it breaks structural formatting
    // Clean up common bad escape characters inside JSON strings (e.g. \s, \., \[ etc)
    .replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("RAW:", raw);
    console.error("CLEANED:", jsonString);
    throw new Error("JSON parse failed in routeAgent");
  }

}