import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
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
# Git pre-push hook: Disallow direct push to dev/beta/production, disallow any/unknown types, type check & lint

remote="$1"
url="$2"

has_code_changes=0

# Inspect refs being pushed
while read local_ref local_sha remote_ref remote_sha
do
  branch_name=\${remote_ref#refs/heads/}

  # Check if this operation is a branch deletion
  if [ "$local_ref" = "(delete)" ] || [ "$local_sha" = "0000000000000000000000000000000000000000" ]; then
    if [ "$branch_name" = "dev" ] || [ "$branch_name" = "beta" ] || [ "$branch_name" = "production" ]; then
      echo "❌ Git push aborted: Deleting the protected '$branch_name' branch is strictly forbidden!"
      exit 1
    fi
    # Allowed deletion for other branches (feature / fix branches)
    continue
  fi

  has_code_changes=1

  # Block direct pushes to protected environment branches
  if [ "$branch_name" = "dev" ] || [ "$branch_name" = "beta" ] || [ "$branch_name" = "production" ]; then
    echo "❌ Git push aborted: Direct push to '$branch_name' branch is strictly forbidden!"
    echo "👉 Environment Workflow:"
    echo "   • dev        : Local testing & development (use feature/* -> PR/MR to dev)"
    echo "   • beta       : Blue Environment (use PR/MR from dev to beta)"
    echo "   • production : Green Environment (use PR/MR from beta to production)"
    echo ""
    echo "   To push code, please checkout a feature/task branch:"
    echo "   1) git checkout -b feature/<your-feature-name>"
    echo "   2) git push -u origin feature/<your-feature-name>"
    echo "   3) Open a PR/MR to merge into dev"
    exit 1
  fi
done

# If only deleting branches, skip type checking and linting
if [ $has_code_changes -eq 0 ]; then
  echo "✅ Remote branch deletion allowed."
  exit 0
fi

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

    // Configure safe branch delete git alias
    try {
      execSync('git config alias.del-branch "!node scripts/safe-branch-delete.js"', {
        cwd: rootDir,
        stdio: "ignore",
      });
      console.log("✅ Git alias 'git del-branch' configured for safe branch deletion.");
    } catch {
      // ignore alias configuration errors if git is unavailable
    }
  } else {
    console.log(
      "ℹ️ .git/hooks directory not found, skipping local git hook installation.",
    );
  }
} catch (err) {
  console.warn("⚠️ Could not write git hooks:", err.message);
}
