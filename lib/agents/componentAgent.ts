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
- Add '"use client";' at the very top of the file ONLY if the component uses hooks (useState, useEffect, etc.) or interactive event handlers (onClick, onChange, etc.). DO NOT add it automatically.
- STRICT PROP RULES:
  - Prop interfaces MUST use optional '?' for all interactive/callback props (e.g., onClick?: (id: string) => void).
  - ALWAYS provide a default no-op function in component parameters for callbacks (e.g., { onClick = () => {} }).
  - ALWAYS provide an empty array as a default for any array prop to prevent .map() crashes (e.g., { items = [] }).

ROUTING & HTML SEMANTICS — MANDATORY:
- NEVER assume routing responsibility unless explicitly requested.
- NEVER wrap an <a> tag inside a <Link>. Apply all classNames directly to the <Link>.
- NEVER use the 'legacyBehavior' prop on <Link>.
- NEVER nest Links (e.g., <Link><Card><Link></Card></Link>). One component owns navigation.
- NEVER nest buttons inside buttons.
- NEVER nest forms inside forms.
- MUST use semantic HTML and proper accessibility (e.g., proper aria-labels, no duplicate IDs).
- If the component is a Login, Signup, or Auth form, YOU MUST import useRouter from next/navigation and use router.push() to navigate upon form submission.

STANDARDIZED NAMING & MODULARITY:
- Use items for arrays, title/description/image/id as standard fields, onAction/onSearch/onSubmit/onClose as handlers.
- DO NOT include full-screen containers ('min-h-screen', 'w-screen', 'p-20') inside reusable components.
- DO NOT include background colors ('bg-gray-100', 'bg-blue-50') that override the parent page. 
- DO NOT include top-level page headers ('h1', 'h2') that might duplicate the page title. 
- Components should be modular "fragments" that fit into any parent container.
- INPUT VISIBILITY: All <input> or <textarea> elements MUST explicitly set a dark text color class (e.g., className="... text-gray-900").
- AUTH PERSISTENCE: Every auth-related component (Login, Signup, ForgotPassword) MUST save the auth state to localStorage (e.g., localStorage.setItem('isLoggedIn', 'true')) upon successful submission.
- DO NOT generate Todo components unless asked.

SVG RULES — CRITICAL — BREAKING BUG IF VIOLATED:
- NEVER generate SVG <path d="..."> attributes longer than 200 characters.
- Use emoji (🛍️ 📊 ✅ 👥 📁 🔔) or lucide-react icons (import from 'lucide-react') instead of inline SVG.
- If you must use SVG, keep the d attribute under 100 characters (e.g., d="M5 12h14", d="M12 4v16").

LAYOUT RULES — CRITICAL:
- NEVER generate a layout.tsx body with gradient or color backgrounds.
- Page-specific colors/gradients belong in page.tsx, NOT in layout.tsx.

STATE MANAGEMENT RULES — CART/WISHLIST/ORDERS:
- NEVER use a hardcoded initialCart/initialOrders array inside a component or page for persistent data.
- For cart, wishlist, or saved items: create lib/cart.ts with getCart(), saveCart(), addToCart() backed by localStorage.

PAGINATION RULES:
- Connect PaginationControls to real currentPage state. Never hardcode page={1}.

MISSING COMPONENT SAFETY RULES:
- Only import components that YOU are defining in THIS response OR that are in the Available Components list.
- NEVER import Modal, Sidebar, Navbar, ProtectedRoute, etc. unless they appear in Available Components.
- Hallucinated imports crash the build with "Module not found" errors.
- If a needed component is missing, build it inline or omit it.

EXTERNAL LIBRARY RULES:
- ONLY import libraries that are standard in the project: 'lucide-react', 'framer-motion', 'react-icons', 'next', 'react'.
- NEVER import 'recharts', 'chart.js', 'axios', 'date-fns', etc.

LUCIDE-REACT ICON NAMING — CRITICAL (wrong names cause build failures):
- GitHub icon: 'Github' (NOT 'GitHub') — lowercase 'h'.
- Google icon: use 'Globe' — there is NO 'Chrome' icon.
- Do NOT use 'SearchIcon' — it's just 'Search'.

TYPESCRIPT TYPE SAFETY — CRITICAL:
- All arrow function parameters in .map(), .filter(), .reduce() MUST have explicit types.
- Component props MUST match their TypeScript interface exactly.

PAGE COMPLETENESS & LINKING:
- NO PLACEHOLDERS: Do not use "To be implemented", "Coming Soon", or empty shells.
- For EVERY component you generate that represents a view (e.g., LoginForm, SignupForm, ProfileCard, CheckoutForm),
  a corresponding page.tsx MUST also exist that imports and renders it.

STRICT JSON RULES:
- Escape all quotes using \\", newlines using \\n.
- Do NOT include markdown blocks (no \`\`\`json).
- DO NOT escape single quotes.
- Return ONLY valid parseable JSON. No conversational text.

CRITICAL:
Generate ONLY reusable React components.
NEVER generate: page.tsx, HomePage, AboutPage, ContactPage, DashboardPage, LoginPage, SignupPage.
Pages belong ONLY to PageAgent.
If a file represents a route or page, do NOT generate it.

PLACEHOLDER IMAGE RULES — CRITICAL:
- NEVER generate external placeholder image services (no placehold.co, no dummyimage.com, etc.).
- Use '/public/placeholder.png' or standard CSS/Tailwind placeholders.
- Do NOT import Image from "next/image" for placeholder or mock images. Use standard <img> tags.

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
    const raw = await generateAI({
      provider: "gemini",
      prompt: [prompt],
      config: {
        responseMimeType: "application/json",
      }
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
