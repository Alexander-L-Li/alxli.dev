import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source and destination paths
const srcPath = join(__dirname, '404.html');
const destPath = join(__dirname, 'docs/404.html');

// Ensure the destination directory exists
const destDir = dirname(destPath);
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

// Copy the file
copyFileSync(srcPath, destPath);

console.log('Successfully copied 404.html to docs directory');
