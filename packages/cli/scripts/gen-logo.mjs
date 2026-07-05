// Genera packages/cli/src/logo.ts a partir de logo-contextcore.webp (raíz del
// monorepo), usando el truco de "medio-bloque" (▀) para pintar 2 píxeles
// verticales por carácter con color ANSI de 24 bits. Se corre una sola vez
// (o cuando cambie el logo) — el resultado queda embebido como string
// estático, sin ninguna dependencia de imágenes en runtime.
//
// Uso: pnpm --filter @contextcore/cli run gen:logo [ancho]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(HERE, "..", "..", "..");
const SOURCE_LOGO = path.join(REPO_ROOT, "logo-contextcore.webp");
const OUTPUT_FILE = path.join(HERE, "..", "src", "logo.ts");

const ALPHA_THRESHOLD = 128;
const targetWidth = Number(process.argv[2]) || 24;

function cellAnsi(top, bottom) {
  const topOpaque = top && top.a >= ALPHA_THRESHOLD;
  const bottomOpaque = bottom && bottom.a >= ALPHA_THRESHOLD;

  if (!topOpaque && !bottomOpaque) return " ";
  if (topOpaque && bottomOpaque) {
    return `\x1b[38;2;${top.r};${top.g};${top.b}m\x1b[48;2;${bottom.r};${bottom.g};${bottom.b}m\u2580\x1b[0m`;
  }
  if (topOpaque) {
    return `\x1b[38;2;${top.r};${top.g};${top.b}m\u2580\x1b[0m`;
  }
  return `\x1b[38;2;${bottom.r};${bottom.g};${bottom.b}m\u2584\x1b[0m`;
}

async function main() {
  // El .webp original tiene mucho margen transparente alrededor del ícono
  // (lienzo cuadrado grande); se recorta antes de medir el aspect ratio para
  // que el pixel-art aproveche toda la grilla de caracteres.
  const trimmed = sharp(SOURCE_LOGO).trim();
  const meta = await trimmed.metadata();
  const aspect = meta.height / meta.width;
  let targetHeight = Math.round(targetWidth * aspect);
  if (targetHeight % 2 !== 0) targetHeight += 1; // par -> cada carácter pinta 2 filas

  const { data, info } = await sharp(SOURCE_LOGO)
    .trim()
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixelAt = (x, y) => {
    if (y >= height) return null;
    const idx = (y * width + x) * channels;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
  };

  const lines = [];
  for (let y = 0; y < height; y += 2) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += cellAnsi(pixelAt(x, y), pixelAt(x, y + 1));
    }
    lines.push(line);
  }

  const banner = lines.join("\n");
  console.log(banner);
  console.log(`\n(${width}x${height} px -> ${lines.length} líneas de terminal)`);

  const fileContents = `// Generado por \`pnpm --filter @contextcore/cli run gen:logo\` a partir de
// logo-contextcore.webp — no editar a mano, volver a correr el script si
// cambia el logo. Medio-bloque (▀) con ANSI de 24 bits: cada línea pinta 2
// filas de píxeles reales del logo.
export const LOGO_WIDTH = ${width};

export const LOGO_LINES: string[] = ${JSON.stringify(lines, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, fileContents, "utf8");
  console.log(`\nEscrito en ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);
}

main().catch((err) => {
  console.error("[gen-logo] Error:", err);
  process.exit(1);
});
