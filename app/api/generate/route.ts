import { plannerAgent } from "@/lib/agents/plannerAgent";
import { coderAgent } from "@/lib/agents/coderAgent";
import { projectBuilder } from "@/lib/services/projectBuilder";
import { zipProject } from "@/lib/services/zipProject";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = body.prompt;

        const blueprint = await plannerAgent(prompt);
        const code = await coderAgent(blueprint);
        const projectPath = await projectBuilder(code.files);
        const zipPath = await zipProject(projectPath);

        return Response.json({
            success: true,
            blueprint: blueprint,
            code: code,
            projectPath: projectPath,
            zipPath: zipPath
        });
    }
    catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Failed to generate blueprint"
        });
    }
}