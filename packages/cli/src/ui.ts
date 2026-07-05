import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";
import { LOGO_LINES, LOGO_WIDTH } from "./logo.js";

export interface CommandInfo {
  name: string;
  description: string;
}

// Fuente única de verdad para la ayuda — si se agrega un comando nuevo al
// switch de index.ts, agregarlo aquí también para que aparezca en `--help`.
export const COMMANDS: CommandInfo[] = [
  { name: "init", description: "Detecta el stack e inicializa .contextcore/ + hook de git" },
  { name: "sync", description: "Recompila AGENTS.md, CLAUDE.md y .cursor/rules" },
  { name: "status", description: "Última actividad por autor" },
  { name: "log", description: "Registra un evento manualmente" },
  { name: "capture", description: "Registra un evento desde el último commit" },
  { name: "login", description: "Inicia sesión con GitHub (dashboard en vivo)" },
  { name: "logout", description: "Cierra la sesión local" },
];

const TAGLINE = "Memoria viva para tus agentes de código";

let cachedVersion: string | undefined;

// Lee la versión desde el package.json del propio paquete — funciona tanto
// corriendo con tsx desde src/ (dev) como desde dist/ (build/publicado),
// porque ambos son hijos directos de packages/cli/.
export function getVersion(): string {
  if (cachedVersion) return cachedVersion;
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.join(here, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version?: string };
    cachedVersion = pkg.version ?? "0.0.0";
  } catch {
    cachedVersion = "0.0.0";
  }
  return cachedVersion;
}

function box(lines: { plain: string; colored?: string }[]): string {
  const width = Math.max(...lines.map((l) => l.plain.length));
  const top = pc.dim(`╭${"─".repeat(width + 2)}╮`);
  const bottom = pc.dim(`╰${"─".repeat(width + 2)}╯`);
  const body = lines
    .map(({ plain, colored }) => {
      const padding = " ".repeat(width - plain.length);
      return `${pc.dim("│")} ${colored ?? plain}${padding} ${pc.dim("│")}`;
    })
    .join("\n");
  return [top, body, bottom].join("\n");
}

export function printBanner(): void {
  const titlePlain = "◆ ContextCore";
  const versionPlain = `v${getVersion()}`;
  // El ancho de la caja lo define la línea más larga (normalmente el
  // tagline); la versión se alinea al borde derecho de esa misma línea.
  const width = Math.max(TAGLINE.length, titlePlain.length + 2 + versionPlain.length);
  const gap = " ".repeat(width - titlePlain.length - versionPlain.length);
  const titleLinePlain = `${titlePlain}${gap}${versionPlain}`;
  const titleLineColored = `${pc.bold(pc.cyan(titlePlain))}${gap}${pc.dim(versionPlain)}`;

  // El pixel-art usa escapes ANSI de 24 bits — solo se pinta en terminales
  // con color (TTY sin NO_COLOR); en salida piped se omite y queda solo la
  // caja, para no ensuciar la salida con escapes crudos.
  if (pc.isColorSupported) {
    const outerWidth = width + 4; // bordes + padding de la caja
    const indent = " ".repeat(Math.max(0, Math.floor((outerWidth - LOGO_WIDTH) / 2)));
    for (const line of LOGO_LINES) {
      console.log(`${indent}${line}`);
    }
  }

  console.log(
    box([
      { plain: titleLinePlain, colored: titleLineColored },
      { plain: TAGLINE, colored: pc.dim(TAGLINE) },
    ])
  );
}

export function printHelp(): void {
  printBanner();
  console.log();
  console.log(pc.bold("Uso:"));
  console.log("  contextcore <comando> [opciones]");
  console.log();
  console.log(pc.bold("Comandos:"));
  const nameWidth = Math.max(...COMMANDS.map((c) => c.name.length));
  for (const { name, description } of COMMANDS) {
    console.log(`  ${pc.cyan(name.padEnd(nameWidth))}  ${description}`);
  }
  console.log();
  console.log(pc.bold("Ejemplos:"));
  console.log("  contextcore init");
  console.log('  contextcore log --module "src/payments" --intent "Nuevo endpoint de reembolsos"');
  console.log();
  console.log(pc.dim("Docs: https://github.com/Matthewzegarra0312/ContextCore"));
}
