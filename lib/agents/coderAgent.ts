import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "@/lib/services/ai/modelRouter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function coderAgent(blueprint: any) {
  const model = genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
  });

  const instruction = `
You are a professional full-stack developer.

Generate a full-stack web app using Next.js App Router.

STRICT RULES:
- Use TypeScript (.ts / .tsx)
- Use Next.js App Router (app folder)
- API routes must be inside: app/api/<route>/route.ts
- Use NextRequest and NextResponse
- Components must be React functional components.
- ALWAYS use 'export default function ComponentName' for components.
- ADD '"use client";' to any component using hooks or interactivity.
- Use @/ path alias imports (e.g., import X from "@/components/X").
- CRITICAL: If you use the <Link> component, YOU MUST import it from 'next/link' (e.g., import Link from 'next/link').
- NEVER use the 'legacyBehavior' prop on <Link>.
- NEVER wrap an <a> tag inside <Link>. Apply all classNames and styles directly to the <Link> component.
- Follow existing template structure.
- DO NOT override layout.tsx.
- Only modify components and logic.
- Use Tailwind CSS only.
- Ensure responsive design.

IMPORTANT:
- STRICTLY follow the USER REQUEST.
- DO NOT generate generic apps.
- DO NOT generate Todo apps unless explicitly asked.
- Generate components relevant to the request (portfolio, dashboard, blog, etc.).
- DO NOT escape single quotes like \\'
- Do NOT wrap your output in markdown code blocks (no \`\`\`json).
- RETURN STRICT VALID JSON ONLY. No conversational text.

SVG RULES — CRITICAL — BREAKING BUG IF VIOLATED:
- NEVER generate SVG <path d="..."> attributes longer than 200 characters.
- The AI has a known bug of generating infinitely long corrupted SVG path strings that crash JSX compilation.
- Use emoji (🛍️ 📊 ✅ 👥 📁 🔔) or lucide-react icons (import from 'lucide-react') instead of inline SVG.
- If you must use SVG, keep d attribute short: d="M5 12h14" is fine, d="M17 20h5v-2a3 3 0 00..." is the maximum complexity.
- Corrupt SVG causes: "JSX element has no corresponding closing tag" — a fatal build error.

LAYOUT RULES — CRITICAL:
- layout.tsx body className MUST be "bg-gray-50 min-h-screen" or "bg-white min-h-screen".
- NEVER add gradient or colored backgrounds to layout.tsx (bg-purple-500, bg-linear-to-br, etc.).
- Gradient backgrounds in layout break ALL page styles. Put them in page.tsx instead.
- Always add SEO metadata: export const metadata = { title: "...", description: "..." }

STATE MANAGEMENT — CART/WISHLIST/ORDERS:
- NEVER use a hardcoded static array (e.g., initialCart = [...]) for cart or persistent data.
- For cart, wishlist, or order lists: create lib/cart.ts with localStorage-backed getCart()/saveCart()/addToCart().
- Cart page reads from localStorage on mount (useEffect). Never from a hardcoded variable.
- "Add to Cart" buttons must persist to localStorage + dispatch window event 'cart-updated'.
- Navbar/header cart count badge must use useEffect + event listener for live count updates.

MISSING PAGE RULES:
- Every route defined in frontendPages MUST have a corresponding page.tsx file.
- If the app has /dashboard, /profile, /settings — generate ALL of them, not just /home.
- A page with only a layout and no content will show as blank — unacceptable.

PAGINATION RULES:
- List pages with more than 8 items MUST implement client-side pagination.
- Pagination controls must be wired to actual currentPage state.

EXTERNAL LIBRARY RULES:
- ONLY import libraries that are standard in the project: 'lucide-react', 'framer-motion', 'react-icons', 'next', 'react'.
- NEVER import 'recharts', 'chart.js', 'axios', 'date-fns', or other 3rd party libraries unless explicitly requested.
- If you need a chart, build a simple CSS/SVG chart or check if the user specifically asked for a library.
- Importing uninstalled libraries will crash the app.

RETURN ONLY JSON:

{
  "routes": {
    "routeName.ts": "Next.js API route code"
  },
  "components": {
    "ComponentName.tsx": "React component code"
  },
  "imports": "import statements for page.tsx",
  "injection": "JSX to render inside page.tsx"
}
  `;

  const response = await generateAI("gemini", [
    instruction,
    "USER REQUEST: " + (blueprint?.appName || ""),
    JSON.stringify(blueprint),
  ]);

  try {
    return safeJsonParse(response);
  } catch (err) {
    console.error("JSON parse failed in coderAgent. Raw text snippet:", response.slice(0, 200));
    throw err;
  }
}
