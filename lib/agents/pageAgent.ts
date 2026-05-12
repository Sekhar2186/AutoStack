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
import { generateAI } from "../services/ai/modelRouter";

export async function pageAgent(data: any) {
  const { blueprint, components, pageName, pageRoute, previousPageCode, uiPrompt } = data;

  const isIterative = !!previousPageCode;

  const instruction = `
You are a Next.js developer.

${isIterative ? 'You are UPDATING an existing page. Maintain the structure but improve or add features according to the blueprint and user request.' : 'You are building a NEW page.'}

You are given EXISTING components to build/update the following page:
Page Name: ${pageName || 'Home'}
Route Path: ${pageRoute || '/'}

RULES:
- Available Components: ${Object.keys(components).join(", ")}
- CRITICAL: ONLY IMPORT COMPONENTS FROM THE Available Components LIST ABOVE.
- IF A COMPONENT IS NOT IN THE LIST, DO NOT IMPORT IT. Build inline or skip it. Hallucinated imports cause "Module not found" build crashes.
- Import components using the absolute path alias: import ComponentName from "@/components/ComponentName";
- ALWAYS use DEFAULT imports for components.
- ALWAYS include '"use client";' at the very top (before any imports).
- NEVER recreate complex logic if a component exists; use the component.
- DEFENSIVE PROP PASSING: Lift state to page level, pass required props with realistic sample data.
- Use Next.js <Link> for all internal navigation instead of <a>.
- CRITICAL: If you use the <Link> component, YOU MUST import it from 'next/link' (e.g., import Link from 'next/link').
- NEVER use the 'legacyBehavior' prop on <Link>.
- NEVER wrap an <a> tag inside <Link>. Apply all classNames and styles directly to the <Link> component.
- ROUTING: Login/Signup pages MUST use router.push() from next/navigation to redirect after submission.
- PROP CONSISTENCY — CRITICAL: Before passing props to an 'Available Component', verify its interface. Do NOT hallucinate prop names like 'notificationsCount' or 'isLoggedIn' if they are not standard for that component. Match props exactly to what was likely generated (e.g., 'isAuthenticated' vs 'isLoggedIn'). If a component expects a 'result' object (e.g., PredictionResultCard), pass the object, not individual fields.
- INPUT VISIBILITY: All <input> or <textarea> elements MUST explicitly set a dark text color class (e.g., className="... text-gray-900") to ensure readability against light backgrounds and prevent theme-related 'invisible text' bugs.
- AUTH PERSISTENCE: Every page that handles login/signup MUST use localStorage.setItem('isLoggedIn', 'true') upon success. The Navbar and private pages MUST use useEffect to check localStorage for this flag and update the UI accordingly.
- API SYMMETRY: For every 'fetch' call made to a local endpoint (e.g., /api/chat, /api/predict), the agent is RESPONSIBLE for ensuring the corresponding API route is generated in the app/api/ folder.
- COMPONENT MODULARITY: Available Components should be treated as modular units. If a component (like a Form) already includes a title or a submit button, do NOT duplicate those elements on the parent page. Avoid double-wrapping components in unnecessary Cards or Containers.
- Maintain logical UI order and spacing with Tailwind CSS.

SVG RULES — CRITICAL — BREAKING BUG IF VIOLATED:
- NEVER generate SVG <path d="..."> attributes longer than 200 characters.
- Use emoji (🛍️ 📊 ✅ 👥 📁 🔔) or lucide-react icons instead of inline SVG paths.
- The AI has a known bug of hallucinating infinitely long corrupted SVG path strings.
- A corrupt SVG path causes: "JSX element has no corresponding closing tag" compile error.

LAYOUT RULES — CRITICAL:
- NEVER modify layout.tsx to add colored/gradient backgrounds.
- layout.tsx body MUST stay: className="bg-gray-50 min-h-screen" or "bg-white min-h-screen".
- Put page-specific backgrounds and gradients inside the page's own container div.

STATE MANAGEMENT — CART/WISHLIST/ORDERS — CRITICAL:
- NEVER use a hardcoded initialCart/initialOrders static array for persistent features.
- For cart, wishlist, saved items: create and use a lib/cart.ts utility with localStorage.
- Cart page MUST use useEffect to read from localStorage on mount.
- "Add to Cart" MUST persist to localStorage AND dispatch 'cart-updated' event.
- Navbar cart badge MUST listen to 'cart-updated' event and show real count.

PAGINATION RULES:
- For any list page with more than 8 items, implement client-side pagination.
- Connect pagination state (currentPage) to the displayed slice of data.

EXTERNAL LIBRARY RULES:
- ONLY import libraries that are standard in the project: 'lucide-react', 'framer-motion', 'react-icons', 'next', 'react'.
- NEVER import 'recharts', 'chart.js', 'axios', 'date-fns', or other 3rd party libraries unless explicitly requested.
- If you need a chart, build a simple CSS/SVG chart or check if the user specifically asked for a library.
- Importing uninstalled libraries will crash the app.

LUCIDE-REACT ICON NAMING — CRITICAL (these mistakes break builds):
- The GitHub icon is 'Github' NOT 'GitHub' — always lowercase 'h'.
- There is NO 'Chrome' icon — use 'Globe' for Google/browser icons.
- There is NO 'Search' icon named 'SearchIcon' — just 'Search'.
- Always double check: Trash2, ArrowLeft, ArrowRight, ChevronDown, ChevronUp — these are correct.
- NEVER guess icon names. Only use icons you are certain exist in lucide-react.

TYPESCRIPT TYPE SAFETY — CRITICAL:
- All function parameters in map/filter/reduce MUST have explicit types: (item: any) => or (item: CartItem) =>.
- Cart item IDs are 'string' type. NEVER pass a 'string' id to a function expecting 'number'.
- When calling updateQuantity(id, delta): id is 'string', delta is 'number'.
- Prop types in components must exactly match what the component interface declares.

ROUTING & NAVIGATION — CRITICAL:
- Every link in Navbar or sidebar MUST have a corresponding page file.
- If Login button Exists → /login page MUST exist.
- If Signup link on login page Exists  → /signup page MUST exist.
- If Cart icon Exists → /cart page MUST exist.
- If Profile/User icon Exists → /profile page MUST exist.
- If Orders link Exists→ /orders page MUST exist.
- Detail pages: if /restaurants exists, /restaurants/[id] MUST exist.
- NEVER add a navigation link without creating the destination page.
- Use router.push('/') or router.push('/dashboard') after login — NEVER redirect to a non-existent page.

COMPLETE PAGE REQUIREMENT — MANDATORY:
- Every page linked from navigation MUST be fully implemented (not a stub or placeholder).
- Minimum 60 lines of real UI code per page. No empty shells.
- The following pages MUST ALWAYS be fully implemented when they appear in the blueprint:
  /login, /signup, /profile, /cart, /checkout, /orders, /dashboard, /settings, /forgot-password.
- Each of these pages must have a working form or real UI with state, event handlers, and router.push() on submit.

COMPONENT-TO-PAGE LINKING — CRITICAL:
- You will receive a list of generated components (e.g., RestaurantCard, AuthForm, ProductCard).
- If a component is a "Card" or "Detail" type used in a list page, a corresponding DETAIL page MUST exist:
  - RestaurantCard used → /restaurants/[id]/page.tsx MUST be generated.
  - ProductCard used → /products/[id]/page.tsx MUST be generated.
  - BlogCard used → /blog/[id]/page.tsx MUST be generated.
- If AuthForm component exists → BOTH /login/page.tsx AND /signup/page.tsx MUST be generated and must import + render AuthForm.
- If CheckoutForm component exists → /checkout/page.tsx MUST import and render it.
- If ProfileCard component exists → /profile/page.tsx MUST import and render it.
- A component that has NO page rendering it is a DEAD COMPONENT. Every generated component must be used by at least one page.
- This is what prevents 404 errors. Never generate a component without generating its corresponding page.

${uiPrompt ? `
CUSTOM UI REQUIREMENTS:
${uiPrompt}
- Use Tailwind CSS only
- Add modern UI effects if requested: glassmorphism, gradients, blur, hover animations
- Keep template structure intact
- Ensure responsive design
- DO NOT generate plain/basic UI.
- CRITICAL: DO NOT return placeholder text like "/* AUTO-IMPORTS */" or "{/* AUTO-INJECT-COMPONENTS */}". These are internal markers. You must replace them with ACTUAL import statements and ACTUAL component usage.
- CRITICAL: If the input context appears minimal, you are RESPONSIBLE for expanding it into a full, professional-grade page layout with Hero, Features, and other sections. Never return a page with less than 50 lines of code.
` : ""}
- CRITICAL: Return ONLY the raw TSX code. DO NOT wrap in markdown code blocks. No explanations.
- Return full page.tsx code with implemented business logic.
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

  // clean markdown if present (defensive)
  const cleaned = text
    .replace(/^```[a-z]*\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();

  return cleaned;
}