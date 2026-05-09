import { verifyToken } from "@/lib/middleware/auth";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    try {
        const user = verifyToken(req);
        if (!user) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");
        const version = url.searchParams.get("version") || "v1";
        const file = url.searchParams.get("file");

        if (!projectId || !file) {
            return Response.json({ success: false, message: "Missing required parameters" }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), "generated", projectId, version, file);

        if (!fs.existsSync(filePath)) {
            return Response.json({ success: false, message: "File not found" }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, "utf-8");

        return Response.json({
            success: true,
            content
        });

    } catch (error) {
        console.error("Error fetching project file:", error);
        return Response.json({ success: false, message: "Failed to fetch file" }, { status: 500 });
    }
}
