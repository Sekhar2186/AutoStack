import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const generatedDir = path.join(rootDir, 'generated');

const WORKING_PROJECT = 'project_1782138046914';
const workingV1Path = path.join(generatedDir, WORKING_PROJECT, 'v1');

const STANDARD_SCRIPTS = {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
};

const STANDARD_DEPENDENCIES = {
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.471.1",
    "next": "15.3.3",
    "react": "^18",
    "react-dom": "^18"
};

// We will also bring in standard devDependencies for tailwind v4, postcss, etc.
const STANDARD_DEV_DEPENDENCIES = {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@tailwindcss/postcss": "^4",
    "autoprefixer": "^10.4.27",
    "postcss": "^8.5.8",
    "tailwindcss": "^4.2.2",
    "typescript": "^5"
};

async function run() {
    if (!fs.existsSync(workingV1Path)) {
        console.error(`Cannot find working project at ${workingV1Path}`);
        process.exit(1);
    }

    // Read the working configuration files so we can copy them
    const nextConfigContent = fs.readFileSync(path.join(workingV1Path, 'next.config.js'), 'utf8');
    const postcssConfigContent = fs.readFileSync(path.join(workingV1Path, 'postcss.config.mjs'), 'utf8');
    const tsconfigContent = fs.readFileSync(path.join(workingV1Path, 'tsconfig.json'), 'utf8');
    
    // Sometimes there is a next-env.d.ts we should copy too
    const nextEnvPath = path.join(workingV1Path, 'next-env.d.ts');
    const nextEnvContent = fs.existsSync(nextEnvPath) ? fs.readFileSync(nextEnvPath, 'utf8') : null;

    const folders = fs.readdirSync(generatedDir);

    let fixedCount = 0;

    for (const folder of folders) {
        if (!folder.startsWith('project_') || folder === WORKING_PROJECT) {
            continue; // Skip non-projects and the working project
        }

        const targetV1Path = path.join(generatedDir, folder, 'v1');
        if (!fs.existsSync(targetV1Path)) continue;

        console.log(`Fixing ${folder}...`);

        const packageJsonPath = path.join(targetV1Path, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                // 1. Fix Scripts
                pkg.scripts = { ...pkg.scripts, ...STANDARD_SCRIPTS };

                // 2. Fix Dependencies (keep project-specific ones, but overwrite Next/React/etc with standard versions)
                if (!pkg.dependencies) pkg.dependencies = {};
                pkg.dependencies = {
                    ...pkg.dependencies,
                    ...STANDARD_DEPENDENCIES
                };

                // 3. Fix Dev Dependencies (Tailwind, PostCSS, Typescript types)
                if (!pkg.devDependencies) pkg.devDependencies = {};
                pkg.devDependencies = {
                    ...pkg.devDependencies,
                    ...STANDARD_DEV_DEPENDENCIES
                };
                
                // Clean up any outdated config leftovers like old tailwindcss versions from dependencies
                // If tailwindcss is in dependencies, move it to devDependencies since v4 prefers it there
                if (pkg.dependencies['tailwindcss']) {
                    delete pkg.dependencies['tailwindcss'];
                }
                if (pkg.dependencies['postcss']) {
                    delete pkg.dependencies['postcss'];
                }
                if (pkg.dependencies['autoprefixer']) {
                    delete pkg.dependencies['autoprefixer'];
                }

                fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 4));
            } catch (err) {
                console.error(`Failed to update package.json for ${folder}:`, err.message);
            }
        }

        // 4. Overwrite Config Files
        fs.writeFileSync(path.join(targetV1Path, 'next.config.js'), nextConfigContent);
        fs.writeFileSync(path.join(targetV1Path, 'postcss.config.mjs'), postcssConfigContent);
        fs.writeFileSync(path.join(targetV1Path, 'tsconfig.json'), tsconfigContent);
        
        if (nextEnvContent) {
            fs.writeFileSync(path.join(targetV1Path, 'next-env.d.ts'), nextEnvContent);
        }

        // 5. Remove outdated configs that might conflict
        const oldPostcssJs = path.join(targetV1Path, 'postcss.config.js');
        if (fs.existsSync(oldPostcssJs)) fs.unlinkSync(oldPostcssJs);

        const oldTailwindConfig = path.join(targetV1Path, 'tailwind.config.js');
        if (fs.existsSync(oldTailwindConfig)) fs.unlinkSync(oldTailwindConfig);

        const oldTailwindConfigTs = path.join(targetV1Path, 'tailwind.config.ts');
        if (fs.existsSync(oldTailwindConfigTs)) fs.unlinkSync(oldTailwindConfigTs);

        fixedCount++;
    }

    console.log(`\nFinished fixing ${fixedCount} projects.`);
    console.log(`Run 'node scripts/migrateProjectsToMongo.mjs' to sync these fixes to MongoDB.`);
}

run();
