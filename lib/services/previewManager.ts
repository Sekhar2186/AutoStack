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

function isServerless() {
    return !!(
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.NETLIFY
    );
}

export async function startPreview(
    projectId: string,
    projectPath: string
) {
    if (isServerless()) {
        return {
            previewLink: "",
            port: 0
        };
    }

    if (runningProjects[projectId]) {
        return {
            previewLink: `http://localhost:${runningProjects[projectId].port}`,
            port: runningProjects[projectId].port
        };
    }

    const port = getNextPort();

    const rootNodeModules = path.join(process.cwd(), "node_modules");
    const projectNodeModules = path.join(projectPath, "node_modules");

    if (
        fs.existsSync(rootNodeModules) &&
        !fs.existsSync(projectNodeModules)
    ) {
        try {
            fs.symlinkSync(rootNodeModules, projectNodeModules, "dir");
        } catch (e) {
            console.error("Symlink failed:", e);
        }
    }
    console.log("PREVIEW PROJECT PATH:", projectPath);

    // IMPORTANT
    const child = spawn(
        "npm",
        ["run", "dev", "--", "-p", port.toString()],
        {
            cwd: projectPath,
            shell: true,
            detached: true,
        }
    );

    child.stdout?.on('data', (data) => console.log(`[PREVIEW ${port}] ${data}`));
    child.stderr?.on('data', (data) => console.error(`[PREVIEW ${port} ERROR] ${data}`));

    child.unref();

    runningProjects[projectId] = {
        port,
        process: child
    };

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
