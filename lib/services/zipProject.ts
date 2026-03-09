import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function zipProject(projectPath: string) {

    const zipPath = projectPath + ".zip";

    return new Promise((resolve, reject) => {

        const output = fs.createWriteStream(zipPath);

        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
            resolve(zipPath);
        });

        archive.on("error", (err: any) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(projectPath, false);
        archive.finalize();
    });
}