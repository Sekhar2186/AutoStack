
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

export async function routeAgent(blueprint: any, previousPath?: string, userId?: string) {

  const instruction = `
Generate API routes ONLY if required for MISCELLANEOUS functionality.

RULES:
- Do NOT generate CRUD routes for entities (e.g. do not generate /api/users, /api/products). CRUD routes are handled by a separate agent.
- ONLY generate miscellaneous routes like /api/upload, /api/search, /api/ai, /api/contact, /api/payment, etc.
- Use Next.js route.ts format
- Use NextRequest, NextResponse
- MOCK DATA — CRITICAL: If no database is specified, ALWAYS return realistic mock data (JSON).
- SYMMETRY: Ensure routes match the expected endpoints called by the frontend.
- DELAY SIMULATION: Add a small artificial delay (e.g., await new Promise(res => setTimeout(res, 1000))) to simulate network latency for better UX testing.
- No MongoDB unless required
- No todo logic unless asked
- NO PLACEHOLDERS: Every route MUST return a valid JSON response with realistic mock data. Never return "Coming Soon" or empty bodies.

STRICT JSON RULES:
- Escape all quotes using \"
- Escape newlines using \\n
- Do NOT include markdown blocks (no \`\`\`json)
- Return ONLY valid parseable JSON. No conversational text.


Return JSON:

{
  "routeName.ts": "code"
}
`;
  let promptParts = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\n" + JSON.stringify(blueprint);

  if (previousPath) {
    promptParts += `\n\nExisting project is at: ${previousPath}. Ensure API routes are consistent with existing structure.`;
  }

  const result = await generateAI({
    provider: "gemini",
    prompt: [promptParts],
    config: {
      responseMimeType: "application/json",
    },
    userId
  });
  const raw = result.text;

  try {
    return safeJsonParse(raw);
  } catch (err) {
    console.error("JSON parse failed in routeAgent. Raw text snippet:", raw.slice(0, 200));
    throw err;
  }
}