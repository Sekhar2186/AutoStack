/** import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function pageAgent(blueprint: any) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    /**  const instruction = `
 You are a Next.js frontend developer.
 
 Generate ONLY the main page (app/page.tsx).
 
 STRICT RULES:
 - Use TypeScript (.tsx)
 - Use React functional component
 - Use Tailwind CSS
 - Use ONLY components passed/imported
 - DO NOT create new layout
 - DO NOT modify layout.tsx
 - Follow template styling
 - Ensure responsive UI
 
 IMPORTANT:
 - STRICTLY follow user request
 - DO NOT generate Todo UI unless asked
 - Use proper structure (hero, sections, cards, etc.)
 - Keep UI clean and modern
 
 RETURN JSON:
 
 {
   "imports": "all required import statements",
   "page": "complete page.tsx code"
 }
 
 Rules:
 - Return raw JSON only
 - No markdown
 - No explanations
 `;
 
    const instruction = `
You are a professional React + Next.js developer.

Generate ONLY the main page.tsx.

RULES:
- Use React functional component
- Use Tailwind CSS
- Use components from "../components"
- Follow the USER REQUEST strictly
- DO NOT generate Todo apps unless explicitly asked
- Build real UI (portfolio, dashboard, landing page, etc.)
- Include sections like:
  - Hero
  - Cards
  - Sections based on request

TEMPLATE:
- Layout already exists
- You are allowed to fully design page content

OUTPUT:
Return ONLY valid TSX code for page.tsx

NO markdown
NO explanation
`;

    const result = await model.generateContent([
        instruction,
        "USER REQUEST: " + (blueprint?.appName || ""),
        JSON.stringify(blueprint),
    ]);

    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON from pageAgent");

    return JSON.parse(jsonMatch[0]);
}
*/

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function pageAgent(data: any) {
    const { blueprint, components, pageName, pageRoute } = data;
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const instruction = `
You are a Next.js developer.

You are given EXISTING components to build the following page:
Page Name: ${pageName || 'Home'}
Route Path: ${pageRoute || '/'}

IMPORTANT:
- Use only the components that are relevant to this specific page.
- DO NOT ignore components if they logically belong on this page.
- DO NOT create new components, use inline HTML/Tailwind for custom layouts if a component is lacking.

Available Components:
${Object.keys(components).join(", ")}

TASK:
- Import required components using the absolute path alias (e.g., \`import ComponentName from "@/components/ComponentName";\`).
- NEVER use relative imports like \`../\` or \`../../\` to resolve components. 
- Use them to assemble the ${pageName || 'Home'} page correctly based on the USER REQUEST.
- Maintain logical UI order and spacing.

Return full page.tsx code (and nothing else).
`;

    const result = await model.generateContent([
        instruction,
        "USER REQUEST: " + (blueprint?.appName || ""),
    ]);

    const text = result.response.text();

    // clean markdown if present
    const cleaned = text
        .replace(/```tsx/g, "")
        .replace(/```/g, "")
        .trim();

    return cleaned;
}