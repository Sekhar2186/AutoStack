import { verifyToken } from "@/lib/middleware/auth";
import fs from "fs";
import path from "path";
import { getGeneratedBasePath } from "@/lib/utils/pathUtils";
import { startPreview } from "@/lib/services/previewManager";

function buildFileTree(dirPath: string, basePath: string, depth: number = 0): any[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: any[] = [];

    const ignored = [".next", "node_modules", ".git"];

    for (const entry of entries) {
        if (ignored.includes(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.relative(basePath, fullPath).replace(/\\/g, "/");

        if (entry.isDirectory()) {
            nodes.push({
                name: entry.name,
                path: relPath,
                isDir: true,
                depth,
                open: depth < 2,
                children: buildFileTree(fullPath, basePath, depth + 1)
            });
        } else {
            nodes.push({
                name: entry.name,
                path: relPath,
                isDir: false,
                depth
            });
        }
    }

    nodes.sort((a, b) => {
        if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
        return a.isDir ? -1 : 1;
    });

    return nodes;
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    console.log("DEBUG: GET request received for project details");
    try {
        const user = verifyToken(req);

        if (!user) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: projectId } = await context.params;

        const projectDir = path.join(
            getGeneratedBasePath(),
            projectId,
        );

        if (!fs.existsSync(projectDir)) {
            return Response.json(
                { success: false, message: "Project not found" },
                { status: 404 }
            );
        }

        const allFiles = fs.readdirSync(projectDir);
        const versions = allFiles
            .filter(v => /^v\d+$/.test(v))
            .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

        if (versions.length === 0) {
            return Response.json(
                { success: false, message: "No versions found" },
                { status: 404 }
            );
        }

        const latestVersion = versions[versions.length - 1];

        const versionPath = path.join(projectDir, latestVersion);

        const fileTree = buildFileTree(versionPath, versionPath);

        const { previewLink, port } =
            await startPreview(projectId, versionPath);

        // Extract docs if available
        let projectDocs = {
            summary: "Professional AI-generated application based on your custom prompt.",
            architecture: "Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.",
            features: ["Responsive Design", "AI-Generated Components", "Dynamic Routing", "Modern UI/UX"]
        };

        try {
            const docsJsonPath = path.join(versionPath, "docs.json");
            const readmePath = path.join(versionPath, "README.md");

            if (fs.existsSync(docsJsonPath)) {
                const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, "utf-8"));
                projectDocs = { ...projectDocs, ...docsJson };
            } else if (fs.existsSync(readmePath)) {
                const readme = fs.readFileSync(readmePath, "utf-8");
                // Basic extraction logic
                const summaryMatch = readme.match(/# (.*?)\n([\s\S]*?)\n##/);
                if (summaryMatch) projectDocs.summary = summaryMatch[2].trim().substring(0, 300) + "...";
            }
        } catch (e) {
            console.error("Failed to parse docs:", e);
        }

        return Response.json({
            success: true,
            project: {
                projectId,
                version: latestVersion,
                blueprint: fileTree,
                previewLink,
                port,
                docs: projectDocs,
                zipPath: `/api/download?projectId=${projectId}&version=${latestVersion}`
            }
        });

    } catch (error) {
        console.error("Error fetching project details:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to fetch project details"
            },
            { status: 500 }
        );
    }
};
