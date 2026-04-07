import { spawn } from "child_process";
import path from "path";

export function runProject(projectPath: string) {

    const port = 3001 + Math.floor(Math.random() * 1000);

    const process = spawn(`npm install && npm run dev -- -p ${port}`, [], {
        cwd: projectPath,
        shell: true,
        stdio: "inherit"
    });

    return `http://localhost:${port}`;
}