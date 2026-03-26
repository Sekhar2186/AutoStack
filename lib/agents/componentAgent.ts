import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function componentAgent(blueprint: any) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  /** const instruction = `
You are a React UI developer.

Generate ONLY React components based on the user request.

STRICT RULES:
- Use TypeScript (.tsx)
- Use functional components
- Use Tailwind CSS
- Keep components modular and reusable
- DO NOT generate API routes
- DO NOT generate page.tsx
- Follow modern UI practices
- Ensure responsive design

IMPORTANT:
- STRICTLY follow the user request
- DO NOT generate Todo apps unless asked

RETURN JSON:

{
"components": {
  "ComponentName.tsx": "code"
}
}

Rules:
- Return raw JSON only
- No markdown
- No explanations
`;
*/
  const instruction = `
Generate React components based on USER REQUEST.

RULES:
- Use TypeScript
- Use Tailwind CSS
- Create reusable components
- DO NOT generate Todo components unless asked
- Examples:
  - HeroSection.tsx
  - ProjectCard.tsx
  - Navbar.tsx

Return JSON:

{
  "ComponentName.tsx": "code"
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
  if (!jsonMatch) throw new Error("Invalid JSON from componentAgent");

  return JSON.parse(jsonMatch[0]);
}
