import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function routeAgent(blueprint: any) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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

Return JSON:

{
  "routeName.ts": "code"
}
`;
  const result = await model.generateContent([
    instruction,
    "USER REQUEST: " + (blueprint?.appName || ""),
    JSON.stringify(blueprint),
  ]);

  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, "").trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid JSON from routeAgent");

  return JSON.parse(jsonMatch[0]);

}