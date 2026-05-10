/** import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function pageAgent(blueprint: any) {
    const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
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
import { generateAI } from "../services/ai/modelRouter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function pageAgent(data: any) {
  const { blueprint, components, pageName, pageRoute, previousPageCode, uiPrompt } = data;
  const model = genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
  });

  const isIterative = !!previousPageCode;

  const instruction = `
You are a Next.js developer.

${isIterative ? 'You are UPDATING an existing page. Maintain the structure but improve or add features according to the blueprint and user request.' : 'You are building a NEW page.'}

You are given EXISTING components to build/update the following page:
Page Name: ${pageName || 'Home'}
Route Path: ${pageRoute || '/'}

RULES:
- Available Components: ${Object.keys(components).join(", ")}
- Import required components using the absolute path alias (e.g., \`import ComponentName from "@/components/ComponentName";\`).
- ALWAYS use DEFAULT imports (e.g., \`import ComponentName from "@/components/ComponentName";\`).
- ALWAYS include '"use client";' at the very top of the file (before any imports).
- NEVER recreate complex logic if a component exists; just use the component.
- DEFENSIVE PROP PASSING:
  - Identify components that likely need interactivity (Search, Modals, Forms).
  - Lift state to the page level to manage these components.
  - ALWAYS pass required props (like arrays for lists) and provide realistic sample data/handlers.
  - Use standardized names in your state/handlers to match component guesses (e.g., \`handleSearch\`, \`items\`).
- Use Next.js \`<Link>\` component for all internal navigation instead of \`<a>\`.
- Maintain logical UI order and spacing with Tailwind CSS.
- Return full page.tsx code (and nothing else).

${uiPrompt ? `
CUSTOM UI REQUIREMENTS:
- Follow this UI style exactly:
${uiPrompt}

- Use Tailwind CSS only
- Add modern UI effects if requested:
  - glassmorphism
  - gradients
  - blur effects
  - hover animations
  - smooth transitions
  - neon/glow effects
- Keep the template structure intact
- Ensure responsive design
- Do NOT generate plain/basic UI
` : ""}
    - Return full page.tsx code
  `;

  const promptParts = [
    instruction,
    "USER REQUEST: " + (blueprint?.appName || ""),
    "BLUEPRINT: " + JSON.stringify(blueprint),
  ];

  if (isIterative) {
    promptParts.push("EXISTING PAGE CODE TO BE UPDATED:\n" + previousPageCode);
    promptParts.push("INSTRUCTIONS: Modify the existing code above to incorporate the new requirements from the blueprint. Keep what works, fix what is broken, and add what is missing.");
  }

  //const result = await model.generateContent(promptParts);

  //const text = result.response.text();

  const text = await generateAI("gemini", promptParts);

  // clean markdown if present
  const cleaned = text
    .replace(/```tsx/g, "")
    .replace(/```/g, "")
    .trim();

  return cleaned;
}