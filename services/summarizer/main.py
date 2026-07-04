import json
from typing import List

from anthropic import Anthropic
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="ContextCore summarizer")
client = Anthropic()

# Modelo barato/rapido a proposito (ver ContextCore.md Bloque 2) - esto corre
# en cada commit del equipo, el costo debe mantenerse minimo.
MODEL = "claude-haiku-4-5"

SUMMARY_SCHEMA = {
    "type": "object",
    "properties": {
        "module": {
            "type": "string",
            "description": "Ruta o modulo principal afectado, ej. 'packages/cli'",
        },
        "intent": {
            "type": "string",
            "description": "Una frase: la intencion del cambio, no el diff literal",
        },
        "decisions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Decisiones de diseno tomadas, si las hay",
        },
        "gotchas": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Comportamientos sorprendentes o trampas descubiertas, si las hay",
        },
    },
    "required": ["module", "intent", "decisions", "gotchas"],
    "additionalProperties": False,
}

SYSTEM_PROMPT = """Analizas un commit de git para un sistema de memoria compartida entre agentes de codigo.

Tu unico trabajo es extraer lo NO OBVIO: la intencion detras del cambio, decisiones de diseno tomadas, y gotchas (comportamientos sorprendentes) descubiertos.

Reglas estrictas:
- NUNCA repitas el diff literal ni describas linea por linea que cambio.
- NUNCA describas cosas que un agente ya puede deducir leyendo el codigo (nombres de funciones, imports, estructura).
- Si no hay una decision de diseno no obvia, devuelve una lista vacia en "decisions".
- Si no hay un gotcha real, devuelve una lista vacia en "gotchas".
- "intent" es una sola frase corta explicando el PORQUE del cambio, no el que.
- "module" es la ruta principal afectada (ej. "packages/cli", "web/dashboard")."""


class SummarizeRequest(BaseModel):
    diff: str
    commit_message: str


class SummarizeResponse(BaseModel):
    module: str
    intent: str
    decisions: List[str]
    gotchas: List[str]


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest) -> SummarizeResponse:
    # El diff se trunca: el presupuesto de tokens es una restriccion de
    # diseno explicita del proyecto (ver ContextCore.md), no solo del compilador.
    user_content = f"Mensaje de commit:\n{req.commit_message}\n\nDiff:\n{req.diff[:12000]}"

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        output_config={"format": {"type": "json_schema", "schema": SUMMARY_SCHEMA}},
        messages=[{"role": "user", "content": user_content}],
    )

    text_block = next(block for block in response.content if block.type == "text")
    data = json.loads(text_block.text)
    return SummarizeResponse(**data)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
