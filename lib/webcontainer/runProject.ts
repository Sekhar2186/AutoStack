import { getWebContainer } from "./webcontainer";

function createMountTree(files: Record<string, string>) {
    const tree: any = {};

    for (const [path, content] of Object.entries(files)) {
        const parts = path.split("/");

        let current = tree;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;

            if (isLast) {
                current[part] = {
                    file: {
                        contents: content,
                    },
                };
            } else {
                current[part] ??= {
                    directory: {},
                };

                current = current[part].directory;
            }
        }
    }

    return tree;
}

export async function runProject(
    files: Record<string, string>
): Promise<string> {
    const wc = await getWebContainer();

    console.log(
        "FILES COUNT:",
        Object.keys(files).length
    );

    console.log(
        "PACKAGE EXISTS:",
        !!files["package.json"]
    );

    console.log(Object.keys(files));

    // =========================
    // PATCH PACKAGE.JSON
    // =========================
    if (files["package.json"]) {
        try {
            const pkg = JSON.parse(
                files["package.json"]
            );

            pkg.dependencies ??= {};

            // Maintain dev script
            if (pkg.scripts?.dev) {
                pkg.scripts.dev =
                    "next dev";
            }

            // Auto install lucide-react
            pkg.dependencies["lucide-react"] =
                "^0.471.1";

            files["package.json"] =
                JSON.stringify(
                    pkg,
                    null,
                    2
                );

            console.log(
                "Patched package.json:"
            );

            console.log(pkg.dependencies);
        } catch (err) {
            console.error(
                "package.json patch failed",
                err
            );
        }
    }

    // =========================
    // PATCH NEXT CONFIG
    // =========================
    if (!files["next.config.js"]) {
        files["next.config.js"] = `
      /** @type {import('next').NextConfig} */
        const nextConfig = {};

        module.exports = nextConfig;
         `;
    }

    console.log(
        "Patched next.config.js"
    );

    console.log(
        "PACKAGE CONTENT:",
        files["package.json"]
    );

    const mountTree =
        createMountTree(files);

    console.log(
        Object.keys(files)
            .filter(f => f.includes("layout"))
    );
    console.log("HAS LAYOUT:", !!files["app/layout.tsx"]);

    if (files["app/layout.tsx"]) {
        console.log("LAYOUT CONTENT:");
        console.log(files["app/layout.tsx"]);
    }

    console.log(
        Object.keys(files)
            .filter(f =>
                f.includes("layout") ||
                f.includes("global")
            )
    );
    await wc.mount(mountTree);

    console.log("Mounted");

    const pkg = JSON.parse(files["package.json"]);

    console.log(
        "NEXT VERSION:",
        pkg.dependencies?.next
    );

    // =========================
    // INSTALL
    // =========================
    const install =
        await wc.spawn(
            "npm",
            ["install"]
        );


    const checkNext = await wc.spawn(
        "npm",
        ["list", "@next/swc-wasm-nodejs"]
    );

    checkNext.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        })
    );

    await checkNext.exit;

    install.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        })
    );

    const installCode = await install.exit;

    console.log("INSTALL EXIT:", installCode);

    const nextList = await wc.spawn("npm", ["list", "next"]);

    nextList.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        })
    );

    await nextList.exit;

    const swcList = await wc.spawn("npm", ["list", "@next/swc-wasm-nodejs"]);

    swcList.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        })
    );

    await swcList.exit;

    // =========================
    // VERIFY LUCIDE INSTALLED
    // =========================
    const check = await wc.spawn("npm", ["list", "lucide-react"]);

    check.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        })
    );
    // =========================
    // START DEV SERVER
    // =========================
    const dev = await wc.spawn("npx", ["next", "dev"]);

    dev.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        })
    );

    return new Promise(
        (resolve) => {
            wc.on(
                "server-ready",
                (_port, url) => {
                    console.log(
                        "SERVER READY:",
                        url
                    );

                    resolve(url);
                }
            );
        }
    );
}