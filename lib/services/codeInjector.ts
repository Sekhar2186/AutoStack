import fs from "fs";
import path from "path";

export async function codeInjector(projectPath: string, generatedCode: any) {
    if (generatedCode.components) {
        const compDir = path.join(projectPath, "components");
        fs.mkdirSync(compDir, { recursive: true });
        for (const fileName in generatedCode.components) {
            const filePath = path.join(compDir, fileName);
            fs.writeFileSync(filePath, generatedCode.components[fileName]);
        }
    }
    if (generatedCode.routes) {
        const apiDir = path.join(projectPath, "app", "api");

        fs.mkdirSync(apiDir, { recursive: true });

        for (const fileName in generatedCode.routes) {

            const routeName = fileName.replace(".ts", "");

            const routeFolder = path.join(apiDir, routeName);

            fs.mkdirSync(routeFolder, { recursive: true });

            const routeFile = path.join(routeFolder, "route.ts");

            fs.writeFileSync(routeFile, generatedCode.routes[fileName]);
        }
    }
    if (generatedCode.models) {

        const modelDir = path.join(projectPath, "lib", "models");

        fs.mkdirSync(modelDir, { recursive: true });

        for (const fileName in generatedCode.models) {

            const filePath = path.join(modelDir, fileName);

            fs.writeFileSync(filePath, generatedCode.models[fileName]);
        }
    }
    if (generatedCode.pages) {

        const appDir = path.join(projectPath, "app");

        for (const fileName in generatedCode.pages) {

            const filePath = path.join(appDir, fileName);

            fs.writeFileSync(filePath, generatedCode.pages[fileName]);
        }
    }
}
