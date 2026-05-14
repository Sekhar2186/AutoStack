import { spawn, execSync } from "child_process";
import path from "path";
import fs from "fs-extra";

const runningProjects: Record<
    string,
    {
        port: number;
        process: any;
    }
> = {};

let isExecuting = false;

function killProcessOnPort(port: number) {
    console.log(`Checking for processes on port ${port}...`);
    try {
        const pids = execSync(`lsof -t -i:${port}`).toString().trim().split('\n').filter(Boolean);
        if (pids.length > 0) {
            console.log(`Found processes on port ${port}: ${pids.join(', ')}. Killing them...`);
            for (const pid of pids) {
                try {
                    execSync(`kill -9 ${pid}`);
                } catch (e) {
                    console.error(`Failed to kill process ${pid}:`, e);
                }
            }
            // Give the OS some time to release the port
            execSync('sleep 2');
        } else {
            console.log(`No processes found on port ${port}.`);
        }
    } catch (e) {
        // No process or lsof failed, ignore
    }
}

async function waitForPortToBeFree(port: number, timeoutMs: number = 5000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            execSync(`lsof -t -i:${port}`);
            // If lsof succeeds, it found something, so wait
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
            // lsof failed, port is likely free
            return true;
        }
    }
    return false;
}

export async function startPreview(
    projectId: string,
    projectPath: string
) {
    // Basic concurrency control
    while (isExecuting) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    isExecuting = true;

    try {
        if (isServerless()) {
            return { previewLink: "", port: 0 };
        }

        const port = 4000;

        // Stop ALL tracked running projects
        const currentProjectIds = Object.keys(runningProjects);
        for (const id of currentProjectIds) {
            stopPreview(id);
        }
        
        // Forcefully kill ANYTHING on the port and wait for it to clear
        killProcessOnPort(port);
        const isFree = await waitForPortToBeFree(port);
        if (!isFree) {
            console.warn(`Port ${port} still seems occupied after killing. Proceeding anyway...`);
        }

        const projectNodeModules = path.join(projectPath, "node_modules");
        const rootNodeModules = path.join(process.cwd(), "node_modules");

        // Ensure projectNodeModules is a valid symlink to rootNodeModules
        if (fs.existsSync(rootNodeModules)) {
            try {
                let exists = false;
                try {
                    fs.lstatSync(projectNodeModules);
                    exists = true;
                } catch (e) {
                    // Path does not exist
                }

                if (exists) {
                    // Check if it's already correct
                    try {
                        const stats = fs.lstatSync(projectNodeModules);
                        if (stats.isSymbolicLink()) {
                            const existingLink = fs.readlinkSync(projectNodeModules);
                            if (existingLink !== rootNodeModules) {
                                fs.removeSync(projectNodeModules);
                            }
                        } else {
                            // It's a real directory or file, remove it so we can symlink
                            fs.removeSync(projectNodeModules);
                        }
                    } catch (e) {
                        fs.removeSync(projectNodeModules);
                    }
                }

                if (!fs.existsSync(projectNodeModules)) {
                    fs.ensureDirSync(path.dirname(projectNodeModules));
                    fs.symlinkSync(rootNodeModules, projectNodeModules, "dir");
                    console.log(`Created symlink for node_modules in ${projectId}`);
                }
            } catch (e) {
                console.error("Symlink management failed:", e);
            }
        }

        console.log(`Starting fresh preview for ${projectId} on port ${port}`);

        const child = spawn(
            "npm",
            ["run", "dev", "--", "-p", port.toString()],
            {
                cwd: projectPath,
                shell: true,
                detached: true,
                stdio: 'ignore'
            }
        );

        child.unref();

        runningProjects[projectId] = {
            port,
            process: child
        };

        // Auto-stop after 15 mins
        setTimeout(() => {
            stopPreview(projectId);
        }, 15 * 60 * 1000);

        return {
            previewLink: `http://localhost:${port}`,
            port
        };
    } finally {
        isExecuting = false;
    }
}

export function stopPreview(projectId: string) {
    const running = runningProjects[projectId];
    if (!running) return;
    
    console.log(`Stopping preview for project: ${projectId}`);
    
    try {
        if (running.process && running.process.pid) {
            // Kill the process group
            process.kill(-running.process.pid, 'SIGKILL'); 
        }
    } catch (e) {
        console.log(`Process kill failed for ${projectId}, fallback to port kill.`);
        killProcessOnPort(running.port);
    }

    delete runningProjects[projectId];
}

function isServerless() {
    return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}
