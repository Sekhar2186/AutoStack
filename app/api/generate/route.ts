import path from "path";
import fs from "fs";

import { plannerAgent } from "@/lib/agents/plannerAgent";
import { componentAgent } from "@/lib/agents/componentAgent";
import { routeAgent } from "@/lib/agents/routeAgent";
import { pageAgent } from "@/lib/agents/pageAgent";
import { generatePDF } from "@/lib/agents/docAgent";

import { versionManager } from "@/lib/services/versionManager";
import { templateLoader } from "@/lib/services/templateLoader";

import { codeInjector } from "@/lib/services/codeInjector";
import { zipProject } from "@/lib/services/zipProject";
import { runProject } from "@/lib/services/serverRunner";

import { verifyToken } from "@/lib/middleware/auth";
import {
    getUsers,
    saveUsers,
    resetDailyCredits,
    updateUserPlan
} from "@/lib/services/userService";

export async function POST(req: Request) {
    try {
        const user = verifyToken(req);

        // STEP 1: Guest handling
        if (!user) {
            if (!globalThis.guestCredits) {
                globalThis.guestCredits = {
                    count: 5,
                    lastReset: new Date().toDateString()
                };
            }

            const today = new Date().toDateString();

            if (globalThis.guestCredits.lastReset !== today) {
                globalThis.guestCredits.count = 5;
                globalThis.guestCredits.lastReset = today;
            }

            if (globalThis.guestCredits.count <= 0) {
                return Response.json({
                    success: false,
                    message: "Guest limit reached. Please login."
                });
            }

            globalThis.guestCredits.count -= 1;
        }

        // STEP 2: User handling
        let currentUser: any = null;
        let users: any[] = [];

        if (user) {
            users = getUsers();
            currentUser = users.find((u: any) => u.id === user.id);

            if (!currentUser) {
                return Response.json({
                    success: false,
                    message: "User not found"
                });
            }

            // Trial expiry logic
            updateUserPlan(currentUser);

            // Daily reset
            resetDailyCredits(currentUser);

            // Credit check
            if (currentUser.plan !== "pro_plus" && currentUser.credits <= 0) {
                return Response.json({
                    success: false,
                    message: "Daily limit reached. Upgrade your plan."
                });
            }

            // Deduct credit (except unlimited)
            if (currentUser.plan !== "pro_plus") {
                currentUser.credits -= 1;
            }

            saveUsers(users);
        }

        // STEP 3: Request body
        const body = await req.json();

        const prompt = body.prompt;

        const existingProjectId = body.projectId;
        const templateType = body.template || "modern-ui";

        // STEP 4: Version system
        const { projectId, projectPath, version, previousPath } =
            await versionManager(existingProjectId);

        // STEP 5: AI planning
        const blueprint = await plannerAgent(prompt, previousPath);

        // STEP 6: Components
        let components = {};
        try {
            components = await componentAgent(blueprint, previousPath);
        } catch (e) {
            console.error("ComponentAgent failed:", e);
            components = {};
        }

        // STEP 7: Routes
        let routes = {};

        if (blueprint?.requiresAPI) {
            try {
                routes = await routeAgent(blueprint, previousPath);
            } catch (e) {
                console.error("RouteAgent failed:", e);
                routes = {};
            }
        }

        // STEP 8: Pages
        const frontendPages =
            blueprint.frontendPages || [{ name: "HomePage", route: "/" }];

        const generatedPages: Record<string, string> = {};

        for (const p of frontendPages) {
            let routePath = p.route.replace(/^\//, "");
            routePath = routePath === "" ? "page.tsx" : `${routePath}/page.tsx`;

            let previousPageCode = null;

            if (previousPath) {
                const prevPagePath = path.join(previousPath, "app", routePath);
                if (fs.existsSync(prevPagePath)) {
                    previousPageCode = fs.readFileSync(prevPagePath, "utf-8");
                }
            }

            const pageCode = await pageAgent({
                blueprint,
                components: components || {},
                pageName: p.name,
                pageRoute: p.route,
                previousPath,
                previousPageCode
            });


            generatedPages[routePath] = pageCode;
        }

        // STEP 9: Merge code
        const code = {
            components: components || {},
            routes: routes || {},
            pages: generatedPages
        };

        // STEP 10: Template (only first version)
        if (version === "v1") {
            await templateLoader(projectPath, templateType);
        }

        // STEP 11: Inject code
        await codeInjector(projectPath, code);

        // STEP 12: PDF
        const pdfPath = await generatePDF(
            {
                projectId,
                version,
                prompt,
                template: templateType,
                ui: body.ui || null,
                components: Object.keys(components || {}),
                pages: Object.keys(generatedPages || {})
            },
            projectPath
        );

        // STEP 13: ZIP + PREVIEW
        const zipPath = await zipProject(projectPath);
        const previewLink = runProject(projectPath);

        // FINAL RESPONSE
        return Response.json({
            success: true,
            projectId,
            version,
            blueprint,
            zipPath,
            pdfPath,
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