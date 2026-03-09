import fs from "fs-extra";
import path from "path";

export async function templateLoader(projectPath: string) {
    const templatePath = path.join(
        process.cwd(),
        "templates",
        "nextjs-template"
    );
    await fs.copy(templatePath, projectPath);
}