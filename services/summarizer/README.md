# summarizer (Bloque 2 — FastAPI, opcional)

`POST /summarize`: recibe `{ diff, commit_message }`, devuelve `{ module, intent, decisions, gotchas }` — el CLI (`contextcore capture`) le agrega `author` y `timestamp` para completar el `ContextEvent` (ver `packages/core/src/types.ts`).

Modelo: `claude-haiku-4-5` a propósito — corre en cada commit del equipo, el costo debe mantenerse mínimo. Usa `output_config.format` (structured outputs) para forzar el JSON de salida.

Prohibido repetir el diff literal o información deducible del código — solo intención, decisiones y gotchas no obvias.

## Correr local

```bash
cd services/summarizer
pip install -r requirements.txt
cp .env.example .env   # setear ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

Luego, en la raíz del repo, setear `SUMMARIZER_URL=http://localhost:8000` (ver `.env.example`) para que `contextcore capture` lo use.

**Best-effort:** si `SUMMARIZER_URL` no está seteado o el servicio no responde en 5s, `contextcore capture` cae automáticamente al fallback local basado en el mensaje de commit (sin LLM) — nunca bloquea el flujo de git.

Plan B (hora 7): si la integración TS↔Python da guerra, esta lógica se colapsa dentro del CLI y este servicio se elimina. El pitch no cambia.
