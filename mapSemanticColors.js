const fs = require('fs');
const path = require('path');

const dirs = [
  'app',
  'components',
];

const replacements = {
  'bg-white': 'bg-app-card',
  'bg-\\[#fafbfc\\]': 'bg-app-bg',
  'bg-slate-50': 'bg-app-bg',
  'text-slate-900': 'text-app-text',
  'text-slate-800': 'text-app-text',
  'text-slate-700': 'text-app-text',
  'text-slate-600': 'text-app-text-muted',
  'text-slate-500': 'text-app-text-muted',
  'text-slate-400': 'text-app-text-muted',
  'border-black/5': 'border-app-border',
  'border-black/8': 'border-app-border',
  'border-black/10': 'border-app-border',
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`(?<!-)\\b${key}\\b`, 'g');
    content = content.replace(regex, value);
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

for (const dir of dirs) {
  walkDir(path.join(__dirname, dir));
}
