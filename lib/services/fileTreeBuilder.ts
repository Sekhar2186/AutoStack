export interface VirtualFileTree {
    [filePath: string]: string;
}

export function buildVirtualFileTree(generatedCode: any): VirtualFileTree {
    const files: VirtualFileTree = {};
    // Components
    if (generatedCode.components) {
        for (const [fileName, content] of Object.entries(generatedCode.components)) {

            // Skip accidentally generated pages
            if (
                fileName.startsWith("app_") ||
                fileName.includes("_page")
            ) {
                console.warn(
                    "[ComponentAgent Bug] Skipping page masquerading as component:",
                    fileName
                );
                continue;
            }

            files[`components/${fileName}`] = content as string;
        }
    }
    // Routes
    if (generatedCode.routes) {
        for (const [fileName, content] of Object.entries(generatedCode.routes)) {
            const routeName = fileName.replace(".ts", "");
            files[`app/api/${routeName}/route.ts`] = content as string;
        }
    }
    // Pages
    if (generatedCode.pages) {
        for (const [filePath, content] of Object.entries(generatedCode.pages)) {
            files[`app/${filePath}`] = content as string;
        }
    }
    // Docs
    if (generatedCode.docs) {
        for (const [fileName, content] of Object.entries(generatedCode.docs)) {
            files[fileName] = content as string;
        }
    }

    // Config Files
    if (generatedCode.configFiles) {
        for (const [fileName, content] of Object.entries(generatedCode.configFiles)) {
            files[fileName] = content as string;
        }
    }

    return files;
}  