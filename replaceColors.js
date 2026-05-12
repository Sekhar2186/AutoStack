const fs = require('fs');
const path = require('path');

const dirs = [
  'app',
  'components',
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace colors
  content = content.replace(/indigo/g, 'sky');
  content = content.replace(/violet/g, 'teal');
  content = content.replace(/purple/g, 'emerald');

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
