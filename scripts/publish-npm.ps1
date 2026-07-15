# Publica @contextcore/core y @contextcore/cli en npm (orden: core → cli).
# Requisitos: npm login + 2FA activo + org @contextcore en tu cuenta.
# Uso (desde la raíz del monorepo):
#   npm login
#   .\scripts\publish-npm.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "Verificando sesión npm..." -ForegroundColor Cyan
npm whoami
if ($LASTEXITCODE -ne 0) {
  Write-Host "No estás logueado. Corré: npm login" -ForegroundColor Red
  exit 1
}

Write-Host "Compilando paquetes..." -ForegroundColor Cyan
pnpm --filter @contextcore/core build
pnpm --filter @contextcore/cli build

Write-Host "Publicando @contextcore/core..." -ForegroundColor Cyan
Set-Location packages/core
pnpm publish --access public --no-git-checks
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Publicando @contextcore/cli..." -ForegroundColor Cyan
Set-Location ../cli
pnpm publish --no-git-checks
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $root
Write-Host ""
Write-Host "Listo. Verificá con:" -ForegroundColor Green
Write-Host "  npm view @contextcore/cli version"
Write-Host "  npx @contextcore/cli@latest init"
