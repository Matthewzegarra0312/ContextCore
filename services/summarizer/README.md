# summarizer (Bloque 2 — FastAPI, opcional)

`POST /summarize`: recibe `git diff` + mensaje de commit, devuelve un `ContextEvent` (ver `packages/core/src/types.ts`).

Prohibido repetir el diff literal o información deducible del código — solo intención, decisiones y gotchas.

Plan B (hora 7): si la integración TS↔Python da guerra, esta lógica se colapsa dentro del CLI y este servicio se elimina.
