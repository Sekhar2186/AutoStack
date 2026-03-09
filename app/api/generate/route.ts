import { plannerAgent } from "@/lib/agents/plannerAgent";
import { coderAgent } from "@/lib/agents/coderAgent";
import { projectBuilder } from "@/lib/services/projectBuilder";
import { zipProject } from "@/lib/services/zipProject";
import { runProject } from "@/lib/services/serverRunner";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = body.prompt;

        const blueprint = await plannerAgent(prompt);
        const code = await coderAgent(blueprint);
        const projectPath = await projectBuilder(code.files);
        const zipPath = await zipProject(projectPath);
        const previewLink = await runProject(projectPath);

        return Response.json({
            success: true,
            blueprint: blueprint,
            code: code,
            projectPath: projectPath,
            zipPath: zipPath,
            previewLink: previewLink
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