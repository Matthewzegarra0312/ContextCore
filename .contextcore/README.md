Todos los eventos del equipo van a `context.jsonl` (append-only, una línea JSON por evento, un único archivo compartido — cada línea incluye el campo `author`, así que no hace falta un archivo por persona). Nunca se edita a mano.

`context.md` en esta carpeta es un archivo generado: `contextcore sync` lo regenera en cada corrida como una vista Markdown legible del historial COMPLETO de eventos (todo `context.jsonl`, sin recorte de tokens). La vista resumida y acotada para agentes sigue siendo `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/contextcore.mdc`.

Contrato del evento (ver `packages/core/src/types.ts`):

```json
{
  "author": "daniel",
  "timestamp": "2026-07-04T12:00:00Z",
  "module": "payments/",
  "intent": "Añadido retry con backoff a la pasarela Stripe",
  "decisions": ["Se descartó cola por simplicidad"],
  "gotchas": ["El sandbox de Stripe tarda ~2s en confirmar"]
}
```
