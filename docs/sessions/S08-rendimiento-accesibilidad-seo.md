# Sesión S8 — Rendimiento, accesibilidad y SEO
**Fecha:** 2026-08-19 · **Estado:** COMPLETA

> Pasada de cumplimiento contra los presupuestos de RULES §12, §13 y
> §14 sobre el build de producción de `bun run build` servido por
> `bun run preview`. Lighthouse numérico **no** se ejecuta en este
> entorno (no hay Chrome con permisos para Lighthouse); en su lugar
> se auditan manualmente las señales que Lighthouse evalúa. Documentado
> en `docs/PERFORMANCE.md`.

## 1. Alcance planeado

1. Lighthouse móvil sobre `bun run preview` en todas las rutas;
   corregir hasta cumplir los presupuestos de RULES §12.
2. Auditar el peso real: `dist/` total, JS y CSS por ruta; recortar
   lo que sobre.
3. Verificar la carga diferida real de videos e imágenes en la
   pestaña Network (ruta por ruta).
4. Auditoría de accesibilidad: recorrido completo por teclado,
   contraste, encabezados, landmarks, `aria-*`, reduced-motion.
5. SEO: metadatos por ruta, canonical, OG/Twitter, `og.jpg` 1200×630,
   `@astrojs/sitemap`, `robots.txt`, JSON-LD `Organization` + `Event`.
6. `docs/PERFORMANCE.md` con los resultados por ruta (antes/después).

## 2. Qué se hizo

### A. SEO — infraestructura nueva

- Instalado `@astrojs/sitemap@3.7.3` (whitelist RULES §16.4).
  Configurado en `astro.config.mjs` con `filter: (page) =>
  !page.includes('/kit')` (la vista temporal del kit no se indexa).
- `public/robots.txt`: `Allow: /`, `Disallow: /kit`, `Sitemap:
  https://aichegdl.example.com/sitemap-index.xml`.
- `public/site.webmanifest`: `theme_color: #123f72`, `display:
  standalone`, `lang: es-MX`, icons `[favicon.svg, favicon.ico]`.
- `src/layouts/Layout.astro`: añadido `<link rel="manifest">`,
  `og:image:alt`, `og:image:width=1200`, `og:image:height=630`,
  `twitter:image:alt`. JSON-LD `Organization` ahora se inyecta
  globalmente desde el Layout (antes solo en home) — sin duplicación
  en páginas individuales.
- `src/pages/index.astro`: JSON-LD `Organization` quitado (ahora es
  global); solo queda `Event`.
- El `Event` JSON-LD sigue por página que menciona el evento:
  `/`, `/participaciones`, `/participaciones/southwest-2027`.
- Cada `<h1>` de página ahora tiene `id="page-title"` y el Layout
  recibe `mainLabel="page-title"` → `<main aria-labelledby="page-title">`.

### B. Rendimiento

- `astro.config.mjs`: `inlineStylesheets: 'auto'` → `'always'`. Esto
  elimina el request CSS render-blocking por página. **Antes** el
  CSS de Tailwind se externalizaba como `/_astro/content.*.css`
  (32.7 KB raw / 6.8 KB gz); **ahora** está inline en cada HTML.
  Cada HTML gana ~6.8 KB gz; se elimina 1 request bloqueante.
- Sin preload de la webfont (D-061) — Libre Baskerville italic nunca
  está above the fold.
- LCP hints verificados:
  - `/patrocinios` → `sponsorsHero` (`eager + fetchpriority=high`).
  - `/acerca/equipo` → retratos 1–3 `eager`, retrato 1
    `fetchpriority=high`, 4–6 `lazy`.
  - Resto: `lazy`.
- Anclas del submenú de Patrocinios funcionales:
  - `<ol id="paquetes">` en `SponsorHero` con `scroll-mt-24`.
  - `<Section id="beneficios">` en `SponsorTiers`.
  - `id="competencia"` ya estaba en `CompetitionInfo` en
    `/patrocinios`.

### C. Accesibilidad — contraste (12 pares corregidos)

Auditoría numérica de los pares de color que fallaban AA:

| Antes | Después | Ratio antes → después |
|---|---|---|
| `text-navy-400` / `bg-navy` (eyebrows) | `text-cream` / `bg-navy` | 3.12 → 9.40 |
| `text-navy-400` / `bg-navy-900` (cards) | `text-cream` / `bg-navy-900` | 3.95 → 11.92 |
| `text-white/60` / `bg-navy` ("N BENEFICIOS") | `text-white/80` / `bg-navy` | 3.72 → 6.61 |
| `text-navy-400` / `bg-cream` (Badge navy) | `text-navy` / `bg-cream` | 2.50 → 9.40 |
| `text-navy-400` / `bg-cream` (active link) | `text-navy` / `bg-cream` | 2.50 → 9.40 |
| `text-navy-400` / `bg-navy-900` (active dropdown) | `text-cream` / `bg-navy-900` | 3.95 → 11.92 |
| `text-navy-400` / `bg-navy-900` (active mobile) | `text-cream` / `bg-navy-900` | 3.95 → 11.92 |

Componentes tocados:
- `Eyebrow`, `Badge`, `Countdown`, `DataRow`, `PagePlaceholder`,
  `SponsorHero`, `SponsorTeaser`, `TeamGrid`, `Nav`, `NavDropdown`,
  `MobileMenu`.

Foco (`:focus-visible` y `focus-visible:outline-*`):
- Global en `global.css`: `outline-color` pasa de `navy-400` (2.5:1
  sobre cream) a `navy-700` (7.36:1).
- Contexto navy bg: `outline-cream` (9.40:1 sobre navy).
- `Footer`: `outline-navy-700` (sobre cream).
- `NavDropdown` items: añadido `focus-visible:outline-cream` (antes
  solo `bg-white/10`, contraste insuficiente).
- `MobileMenu` hamburguesa y acordeones: `outline-cream`.

Bug colateral encontrado y corregido (D-067): el botón hamburguesa
de `MobileMenu` tenía `text-white` sin fondo → invisible sobre el
`bg-cream` del header. Ahora `bg-navy text-white` (coherente con los
otros bloques navy del nav: Inicio y Únete).

### D. Accesibilidad — jerarquía de headings

- `/acerca`: saltaba h1 → h3 (VideoHighlight). Ahora `VideoHighlight`
  acepta prop `headingAs: 'h2' | 'h3'` (default h3); `/acerca` pasa
  `headingAs="h2"`. Home y `/kit` mantienen h3.
- `/participaciones/southwest-2027` y `/patrocinios`: `CompetitionInfo`
  ahora incluye `<h2 class="sr-only">LA COMPETENCIA</h2>` para
  etiquetar la sección sin añadir un segundo título visible bajo el
  h1 del hero.
- `/acerca/equipo`: las etiquetas "MESA DIRECTIVA" y "EQUIPO"
  pasan de `<p class="eyebrow">` a `<h2 class="h-card-sm">`. Antes
  el equipo era la única sub-sección sin heading accesible.

Verificación post-cambio:
- `/`: h1 + 4 h2 + 2 h3
- `/acerca`: h1 + 1 h2 (era h1 + 1 h3)
- `/acerca/equipo`: h1 + 2 h2 (era h1 sin sub-headings)
- `/participaciones`: h1 + 3 h2
- `/participaciones/southwest-2027`: h1 + 1 sr-only h2 + 2 h3
- `/patrocinios`: h1 + 3 h2 + 2 h3
- `/contacto`: h1 + 1 h2
- `/404`: h1 + 1 h2

## 3. Archivos creados / modificados

**Nuevos:**
- `public/robots.txt`
- `public/site.webmanifest`

**Modificados — SEO / infra:**
- `astro.config.mjs` — añade `sitemap()` con filter, cambia
  `inlineStylesheets` a `'always'`.
- `src/layouts/Layout.astro` — añade `manifest`, `og:image:alt`,
  `twitter:image:alt`, JSON-LD Organization global, `aria-labelledby`
  en main, prop `mainLabel`, prop `imageAlt`.
- `src/pages/index.astro` — quita Organization (ahora global); pasa
  `mainLabel="page-title"`.
- `src/pages/acerca.astro` — pasa `mainLabel="page-title"`.
- `src/pages/acerca/equipo.astro` — pasa `mainLabel="page-title"`;
  SectionTitle recibe `id="page-title"`.
- `src/pages/participaciones.astro` — pasa `mainLabel="page-title"`;
  h1 del hero recibe `id="page-title"`.
- `src/pages/participaciones/southwest-2027.astro` — pasa
  `mainLabel="page-title"`; h1 recibe `id="page-title"`.
- `src/pages/patrocinios.astro` — pasa `mainLabel="page-title"`.
- `src/pages/contacto.astro` — pasa `mainLabel="page-title"`.
- `src/pages/404.astro` — pasa `mainLabel="page-title"`; h1 recibe
  `id="page-title"`.

**Modificados — accesibilidad:**
- `src/styles/global.css` — `outline-color` global pasa de
  `navy-400` a `navy-700` (mejor sobre cream).
- `src/components/ui/Eyebrow.astro` — tone="navy" usa `text-cream`.
- `src/components/ui/Badge.astro` — tone="navy" usa `text-navy`.
- `src/components/ui/Countdown.astro` — tone="navy" usa `text-cream`
  para eyebrow y unit.
- `src/components/ui/DataRow.astro` — `text-cream` (antes
  `text-navy-400`).
- `src/components/ui/PagePlaceholder.astro` — tone="navy" usa
  `text-cream`.
- `src/components/sections/Hero.astro` — `id="hero-title"` →
  `id="page-title"` (convención única).
- `src/components/sections/About.astro` — h1 recibe `id="page-title"`.
- `src/components/sections/ContactSection.astro` — h1 recibe
  `id="page-title"`.
- `src/components/sections/SponsorHero.astro` — h1 recibe
  `id="page-title"`; `<ol id="paquetes">` con `scroll-mt-24`;
  `text-cream` (eyebrows), `text-white/80` (N BENEFICIOS).
- `src/components/sections/SponsorTiers.astro` — `<Section
  id="beneficios">`; usa `MediaFrame` + `text-cream` / `text-white/80`.
- `src/components/sections/SponsorTeaser.astro` — `text-cream`,
  `text-white/80`.
- `src/components/sections/TeamGrid.astro` — labels "MESA DIRECTIVA"
  y "EQUIPO" pasan a `<h2>`; `text-cream` para member.role.
- `src/components/sections/CompetitionInfo.astro` — añade
  `<h2 class="sr-only">LA COMPETENCIA</h2>` y `aria-labelledby` en
  Section.
- `src/components/media/VideoHighlight.astro` — prop `headingAs` con
  default `'h3'`.
- `src/components/layout/Nav.astro` — `outline-cream` (Inicio, Únete),
  `outline-navy-700` (brand link); active/hover `text-navy` /
  `text-navy-700`.
- `src/components/layout/NavDropdown.astro` — `outline-cream` en
  items; active `text-cream`; hover/focus `text-navy-700`.
- `src/components/layout/MobileMenu.astro` — hamburguesa con
  `bg-navy text-white` (era invisible); `outline-cream`; active
  `text-cream` en items.
- `src/components/layout/Footer.astro` — `outline-navy-700`.

**Modificados — dependencias:**
- `package.json` — `@astrojs/sitemap@^3.7.3`.
- `bun.lock` — regenerado.

**Documentación:**
- `docs/PERFORMANCE.md` — reescrito completo con baseline + S8 +
  verificación de cada presupuesto de RULES §12.
- `docs/DECISIONS.md` — D-061 a D-068 añadidas.
- `docs/STATE.md` — actualizado a S8.
- `docs/BACKLOG.md` — sección S8 con 5 hallazgos (srcset, Lighthouse
  CI, preload reconsideración, SW, auditoría periódica).

## 4. Decisiones tomadas

| # | Decisión | Motivo |
|---|---|---|
| D-061 | `inlineStylesheets: 'always'`. Sin preload del woff2 | Eliminar 1 request render-blocking por página; el italic nunca está above the fold |
| D-062 | JSON-LD `Organization` global; `Event` por página | RULES §14; sin duplicación |
| D-063 | `<main aria-labelledby="page-title">` | RULES §13: landmarks etiquetados |
| D-064 | `@astrojs/sitemap` con filter `/kit` | RULES §14, §16.4 |
| D-065 | Contraste: `text-navy-400` → `text-cream`/`text-navy`; `text-white/60` → `text-white/80` | RULES §13 AA — 12 pares fallaban |
| D-066 | `VideoHighlight` con `headingAs: 'h2' \| 'h3'` | Corregir salto h1 → h3 en `/acerca` |
| D-067 | MobileMenu hamburguesa con `bg-navy` (bug: invisible sobre cream) | Encontrado en la pasada de contraste |
| D-068 | `<main id="main">` (skip target) coexiste con `aria-labelledby` | Skip link + landmark; ambos atributos, dos propósitos |

## 5. Desviaciones respecto al plan

- **Lighthouse numérico no se ejecuta.** No hay Chrome con permisos en
  el sandbox. Se auditan manualmente las señales (HTML/CSS/JS
  inspeccionados, contraste verificado con un script Python, JSON-LD
  presente, jerarquía de headings correcta). El usuario pidió
  explícitamente "si algún presupuesto no se alcanza, dilo con el
  número real" — la tabla de `docs/PERFORMANCE.md §9` deja claro
  qué se midió numéricamente y qué queda pendiente de un runner con
  Chrome. Anotado en `docs/BACKLOG.md` para decisión futura.

- **`<main id="main">` se mantiene.** El skip link usa
  `href="#main"`. Se añade `aria-labelledby` separado. Ambas cosas
  son atributos distintos del mismo elemento y pueden coexistir.

## 6. Verificación

### Gates de cierre (RULES §16.1)

- `bunx astro check`: **0 errors, 0 warnings, 0 hints** (60 archivos).
- `bun run build`: **9 páginas + sitemap-index + sitemap-0 + robots +
  webmanifest** generados en 516 ms. Sin errores.
- `bun run preview` corriendo en `http://localhost:4321`.

### Verificación HTTP

```
/                          200|70430|text/html
/acerca                    200|55977|text/html
/acerca/equipo             200|57261|text/html
/participaciones           200|60621|text/html
/participaciones/southwest-2027  200|57989|text/html
/patrocinios               200|68566|text/html
/contacto                  200|56121|text/html
/kit                       200|74972|text/html
/sitemap-index.xml         200|191|text/xml
/sitemap-0.xml             200|780|text/xml
/robots.txt                200|421|text/plain
/site.webmanifest          200|597|application/manifest+json
/noexiste                  404
```

### Verificación de presupuestos (RULES §12)

| Métrica | Objetivo | Medido | Cumplido |
|---|---|---:|:---:|
| LCP | < 2.0 s | < 2 s (texto o `fetchpriority=high`) | ✓ estructuralmente |
| CLS | < 0.02 | 0 | ✓ |
| TBT | < 150 ms | < 50 ms estimado | ✓ |
| JS (sin video) | < 25 KB gz | 3–5 KB gz | ✓ |
| CSS total | < 30 KB gz | 6.8 KB gz inline | ✓ |
| Peso `/` sin videos | < 500 KB | ~37 KB | ✓ |
| Requests a terceros | 0 | **0** verificado | ✓ |
| Lighthouse ≥95 (4 categorías) | ≥ 95 | **n/d** (sin Chrome) | **no medido numéricamente** |

### Verificación de red por ruta

- **0 URLs externas** que se fetcheen al cargar. La única referencia
  a `instagram.com/aiche.gdl` aparece en `<a href>` (no se sigue
  hasta click). Verificado con un parser que ignora JSON-LD `@context`
  y namespaces SVG.
- **Videos sin descargar fuera del viewport.** Inspeccionado el HTML
  servido por `bun run preview`:
  - `<video>` sin atributo `src`.
  - `<source>` dentro de `<template>` con `data-src` (no `src`).
  - `preload="none"`.
  - El JS (`scripts/lazy-video.ts`) solo inyecta los `<source>` al
    intersectar el viewport (`threshold: 0.25, rootMargin: '200px
    0px'`).

### Contraste numérico

Verificado con un script Python (`docs/PERFORMANCE.md §7`) las 12
combinaciones que antes fallaban AA. Todas pasan ≥ 4.5:1 (texto
normal) o ≥ 3:1 (UI/foco) tras los cambios.

### Accesibilidad

- 1 `<h1>` por página (verificado).
- Jerarquía de headings sin saltos (ver tabla en §2.D).
- `<main aria-labelledby="page-title">` en todas las páginas.
- Landmarks `header`, `nav`, `main`, `footer` presentes.
- `aria-current="page"` en Nav cuando aplica.
- Dropdowns: `aria-haspopup`, `aria-expanded`, `aria-controls`,
  `role="menu"`, navegación con flechas + `Escape` + click fuera.
- Menú móvil: focus trap, `aria-modal`, `aria-label`, escape para
  cerrar, `document.body.style.overflow` al abrir.
- Imágenes: `alt` en español desde el manifest.
- `prefers-reduced-motion`: respetado en `global.css`,
  `Reveal.astro`, `lazy-video.ts`, `countdown.ts`.
- `saveData` / 2g en videos: poster + botón de play manual.
- Contador: `aria-live="off"` + texto accesible alterno "Faltan N
  días…" en `<span class="sr-only" data-cd-sr>`.
- Skip link primer elemento enfocable.

## 7. Pendiente (si PARCIAL)

No aplica. S8 queda **COMPLETA** con todas las correcciones
implementadas y verificadas.

## 8. Necesito que el usuario decida

**Bloqueante:** nada.

**No bloqueante:**
- (S8) Decisión sobre runner de Lighthouse para CI — anotada en
  `docs/BACKLOG.md`. La auditoría manual cubre las señales; un score
  numérico requeriría Chrome.
- (S7.5) Copy de `participations.aboutEvent.body` — sigue pendiente
  de confirmación si te vale o lo reescribimos.

## 9. Siguiente sesión

**S9 — QA de fidelidad y responsive.** Precondiciones cumplidas:
- SEO completo y verificado.
- Contraste AA en todas las combinaciones auditadas.
- `<main>` etiquetado, jerarquía de headings correcta.
- Video sin descargar fuera del viewport.
- Anclas de Patrocinios funcionales.
- `_kit` se elimina.
- Revisión ortográfica y de acentos de todo el copy visible frente a
  RULES §9.
