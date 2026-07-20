
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

export async function componentAgent(blueprint: any, previousPath?: string, userId?: string) {

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
  - CRITICAL: Component Props interfaces MUST accurately reflect the exact props expected to be passed by parent components. Do NOT define required properties in the interface that won't be provided.
  - CRITICAL: Data model interfaces (e.g., Message, User) MUST accurately reflect the actual object structure. If a property is accessed (e.g., message.sender), it MUST be defined in the interface. If it is sometimes omitted, mark it as optional (e.g., id?: string).

SHARED GLOBAL TYPES — MANDATORY COMPATIBILITY:
- The project has a global Destination.d.ts with:
  interface Destination { id: string; name: string; location: string; description: string; imageUrl: string; category: string; rating?: number; price?: string; }
- If you generate a DestinationCard or any component that accepts a Destination object:
  - Its Props interface MUST accept { destination: Destination } (the full object), NOT flat fields like name/location/id.
  - The Destination interface inside the component MUST match the global one exactly (same required fields: id, name, location, description, imageUrl, category).
  - NEVER use 'subtitle', 'averageRating', or 'slug' as field names — these don't exist in the global type.

SELF-NAVIGATING COMPONENT RULE — CRITICAL:
- If you generate a Card component (e.g., DestinationCard, ProductCard, ArticleCard) that contains an internal <Link> for navigation:
  - DO NOT accept 'children' in the props interface.
  - Add a JSDoc comment above the export: /** @selfNavigating — do NOT wrap this component in <Link> from the parent page. It handles its own routing internally. */
  - This prevents parent pages from creating nested <a> inside <Link> hydration errors.
- If a component does NOT handle its own navigation (e.g., it's just a display card), clearly omit any Link imports.

PROP NAMING CONSISTENCY — CRITICAL:
- Use 'description' (NOT 'subtitle') for secondary text in HeroSection, SectionHeader, or any section component.
- HeroSection MUST have this exact interface: { title: string; description: string; imageUrl: string; buttonText?: string; buttonLink?: string; }
  - NEVER add 'subtitle', 'ctaText', 'ctaLink', 'backgroundImage', or 'children' to HeroSection.
- SectionHeader MUST have: { title: string; description?: string; }
  - NEVER add 'subtitle' to SectionHeader.
- SearchInput MUST have: { placeholder?: string; onSearch?: (query: string) => void; }
  - NEVER add 'name', 'className', 'buttonText', 'value', or 'onChange' to SearchInput.

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
- ALWAYS use '/placeholder.png' — Next.js serves /public as the root, so the correct URL path is '/placeholder.png'.
- NEVER write '/public/placeholder.png' — this path will 404 at runtime.
- NEVER generate external placeholder image services (no placehold.co, no dummyimage.com, etc.).
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
    const result = await generateAI({
      provider: "gemini",
      prompt: [prompt],
      config: {
        responseMimeType: "application/json",
      },
      userId
    });
    const raw = result.text;

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
