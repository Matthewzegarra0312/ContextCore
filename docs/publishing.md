# Publicar en npm (Bloque 7)

Esto lo tiene que correr alguien del equipo con su propia cuenta de npm — publicar
es una acción pública e irreversible por versión, así que no la ejecuta el agente.

## Antes de publicar

1. **2FA obligatorio.** npm exige two-factor auth para publicar. Si tu cuenta no
   lo tiene, activalo en npmjs.com → tu avatar → **Account** → *Two-Factor
   Authentication* antes de seguir, o el publish falla con `EOTP`.
2. **El scope `@contextcore` tiene que existir como organización tuya.** Sin
   esto, publicar `@contextcore/core` o `@contextcore/cli` falla con
   `404 Scope notfound`. Creala en npmjs.com → tu avatar → **Add Organization**
   → nombre `contextcore` → plan gratuito (paquetes públicos ilimitados).
3. Confirmar sesión: `npm whoami` (si falla, `npm login`).
4. Build de ambos paquetes desde la raíz del monorepo:
   ```bash
   pnpm --filter @contextcore/core build
   pnpm --filter @contextcore/cli build
   ```
5. Dry-run para revisar qué se va a subir (no publica nada todavía):
   ```bash
   cd packages/core && pnpm publish --access public --dry-run
   cd ../cli && pnpm publish --dry-run
   ```

## Publicar (orden importa)

`@contextcore/cli` depende de `@contextcore/core` en runtime — hay que publicar
`@contextcore/core` primero, o instalar el CLI va a fallar buscando una versión
de `@contextcore/core` que todavía no existe en el registro.

```bash
cd packages/core
pnpm publish --access public

cd ../cli
pnpm publish
```

`pnpm publish` (no `npm publish`) es necesario porque la dependencia
`"@contextcore/core": "workspace:*"` solo pnpm sabe reescribirla a un rango de
versión real al publicar.

Cada uno de estos dos comandos abre una URL de confirmación en el navegador
(`Authenticate your account at: https://www.npmjs.com/auth/cli/...`) — hay que
abrirla y confirmar con la cuenta logueada antes de que el publish continúe.

**Gotcha real:** el nombre unscoped `contextcore` (sin `@contextcore/`) está
bloqueado por la política antisquatting de npm — lo marca "too similar to
existing package `context-core`" y devuelve `403`. Por eso el paquete del CLI
se publica como `@contextcore/cli` (scoped), no como `contextcore` a secas.

## Cómo queda el "empezar" para un usuario nuevo

El scope no cambia el comando final una vez instalado — el binario sigue
llamándose `contextcore` (campo `bin` del `package.json`, independiente del
nombre del paquete):

```bash
npm install -D @contextcore/cli
npx contextcore init
```

Después de ese install, todo `npx contextcore ...` (incluido el que dispara el
hook `post-commit`) resuelve local via `node_modules/.bin/contextcore` — no
vuelve a pegarle al registro.

## Verificar

```bash
npx @contextcore/cli@latest status
```

Debería imprimir "Sin eventos todavía" — confirma que resolvió el paquete
publicado desde el registro público, no el local.

## Re-publicar

npm no permite subir la misma versión dos veces. Antes de un segundo publish,
subir el número de versión en `packages/core/package.json` y
`packages/cli/package.json` (mantenerlos sincronizados es lo más simple).
