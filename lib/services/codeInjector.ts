import fs from "fs";
import path from "path";

export async function codeInjector(projectPath: string, generatedCode: any) {
    if (generatedCode.components) {
        const compDir = path.join(projectPath, "components");
        // We still ensure the base compDir exists
        fs.mkdirSync(compDir, { recursive: true });
        for (const fileName in generatedCode.components) {
            const filePath = path.join(compDir, fileName);
            // Ensure any component subdirectories (e.g. "ui/button.tsx") exist
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
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

            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            fs.writeFileSync(filePath, generatedCode.models[fileName]);
        }
    }

    //const pagePath = path.join(projectPath, "app", "page.tsx");

    //if (fs.existsSync(pagePath)) {
    //   let pageContent = fs.readFileSync(pagePath, "utf-8");

    //   if (generatedCode.imports) {
    //       pageContent = pageContent.replace(
    //          "/* AUTO-IMPORTS */",
    //          generatedCode.imports
    //    );
    // }

    //  if (generatedCode.injection) {
    //     pageContent = pageContent.replace(
    //         "{/* AUTO-INJECT-COMPONENTS */}",
    //          generatedCode.injection
    //     );
    //}
    //
    //fs.writeFileSync(pagePath, pageContent);

    if (generatedCode.pages) {
        for (const [routePath, pageContent] of Object.entries(generatedCode.pages)) {
            const pageFilePath = path.join(projectPath, "app", routePath);
            const dir = path.dirname(pageFilePath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(pageFilePath, pageContent as string);
        }
    }
    if (generatedCode.docs) {

        for (const [fileName, content] of Object.entries(generatedCode.docs)) {

            const filePath = path.join(projectPath, fileName);

            fs.writeFileSync(
                filePath,
                content as string,
                "utf-8"
            );
        }
    }
}

