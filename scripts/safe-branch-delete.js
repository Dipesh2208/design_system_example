import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const force = args.includes("-D") || args.includes("-f") || args.includes("--force");
const branches = args.filter((arg) => !arg.startsWith("-"));

const PROTECTED_BRANCHES = new Set(["dev", "beta", "production"]);

if (branches.length === 0) {
  console.log("Usage: node scripts/safe-branch-delete.js [-d|-D] <branch-name>");
  console.log("Or via git alias: git del-branch <branch-name>");
  process.exit(1);
}

let hasError = false;

for (const branch of branches) {
  if (PROTECTED_BRANCHES.has(branch.trim())) {
    console.error(
      `\x1b[31m❌ Action aborted: Branch '${branch}' is a protected environment branch (dev, beta, production) and cannot be deleted!\x1b[0m`,
    );
    hasError = true;
    continue;
  }

  try {
    const flag = force ? "-D" : "-d";
    const output = execSync(`git branch ${flag} ${branch}`, {
      stdio: "pipe",
      encoding: "utf-8",
    });
    console.log(output.trim());
  } catch (err) {
    console.error(`\x1b[31m❌ Failed to delete branch '${branch}':\x1b[0m\n${err.stderr || err.message}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}
