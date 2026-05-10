import fs from "fs";
import path from "path";
import { getGeneratedBasePath } from "@/lib/utils/pathUtils";

export async function projectBuilder(files: any) {
    const projectId = Date.now();

    const baseDir = path.join(getGeneratedBasePath(), `project_${projectId}`);

    fs.mkdirSync(baseDir, { recursive: true });

    for (const filePath in files) {
        const fullPath = path.join(baseDir, filePath);

        const dir = path.dirname(fullPath);

        fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(fullPath, files[filePath]);
    }

    return baseDir;
}