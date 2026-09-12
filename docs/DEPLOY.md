# DEPLOY — Cómo publicar el sitio AIChE GDL

> **Estado:** el sitio es **100 % estático**. El output de
> `bun run build` es `dist/` — basta con servirlo desde cualquier host
> estático. Esta guía cubre los tres principales: **Cloudflare Pages**
> (recomendado), **Netlify** y **GitHub Pages**.

---

## 0. Antes de desplegar

### 0.1 Reemplazar el dominio placeholder

El sitio sale con `https://aichegdl.example.com` como placeholder
(ver `src/data/site.ts`, constante `siteUrl`). Cuando el usuario
confirme el dominio definitivo:

1. Editar **`siteUrl` en `src/data/site.ts`**. Es la única línea: desde F8
   `astro.config.mjs` la importa y `robots.txt` se genera a partir de ella
   (D-183). Antes estaba escrita a mano en tres sitios y cambiar sólo
   `site.ts` habría publicado el sitemap y el robots apuntando al dominio
   de prueba.
2. `bun run build` y comprobar que **no queda ni una aparición del dominio
   anterior**:

   ```bash
   grep -rl 'aichegdl.example.com' dist/ || echo "limpio"
   ```

   Debe propagar a `<link rel="canonical">`, `og:url`, `og:image`,
   `twitter:image`, el JSON-LD de `Organization` y `Event`,
   `sitemap-index.xml`, `sitemap-0.xml` y la línea `Sitemap:` de
   `robots.txt`.

### 0.2 Reemplazar imágenes y videos reales

**Después** los placeholders actuales por imágenes y videos
definitivos. Detalle completo en `docs/ASSETS.md`.

> **Importante:** tras sustituir cualquier archivo en `src/assets/media/`,
> **volver a ejecutar `bun run capture`** para regenerar las capturas
> del sitio antes de producir el video o de publicar. Las imágenes
> definitivas (sobre todo las fotos del equipo) tienen más calidad y
> merecen capturas actualizadas.

### 0.3 Verificar el build limpio

```bash
bun install              # primera vez o al cambiar dependencias
bunx astro check         # 0 errors, 0 warnings, 0 hints
bun run build            # genera dist/ con 8 páginas + sitemap
```

### 0.4 Smoke test del build local

```bash
bun run preview          # http://localhost:4321
```

Recorrer las 8 rutas. Sin errores en consola. Sin scroll horizontal en
360 px (móvil).

---

## 1. Cloudflare Pages (recomendado)

**Por qué:** free tier generoso, deploy atómico desde Git, HTTPS
automático, soporte nativo para Astro, **sin límite de tamaño** (los
videos pueden ser > 25 MB), red global con caché en el borde.

### 1.1 Setup inicial

1. Crear cuenta en https://dash.cloudflare.com (si no existe).
2. **Pages** → **Create a project** → **Connect to Git**.
3. Elegir el repo (GitHub / GitLab).
4. **Production branch:** `main`.
5. **Build command:** `bun run build`.
6. **Build output directory:** `dist`.
7. **Environment variables:**
   - `NODE_VERSION` = `22` (para Bun 1.3).
   - (opcional) `BUN_VERSION` = `1.3.14` si Cloudflare lo pide.
8. **Root directory** (advanced): dejar vacío (raíz del repo).

### 1.2 Custom domain

1. Una vez creado el proyecto, **Custom domains** → **Set up a custom
   domain**.
2. Añadir `aichegdl.org` (o el dominio definitivo).
3. Cloudflare configura automáticamente el certificado TLS.
4. Apuntar los nameservers del dominio al nameserver de Cloudflare
   (en el registrador).

### 1.3 Headers de caché y compresión

Cloudflare aplica `gzip`/`brotli` automáticamente. Configurar headers
personalizados vía `_headers` file en `public/` (Cloudflare Pages lo
copia tal cual al deploy):

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=604800

/*.webm
  Cache-Control: public, max-age=604800

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

> Nota: los archivos en `public/` del proyecto se sirven desde la
> raíz. Para `_astro/*` los archivos están en `dist/_astro/`. La
> regla `/_astro/*` aplica a esos paths. Cloudflare Pages mapea
> `public/_headers` y `public/_redirects` automáticamente.

### 1.4 Límites relevantes

| Límite | Valor |
|---|---|
| Tamaño máximo por archivo | **25 MB** (Cloudflare Pages) |
| Workers (free) | 100k req/día |
| Build time | ~5 min max (no problema para este sitio: ~5 s) |
| Sitios | 100 |

> **Si los videos reales superan 25 MB** (definitivos pesados), evaluar
> Cloudflare Stream o Bunny Stream — decisión del usuario.

---

## 2. Netlify

**Por qué:** alternative popular, free tier decente, integración Git,
formularios serverless.

### 2.1 Setup inicial

1. Crear cuenta en https://app.netlify.com.
2. **Add new site** → **Import an existing project**.
3. **Build command:** `bun run build`.
4. **Publish directory:** `dist`.
5. **Environment variables:**
   - `NODE_VERSION` = `22`.

### 2.2 Custom domain

**Domain settings** → **Add custom domain**. Netlify gestiona TLS vía
Let's Encrypt.

### 2.3 Headers (`public/_headers`)

Mismo formato que en Cloudflare (ver §1.3).

### 2.4 Límites

| Límite | Valor |
|---|---|
| Tamaño por archivo | **25 MB** (free) |
| Bandwidth | 100 GB/mes (free) |
| Build minutes | 300 min/mes (free) |

---

## 3. GitHub Pages

**Por qué:** free, simple, pero **limitado a 1 GB** total y archivos
≤ 100 MB. **No recomendado** si los videos definitivos son grandes.

### 3.1 Setup

1. En el repo: **Settings** → **Pages**.
2. **Source:** GitHub Actions.
3. Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.3.14
      - run: bun install
      - run: bun run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3.2 Custom domain

**Settings** → **Pages** → **Custom domain** → añadir el dominio.
Crear `CNAME` en la raíz con el dominio.

### 3.3 Límites

| Límite | Valor |
|---|---|
| Repo size | **1 GB** |
| Archivo individual | **100 MB** |
| Bandwidth | 100 GB/mes (soft) |

> Si los videos definitivos pesan > 100 MB, GitHub Pages **no
> funciona**. Considerar Cloudflare Stream + embed, o reducir el peso
> de los videos con `ffmpeg -crf 28` (ver `docs/VIDEO.md`).

---

## 4. Hosting mínimo viable (drag & drop)

Si quieres desplegar **sin** Git ni CI:

1. `bun run build` localmente.
2. Comprimir `dist/` en un `.zip`.
3. Subir a:
   - **Cloudflare Pages** → "Direct Upload".
   - **Netlify** → "Deploy manually" (drag & drop).
   - **Vercel** → "Browse" en el dashboard.
4. Configurar dominio custom en el dashboard.

Esto es útil para un primer deploy de QA antes de conectar Git.

---

## 5. Post-deploy checklist

Una vez desplegado:

- [ ] `https://aichegdl.org/` (o el dominio definitivo) responde 200.
- [ ] `https://aichegdl.org/sitemap-index.xml` existe.
- [ ] `https://aichegdl.org/robots.txt` apunta al sitemap correcto.
- [ ] `https://aichegdl.org/site.webmanifest` existe y referencia el favicon.
- [ ] Probador de Rich Results de Google reconoce el JSON-LD
      Organization y Event:
      https://search.google.com/test/rich-results
- [ ] Sin errores en consola en las 8 rutas.
- [ ] Lighthouse mobile (4G simulated) ≥ 95 en las 4 categorías en
      `/`, `/patrocinios`, `/participaciones`. Documentar el número
      en `docs/PERFORMANCE.md §9`.
- [ ] Sin requests a terceros en la pestaña Network (verificar en
      DevTools → Network → Domain).
- [ ] El mailto `aiche.gdl@gmail.com?subject=Contacto%20AIChE%20GDL`
      abre el cliente de correo con el asunto correcto.
- [ ] El enlace a Instagram abre
      `https://instagram.com/aiche.gdl` en nueva pestaña.
- [ ] El contador regresivo muestra 219 días (al 2026-08-19) y se
      actualiza cada segundo.

---

## 6. Rotación de medios

Cuando el usuario sustituya una imagen o video:

1. Sobrescribir el archivo en `src/assets/media/...` con el mismo nombre (los videos siguen en `public/media/video/`).
2. Si cambian las proporciones o dimensiones, actualizar `w`/`h` en
   `src/data/media.ts` para mantener CLS = 0.
3. Si el archivo es muy pesado (> 25 MB para Cloudflare / Netlify),
   evaluar compresión con ffmpeg (ver `docs/VIDEO.md`).
4. **Volver a ejecutar** `bun run capture` para regenerar las
   capturas y screencasts.
5. **Volver a desplegar** (`git push` o drag & drop del nuevo `dist/`).

---

## 7. Variables de entorno y secretos

**El sitio no tiene secretos, claves API ni credenciales** (regla §3.9:
cero terceros, cero analytics). Lo único configurable es:

- `siteUrl` en `src/data/site.ts` (placeholder hasta dominio definitivo).

Si en algún momento futuro se quiere añadir analytics, el camino es:
- **Plausible / Umami** auto-alojado (no rompe §3.9 si se sirve desde
  el mismo dominio).
- **Cloudflare Web Analytics** (gratis con Pages, no añade requests
  externos al cliente — privacy-first).

---

## 8. Costes esperados

| Concepto | Coste |
|---|---|
| Dominio `.org` | ~10–15 USD/año |
| Cloudflare Pages (free) | 0 USD/mes |
| SSL/TLS | 0 USD (Let's Encrypt / Cloudflare) |
| Build minutes | ~30 s × N despliegues/mes → 0 USD (free tier cubre) |
| Email forwarding | 0–5 USD/año (Cloudflare Email Routing) |

**Total estimado: 10–20 USD/año.**

---

## 9. Reversibilidad

El sitio es estático y todo el código está en Git. Si el deploy sale
mal, hacer rollback:

- **Cloudflare Pages:** rollbacks atómicos desde el dashboard
  (`Deployments` → `Rollback to this deploy`).
- **Netlify:** mismo flujo (`Deploys` → `Publish deploy` antiguo).
- **GitHub Pages:** `git revert` del commit y `git push`.

Los rollbacks no pierden datos porque **todo está en Git**.

---

## 10. Resumen de URLs de producción (template)

Una vez desplegado:

```
https://aichegdl.org/                                 → Home
https://aichegdl.org/equipo                          → Nuestro equipo
https://aichegdl.org/participaciones                  → Participaciones
https://aichegdl.org/participaciones/southwest-2027   → Detalle del evento
https://aichegdl.org/patrocinios                     → Patrocinios
https://aichegdl.org/contacto                        → Contacto
https://aichegdl.org/sitemap-index.xml                → sitemap
https://aichegdl.org/robots.txt                      → robots
https://aichegdl.org/site.webmanifest                 → PWA manifest
```

---

## 11. Próximos pasos tras el primer deploy

1. **Enviar sitemap** a Google Search Console:
   `https://search.google.com/search-console/sitemaps`.
2. **Indexar manualmente** las URLs clave con `site:search`.
3. **Medir** con Lighthouse (mobile, 4G simulated) y documentar el
   número en `docs/PERFORMANCE.md §9`.
4. **Sustituir placeholders** por imágenes y videos reales (ver
   `docs/ASSETS.md`).
5. **Regenerar capturas** con `bun run capture` (RULES §17).
6. **Producir el video** siguiendo `docs/SHOTLIST.md` + `docs/VIDEO-BRIEF.md`.
7. **Notificar al usuario** con los números reales del deploy y los
   pendientes que requieren su decisión (ver `docs/BACKLOG.md`).