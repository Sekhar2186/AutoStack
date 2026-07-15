export interface ValidationResult {
    isValid: boolean;
    errors: { file: string; issues: string[] }[];
}

export function validateGeneratedCode(files: Record<string, string>): ValidationResult {
    const errors: { file: string; issues: string[] }[] = [];

    const fileKeys = Object.keys(files);

    // Global Project Validations
    const globalIssues: string[] = [];
    if (!fileKeys.some(f => f.includes('app/layout.tsx'))) globalIssues.push("Missing app/layout.tsx");
    if (!fileKeys.some(f => f.includes('package.json'))) globalIssues.push("Missing package.json");

    if (globalIssues.length > 0) {
        errors.push({ file: "PROJECT_ROOT", issues: globalIssues });
    }

    for (const [filePath, code] of Object.entries(files)) {
        const issues: string[] = [];
        
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            // 1. Next.js 15 App Router validations
            if (code.includes('"use client"') || code.includes("'use client'")) {
                if (/export default(?: async)? function\s+\w+\s*\(\s*\{\s*[^}]*(?:params|searchParams)/.test(code)) {
                    issues.push("Client Component ('use client') is receiving 'params' or 'searchParams'. In Next.js 15, use useParams() or useSearchParams() instead.");
                }
                if (/export default async function/.test(code)) {
                    issues.push("Client Component ('use client') cannot be async.");
                }
            }

            // 2. HTML Semantics / Nesting Validations
            // These regexes check if a tag is opened and another identical tag is opened before the first one is closed
            if (/<Link[^>]*>(?:(?!<\/Link>)[\s\S])*<Link/.test(code)) {
                issues.push("Nested <Link> tags found. Do not wrap a Link inside another Link.");
            }
            if (/<button[^>]*>(?:(?!<\/button>)[\s\S])*<button/.test(code)) {
                issues.push("Nested <button> tags found.");
            }
            if (/<a\s[^>]*>(?:(?!<\/a>)[\s\S])*<a\s/.test(code)) {
                issues.push("Nested <a> tags found. Apply classes to a single <Link> or <a>.");
            }
            if (/<form[^>]*>(?:(?!<\/form>)[\s\S])*<form/.test(code)) {
                issues.push("Nested <form> tags found.");
            }
            if (/<Link[^>]*>[\s\S]*?<a\s/.test(code) && /<a\s[^>]*>[\s\S]*?<\/Link>/.test(code)) {
                issues.push("<a> tag wrapped inside <Link>. Apply classes directly to <Link>.");
            }

            // 3. Image validaton
            if (/placehold\.co|dummyimage\.com|via\.placeholder\.com/.test(code)) {
                issues.push("External placeholder image service detected. Use /public/placeholder.png or Tailwind CSS placeholders instead.");
            }

            // 4. Import Validations
            // Extract imports like import Foo from "@/components/Foo"
            const importRegex = /import\s+.*?\s+from\s+["']@\/([^"']+)["']/g;
            let match;
            while ((match = importRegex.exec(code)) !== null) {
                const importPath = match[1]; // e.g. components/Foo
                // Check if file exists in virtual tree
                // Could be .ts, .tsx, .js, .jsx
                const exists = 
                    files[`${importPath}.tsx`] || 
                    files[`${importPath}.ts`] || 
                    files[`${importPath}/index.tsx`] ||
                    files[`${importPath}/index.ts`] ||
                    files[importPath];
                
                if (!exists) {
                    // Skip next-specific imports like next/image or lucide-react if they accidentally use @/
                    issues.push(`Imported module "@/${importPath}" does not exist in the generated files.`);
                }
            }
            
            // Check for missing relative imports
            const relativeImportRegex = /import\s+.*?\s+from\s+["'](\.\.?\/[^"']+)["']/g;
            while ((match = relativeImportRegex.exec(code)) !== null) {
                const importPath = match[1];
                // Simplify path resolution just roughly
                issues.push(`Found relative import "${importPath}". Use absolute imports (@/components/...) instead to ensure correctness.`);
            }

            // 5. Basic React Validations
            if (code.includes('className="') && code.includes('class="')) {
                issues.push("Found 'class=' instead of 'className=' in React component.");
            }

            // 6. Architectural Validations (Page -> API -> Storage -> Data)
            if (filePath.startsWith('app/') && !filePath.startsWith('app/api/')) {
                // Frontend pages/components
                if (code.includes('from "@/data') || code.includes("from '@/data") || code.includes('from "../data') || code.includes("from '../data")) {
                    issues.push("Frontend code cannot import directly from data/. It must fetch from /api endpoints.");
                }
                if (code.includes('from "@/lib/storage') || code.includes("from '@/lib/storage") || code.includes('from "../lib/storage') || code.includes("from '../lib/storage")) {
                    issues.push("Frontend code cannot import directly from lib/storage/. It must fetch from /api endpoints.");
                }
            }

            if (filePath.startsWith('app/api/')) {
                // API Routes
                if (code.includes('from "@/data') || code.includes("from '@/data") || code.includes('from "../../data') || code.includes("from '../../data")) {
                    issues.push("API routes cannot import directly from data/. They must use lib/storage/.");
                }
            }
        }

        if (issues.length > 0) {
            errors.push({ file: filePath, issues });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
