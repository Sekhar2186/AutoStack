import { verifyToken } from "@/lib/middleware/auth";
import fs from "fs";
import path from "path";
import os from "os";
import { zipProject } from "@/lib/services/zipProject";
import { connectDB } from "@/lib/db/connect";
import { Project } from "@/lib/db/models/ProjectFiles";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");
        const version = url.searchParams.get("version") || "v1";

        if (!projectId) {
            return new Response("Missing projectId", { status: 400 });
        }

        await connectDB();
        const project = await Project.findOne({ projectId, version });

        if (!project || !project.files) {
            return new Response("Project version not found", { status: 404 });
        }

        const projectDir = path.join(os.tmpdir(), `${projectId}_${version}_${Date.now()}`);
        fs.mkdirSync(projectDir, { recursive: true });

        for (const [filePath, content] of Object.entries(project.files)) {
            if (typeof content === 'string') {
                const fullPath = path.join(projectDir, filePath);
                const dir = path.dirname(fullPath);
                fs.mkdirSync(dir, { recursive: true });
                
                if (content.startsWith("data:application/pdf;base64,")) {
                    const base64Data = content.replace("data:application/pdf;base64,", "");
                    fs.writeFileSync(fullPath, base64Data, "base64");
                } else {
                    fs.writeFileSync(fullPath, content, "utf-8");
                }
            }
        }

        await zipProject(projectDir);
        const zipPath = projectDir + ".zip";

        const fileBuffer = fs.readFileSync(zipPath);

        fs.rmSync(projectDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);

        return new Response(fileBuffer, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${projectId}_${version}.zip"`
            }
        });

    } catch (error) {
        console.error("Error downloading project:", error);
        return new Response("Failed to download file", { status: 500 });
    }
}
