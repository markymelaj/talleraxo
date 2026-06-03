# Corrección de despliegue Vercel

El error de Vercel:

```txt
npm error Exit handler never called!
Command "npm install" exited with 1
```

no corresponde al código de la aplicación. Ocurre antes del build, durante la instalación de dependencias.

## Qué se corrigió

- Se eliminó `package-lock.json` porque contenía URLs `resolved` de un registry interno del entorno de generación.
- Se agregó `.npmrc` apuntando explícitamente a `https://registry.npmjs.org/`.
- Se fijó Node.js en `22.x`.
- Se agregó `packageManager: npm@10.9.2`.
- Se configuró `vercel.json` para instalar con:

```bash
npm install --no-audit --no-fund --prefer-online --registry=https://registry.npmjs.org/
```

## Cómo subirlo

1. Reemplazar el contenido del repo por esta versión.
2. Confirmar que NO exista `package-lock.json` en GitHub.
3. Hacer commit y push.
4. En Vercel: redeploy con **Clear Build Cache**.

## Variables necesarias en Vercel

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WORKSHOP_WHATSAPP=569XXXXXXXX
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
ADMIN_PASSWORD=demo123
```
