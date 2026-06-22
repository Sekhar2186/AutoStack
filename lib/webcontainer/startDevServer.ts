import { getWebContainer } from "./webcontainer";
import { convertFilesToTree } from "./mountFiles";

export async function startDevServer(
    files: Record<string, string>
) {
    const wc = await getWebContainer();

    const tree = convertFilesToTree(files);

    await wc.mount(tree);

    const install = await wc.spawn("npm", ["install"]);

    await install.exit;

    const dev = await wc.spawn("npm", ["run", "dev"]);

    return new Promise<string>((resolve) => {
        wc.on("server-ready", (_port, url) => {
            resolve(url);
        });
    });
}