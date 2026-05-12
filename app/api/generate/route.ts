import path from "path";
import fs from "fs";

import { plannerAgent } from "@/lib/agents/plannerAgent";
import { componentAgent } from "@/lib/agents/componentAgent";
import { routeAgent } from "@/lib/agents/routeAgent";
import { pageAgent } from "@/lib/agents/pageAgent";
import { docAgent } from "@/lib/agents/docAgent";
import { generatePDF } from "@/lib/services/generatePDF";

import { versionManager } from "@/lib/services/versionManager";
import { templateLoader } from "@/lib/services/templateLoader";

import { codeInjector } from "@/lib/services/codeInjector";
import { zipProject } from "@/lib/services/zipProject";
//import { runProject } from "@/lib/services/serverRunner";
import { startPreview } from "@/lib/services/previewManager";

import { verifyToken } from "@/lib/middleware/auth";
import pLimit from "p-limit";
/*import {
    getUsers,
    saveUsers,
    resetDailyCredits,
    updateUserPlan
} from "@/lib/services/userService";*/

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

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

        if (user) {
            await connectDB();
            currentUser = await User.findById(user.id);

            if (!currentUser) {
                return Response.json({
                    success: false,
                    message: "User not found"
                });
            }

            // Daily reset logic
            const now = new Date();
            const last = new Date(currentUser.lastReset);
            const isNewDay = now.getDate() !== last.getDate() || now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();

            if (isNewDay) {
                if (currentUser.plan === "pro") currentUser.credits = 500;
                else if (currentUser.plan === "free") currentUser.credits = 20;
                currentUser.lastReset = now;
            }

            // Credit check
            if (currentUser.plan !== "pro_plus" && currentUser.credits <= 0) {
                return Response.json({
                    success: false,
                    message: "Daily limit reached. Upgrade your plan."
                });
            }

            // Deduct credit
            if (currentUser.plan !== "pro_plus") {
                currentUser.credits -= 1;
            }

            await currentUser.save();
        }

        // STEP 3: Request body
        const body = await req.json();

        const prompt = body.prompt;

        const existingProjectId = body.projectId;
        const templateType = body.template || "modern-ui";

        // STEP 4: Version system
        const { projectId, projectPath, version, previousPath } =
            await versionManager(existingProjectId, currentUser);

        // STEP 5: AI planning
        const blueprint = await plannerAgent(prompt, previousPath);

        // Save new project to user history
        if (currentUser && version === "v1" && !existingProjectId) {
            currentUser.projects.unshift({
                projectId,
                appName: blueprint?.appName || "Untitled Project",
                description: blueprint?.description || prompt.substring(0, 100) + "...",
                createdAt: new Date()
            });
            await currentUser.save();
        }

        // STEP 6 & 7: Components and Routes (parallel)
        let components = {};
        let routes = {};

        const parallelTasks = [];

        parallelTasks.push(
            componentAgent(blueprint, previousPath)
                .then(res => { components = res; })
                .catch(e => {
                    console.error("ComponentAgent failed:", e);
                    components = {};
                })
        );

        if (blueprint?.requiresAPI) {
            parallelTasks.push(
                routeAgent(blueprint, previousPath)
                    .then(res => { routes = res; })
                    .catch(e => {
                        console.error("RouteAgent failed:", e);
                        routes = {};
                    })
            );
        }

        await Promise.all(parallelTasks);

        // STEP 8: Pages (sequential)
        const frontendPages =
            blueprint.frontendPages || [{ name: "HomePage", route: "/" }];

        const generatedPages: Record<string, string> = {};
        console.log(`[Generate] Starting parallel generation for ${frontendPages.length} pages...`);

        const limit = pLimit(2);

        //const sleep = (ms: number) =>
        // new Promise(resolve => setTimeout(resolve, ms));

        await Promise.all(
            frontendPages.map((p: any) =>
                limit(async () => {

                    console.log(`[PageAgent] Generating ${p.name}`);

                    //await sleep(3000);

                    let routePath = p.route.replace(/^\//, "");
                    routePath = routePath.replace(/:([^\/]+)/g, "[$1]");
                    routePath =
                        routePath === ""
                            ? "page.tsx"
                            : `${routePath}/page.tsx`;

                    let previousPageCode = null;

                    if (previousPath) {
                        const prevPagePath = path.join(
                            previousPath,
                            "app",
                            routePath
                        );

                        if (fs.existsSync(prevPagePath)) {
                            previousPageCode =
                                fs.readFileSync(prevPagePath, "utf-8");
                        }
                    }

                    const uiPrompt = body.ui || "";

                    try {
                        const pageCode = await pageAgent({
                            blueprint,
                            components: components || {},
                            pageName: p.name,
                            pageRoute: p.route,
                            previousPath,
                            previousPageCode,
                            uiPrompt
                        });

                        generatedPages[routePath] = pageCode;

                        console.log(`[PageAgent] Finished ${p.name}`);

                    } catch (e) {

                        console.error(
                            `PageAgent failed for ${p.name} (${p.route}):`,
                            e
                        );

                        generatedPages[routePath] =
                            `// Failed to generate ${p.name}`;

                    }
                })
            )
        );
        // STEP 8.5: Generate AI docs
        let docs = {};
        try {
            docs = await docAgent({
                prompt,
                blueprint,
                projectId,
                version,
                components: Object.keys(components || {}),
                pages: Object.keys(generatedPages || {}),
                routes: Object.keys(routes || {}),
                ui: body.ui || "",
                template: templateType,
                model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini"
            });
        } catch (e) {
            console.error("Doc generation failed:", e);
            docs = {};
        }

        // STEP 9: Merge code
        const code = {
            components: components || {},
            routes: routes || {},
            pages: generatedPages,
            docs: docs || {}
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
                docs,
                blueprint,
                components: Object.keys(components || {}),
                pages: Object.keys(generatedPages || {}),
                routes: Object.keys(routes || {})
            },
            projectPath
        );

        // STEP 13: ZIP + PREVIEW
        const zipPath = await zipProject(projectPath);
        //const previewLink = runProject(projectPath);
        const { previewLink, port } =
            await startPreview(projectId, projectPath);

        // FINAL RESPONSE
        return Response.json({
            success: true,
            projectId,
            version,
            blueprint,
            zipPath,
            pdfPath,
            previewLink,
            port
        });

    } catch (error) {
        console.error(error);

        return Response.json({
            success: false,
            message: "Failed to generate project"
        });
    }
}