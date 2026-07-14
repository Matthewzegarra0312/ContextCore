import { appendEvent, getAuthor, insertEventBestEffort, type ContextEvent } from "@contextcore/core";

function parseArgs(
  args: string[]
): { module?: string; intent?: string; changes: string[]; decisions: string[]; gotchas: string[] } {
  const result = { changes: [] as string[], decisions: [] as string[], gotchas: [] as string[] } as {
    module?: string;
    intent?: string;
    changes: string[];
    decisions: string[];
    gotchas: string[];
  };

  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    const value = args[++i];
    if (flag === "--module") result.module = value;
    else if (flag === "--intent") result.intent = value;
    else if (flag === "--change") result.changes.push(value);
    else if (flag === "--decision") result.decisions.push(value);
    else if (flag === "--gotcha") result.gotchas.push(value);
  }
  return result;
}

// Comando manual para registrar un evento antes de que existan el
// resumen automático (Bloque 2) y el git hook (Bloque 4). Bloque 4
// terminará llamando a esta misma función (appendEvent + insertEventBestEffort)
// desde el hook post-commit, con el evento generado por el summarizer.
export async function log(args: string[]): Promise<void> {
  const { module, intent, changes, decisions, gotchas } = parseArgs(args);

  if (!module || !intent) {
    console.log(
      "Uso: contextcore log --module <ruta> --intent <texto> [--change <texto>]... [--decision <texto>]... [--gotcha <texto>]..."
    );
    process.exit(1);
  }

  const event: ContextEvent = {
    author: getAuthor(),
    timestamp: new Date().toISOString(),
    module,
    intent,
    changes,
    decisions,
    gotchas,
  };

  appendEvent(event);
  await insertEventBestEffort(event);

  console.log(`[contextcore log] Evento registrado por ${event.author} en ${event.module}`);
}
