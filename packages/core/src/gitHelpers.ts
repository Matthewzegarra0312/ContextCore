import { execSync } from "node:child_process";

export function git(args: string, cwd: string = process.cwd()): string {
  try {
    return execSync(`git ${args}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}
