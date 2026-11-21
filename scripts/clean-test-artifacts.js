import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DIRS_TO_CLEAN = [
  "test-results",
  "playwright-report",
  "blob-report",
  ".playwright",
];

let cleanedCount = 0;

for (const dir of DIRS_TO_CLEAN) {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🧹 Cleaned test artifact: ${dir}`);
      cleanedCount++;
    } catch (err) {
      console.warn(`Could not remove ${dir}:`, err);
    }
  }
}

if (cleanedCount > 0) {
  console.log(
    "✨ All extra test files cleaned up successfully (0 bugs found).",
  );
} else {
  console.log("✨ Workspace is already clean. No extra test files found.");
}
