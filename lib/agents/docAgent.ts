import { generateAI } from "../services/ai/modelRouter";

export async function docAgent(data: any) {

    const prompt = `
You are an expert software architect and technical documentation writer.

Analyze the generated AI project deeply and generate professional markdown documentation.

IMPORTANT:
- DO NOT use placeholders
- DO NOT write generic summaries
- Analyze the actual project idea
- Understand the user prompt
- Explain generated features
- Explain generated architecture
- Explain generated components and pages
- Explain project workflow
- Explain future improvements
- Explain limitations
- Write realistic technical documentation

Generate:

1. README.md
2. PROJECT_REPORT.md
3. ARCHITECTURE.md
4. TODO.md

The documentation should include:

- Project title
- User prompt analysis
- Project objective
- Features generated
- Pages generated
- Components generated
- Architecture explanation
- AI agent pipeline
- Folder structure
- Tech stack
- Workflow
- Limitations
- Future scope
- Version information
- Summary of generated application
- Estimated development time saved

Return ONLY valid JSON.

FORMAT:
{
  "README.md": "...",
  "PROJECT_REPORT.md": "...",
  "ARCHITECTURE.md": "...",
  "TODO.md": "...",
  "docs.json": "{\"summary\": \"...\", \"architecture\": \"...\", \"features\": [\"...\", \"...\"]}"
}

PROJECT DATA:
${JSON.stringify(data, null, 2)}
`;

    const raw = await generateAI("gemini", [prompt], {
        responseMimeType: "application/json",
    });

    const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON parse failed in docAgent. Raw text snippet:", raw.slice(0, 200));
        throw e;
    }
}
