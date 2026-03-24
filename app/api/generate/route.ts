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

        const existingProjectId = body.projectId;
        const templateType = body.template || "modern-ui";

        //AI
        const blueprint = await plannerAgent(prompt);
        const code = await coderAgent(blueprint);

        //Version Management
        const { projectId, projectPath, version } = await versionManager(existingProjectId);

        //Only load template v1
        if (version === "v1") {
            await templateLoader(projectPath, templateType);
        }

        //Inject code Safely
        await codeInjector(projectPath, code);


        //Zip + Run
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