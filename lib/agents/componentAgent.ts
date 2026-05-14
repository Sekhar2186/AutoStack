import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

export async function componentAgent(blueprint: any, previousPath?: string) {

  const instruction = `
Generate React components based on USER REQUEST.

RULES:
- Use TypeScript with clear interface definitions for Props.
- Use Tailwind CSS.
- Create reusable components.
- ALWAYS use 'export default function ComponentName' for the main component.
- CRITICAL INTEGRITY: You MUST generate EVERY component listed in the blueprint's frontendComponents array. Skipping even one component will cause the entire application to crash. Do not omit any components due to length or complexity.
- Add '"use client";' at the very top of the file if the component uses hooks (useState, useEffect, etc.) or interactive event handlers (onClick, onChange, etc.).
- STRICT PROP RULES:
  - Prop interfaces MUST use optional '?' for all interactive/callback props (e.g., onClick?: (id: string) => void).
  - ALWAYS provide a default no-op function in component parameters for callbacks (e.g., { onClick = () => {} }).
  - ALWAYS provide an empty array as a default for any array prop to prevent .map() crashes (e.g., { items = [] }).
- ROUTING RULES:
  - If the component is a Login, Signup, or Auth form, YOU MUST import useRouter from next/navigation and use router.push() to navigate upon form submission. Do not just console.log the submission.
  - CRITICAL: If you use the <Link> component, YOU MUST import it from 'next/link' (e.g., import Link from 'next/link').
  - NEVER use the 'legacyBehavior' prop on <Link>.
  - NEVER wrap an <a> tag inside <Link>. Apply all classNames and styles directly to the <Link> component.
- STANDARDIZED NAMING: Use items for arrays, title/description/image/id as standard fields, onAction/onSearch/onSubmit/onClose as handlers.
- MODULAR COMPONENT DESIGN — CRITICAL: 
  - DO NOT include full-screen containers ('min-h-screen', 'w-screen', 'p-20') inside reusable components.
  - DO NOT include background colors ('bg-gray-100', 'bg-blue-50') that override the parent page. 
  - DO NOT include top-level page headers ('h1', 'h2') that might duplicate the page title. 
  - Components should be modular "fragments" that fit into any parent container.
- INPUT VISIBILITY: All <input> or <textarea> elements MUST explicitly set a dark text color class (e.g., className="... text-gray-900") to ensure readability against light backgrounds and prevent theme-related 'invisible text' bugs.
- AUTH PERSISTENCE: Every auth-related component (Login, Signup, ForgotPassword) MUST save the auth state to localStorage (e.g., localStorage.setItem('isLoggedIn', 'true')) upon successful submission.
- DO NOT generate Todo components unless asked.

SVG RULES — CRITICAL — BREAKING BUG IF VIOLATED:
- NEVER generate SVG <path d="..."> attributes longer than 200 characters.
- The AI has a known bug of generating infinitely long corrupted SVG path strings that break JSX compilation.
- Use emoji (🛍️ 📊 ✅ 👥 📁 🔔) or lucide-react icons (import from 'lucide-react') instead of inline SVG.
- If you must use SVG, keep the d attribute under 100 characters (e.g., d="M5 12h14", d="M12 4v16").
- A corrupt SVG path causes: "JSX element has no corresponding closing tag" error.

LAYOUT RULES — CRITICAL:
- NEVER generate a layout.tsx body with gradient or color backgrounds (bg-purple-500, bg-blue-600, bg-linear-to-br, etc.).
- layout.tsx MUST use only: <body className="bg-gray-50 min-h-screen"> or <body className="bg-white min-h-screen">.
- Colored layout backgrounds bleed through and hide all page content.
- Page-specific colors/gradients belong in page.tsx, NOT in layout.tsx.

STATE MANAGEMENT RULES — CART/WISHLIST/ORDERS:
- NEVER use a hardcoded initialCart/initialOrders array inside a component or page for persistent data.
- For cart, wishlist, or saved items: create lib/cart.ts with getCart(), saveCart(), addToCart() backed by localStorage.
- Cart page MUST read from localStorage on mount (useEffect), not from a hardcoded variable.
- "Add to Cart" buttons MUST call the shared cart utility and persist to localStorage.
- Cart count badge in Navbar MUST use useEffect + localStorage event listener ('cart-updated') for live count.
- Pattern:
    // lib/cart.ts
    export function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    export function addToCart(item) { const c = getCart(); /* merge/add */ saveCart(c); window.dispatchEvent(new Event('cart-updated')); }
    // CartPage: useEffect(() => { setItems(getCart()); window.addEventListener('cart-updated', refresh); }, []);

PAGINATION RULES:
- If a list page shows more than 8 items, implement client-side pagination.
- Connect PaginationControls to real currentPage state. Never hardcode page={1}.

MISSING COMPONENT SAFETY RULES:
- Only import components that YOU are defining in THIS response OR that are in the Available Components list.
- NEVER import Modal, Sidebar, Navbar, ProtectedRoute, etc. unless they appear in Available Components.
- Hallucinated imports crash the build with "Module not found" errors.
- If a needed component is missing, build it inline or omit it.

EXTERNAL LIBRARY RULES:
- ONLY import libraries that are standard in the project: 'lucide-react', 'framer-motion', 'react-icons', 'next', 'react'.
- NEVER import 'recharts', 'chart.js', 'axios', 'date-fns', or other 3rd party libraries unless explicitly requested.
- If you need a chart, build a simple CSS/SVG chart or check if the user specifically asked for a library.
- Importing uninstalled libraries will crash the app.

LUCIDE-REACT ICON NAMING — CRITICAL (wrong names cause build failures):
- GitHub icon: 'Github' (NOT 'GitHub') — lowercase 'h'.
- Google icon: use 'Globe' — there is NO 'Chrome' icon.
- Do NOT use 'SearchIcon' — it's just 'Search'.
- Safe icons: Trash2, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Star, Clock, MapPin, Phone, Mail, Lock, User, Plus, Minus, X, Check, Edit2, LogOut, Package, Heart, ShoppingCart, ShoppingBag, CreditCard, Github, Globe, Filter, RotateCcw, Menu.
- NEVER guess an icon name. If unsure, use a safe icon from the list above.

TYPESCRIPT TYPE SAFETY — CRITICAL:
- All arrow function parameters in .map(), .filter(), .reduce() MUST have explicit types: (item: any) => or (item: MyType) =>.
- Component props MUST match their TypeScript interface exactly — no extra or missing required props.
- IDs used in cart/wishlist: always 'string'. Never assume 'number' for IDs.
- When a function parameter is 'string', never pass a 'number' and vice versa.

PAGE COMPLETENESS — MANDATORY:
- NO PLACEHOLDERS: Do not use "To be implemented", "Coming Soon", or empty shells.
- The following pages MUST ALWAYS be fully implemented if they appear in the blueprint:
  /login, /signup, /profile, /cart, /checkout, /orders, /dashboard, /settings, /forgot-password.
- NEVER generate these as stubs or placeholders — write full, production-quality UI with forms, state, and navigation.
- If a Login component exists, /login/page.tsx MUST use it with a working form that calls router.push() on submit.
- If a Signup component exists, /signup/page.tsx MUST use it with full name/email/password fields.
- If a Profile component exists, /profile/page.tsx MUST render it with real user data (mock if needed).

COMPONENT-TO-PAGE LINKING — CRITICAL:
- For EVERY component you generate that represents a view (e.g., LoginForm, SignupForm, ProfileCard, CheckoutForm),
  a corresponding page.tsx MUST also exist that imports and renders it.
- Example: If you generate 'AuthForm.tsx', then '/login/page.tsx' and '/signup/page.tsx' MUST import and render it.
- Example: If you generate 'ProductCard.tsx' used on a listing page, '/products/[id]/page.tsx' MUST exist.
- Example: If you generate 'RestaurantCard.tsx', '/restaurants/[id]/page.tsx' MUST exist showing the full detail view.
- This rule prevents 404 errors from links on generated pages.
- A component without a page that renders it is INCOMPLETE — you MUST create both.


STRICT JSON RULES:
- Escape all quotes using \\", newlines using \\n.
- Do NOT include markdown blocks (no \`\`\`json).
- DO NOT escape single quotes.
- Return ONLY valid parseable JSON. No conversational text.

Return JSON:
{
  "ComponentName.tsx": "code"
}
`;

  let prompt = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\n" + JSON.stringify(blueprint);

  if (previousPath) {
    prompt += `\n\nExisting project is at: ${previousPath}. Ensure components are compatible with the existing structure.`;
  }

  try {
    const raw = await generateAI("gemini", [prompt], {
      responseMimeType: "application/json",
    });

    const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return safeJsonParse(cleaned);
  } catch (error: any) {
    console.error("JSON parse failed in componentAgent.");
    throw error;
  }
}
