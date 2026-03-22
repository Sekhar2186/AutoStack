import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function coderAgent(blueprint: any) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const instruction = `
You are a Next.js full-stack developer.

Generate a full-stack app using Next.js App Router.

Rules:
- Use TypeScript (.ts / .tsx)
- Do NOT use Express
- API routes must be in: app/api/<route>/route.ts
- Use NextRequest and NextResponse
- Components must be React functional components
- Create a main UI page in app/page.tsx
- Use relative imports only
- Example: "../components/TodoList"
- Example: "../lib/models/Todo"
- Do NOT use MongoDB or mongoose
- Use in-memory array for todos
- Do NOT use any database
- Store todos in a simple array inside the API route
- Do NOT generate full UI layout
- Follow existing template structure
- Only modify components and logic
- Use Tailwind CSS only
- Do NOT override layout.tsx

Return ONLY JSON:

{
  "routes": {
    "todos.ts": "Next.js API route code"
  },
  "models": {
    "Todo.ts": "mongoose schema"
  },
  "components": {
    "TodoList.tsx": "React component"
  },
  "imports" : "import TodoList from '@/components/TodoList';" ,

  "injection" : "<TodoList/>"
}

Rules:
- Return raw JSON only
- No explanations
- No markdown

`;
  const result = await model.generateContent([
    instruction,
    JSON.stringify(blueprint)
  ]);

  const response = result.response.text();

  const cleaned = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

  return JSON.parse(jsonString);
}