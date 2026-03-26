import { plannerAgent } from "@/lib/agents/plannerAgent";

import { versionManager } from "@/lib/services/versionManager";
import { templateLoader } from "@/lib/services/templateLoader";

import { codeInjector } from "@/lib/services/codeInjector";
import { zipProject } from "@/lib/services/zipProject";
import { runProject } from "@/lib/services/serverRunner";

import { componentAgent } from "@/lib/agents/componentAgent";
import { routeAgent } from "@/lib/agents/routeAgent";
import { pageAgent } from "@/lib/agents/pageAgent";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const prompt = body.prompt;

        const existingProjectId = body.projectId;
        const templateType = body.template || "modern-ui";

        // AI planning
        const blueprint = await plannerAgent(prompt);

        // Multi-agent generation
        const components = await componentAgent(blueprint);
        const routes = await routeAgent(blueprint);
        const page = await pageAgent({
            blueprint,
            components: components.components
        });

        // Merge outputs
        const code = {
            components: components || {},
            routes: routes || {},
            page: page
        };

        // Version system
        const { projectId, projectPath, version } =
            await versionManager(existingProjectId);

        // Load template (v1 only)
        if (version === "v1") {
            await templateLoader(projectPath, templateType);
        }

        // Inject generated code
        await codeInjector(projectPath, code);

        // Zip + preview
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