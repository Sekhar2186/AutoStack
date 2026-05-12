import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

export async function plannerAgent(userQuery: string, previousPath?: string) {

  const Instruction = `
You are a senior software engineer and architecture planner.

Your task is to take a user query and generate a detailed software architecture plan.

The output must be valid JSON. Use EXACTLY this format:
{
  "appName": "string",
  "frontendPages": [
    { "name": "HomePage", "route": "/", "interactions": ["search", "filter"] },
    { "name": "AboutPage", "route": "/about" }
  ],
  "frontendComponents": ["component1", "component2"],
  "backendRoutes": ["route1", "route2"],
  "databaseModels": ["model1", "model2"],
  "features": ["feature1", "feature2"],
  "interactionNotes": "High level notes on how components should interact"
}

PLANNING RULES:
- Return only JSON. No explanations. No markdown.
- Components should be simple names (e.g., "Navbar", "ProductCard", "FilterPanel").
- CRITICAL ROUTING: Every component that implies a page view MUST have a corresponding entry in frontendPages.
- CRITICAL COMPLETENESS: Provide a COMPLETE list of frontendPages and frontendComponents.
  - If the app needs Dashboard, Login, Signup, Settings — list ALL of them.
  - Do not skip essential pages.
- If existing project context is provided, maintain architectural consistency.

FEATURE PLANNING GUARDRAILS — these prevent common bugs in generated code:

SVG SAFETY:
- In interactionNotes, add: "Use emoji or lucide-react icons for all icons. Never use SVG path elements with long d attributes."

LAYOUT SAFETY:
- In interactionNotes, add: "layout.tsx must have a plain bg-gray-50 or bg-white body. No gradient backgrounds in layout."

CART/STATE PERSISTENCE:
- If the app has a cart, wishlist, or saved items feature, add to features:
  "localStorage-backed cart with lib/cart.ts utility (getCart, saveCart, addToCart)"
- Add to interactionNotes: "Cart page reads from localStorage on mount. Add to Cart persists to localStorage and dispatches cart-updated event. Navbar shows real cart count via useEffect."

AUTHENTICATION FLOW:
- If the app has login/register, add to interactionNotes:
  "Login and Register forms MUST use router.push() from next/navigation to redirect to dashboard after submission."

LINK COMPONENT SAFETY:
- In interactionNotes, add: "Always import Link from 'next/link'. Never use legacyBehavior or nested <a> tags inside <Link>."

PAGINATION:
- If any page has lists or grids with potentially many items, add to features: "Client-side pagination for list pages"
- Add to interactionNotes: "Paginated lists use currentPage state, not hardcoded page 1."

MISSING PAGE PREVENTION:
- Every sidebar link, navbar link, and quick-action button MUST correspond to a route in frontendPages.
- If the app is a store, you MUST include: Home (/), Products (/products), Product Detail (/products/:id), Cart (/cart), Checkout (/checkout), Login (/login), Signup (/signup), Profile (/profile), Orders (/orders).
- If the app is a Dashboard SaaS, you MUST include: Dashboard (/dashboard), Profile (/profile), Settings (/settings), Login (/login), Signup (/signup).
- If the app is a food delivery app, you MUST include: Home (/), Restaurants (/restaurants), Restaurant Detail (/restaurants/:id), Cart (/cart), Checkout (/checkout), Orders (/orders), Login (/login), Signup (/signup), Profile (/profile).
- NEVER skip the detail pages (e.g., /restaurants/:id) if you include a list page (e.g., /restaurants).
- If the sidebar has 10 links, there must be 10 pages. Incomplete pages show as 404s.

COMPONENT-TO-PAGE ARCHITECTURE RULE — CRITICAL:

- EVERY interactive UI entity represented by a reusable component MUST have a corresponding page route.

- If a component represents:
  - a card
  - a list item
  - a preview item
  - a tile
  - a profile
  - a product
  - a service
  - a dashboard module
  - a project item
  - a task item
  - a user entity
  - a document
  - a post
  - a media item
  - or ANY clickable/detail-based entity

  THEN a dedicated detail page MUST exist in frontendPages.

GENERAL RULES:
- Components ending with:
  - Card
  - Item
  - Tile
  - Preview
  - Profile
  - Row
  - Box
  - Panel
  - Widget

  SHOULD automatically generate detail pages.

DETAIL PAGE PATTERN:
- Use dynamic routes:
  - /entity/:id
  - /entity/[id]
  depending on framework style.

EXAMPLES:
- ProductCard → ProductDetailPage → /products/:id
- CourseCard → CourseDetailPage → /courses/:id
- EmployeeCard → EmployeeDetailPage → /employees/:id
- ProjectCard → ProjectDetailPage → /projects/:id
- TaskItem → TaskDetailPage → /tasks/:id
- VideoPreview → VideoPage → /videos/:id
- ChatRoomCard → ChatRoomPage → /chat/:id

AUTH RULES:
- If authentication-related components exist:
  - AuthForm
  - LoginForm
  - SignupForm
  - RegisterForm

  THEN create:
  - /login
  - /signup
  - /forgot-password (optional)

DASHBOARD RULE:
- If DashboardSidebar or DashboardLayout exists:
  MUST create:
  - /dashboard

SETTINGS RULE:
- If SettingsPanel or SettingsForm exists:
  MUST create:
  - /settings

CRUD RULE:
- If entity management exists:
  MUST generate:
  - Create Page
  - Edit Page
  - Detail Page
  - List Page

PAGE-COMPONENT LINK RULE:
- EVERY generated component MUST be used by at least one page.
- NO unused/dead components allowed.
- NO orphan routes allowed.
- NO frontend component should exist without navigation flow.

NAVIGATION RULE:
- All pages must be reachable from:
  - navbar
  - sidebar
  - dashboard
  - cards
  - buttons
  - menus
  - or routing actions.

APPLICATION FLOW RULE:
- Planner must think like a real production SaaS architecture.
- Generate complete navigation flow, not isolated pages.
- Every app must feel fully connected and navigable.
  `;

  let promptParts = Instruction + "\n\nUser request: " + userQuery;

  if (previousPath) {
    promptParts += `\n\nExisting project is located at: ${previousPath}. Please maintain architectural consistency.`;
  }

  const text = await generateAI("gemini", [promptParts]);

  try {
    return safeJsonParse(text);
  } catch (error) {
    console.error("JSON parse failed in plannerAgent. Raw text snippet:", text.slice(0, 200));
    throw error;
  }
}
