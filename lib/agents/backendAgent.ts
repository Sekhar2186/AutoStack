import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

export async function backendAgent(blueprint: any, previousPath?: string) {
  const instruction = `
You are a senior backend engineer.

Your task is to generate a fully functional, local storage-based backend for the given app entities.
The architecture MUST follow these strict layering rules:
Page -> API Routes -> Storage -> Data

1. Data Layer (data/<entity>.ts): Export a mock array of items.
2. Storage Layer (lib/storage/storage.ts & lib/storage/<entity>.ts): Implement CRUD operations that mutate the Data array.
3. API Routes (app/api/<entity>/route.ts & app/api/<entity>/[id]/route.ts): Handle GET, POST, PUT, DELETE by calling the Storage layer. NEVER access the Data arrays directly from API routes.
4. Types (types/<entity>.ts): Define TypeScript interfaces for the entities. Shared across all layers.
5. Validators (lib/validators/<entity>.ts): Simple validation functions used by the API routes before calling Storage.

STRICT RULES:
- Do NOT use MongoDB, Supabase, Prisma, or any external database.
- Do NOT use localStorage().
- Do NOT hardcode fake API routes that only return success messages. API routes MUST use the Storage layer and perform actual CRUD.
- All code MUST be TypeScript.
- Escape all quotes properly for JSON serialization.
- NO PLACEHOLDERS: Generate complete logic.
- Use NextRequest and NextResponse for API routes.

Output format MUST be valid JSON mapping file paths to their content:

{
  "types/product.ts": "...",
  "data/products.ts": "...",
  "lib/storage/storage.ts": "export interface StorageAdapter<T> { ... }",
  "lib/storage/products.ts": "...",
  "lib/validators/products.ts": "...",
  "app/api/products/route.ts": "...",
  "app/api/products/[id]/route.ts": "..."
}
`;

  let promptParts = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\nBLUEPRINT:\n" + JSON.stringify(blueprint);

  if (previousPath) {
    promptParts += `\n\nExisting project is at: ${previousPath}. Ensure backend structure remains consistent.`;
  }

  const raw = await generateAI({
    provider: "gemini",
    prompt: [promptParts],
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return safeJsonParse(raw);
  } catch (err) {
    console.error("JSON parse failed in backendAgent. Raw text snippet:", raw.slice(0, 200));
    throw err;
  }
}
