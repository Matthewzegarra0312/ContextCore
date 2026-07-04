# Publicar en npm (Bloque 7)

Esto lo tiene que correr alguien del equipo con su propia cuenta de npm — publicar
es una acción pública e irreversible por versión, así que no la ejecuta el agente.

## Antes de publicar

1. Confirmar sesión: `npm whoami` (si falla, `npm login`).
2. Build de ambos paquetes desde la raíz del monorepo:
   ```bash
   pnpm --filter @contextcore/core build
   pnpm --filter contextcore build
   ```
3. Dry-run para revisar qué se va a subir (no publica nada todavía):
   ```bash
   cd packages/core && pnpm publish --access public --dry-run
   cd ../cli && pnpm publish --dry-run
   ```

## Publicar (orden importa)

`contextcore` depende de `@contextcore/core` en runtime — hay que publicar
`@contextcore/core` primero, o `npm install contextcore` va a fallar buscando
una versión de `@contextcore/core` que todavía no existe en el registro.

```bash
cd packages/core
pnpm publish --access public

cd ../cli
pnpm publish
```

`pnpm publish` (no `npm publish`) es necesario en `packages/cli` porque su
dependencia `"@contextcore/core": "workspace:*"` solo pnpm sabe reescribirla
a un rango de versión real al publicar.

## Verificar

Desde cualquier carpeta (no hace falta estar en el monorepo):

```bash
npx contextcore@latest status
```

Debería imprimir "Sin eventos todavía" — confirma que resolvió el paquete
publicado desde el registro público, no el local.

## Re-publicar

npm no permite subir la misma versión dos veces. Antes de un segundo publish,
subir el número de versión en `packages/core/package.json` y
`packages/cli/package.json` (mantenerlos sincronizados es lo más simple).
