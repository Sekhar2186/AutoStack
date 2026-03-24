import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function coderAgent(blueprint: any) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const instruction = `
You are a professional full-stack developer.

Generate a full-stack web app using Next.js App Router.

STRICT RULES:
- Use TypeScript (.ts / .tsx)
- Use Next.js App Router (app folder)
- API routes must be inside: app/api/<route>/route.ts
- Use NextRequest and NextResponse
- Components must be React functional components
- Use relative imports only (../components/...)
- Follow existing template structure
- DO NOT override layout.tsx
- Only modify components and logic
- Use Tailwind CSS only
- Ensure responsive design

IMPORTANT:
- STRICTLY follow the USER REQUEST
- DO NOT generate generic apps
- DO NOT generate Todo apps unless explicitly asked
- Generate components relevant to the request (portfolio, dashboard, blog, etc.)

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

Rules:
- Return raw JSON only
- No explanations
- No markdown

`;

  const result = await model.generateContent([
    instruction,
    "USER REQUEST: " + (blueprint?.appName || ""),
    JSON.stringify(blueprint),
  ]);

  const response = result.response.text();

  const cleaned = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Invalid JSON response from model");
  }

  const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON PARSE ERROR:", jsonString);
    throw err;
  }
}
