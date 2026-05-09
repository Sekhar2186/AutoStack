import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "@/lib/services/ai/modelRouter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function coderAgent(blueprint: any) {
  const model = genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
  });

  const instruction = `
You are a professional full-stack developer.

Generate a full-stack web app using Next.js App Router.

STRICT RULES:
- Use TypeScript (.ts / .tsx)
- Use Next.js App Router (app folder)
- API routes must be inside: app/api/<route>/route.ts
- Use NextRequest and NextResponse
- Components must be React functional components.
- ALWAYS use 'export default function ComponentName' for components.
- ADD '"use client";' to any component using hooks or interactivity.
- Use relative imports only (../components/...).
- Follow existing template structure.
- DO NOT override layout.tsx.
- Only modify components and logic.
- Use Tailwind CSS only.
- Ensure responsive design.

IMPORTANT:
- STRICTLY follow the USER REQUEST.
- DO NOT generate generic apps.
- DO NOT generate Todo apps unless explicitly asked.
- Generate components relevant to the request (portfolio, dashboard, blog, etc.).
- DO NOT escape single quotes like \\\'
- RETURN STRICT VALID JSON ONLY.

RETURN ONLY JSON:

{
  "routes": {
    "routeName.ts": "Next.js API route code"
  },
  "components": {
    "ComponentName.tsx": "React component code"
  },
  "imports": "import statements for page.tsx",
  "injection": "JSX to render inside page.tsx"
}
  
`;

  //const result = await model.generateContent([
  // instruction,
  // "USER REQUEST: " + (blueprint?.appName || ""),
  // JSON.stringify(blueprint),
  //]);

  //const response = result.response.text();

  const response = await generateAI("gemini", [
    instruction,
    "USER REQUEST: " + (blueprint?.appName || ""),
    JSON.stringify(blueprint),
  ]);

  try {
    return safeJsonParse(response);
  } catch (err) {
    console.error("JSON parse failed in coderAgent. Raw text snippet:", response.slice(0, 200));
    throw err;
  }
}
