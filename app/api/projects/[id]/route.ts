/*import { verifyToken } from "@/lib/middleware/auth";
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

function isServerless() {
    return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    console.log("DEBUG: GET request received for project details");
    try {
        const user = verifyToken(req);

        if (!user && isServerless()) {
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
*/

import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { Project } from "@/lib/db/models/ProjectFiles";
import { User } from "@/lib/db/models/User";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = verifyToken(req);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }

        await connectDB();

        const { id: projectId } = await context.params;

        const project = await Project.findOne({
            projectId
        });
        console.log(
            "FILES COUNT:",
            Object.keys(project?.files || {}).length
        );

        console.log(
            "FIRST FILES:",
            Object.keys(project?.files || {}).slice(0, 10)
        );

        if (!project) {
            return Response.json(
                {
                    success: false,
                    message: "Project not found"
                },
                {
                    status: 404
                }
            );
        }

        let projectDocs = {
            summary:
                "Professional AI-generated application based on your prompt.",
            architecture:
                "Next.js + Tailwind CSS + React",
            features: []
        };

        try {
            if (project.files?.["docs.json"]) {
                const parsedDocs = JSON.parse(
                    project.files["docs.json"]
                );

                projectDocs = {
                    ...projectDocs,
                    ...parsedDocs
                };
            }
        } catch (err) {
            console.error(
                "Failed to parse docs.json:",
                err
            );
        }

        return Response.json({
            success: true,
            project: {
                projectId: project.projectId,
                appName: project.appName,
                version: project.version,
                blueprint: project.blueprint,
                files: project.files,
                docs: projectDocs,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                zipPath: `/api/download?projectId=${project.projectId}&version=${project.version}`
            }
        });
    } catch (error) {
        console.error(
            "Project fetch error:",
            error
        );

        return Response.json(
            {
                success: false,
                message:
                    "Failed to fetch project"
            },
            {
                status: 500
            }
        );
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = verifyToken(req);

        if (!decoded) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { id: projectId } = await context.params;
        const userId = (decoded as any).id;

        const project = await Project.findOne({ projectId });

        if (!project) {
            return Response.json({ success: false, message: "Project not found" }, { status: 404 });
        }

        // Verify ownership
        if (project.userId && project.userId !== userId) {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        // Soft-delete: mark isDeleted on the Project document
        await Project.updateOne({ projectId }, { $set: { isDeleted: true } });

        // Soft-delete: mark isDeleted on the User's embedded project entry
        await User.updateOne(
            { _id: userId, "projects.projectId": projectId },
            { $set: { "projects.$.isDeleted": true } }
        );

        return Response.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Project delete error:", error);
        return Response.json({ success: false, message: "Failed to delete project" }, { status: 500 });
    }
}