
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

COMPONENT PROP CONTRACT — HIGHEST PRIORITY RULE:
- BEFORE using any component from the Available Components list, you MUST reason about its EXACT TypeScript interface.
- YOU ARE PROVIDED THE COMPONENT SOURCE CODE in the COMPONENTS section below. Read the Props interface for EVERY component you use.
- PASS ONLY the props that are explicitly declared in the component's Props interface. DO NOT invent, assume, or guess prop names.
- DO NOT pass props that do not exist in the interface. This causes TypeScript errors and build failures.
- SPECIFIC KNOWN VIOLATIONS TO AVOID:
  - HeroSection accepts: { title, description, imageUrl, buttonText?, buttonLink? }.
    NEVER pass: subtitle, backgroundImage, ctaText, ctaLink, children — THESE DO NOT EXIST.
  - SearchInput accepts: { placeholder?, onSearch? }.
    NEVER pass: name, className, buttonText, value, onChange — THESE DO NOT EXIST.
  - SectionHeader accepts: { title, description? }.
    NEVER pass: subtitle — IT DOES NOT EXIST. The prop is called 'description'.
  - DestinationCard accepts: { destination: Destination, onClick? }.
    NEVER pass flat props like name, location, imageUrl, id directly — WRAP THEM in a destination={{...}} object.
- DO NOT pass children to a component unless its interface explicitly includes 'children: React.ReactNode'.

NESTED LINK / DOUBLE NAVIGATION RULE — CRITICAL:
- If a component (e.g., DestinationCard, ProductCard, ArticleCard) already contains a <Link> internally, DO NOT wrap it in another <Link> in the page.
- Nested <a> tags inside <Link> cause hydration errors and broken navigation.
- Rule: ONE component, ONE navigation owner. Check the component source to see if it handles its own navigation.

SERVER COMPONENT EVENT HANDLER RULE — CRITICAL:
- Page components in the App Router are Server Components by default.
- NEVER pass inline functions, closures, or event handlers (e.g., onClick={...}, onSearch={...}) from a Server Component to a Client Component.
- This will cause the error: 'Event handlers cannot be passed to Client Component props.'
- If you use a Client Component like SearchInput in a page, do NOT pass onSearch. Let the component handle it internally or use standard HTML <form action="...">.

DYNAMIC ROUTE HALLUCINATION PREVENTION:
- If you are generating a dynamic route page (e.g., /app/destinations/[id]/page.tsx), it MUST be a DETAIL view.
- DO NOT generate a list page (mapping over an array of cards) for an [id] route.
- It MUST accept the dynamic param (e.g., { params }: { params: Promise<{ id: string }> }), look up a single record, and render a dedicated detail layout for that specific entity.

SHARED TYPE DEFINITIONS — MANDATORY:
- The project has a global Destination.d.ts that defines:
  interface Destination { id: string; name: string; location: string; description: string; imageUrl: string; category: string; rating?: number; price?: string; }
- When building mock data arrays for Destination, your local interface MUST include ALL required fields from the global definition, especially 'category'.
- NEVER define a local interface that is LESS complete than the global shared type.
- NEVER use field names that don't exist in the global type (e.g., do NOT use 'slug', 'averageRating', 'subtitle' on a Destination object).
- If you use 'averageRating' in an API response, MAP it to 'rating' before passing to DestinationCard.

STRING LITERAL SAFETY:
- NEVER use a bare backslash (\) inside a string literal in JSX/TSX. Use escape sequences or template literals.
- NEVER use invalid characters in object property values or JSX attributes.

PLACEHOLDER IMAGE PATH — CRITICAL:
- ALWAYS use '/placeholder.png' (served from /public/placeholder.png).
- NEVER write '/public/placeholder.png' — Next.js serves /public as root, so the path is '/placeholder.png'.

COMPONENT RESPONSIBILITIES & MODULARITY:
- DEFENSIVE PROP PASSING: Lift state to page level, pass required props with realistic sample data.
- PROP CONSISTENCY: Match props exactly to what was likely generated (e.g., 'isAuthenticated' vs 'isLoggedIn').
- PROP CONTRACTS: When passing props to a child component, ensure you pass ALL required properties that the child component expects, and DO NOT pass props that the child does not define.
- DATA MODEL ACCURACY: Ensure data objects passed to components match the expected TypeScript interfaces (e.g., do not omit 'id' or 'category' if the component strictly requires it).
- COMPONENT MODULARITY: Available Components should be treated as modular units. Avoid double-wrapping components in unnecessary Cards or Containers.
- Maintain logical UI order and spacing with Tailwind CSS.
- INPUT VISIBILITY: All <input> or <textarea> elements MUST explicitly set a dark text color class (e.g., className="... text-gray-900").
- AUTH PERSISTENCE: Every page that handles login/signup MUST use localStorage.setItem('isLoggedIn', 'true') upon success.

DATA FETCHING & WEBCONTAINER SAFETY — CRITICAL:
- When generating frontend prototypes, DO NOT use 'fetch' with 'process.env.NEXT_PUBLIC_BASE_URL' in Server Components.
- WebContainers often lack these environment variables, causing 'Failed to parse URL from undefined/api/...' crashes.
- INSTEAD: Define static mock data arrays directly inside the page components (e.g., const popularDestinations = [...]) to ensure the prototype runs reliably.

PLACEHOLDER IMAGE RULES — CRITICAL:
- ALWAYS use '/placeholder.png' — Next.js serves /public as the root, so the correct path is '/placeholder.png'.
- NEVER write '/public/placeholder.png' — this path will 404 at runtime.
- NEVER generate external placeholder image services (no placehold.co, no dummyimage.com, etc.).
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

  promptParts.push("COMPONENT SOURCE CODE (READ PROP INTERFACES BEFORE USING):\n" + JSON.stringify(components, null, 2));

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