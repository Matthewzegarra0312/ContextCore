import { execSync } from "node:child_process";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

export function getAuthor(): string {
  if (process.env.CONTEXTCORE_AUTHOR) {
    return slugify(process.env.CONTEXTCORE_AUTHOR);
  }
  try {
    const gitName = execSync("git config user.name", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (gitName) return slugify(gitName);
  } catch {
    // sin git config disponible, seguimos al fallback
  }
  return "unknown";
}
