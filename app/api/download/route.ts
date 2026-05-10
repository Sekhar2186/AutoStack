import { verifyToken } from "@/lib/middleware/auth";
import fs from "fs";
import path from "path";
import { getGeneratedBasePath } from "@/lib/utils/pathUtils";

export async function GET(req: Request) {
    try {
        const user = verifyToken(req);
        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");
        const version = url.searchParams.get("version") || "v1";

        if (!projectId) {
            return new Response("Missing projectId", { status: 400 });
        }

        const zipPath = path.join(getGeneratedBasePath(), projectId, `${version}.zip`);

        if (!fs.existsSync(zipPath)) {
            return new Response("ZIP file not found", { status: 404 });
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
