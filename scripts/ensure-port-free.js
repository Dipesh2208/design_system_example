import { execSync } from "node:child_process";

const port = process.argv[2] || "3002";

try {
  if (process.platform === "win32") {
    const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const lines = out.trim().split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0" && !isNaN(Number(pid))) {
        try {
          process.kill(Number(pid), "SIGKILL");
          console.log(`Freed port ${port} by terminating lingering process PID ${pid}`);
        } catch {}
      }
    }
  }
} catch {
  // Port is free
}
