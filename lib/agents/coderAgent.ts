import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 🔧 JSON Fixer (VERY IMPORTANT)
function fixJsonString(str: string) {
  return str
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\\'/g, "'")             // fix invalid escaped single quotes
    .replace(/\\"/g, '"')             // normalize quotes
    .replace(/[\u0000-\u001F]+/g, "") // remove control chars
    .trim();
}

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
- DO NOT escape single quotes like \\\'
- RETURN STRICT VALID JSON ONLY

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

  const result = await model.generateContent([
    instruction,
    "USER REQUEST: " + (blueprint?.appName || ""),
    JSON.stringify(blueprint),
  ]);

  const response = result.response.text();

  // 🧼 Clean + Fix
  const cleaned = fixJsonString(response);

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Invalid JSON response from model");
  }

  const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("❌ JSON PARSE ERROR (RAW):", response);
    console.error("❌ JSON PARSE ERROR (CLEANED):", jsonString);
    throw err;
  }
}
