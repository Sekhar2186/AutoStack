import { generateAI } from "../services/ai/modelRouter";
import { safeJsonParse } from "@/lib/utils/jsonUtils";

export async function fixAgent(data: {
    fileName: string;
    fileCode: string;
    issues: string[];
    userId?: string;
}): Promise<string> {
    const { fileName, fileCode, issues, userId } = data;

    const instruction = `
You are an expert Next.js developer acting as an automated code fixer.
You have been provided with a file that failed static validation.

FILE PATH: ${fileName}

VALIDATION ISSUES:
${issues.map(issue => `- ${issue}`).join("\n")}

YOUR MISSION:
1. Fix all the validation issues listed above.
2. DO NOT rewrite unrelated code. Preserve the existing design, layout, styling, and logic.
3. If the issue is related to "use client" and params in a Next.js 15 App Router page:
   - For a Client Component, remove 'params' from the component props and use 'useParams()' from 'next/navigation'.
   - Or if the component doesn't need to be a Client Component, remove '"use client"' and make it a Server Component.
4. If the issue is related to nested Links or anchors, refactor the HTML so that only one element handles the navigation (usually the outer <Link>).
5. If the issue is related to missing imports, either remove the unused component or fix the import path if it's obvious.
6. If the issue is related to external placeholder images, replace them with '/placeholder.png' (NOT '/public/placeholder.png') or a Tailwind CSS div placeholder.
7. COMPONENT PROP MISMATCH FIXES — apply these known corrections:
   - HeroSection: accepted props are { title, description, imageUrl, buttonText?, buttonLink? }.
     * Rename 'subtitle' → 'description'.
     * Rename 'backgroundImage' → 'imageUrl'.
     * Rename 'ctaText' → 'buttonText', 'ctaLink' → 'buttonLink'.
     * Remove 'children' prop. Move any child content (e.g., SearchInput, forms) OUTSIDE the HeroSection tag.
   - SectionHeader: accepted props are { title, description? }.
     * Rename 'subtitle' → 'description'.
   - SearchInput: accepted props are { placeholder?, onSearch? }.
     * Remove props: name, className, buttonText, value, onChange.
     * If a search form is needed, wrap <SearchInput> in a <form> element instead of passing 'name' or 'buttonText'.
   - DestinationCard: accepted props are { destination: Destination, onClick? }.
     * Replace flat props (name, location, imageUrl, id, etc.) with a single destination={{id, name, location, imageUrl, description, category}} object.
     * If wrapping DestinationCard in a <Link>, REMOVE the outer <Link> — DestinationCard handles its own navigation internally.
10. SERVER TO CLIENT EVENT HANDLERS: If the error is 'Event handlers cannot be passed to Client Component props', REMOVE the offending inline function prop (like onSearch={...} or onClick={...}) from the component invocation in the Server Component.
11. WEBCONTAINER FETCH CRASH: If the error is 'Failed to parse URL from undefined/api...', REPLACE the entire 'fetch(process.env.NEXT_PUBLIC_BASE_URL...)' block with a static mock data array definition. Do not attempt to use absolute URLs for fetching in Server Components.
12. ORPHANED CODE / PARSING ERRORS: If you see 'Return statement is not allowed here' or 'Parsing ecmascript source code failed', look for orphaned code (like an extra return statement after a function already returned) or mismatched braces, and delete the invalid leftover code.

RETURN FORMAT:
- CRITICAL: Return ONLY a valid JSON object. No markdown. No conversational text.
- Use EXACTLY this JSON schema:
{
  "code": "full fixed source code here"
}
`;

    const promptParts = [
        instruction,
        "ORIGINAL FILE CODE:\n" + fileCode
    ];

    try {
        const result = await generateAI({
            provider: "gemini",
            prompt: promptParts,
            config: {
                responseMimeType: "application/json",
            },
            userId
        });

        const parsed = safeJsonParse(result.text);
        return parsed.code;
    } catch (error) {
        console.error(`FixAgent failed for ${fileName}:`, error);
        // Fallback to original code if fix fails
        return fileCode;
    }
}
