import { spawn } from "child_process";

export function runProject(projectPath: string) {

    const process = spawn("npm", ["start"], {
        cwd: projectPath,
        shell: true
    });

    process.stdout.on("data", (data) => {
        console.log(data.toString());
    });

    process.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    return "http://localhost:5000";
}