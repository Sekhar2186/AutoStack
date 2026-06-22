import { FileSystemTree } from "@webcontainer/api";

export function convertFilesToTree(files: Record<string, string>) {
    const tree: FileSystemTree = {};

    for (const [filepath, content] of Object.entries(files)) {
        const parts = filepath.split("/");

        let current: any = tree;

        while (parts.length > 1) {
            const part = parts.shift()!;

            current[part] ??= {
                directory: {}
            };

            current = current[part].directory;
        }

        current[parts[0]] = {
            file: {
                contents: content
            }
        };
    }

    return tree;
}