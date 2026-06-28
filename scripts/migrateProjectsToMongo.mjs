import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MONGODB_URI = "mongodb+srv://somasekharkurapati6423_db_user:I0YUuv7gjC9xyWT6@cluster0.eottkfq.mongodb.net/?appName=Cluster0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const generatedDir = path.join(rootDir, 'generated');

// Directories and files to exclude
const EXCLUDE = [
  '.next', 
  'node_modules', 
  '.git', 
  'package-lock.json', 
  '.env.local', 
  'fix_db.mjs', 
  'update_project_files.mjs', 
  'report.pdf'
];

// Function to recursively get all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (EXCLUDE.includes(file)) {
      return;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function run() {
  const args = process.argv.slice(2);
  const targetProject = args[0]; // e.g. project_1782138046914

  let targetProjects = [];

  if (targetProject) {
    targetProjects.push(targetProject);
  } else {
    // Scan generated/ directory
    if (fs.existsSync(generatedDir)) {
      const folders = fs.readdirSync(generatedDir);
      for (const folder of folders) {
        if (folder.startsWith('project_')) {
          const v1Path = path.join(generatedDir, folder, 'v1');
          if (fs.existsSync(v1Path)) {
            targetProjects.push(folder);
          }
        }
      }
    } else {
      console.log(`Generated directory not found at ${generatedDir}`);
    }
  }

  console.log(`Found ${targetProjects.length} projects`);

  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.log("Continuing gracefully without DB connection...");
    // If we can't connect, all updates will fail anyway, but we will follow the instruction
    // to continue gracefully.
  }

  for (const projectId of targetProjects) {
    console.log(`Updating ${projectId} ...`);
    try {
      const v1Path = path.join(generatedDir, projectId, 'v1');
      
      if (!fs.existsSync(v1Path)) {
        console.log(`✗ Not Found (missing v1 folder)`);
        skippedCount++;
        continue;
      }

      const allFiles = getAllFiles(v1Path);
      const filesObject = {};

      allFiles.forEach(filePath => {
        // Get the relative path starting from 'v1' directory
        const relativePath = path.relative(v1Path, filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        filesObject[relativePath] = content;
      });

      // If mongoose is connected
      if (mongoose.connection.readyState === 1) {
        const result = await mongoose.connection.db.collection('projects').updateOne(
          { projectId: projectId },
          { $set: { files: filesObject } }
        );

        if (result.matchedCount > 0) {
          console.log("✓ Updated");
          updatedCount++;
        } else {
          console.log("✗ Not Found (missing in DB)");
          skippedCount++;
        }
      } else {
         console.log("✗ Failed: No MongoDB connection");
         failedCount++;
      }

    } catch (err) {
      console.log(`✗ Failed: ${err.message}`);
      failedCount++;
    }
  }

  console.log("Migration Complete");
  console.log(`Updated : ${updatedCount}`);
  console.log(`Skipped : ${skippedCount}`);
  console.log(`Failed  : ${failedCount}`);

  try {
    await mongoose.disconnect();
  } catch (err) {}
  
  process.exit(0);
}

run();
