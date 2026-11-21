import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SCAN_DIRS = ["apps", "packages"];
const IGNORE_DIRS = new Set([
  "node_modules",
  "build",
  "dist",
  ".turbo",
  ".git",
  ".react-router",
]);

// Patterns that identify forbidden 'any' and 'unknown' type usage in TypeScript
const FORBIDDEN_RULES = [
  {
    name: "Explicit 'any' type annotation or cast",
    // Matches: : any, : any[], as any, <any>, Array<any>, Promise<any>, Record<..., any>
    pattern:
      /(:\s*any\b|\bas\s+any\b|<any>|Array<any>|Promise<any>|Record<[^,>]+,\s*any>)/,
  },
  {
    name: "Explicit 'unknown' type annotation or cast",
    // Matches: : unknown, : unknown[], as unknown, <unknown>, Array<unknown>, Promise<unknown>, Record<..., unknown>
    pattern:
      /(:\s*unknown\b|\bas\s+unknown\b|<unknown>|Array<unknown>|Promise<unknown>|Record<[^,>]+,\s*unknown>)/,
  },
];

function getSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      getSourceFiles(fullPath, fileList);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".d.ts")
    ) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function runCheck() {
  console.log(
    "\x1b[36m%s\x1b[0m",
    "🔍 Checking TypeScript files for forbidden 'any' or 'unknown' types...",
  );

  const files = [];
  for (const scanDir of SCAN_DIRS) {
    getSourceFiles(path.join(rootDir, scanDir), files);
  }

  const violations = [];

  for (const filePath of files) {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Skip comments
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*")
      ) {
        return;
      }

      for (const rule of FORBIDDEN_RULES) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: relPath,
            lineNum: index + 1,
            lineText: trimmed,
            rule: rule.name,
          });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error(
      "\n\x1b[41m\x1b[37m%s\x1b[0m",
      " ❌ STRICT TYPE POLICY VIOLATION ",
    );
    console.error(
      "\x1b[31m%s\x1b[0m",
      `Found ${violations.length} occurrence(s) of forbidden 'any' or 'unknown' types:\n`,
    );

    violations.forEach((v) => {
      console.error(
        ` \x1b[33m${v.file}:${v.lineNum}\x1b[0m\n` +
          `   \x1b[31m[Violation]\x1b[0m ${v.rule}\n` +
          `   \x1b[90m${v.lineText}\x1b[0m\n`,
      );
    });

    console.error(
      "\x1b[31m%s\x1b[0m",
      "Commit, push, or merge request blocked per repository strict typing policy.",
    );
    console.error(
      "\x1b[90m%s\x1b[0m",
      "Hint: Replace 'any' or 'unknown' with strongly typed interfaces, unions, or safe type guards.\n",
    );

    process.exit(1);
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    `✅ Passed: ${files.length} TypeScript files verified. Zero 'any' or 'unknown' types found!`,
  );
  process.exit(0);
}

runCheck();
