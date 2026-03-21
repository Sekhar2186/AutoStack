import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";

export async function templateLoader(projectPath: string, templateType: string) {

    const baseTemplate = path.join(process.cwd(), "templates", "nextjs-template");
    const uiTemplate = path.join(process.cwd(), "ui-templates", templateType);

    copyFolder(baseTemplate, projectPath);

    copyFolder(uiTemplate, projectPath);
}

function copyFolder(src: string, dest: string) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);

    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyFolder(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}