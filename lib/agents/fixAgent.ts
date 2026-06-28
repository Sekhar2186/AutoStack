import { generateAI } from "../services/ai/modelRouter";

export async function fixAgent(data: {
    fileName: string;
    fileCode: string;
    issues: string[];
}): Promise<string> {
    const { fileName, fileCode, issues } = data;

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
6. If the issue is related to external placeholder images, replace them with '/public/placeholder.png' or a Tailwind CSS div placeholder.

RETURN FORMAT:
Return ONLY the raw, fixed source code. DO NOT wrap the code in markdown blocks (e.g., \`\`\`tsx). DO NOT include any explanations. The string you return will be written directly to the file.
`;

    const promptParts = [
        instruction,
        "ORIGINAL FILE CODE:\n" + fileCode
    ];

    try {
        const text = await generateAI("gemini", promptParts);

        // Clean markdown blocks if the model accidentally included them
        const cleaned = text
            .replace(/^```[a-z]*\n?/gm, "")
            .replace(/```$/gm, "")
            .trim();

        return cleaned;
    } catch (error) {
        console.error(`FixAgent failed for ${fileName}:`, error);
        // Fallback to original code if fix fails
        return fileCode;
    }
}
