import { spawn } from "child_process";
import path from "path";
import fs from "fs-extra";

const runningProjects: Record<
    string,
    {
        port: number;
        process: any;
    }
> = {};

let currentPort = 4000;

function getNextPort() {
    return currentPort++;
}

export async function startPreview(
    projectId: string,
    projectPath: string
) {
    // 🔥 If already running
    if (runningProjects[projectId]) {
        return {
            previewLink: `http://localhost:${runningProjects[projectId].port}`,
            port: runningProjects[projectId].port
        };
    }

    const port = getNextPort();

    // Preemptively symlink node_modules from the root project to avoid slow npm install
    const rootNodeModules = path.join(process.cwd(), "node_modules");
    const projectNodeModules = path.join(projectPath, "node_modules");

    if (fs.existsSync(rootNodeModules) && !fs.existsSync(projectNodeModules)) {
        try {
            fs.symlinkSync(rootNodeModules, projectNodeModules, "dir");
        } catch (e) {
            console.error("Failed to symlink node_modules:", e);
        }
    }

    const child = spawn(
        "npm",
        ["run", "dev", "--", "-p", port.toString()],
        {
            cwd: projectPath,
            shell: true,
            stdio: "ignore"
        }
    );

    runningProjects[projectId] = {
        port,
        process: child
    };

    // 🔥 Auto cleanup after 10 mins
    setTimeout(() => {
        stopPreview(projectId);
    }, 10 * 60 * 1000);

    return {
        previewLink: `http://localhost:${port}`,
        port
    };
}

export function stopPreview(projectId: string) {
    const running = runningProjects[projectId];

    if (!running) return;

    running.process.kill();

    delete runningProjects[projectId];
}

export function getRunningProjects() {
    return runningProjects;
}