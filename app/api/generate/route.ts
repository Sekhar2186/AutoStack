import path from "path";
import fs from "fs";
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

        // Version system
        const { projectId, projectPath, version, previousPath } =
            await versionManager(existingProjectId);

        // AI planning
        const blueprint = await plannerAgent(prompt, previousPath);

        // Multi-agent generation
        const components = await componentAgent(blueprint, previousPath);
        let routes = {};

        if (blueprint?.requiresAPI) {
            try {
                routes = await routeAgent(blueprint, previousPath);
            } catch (e) {
                console.error("RouteAgent failed:", e);
                routes = {};
            }
        }
        // const routes = await routeAgent(blueprint);
        const frontendPages = blueprint.frontendPages || [{ name: "HomePage", route: "/" }];
        const generatedPages: Record<string, string> = {};

        for (const p of frontendPages) {
            let previousPageCode = null;

            if (previousPath) {
                const prevPagePath = path.join(previousPath, "app", "page.tsx");

                if (fs.existsSync(prevPagePath)) {
                    previousPageCode = fs.readFileSync(prevPagePath, "utf-8");
                }
            }
            const pageCode = await pageAgent({
                blueprint,
                components: components || {},
                pageName: p.name,
                pageRoute: p.route,
                previousPath: previousPath
            });

            let routePath = p.route.replace(/^\//, ''); // Remove leading slash
            routePath = routePath === "" ? "page.tsx" : `${routePath}/page.tsx`;
            generatedPages[routePath] = pageCode;
        }

        // Merge outputs
        const code = {
            components: components || {},
            routes: routes || {},
            pages: generatedPages
        };

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