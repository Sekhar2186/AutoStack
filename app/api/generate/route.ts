import { plannerAgent } from "@/lib/agents/plannerAgent";
import { coderAgent } from "@/lib/agents/coderAgent";
import { versionManager } from "@/lib/services/versionManager";
import { templateLoader } from "@/lib/services/templateLoader";
import { codeInjector } from "@/lib/services/codeInjector";
import { zipProject } from "@/lib/services/zipProject";
import { runProject } from "@/lib/services/serverRunner";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = body.prompt;

        const blueprint = await plannerAgent(prompt);
        const code = await coderAgent(blueprint);

        const templateType = body.template || "modern-ui";

        const { projectId, projectPath, version } = await versionManager();

        if (version === "v1") {
            await templateLoader(projectPath, templateType);
        }

        await codeInjector(projectPath, code);

        const zipPath = await zipProject(projectPath);
        const previewLink = runProject(projectPath);

        return Response.json({
            success: true,
            projectId,
            version,
            blueprint,
            zipPath,
            previewLink
        });

    } catch (error) {
        console.error(error);

        return Response.json({
            success: false,
            message: "Failed to generate project"
        });
    }
}