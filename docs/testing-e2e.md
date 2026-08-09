# Pruebas E2E

La suite usa Playwright y debe ejecutarse contra localhost o un proyecto Supabase de staging. No se deben usar credenciales de producción ni ejecutar mutaciones contra datos compartidos.

## Instalación

```powershell
npm install
npx playwright install chromium
```

## Ejecución visible

```powershell
npm run test:e2e:ui
npx playwright test --headed
npx playwright show-report
```

`npm run test:e2e:ui` abre Playwright UI. `--headed` muestra el navegador durante la ejecución.

## Variables opcionales

Sin estas variables se ejecutan las pruebas públicas y de `401`; los escenarios `403`, superadmin y modal se omiten con un mensaje explícito.

```powershell
$env:E2E_BASE_URL="http://127.0.0.1:3000"
$env:NEXT_PUBLIC_SUPABASE_URL="https://proyecto-staging.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
$env:E2E_ADMIN_EMAIL="admin-staging@example.com"
$env:E2E_ADMIN_PASSWORD="..."
$env:E2E_NON_ADMIN_EMAIL="editor-staging@example.com"
$env:E2E_NON_ADMIN_PASSWORD="..."
npm run test:e2e:auth
```

Los tokens solo viven en memoria del runner y no se imprimen. Las pruebas de esta primera fase no crean, actualizan ni eliminan contenido.
