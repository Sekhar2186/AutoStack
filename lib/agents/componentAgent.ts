import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function componentAgent(blueprint: any, previousPath?: string) {
  const model = genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const instruction = `
Generate React components based on USER REQUEST.

RULES:
- Use TypeScript with clear interface definitions for Props.
- Use Tailwind CSS.
- Create reusable components.
- ALWAYS use 'export default function ComponentName' for the main component.
- Add '"use client";' at the very top of the file if the component uses hooks (useState, useEffect, etc.) or interactive event handlers (onClick, onChange, etc.).
- STRICT PROP RULES:
  - Prop interfaces MUST use optional '?' for all interactive/callback props (e.g., \`onClick?: (id: string) => void\`).
  - ALWAYS provide a default no-op function in the component parameters for callbacks (e.g., \`{ onClick = () => {} }\`).
  - Ensure props used for list iteration (.map()) are NOT optional unless you provide a fallback empty array.
- STANDARDIZED NAMING:
  - Use \`items\` for arrays of data.
  - Use \`title\`, \`description\`, \`image\`, \`id\` as standard field names.
  - Use \`onAction\` or specific verbs like \`onSearch\`, \`onSubmit\`, \`onClose\`.
- DO NOT generate Todo components unless asked.
- Examples:
  - Modal.tsx: export default function Modal({ isOpen, onClose = () => {}, title, children }) { ... }
  - Search.tsx: export default function Search({ onSearch = (q) => {}, placeholder = "..." }) { ... }

STRICT JSON RULES:
- Escape all quotes using \"
- Escape newlines using \\n
- Do NOT include markdown
- DO NOT escape single quotes (use ' not \\')
- Return only valid JSON

Return JSON:

{
  "ComponentName.tsx": "code"
}
`;

  let promptParts = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\n" + JSON.stringify(blueprint);

  if (previousPath) {
    promptParts += `\n\nExisting project is at: ${previousPath}. Ensure components are compatible with the existing structure.`;
  }

  const result = await model.generateContent([promptParts]);

  const text = result.response.text();

  try {
    return safeJsonParse(text);
  } catch (error) {
    console.error("JSON parse failed in componentAgent. Raw text snippet:", text.slice(0, 200));
    throw error;
  }
}
