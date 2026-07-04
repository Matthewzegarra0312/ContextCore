Cada dev escribe SOLO en su propio `<autor>.jsonl` (append-only, una línea JSON por evento). Nunca se edita el compilado a mano.

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
