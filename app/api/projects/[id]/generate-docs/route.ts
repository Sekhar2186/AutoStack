import { docAgent } from "@/lib/agents/docAgent";
import { generatePDF } from "@/lib/services/generatePDF";
import { connectDB } from "@/lib/db/connect";
import { Project } from "@/lib/db/models/ProjectFiles";
import { verifyToken } from "@/lib/middleware/auth";
import os from "os";
import fs from "fs";
import path from "path";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = verifyToken(req);
        if (!user) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;
        const body = await req.json();
        const version = body.version || "v1";

        await connectDB();
        const project = await Project.findOne({ projectId, version });

        if (!project) {
            return Response.json({ success: false, message: "Project not found" }, { status: 404 });
        }

        // Reconstruct necessary data for docs generation
        const blueprint = project.blueprint || {};
        const files = project.files || {};
        const appName = blueprint.appName || "Generated Project";
        const prompt = blueprint.description || "An AI-generated application.";

        // Extract components, pages, routes from virtual files
        const components = Object.keys(files)
            .filter((f: string) => f.startsWith("components/"))
            .map((f: string) => f.replace("components/", "").replace(".tsx", ""));

        const pages = Object.keys(files)
            .filter((f: string) => f.startsWith("app/") && f.endsWith("page.tsx"))
            .map((f: string) => f.replace("app/", "").replace("/page.tsx", ""));

        const routes = Object.keys(files)
            .filter((f: string) => f.startsWith("app/api/") && f.endsWith("route.ts"))
            .map((f: string) => f.replace("app/api/", "").replace("/route.ts", ""));

        // STEP 1: Generate AI docs
        let docs: Record<string, string> = {};
        try {
            docs = await docAgent({
                prompt,
                blueprint,
                projectId,
                version,
                components,
                pages,
                routes,
                ui: "", // We don't have the original UI prompt here unless we save it, but docAgent handles empty
                template: "modern-ui", // Or we could save it in DB
                model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini"
            });
        } catch (e) {
            console.error("Doc generation failed, using fallback:", e);
            docs = {
                "README.md": `# ${appName}\n\n${prompt}\n\n## Features\n${(blueprint.features || []).map((f: string) => `- ${f}`).join("\n")}\n\n## Tech Stack\n- Next.js 14\n- Tailwind CSS`,
                "PROJECT_REPORT.md": `# Project Report\n\nThis project was generated using AutoStack.\n\n### Blueprint\n- App Name: ${appName}\n- Components: ${components.join(", ")}\n- Pages: ${pages.join(", ")}`,
                "ARCHITECTURE.md": `# Architecture Overview\n\n- **Frontend**: Next.js 14 (App Router)\n- **Styling**: Tailwind CSS\n- **Components**: Atomic Design Pattern\n- **State**: React Context / Hooks`,
                "TODO.md": `# Future Tasks\n\n- [ ] Implement database integration\n- [ ] Add advanced user analytics\n- [ ] Setup CI/CD pipeline\n- [ ] Optimize performance`,
                "docs.json": JSON.stringify({
                    summary: prompt,
                    architecture: "Next.js 14 + Tailwind CSS",
                    features: blueprint.features || []
                })
            };
        }

        // STEP 2: Generate PDF
        // Create a temporary directory to generate the PDF
        const tmpDir = path.join(os.tmpdir(), `autostack_docs_${projectId}_${Date.now()}`);
        fs.mkdirSync(tmpDir, { recursive: true });

        const pdfPath = await generatePDF(
            {
                projectId,
                version,
                prompt,
                docs,
                blueprint,
                components,
                pages,
                routes
            },
            tmpDir
        );

        // Read the generated PDF as Base64 to store in MongoDB
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

        // Cleanup temporary directory
        fs.rmSync(tmpDir, { recursive: true, force: true });

        // STEP 3: Update MongoDB using $set to avoid touching other files
        const updateQuery: any = {
            $set: {
                "docs": docs,
                "files.README.md": docs["README.md"],
                "files.PROJECT_REPORT.md": docs["PROJECT_REPORT.md"],
                "files.ARCHITECTURE.md": docs["ARCHITECTURE.md"],
                "files.TODO.md": docs["TODO.md"],
                "files.docs.json": docs["docs.json"],
                "files.report.pdf": pdfBase64
            }
        };

        await Project.updateOne({ projectId, version }, updateQuery);

        return Response.json({
            success: true,
            message: "Documentation generated successfully",
            docs
        });

    } catch (error) {
        console.error("Documentation generation error:", error);
        return Response.json({
            success: false,
            message: "Failed to generate documentation"
        }, { status: 500 });
    }
}
