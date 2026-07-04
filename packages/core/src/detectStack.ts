import fs from "node:fs";
import path from "node:path";

export interface DetectedStack {
  name: string;
  languages: string[];
  frameworks: string[];
  packageManager?: string;
}

const NODE_FRAMEWORKS: Record<string, string> = {
  next: "Next.js",
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  express: "Express",
  fastify: "Fastify",
  "@nestjs/core": "NestJS",
};

function readJsonSafe(filePath: string): any | undefined {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

export function detectStack(cwd: string = process.cwd()): DetectedStack {
  const languages: string[] = [];
  const frameworks: string[] = [];
  let name = path.basename(cwd);
  let packageManager: string | undefined;

  const pkgJsonPath = path.join(cwd, "package.json");
  const pkgJson = readJsonSafe(pkgJsonPath);
  if (pkgJson) {
    name = pkgJson.name ?? name;
    const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
    const usesTypeScript =
      fs.existsSync(path.join(cwd, "tsconfig.json")) ||
      fs.existsSync(path.join(cwd, "tsconfig.base.json")) ||
      "typescript" in deps;
    languages.push(usesTypeScript ? "TypeScript" : "JavaScript");
    for (const [dep, label] of Object.entries(NODE_FRAMEWORKS)) {
      if (dep in deps) frameworks.push(label);
    }

    if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) packageManager = "pnpm";
    else if (fs.existsSync(path.join(cwd, "yarn.lock"))) packageManager = "yarn";
    else if (fs.existsSync(path.join(cwd, "package-lock.json"))) packageManager = "npm";
  }

  const hasPython =
    fs.existsSync(path.join(cwd, "requirements.txt")) || fs.existsSync(path.join(cwd, "pyproject.toml"));
  if (hasPython) {
    languages.push("Python");
    const reqPath = path.join(cwd, "requirements.txt");
    const req = fs.existsSync(reqPath) ? fs.readFileSync(reqPath, "utf8").toLowerCase() : "";
    if (req.includes("fastapi")) frameworks.push("FastAPI");
    if (req.includes("flask")) frameworks.push("Flask");
    if (req.includes("django")) frameworks.push("Django");
  }

  if (fs.existsSync(path.join(cwd, "go.mod"))) languages.push("Go");
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) languages.push("Rust");

  return { name, languages, frameworks, packageManager };
}
