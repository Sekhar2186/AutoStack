
import { generateAI } from "../services/ai/modelRouter";
import { safeJsonParse } from "@/lib/utils/jsonUtils";

export async function pageAgent(data: any, userId?: string) {
  const { blueprint, components, pageName, pageRoute, previousPageCode, uiPrompt } = data;

  const isIterative = !!previousPageCode;

  const instruction = `
You are a Next.js developer.

\${isIterative ? 'You are UPDATING an existing page. Maintain the structure but improve or add features according to the blueprint and user request.' : 'You are building a NEW page.'}

You are given EXISTING components to build/update the following page:
Page Name: \${pageName || 'Home'}
Route Path: \${pageRoute || '/'}

RULES:
- Available Components: \${Object.keys(components).join(", ")}
- CRITICAL: ONLY IMPORT COMPONENTS FROM THE Available Components LIST ABOVE.
- IF A COMPONENT IS NOT IN THE LIST, DO NOT IMPORT IT. Build inline or skip it. Hallucinated imports cause "Module not found" build crashes.
- Import components using the absolute path alias: import ComponentName from "@/components/ComponentName";
- ALWAYS use DEFAULT imports for components.

NEXT.JS 15 APP ROUTER RULES — MANDATORY:
- NEVER generate '"use client"' with 'params' or 'searchParams'.
- NEVER generate async Client Components.
- NEVER await 'params' or 'searchParams'.
- SERVER COMPONENTS (default): May receive 'params' and 'searchParams'. Use: 'export default async function Page({ params, searchParams })'
- CLIENT COMPONENTS: Must use 'useRouter()', 'useSearchParams()', 'useParams()' from 'next/navigation'.
- NEVER generate '"use client"' automatically. ONLY add it when the page actually uses: useState, useEffect, useMemo, useCallback, browser APIs, event handlers, useRouter, useSearchParams, or useParams. Otherwise, generate a Server Component.

FRONTEND STRICT ISOLATION RULES — CRITICAL:
- NEVER generate ANY backend code in page files. No database connections, no raw file reads.
- NEVER import files from 'data/' or 'lib/storage/'.
- The frontend MUST ONLY communicate with the backend via fetch('/api/<entity>').
- All CRUD operations must use standard HTTP methods (GET, POST, PUT, DELETE) against the API.

ROUTING & LINKS — CRITICAL:
- Every generated Link must point to an existing page.
- For dynamic routes (e.g., app/books/[id]/page.tsx), href="/books/\${id}" MUST be generated. Never generate hardcoded invalid URLs.
- NEVER wrap an <a> tag inside <Link>. Apply all classNames and styles directly to the <Link> component.
- NEVER use the 'legacyBehavior' prop on <Link>.
- Login/Signup pages MUST use router.push() from next/navigation to redirect after submission.
- Every link in Navbar or sidebar MUST have a corresponding page file.
- If a component is a "Card" or "Detail" type used in a list page, a corresponding DETAIL page MUST exist:
  - RestaurantCard used → /restaurants/[id]/page.tsx MUST be generated.
  - ProductCard used → /products/[id]/page.tsx MUST be generated.

COMPONENT RESPONSIBILITIES & MODULARITY:
- DEFENSIVE PROP PASSING: Lift state to page level, pass required props with realistic sample data.
- PROP CONSISTENCY: Match props exactly to what was likely generated (e.g., 'isAuthenticated' vs 'isLoggedIn').
- COMPONENT MODULARITY: Available Components should be treated as modular units. Avoid double-wrapping components in unnecessary Cards or Containers.
- Maintain logical UI order and spacing with Tailwind CSS.
- INPUT VISIBILITY: All <input> or <textarea> elements MUST explicitly set a dark text color class (e.g., className="... text-gray-900").
- AUTH PERSISTENCE: Every page that handles login/signup MUST use localStorage.setItem('isLoggedIn', 'true') upon success.

PLACEHOLDER IMAGE RULES — CRITICAL:
- NEVER generate external placeholder image services (no placehold.co, no dummyimage.com, etc.).
- Use '/public/placeholder.png' or standard CSS/Tailwind placeholders (e.g. <div className="w-full h-48 bg-gray-200 animate-pulse rounded-md flex items-center justify-center text-gray-400">Placeholder</div>).
- Only use next/image when referencing local files from /public.

SVG RULES — CRITICAL — BREAKING BUG IF VIOLATED:
- NEVER generate SVG <path d="..."> attributes longer than 200 characters.
- Use emoji (🛍️ 📊 ✅ 👥 📁 🔔) or lucide-react icons instead of inline SVG paths.
- NO PLACEHOLDERS: Every SVG must be either a Lucide icon or a simple, short path.

LAYOUT RULES — CRITICAL:
- NEVER modify layout.tsx to add colored/gradient backgrounds.
- NEVER import or use the <Layout>, <Navbar>, or <Sidebar> components in your generated page files! The root layout.tsx ALREADY wraps all pages.

STATE MANAGEMENT & PAGINATION:
- NEVER use a hardcoded initialCart/initialOrders static array for persistent features.
- For cart, wishlist, saved items: create and use a lib/cart.ts utility with localStorage.
- For any list page with more than 8 items, implement client-side pagination.

EXTERNAL LIBRARY & ICON RULES:
- ONLY import standard libraries: 'lucide-react', 'framer-motion', 'react-icons', 'next', 'react'.
- NEVER import 'recharts', 'chart.js', 'axios', 'date-fns', etc.
- LUCIDE-REACT: Use 'Github', 'Globe', 'Search'. NEVER guess icon names.

TYPESCRIPT TYPE SAFETY — CRITICAL:
- All function parameters in map/filter/reduce MUST have explicit types.
- Cart item IDs are 'string' type.

COMPLETE PAGE REQUIREMENT — MANDATORY:
- EVERY PAGE LINKED FROM NAVIGATION MUST BE FULLY IMPLEMENTED. 
- PLACEHOLDERS ARE BANNED: Do not use "Coming Soon", "To be implemented", or empty shells.
- Minimum 80 lines of real UI code per page.

\${uiPrompt ? \`
CUSTOM UI REQUIREMENTS:
\${uiPrompt}
- Use Tailwind CSS only
- Add modern UI effects if requested
- DO NOT generate plain/basic UI.
- CRITICAL: DO NOT return placeholder text like "/* AUTO-IMPORTS */"
\` : ""}
- CRITICAL: Return ONLY a valid JSON object. No markdown. No conversational text.
- Use EXACTLY this JSON schema:
{
  "code": "full page.tsx code with implemented business logic here"
}
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

  const result = await generateAI({
    provider: "gemini",
    prompt: promptParts,
    config: {
      responseMimeType: "application/json",
    },
    userId
  });
  const text = result.text;

  try {
    const parsed = safeJsonParse(text);
    return parsed.code;
  } catch (err) {
    console.error("JSON parse failed in pageAgent. Raw text snippet:", text.slice(0, 200));
    throw err;
  }
}