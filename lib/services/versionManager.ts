import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";

export async function versionManager(projectId?: string) {

    const baseDir = path.join(process.cwd(), "generated");

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

    if (!fs.existsSync(projectDir)) {
        throw new Error("Project Not Found");
    }

    const versions = fs.readdirSync(projectDir).filter(v => v.startsWith("v"));

    const sorted = versions.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

    const latest = sorted[sorted.length - 1];

    const nextVersionNumber = Number(latest.slice(1)) + 1;

    const newVersion = `v${nextVersionNumber}`;

    const latestPath = path.join(projectDir, latest);

    const newVersionPath = path.join(projectDir, newVersion);

    // Copy previous version → new version
    await fsExtra.copy(latestPath, newVersionPath);

    if (sorted.length >= 4) {
        const oldest = sorted[0];
        const oldestPath = path.join(projectDir, oldest);
        fs.rmSync(oldestPath, { recursive: true, force: true });
    }

    return {
        projectId,
        version: newVersion,
        projectPath: newVersionPath
    };
}