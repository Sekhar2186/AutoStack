const { startPreview } = require("./lib/services/previewManager");
const path = require("path");

async function run() {
    const projectId = " ";
    const version = " ";
    const projectPath = path.join(process.cwd(), "generated", projectId, version);
    console.log(`Starting preview for ${projectId}...`);
    const result = await startPreview(projectId, projectPath, version);
    console.log("Result:", result);
}

run().catch(console.error);
