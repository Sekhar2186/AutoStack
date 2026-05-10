import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import { getGeneratedBasePath } from "@/lib/utils/pathUtils";

function isServerless() {
    return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

export async function versionManager(projectId?: string, currentUser?: any) {

    const baseDir = getGeneratedBasePath();

    // ── NEW PROJECT ────────────────────────────────────────────────────────────
    if (!projectId) {
        const newProjectId = `project_${Date.now()}`;
        const projectDir = path.join(baseDir, newProjectId);
        const version = "v1";
        const versionPath = path.join(projectDir, version);
        fs.mkdirSync(versionPath, { recursive: true });

        return {
            projectId: newProjectId,
            version,
            projectPath: versionPath
        };
    }

    const projectDir = path.join(baseDir, projectId);

    // ── SERVERLESS: use DB version counter ────────────────────────────────────
    if (isServerless()) {
        let nextVersionNumber = 2; // default: bump to v2

        if (currentUser) {
            const projectRecord = currentUser.projects?.find(
                (p: any) => p.projectId === projectId
            );
            if (projectRecord) {
                // Increment the stored version
                nextVersionNumber = (projectRecord.latestVersion || 1) + 1;
                projectRecord.latestVersion = nextVersionNumber;
                await currentUser.save();
            }
        }

        const newVersion = `v${nextVersionNumber}`;
        const newVersionPath = path.join(projectDir, newVersion);
        fs.mkdirSync(newVersionPath, { recursive: true });

        return {
            projectId,
            version: newVersion,
            projectPath: newVersionPath,
            previousPath: undefined  // ephemeral FS — no previous files to copy
        };
    }

    // ── LOCAL: filesystem-based versioning ────────────────────────────────────
    if (!fs.existsSync(projectDir)) {
        const version = "v1";
        const versionPath = path.join(projectDir, version);
        fs.mkdirSync(versionPath, { recursive: true });
        return {
            projectId,
            version,
            projectPath: versionPath
        };
    }

    const versions = fs.readdirSync(projectDir);

    const sorted = versions
        .filter(v => /^v\d+$/.test(v))
        .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

    if (sorted.length === 0) {
        const version = "v1";
        const versionPath = path.join(projectDir, version);
        if (!fs.existsSync(versionPath)) {
            fs.mkdirSync(versionPath, { recursive: true });
        }
        return {
            projectId,
            version,
            projectPath: versionPath
        };
    }

    const latest = sorted[sorted.length - 1];
    const nextVersionNumber = Number(latest.slice(1)) + 1;
    const newVersion = `v${nextVersionNumber}`;

    const latestPath = path.join(projectDir, latest);
    const newVersionPath = path.join(projectDir, newVersion);

    if (latestPath === newVersionPath) {
        throw new Error(`Version collision detected: ${latestPath}`);
    }

    await fsExtra.copy(latestPath, newVersionPath);

    if (sorted.length >= 4) {
        const oldest = sorted[0];
        const oldestPath = path.join(projectDir, oldest);
        fs.rmSync(oldestPath, { recursive: true, force: true });
    }

    return {
        projectId,
        version: newVersion,
        projectPath: newVersionPath,
        previousPath: latestPath
    };
}