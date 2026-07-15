<!-- Generado por `contextcore sync` — no editar a mano. -->

# ContextCore — contextcore-monorepo

- Lenguajes: TypeScript
- Frameworks: ninguno detectado
- Gestor de paquetes: pnpm

## Historial de contexto (17 eventos)

### 2026-07-15T07:21:30.762Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore`
- **Intent:** Automatizacion

### 2026-07-14T07:54:48.302Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, AGENTS.md (+5 más)`
- **Intent:** Automatizacion

### 2026-07-04T14:05:31.007Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, AGENTS.md (+5 más)`
- **Intent:** Conectado Supabase real + fix critico de carga de .env

### 2026-07-04T14:04:30.328Z — matthew-stephano-zegarra-ramos

- **Módulo:** `packages/cli,services/summarizer,supabase`
- **Intent:** Conectado el proyecto real de Supabase (dashboard en vivo + insert del CLI) y agregada carga automatica de .env
- **Decisiones:**
  - Se agrego dotenv al CLI y python-dotenv al summarizer: sin esto, crear un .env no tenia ningun efecto, ni Node ni Python lo cargan solos
- **Gotchas:**
  - Supabase a veces activa RLS solo al crear una tabla desde el SQL editor; con RLS activado y sin politicas, tanto el insert del CLI como el select del dashboard quedan bloqueados por default
  - Correr todo el schema.sql de una vez falla si una linea ya se aplico antes (alter publication no es idempotente) y aborta la transaccion completa, incluyendo lineas posteriores que si hacian falta

### 2026-07-04T12:52:15.298Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, .github (+8 más)`
- **Intent:** Bloque 7: publicados de verdad en npm + fix de naming

### 2026-07-04T12:51:36.988Z — matthew-stephano-zegarra-ramos

- **Módulo:** `packages/cli,docs,web`
- **Intent:** Publicados @contextcore/core y @contextcore/cli en npm de verdad (registro publico)
- **Decisiones:**
  - El paquete del CLI paso de 'contextcore' (unscoped) a '@contextcore/cli' (scoped) porque npm bloqueo el nombre unscoped por similitud con el paquete existente 'context-core'
- **Gotchas:**
  - npm exige 2FA para publicar y el scope @contextcore debe existir como organizacion antes de publicar bajo el, o falla con 404 Scope notfound
  - Tras un publish exitoso, 'npm view' puede devolver 404 por unos segundos hasta que el registro propaga — no es que el publish fallo

### 2026-07-04T12:15:28.406Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, .github (+8 más)`
- **Intent:** Bloque 7: paquetes listos para npm + pitch pulido

### 2026-07-04T12:13:22.972Z — matthew-stephano-zegarra-ramos

- **Módulo:** `packages/cli,packages/core,docs`
- **Intent:** Bloque 7: paquetes listos para npm publish + pitch de 3 minutos pulido
- **Decisiones:**
  - El paquete del CLI se renombro de @contextcore/cli a contextcore (sin scope) para que npx contextcore init funcione tal cual promete el pitch
  - @contextcore/core tambien se publica (publishConfig access public) porque el CLI lo necesita en runtime, no solo en el monorepo
- **Gotchas:**
  - pnpm publish (no npm publish) es obligatorio en packages/cli: solo pnpm reescribe la dependencia workspace:* a un rango de version real al publicar
  - @contextcore/core debe publicarse antes que contextcore, o npm install fallaria buscando una version de core que todavia no existe en el registro

### 2026-07-04T12:06:53.761Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, .gitignore (+6 más)`
- **Intent:** Bloque 5: repo demo/ reproducible + guion de la demo de dos actos

### 2026-07-04T12:03:55.729Z — matthew-stephano-zegarra-ramos

- **Módulo:** `scripts,docs`
- **Intent:** Bloque 5: repo demo/ (target de ejemplo con historial real) + guion de los dos actos
- **Decisiones:**
  - demo/ es un repo git separado y gitignoreado por el monorepo; se versiona scripts/setup-demo.sh, no el contenido generado, para que cualquiera lo regenere identico
  - El commit de housekeeping (init + historial sembrado) deshabilita el hook temporalmente para no ensuciar 'trabajo en curso' con un evento meta
- **Gotchas:**
  - inferModule devolvia solo el primer segmento de ruta (ej. 'src'), demasiado generico para el pitch; se corrigio para usar dos segmentos cuando el primero es un directorio contenedor (src, packages, services, etc.)

### 2026-07-04T11:27:37.505Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, AGENTS.md (+4 más)`
- **Intent:** Bloque 1b/6: dashboard Next.js + Tailwind con Supabase Realtime

### 2026-07-04T11:26:44.318Z — matthew-stephano-zegarra-ramos

- **Módulo:** `web,supabase`
- **Intent:** Bloque 1b/6: dashboard Next.js + Tailwind (landing y /dashboard) con Supabase Realtime
- **Decisiones:**
  - Paleta categorica del skill dataviz (8 colores validados) para identidad por autor, determinista via hash, nunca reasignada
  - Dashboard con fallback a datos de ejemplo (mockEvents) si NEXT_PUBLIC_SUPABASE_URL/ANON_KEY no estan seteados, para poder demostrarlo sin backend
- **Gotchas:**
  - Supabase Realtime es opt-in por tabla: hay que correr 'alter publication supabase_realtime add table context_events' o los INSERTs no llegan por websocket

### 2026-07-04T11:15:37.327Z — matthew-stephano-zegarra-ramos

- **Módulo:** `.contextcore, .cursor, .env.example (+4 más)`
- **Intent:** Bloque 2: servicio FastAPI de resumen semantico (best-effort)

### 2026-07-04T11:14:51.149Z — matthew-stephano-zegarra-ramos

- **Módulo:** `services/summarizer,packages/core`
- **Intent:** Bloque 2: servicio FastAPI de resumen semantico + integracion best-effort en contextcore capture
- **Decisiones:**
  - Modelo claude-haiku-4-5 a proposito (barato/rapido, corre en cada commit del equipo)
  - Structured outputs (output_config.format json_schema) en vez de pedirle al modelo que devuelva JSON en texto libre, para no depender de parseo fragil
- **Gotchas:**
  - Sin el servicio corriendo o SUMMARIZER_URL sin configurar, capture cae solo al fallback local (mensaje de commit) sin romper el commit

### 2026-07-04T10:59:02.326Z — matthew-stephano-zegarra-ramos

- **Módulo:** `packages/core`
- **Intent:** Bloque 3: compilador multi-formato (AGENTS.md, CLAUDE.md, .cursor/rules/contextcore.mdc) con presupuesto de tokens
- **Decisiones:**
  - CLAUDE.md se escribe como copia real de AGENTS.md, no symlink: en Windows un symlink pide privilegios elevados y esto tiene que andar sin friccion en la demo
  - Presupuesto de tokens (~2000): se recortan primero los gotchas mas viejos, luego las decisiones mas viejas; overview y trabajo en curso nunca se truncan

### 2026-07-04T10:59:00.586Z — matthew-stephano-zegarra-ramos

- **Módulo:** `packages/core,packages/cli`
- **Intent:** Bloque 1: storage append-only por autor + deteccion de stack + Supabase best-effort
- **Decisiones:**
  - Se agrego el comando log (no estaba en el doc original) para poder generar eventos antes de que existan el summarizer y el git hook
  - Insert a Supabase es best-effort: si faltan SUPABASE_URL/SUPABASE_ANON_KEY, no-op silencioso, el CLI sigue offline
- **Gotchas:**
  - packages/core hay que recompilar (tsc) tras cada cambio de fuente, o el CLI en modo dev via tsx falla con 'no provee export' porque importa desde dist/
  - detectStack no detectaba TypeScript en la raiz del monorepo porque solo miraba tsconfig.json y no tsconfig.base.json; corregido sumando ese chequeo

### 2026-07-04T10:58:58.837Z — matthew-stephano-zegarra-ramos

- **Módulo:** `packages/core,packages/cli`
- **Intent:** Bloque 0: contrato del evento de contexto y scaffold del monorepo pnpm
- **Decisiones:**
  - ContextEvent minimal: author/timestamp/module/intent/decisions/gotchas, sin campos extra
