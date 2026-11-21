import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const hooksDir = path.join(rootDir, ".git", "hooks");

const preCommitHook = `#!/bin/sh
# Git pre-commit hook: Disallow any or unknown types & run type checking

echo "🔍 Running pre-commit strict type check..."
node scripts/check-no-any-unknown.js
if [ $? -ne 0 ]; then
  echo "❌ Git commit aborted: 'any' or 'unknown' types are strictly disallowed!"
  exit 1
fi

echo "🛡️ Running pre-commit TypeScript check-types..."
pnpm check-types
if [ $? -ne 0 ]; then
  echo "❌ Git commit aborted: TypeScript type checking failed!"
  exit 1
fi

echo "✅ Pre-commit verification passed."
exit 0
`;

const prePushHook = `#!/bin/sh
# Git pre-push hook: Disallow any or unknown types, type check & lint

echo "🔍 Running pre-push strict type check..."
node scripts/check-no-any-unknown.js
if [ $? -ne 0 ]; then
  echo "❌ Git push aborted: 'any' or 'unknown' types are strictly disallowed!"
  exit 1
fi

echo "🛡️ Running pre-push TypeScript check-types..."
pnpm check-types
if [ $? -ne 0 ]; then
  echo "❌ Git push aborted: TypeScript type checking failed!"
  exit 1
fi

echo "🔍 Running pre-push ESLint verification..."
pnpm run lint
if [ $? -ne 0 ]; then
  echo "❌ Git push aborted: ESLint validation failed!"
  exit 1
fi

echo "✅ Pre-push verification passed."
exit 0
`;

try {
  if (fs.existsSync(hooksDir)) {
    fs.writeFileSync(path.join(hooksDir, "pre-commit"), preCommitHook, {
      mode: 0o755,
    });
    fs.writeFileSync(path.join(hooksDir, "pre-push"), prePushHook, {
      mode: 0o755,
    });
    console.log("✅ Git pre-commit and pre-push hooks installed successfully.");
  } else {
    console.log(
      "ℹ️ .git/hooks directory not found, skipping local git hook installation.",
    );
  }
} catch (err) {
  console.warn("⚠️ Could not write git hooks:", err.message);
}
