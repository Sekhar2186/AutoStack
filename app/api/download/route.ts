import { verifyToken } from "@/lib/middleware/auth";
import fs from "fs";
import path from "path";
import { getGeneratedBasePath } from "@/lib/utils/pathUtils";
import { zipProject } from "@/lib/services/zipProject";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");
        const version = url.searchParams.get("version") || "v1";

        if (!projectId) {
            return new Response("Missing projectId", { status: 400 });
        }

        const projectDir = path.join(getGeneratedBasePath(), projectId, version);
        const zipPath = projectDir + ".zip";

        if (!fs.existsSync(zipPath)) {
            if (!fs.existsSync(projectDir)) {
                return new Response("Project version directory not found", { status: 404 });
            }
            // Generate zip on the fly if it doesn't exist
            await zipProject(projectDir);
        }

        const fileBuffer = fs.readFileSync(zipPath);

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
