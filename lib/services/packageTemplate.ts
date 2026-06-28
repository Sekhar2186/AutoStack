/**
 * packageTemplate.ts
 *
 * SINGLE SOURCE OF TRUTH for all generated Next.js project configuration.
 *
 * Rules:
 *  - Framework versions are NEVER chosen by the LLM.
 *  - All configFiles in generate/route.ts MUST import from here.
 *  - validatePackageJson() MUST be called before writing configFiles.
 */

// ─── Locked Framework Versions ───────────────────────────────────────────────

const NEXT_VERSION = "15.3.3";
const REACT_VERSION = "^18";
const REACT_DOM_VERSION = "^18";

// ─── Canonical Package Template ──────────────────────────────────────────────

export const PACKAGE_TEMPLATE = {
    private: true,
    scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
    },
    dependencies: {
        next: NEXT_VERSION,
        react: REACT_VERSION,
        "react-dom": REACT_DOM_VERSION,
        "lucide-react": "^0.471.1",
        "framer-motion": "^12.38.0",
        "react-icons": "^5.4.0",
    },
    devDependencies: {
        typescript: "^5",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "@types/node": "^20",
        tailwindcss: "^4",
        "@tailwindcss/postcss": "^4",
        postcss: "^8",
        autoprefixer: "^10",
    },
} as const;

// ─── buildPackageJson ─────────────────────────────────────────────────────────

/**
 * Builds a validated, serialized package.json string for a generated project.
 * The app name is the only dynamic field — all framework versions are locked.
 */
export function buildPackageJson(appName?: string): string {
    const pkg = {
        name: sanitizePackageName(appName ?? "generated-app"),
        ...PACKAGE_TEMPLATE,
    };

    validatePackageJson(pkg);

    return JSON.stringify(pkg, null, 2);
}

function sanitizePackageName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 214) || "generated-app";
}

// ─── tsconfig.json ────────────────────────────────────────────────────────────

export const TSCONFIG_TEMPLATE = {
    compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        baseUrl: ".",
        paths: {
            "@/*": ["./*"],
        },
    },
    include: ["**/*.ts", "**/*.tsx", "next-env.d.ts"],
    exclude: ["node_modules"],
};

// ─── next.config.js ───────────────────────────────────────────────────────────

/**
 * Minimal next.config.js — no turbopack.root or server-fs overrides that
 * break WebContainer.
 */
export const NEXTCONFIG_TEMPLATE = `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`;

// ─── postcss.config.mjs ───────────────────────────────────────────────────────

/**
 * Registers @tailwindcss/postcss and autoprefixer so Tailwind v4 processes
 * CSS correctly. Never use an empty plugins: {} object.
 */
export const POSTCSS_TEMPLATE = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
`;

// ─── next-env.d.ts ───────────────────────────────────────────────────────────

/**
 * Required reference directives that tell TypeScript about Next.js types.
 * This file must never be empty — an empty file causes the TS auto-install prompt.
 */
export const NEXT_ENV_DTS = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

// ─── Validation ───────────────────────────────────────────────────────────────

interface PackageJson {
    name?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
}

const REQUIRED_SCRIPTS = ["dev", "build", "start"] as const;

const REQUIRED_DEPENDENCIES = ["next", "react", "react-dom"] as const;

const REQUIRED_DEV_DEPENDENCIES = [
    "typescript",
    "@types/react",
    "@types/react-dom",
    "@types/node",
] as const;

/**
 * Validates a package.json object before it is written into a generated project.
 *
 * Throws a descriptive error if any required field is missing, preventing an
 * incomplete project from being returned to the user.
 */
export function validatePackageJson(pkg: PackageJson): void {
    const errors: string[] = [];

    // Scripts
    for (const script of REQUIRED_SCRIPTS) {
        if (!pkg.scripts?.[script]) {
            errors.push(`Missing required script: "${script}"`);
        }
    }

    // Core dependencies
    for (const dep of REQUIRED_DEPENDENCIES) {
        if (!pkg.dependencies?.[dep]) {
            errors.push(`Missing required dependency: "${dep}"`);
        }
    }

    // TypeScript devDependencies
    for (const dep of REQUIRED_DEV_DEPENDENCIES) {
        if (!pkg.devDependencies?.[dep]) {
            errors.push(`Missing required devDependency: "${dep}"`);
        }
    }

    // Version integrity — reject any Next.js version that isn't 15.x
    const nextVersion = pkg.dependencies?.["next"] ?? "";
    if (nextVersion && !nextVersion.startsWith("15")) {
        errors.push(
            `Invalid Next.js version "${nextVersion}". Must be 15.x (got ${nextVersion}). ` +
            `Do not allow the LLM to choose framework versions.`
        );
    }

    if (errors.length > 0) {
        throw new Error(
            `[packageTemplate] Generated package.json validation failed:\n` +
            errors.map((e) => `  • ${e}`).join("\n")
        );
    }
}

/**
 * Validates that a project containing TypeScript files has all required
 * TypeScript devDependencies. Call this after the virtual file tree is built.
 */
export function validateTypeScriptDeps(
    files: Record<string, string>,
    pkg: PackageJson
): void {
    const hasTypeScriptFiles = Object.keys(files).some(
        (f) => f.endsWith(".ts") || f.endsWith(".tsx")
    );
    const hasTsConfig = "tsconfig.json" in files;

    if (!hasTypeScriptFiles && !hasTsConfig) return;

    const missingDeps = REQUIRED_DEV_DEPENDENCIES.filter(
        (dep) => !pkg.devDependencies?.[dep]
    );

    if (missingDeps.length > 0) {
        throw new Error(
            `Generated project is missing required TypeScript dependencies: ` +
            missingDeps.join(", ")
        );
    }
}
