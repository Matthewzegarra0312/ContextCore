#!/usr/bin/env node
// Corre automáticamente en cada `pnpm install` (lifecycle "prepare" del
// package.json raíz). Instala el hook post-commit sin depender de dist/ de
// @contextcore/core, que todavía no existe en un clon recién hecho antes del
// primer build. Duplica a propósito la lógica de packages/core/src/gitHook.ts
// (mismo HOOK_MARKER, mismo contenido) para no crear una dependencia circular
// con el build.
import fs from "node:fs";
import path from "node:path";

const HOOK_MARKER = "# contextcore-hook";
const cwd = process.cwd();
const hooksDir = path.join(cwd, ".git", "hooks");

if (!fs.existsSync(hooksDir)) {
  console.log("[contextcore] Aviso: no se detectó .git/hooks — se omite instalación del hook (¿no es un repo git?).");
  process.exit(0);
}

const hookPath = path.join(hooksDir, "post-commit");

if (fs.existsSync(hookPath)) {
  const existing = fs.readFileSync(hookPath, "utf8");
  if (existing.includes(HOOK_MARKER)) {
    console.log("[contextcore] Hook post-commit ya estaba instalado.");
  } else {
    console.log("[contextcore] Aviso: ya existe un post-commit de otra herramienta, no se tocó.");
  }
  process.exit(0);
}

const script = ["#!/bin/sh", HOOK_MARKER, "npx contextcore capture", "npx contextcore sync", ""].join("\n");
fs.writeFileSync(hookPath, script, "utf8");
try {
  fs.chmodSync(hookPath, 0o755);
} catch {
  // Windows no tiene bits de permiso; Git Bash igual respeta el shebang.
}
console.log("[contextcore] Hook post-commit instalado automáticamente (capture + sync en cada commit).");
