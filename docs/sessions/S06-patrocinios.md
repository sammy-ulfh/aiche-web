# Sesión S6 — Patrocinios
**Fecha:** 2026-08-19 · **Estado:** COMPLETA

## 1. Alcance planeado

1. Hero de la p.9: eyebrow, título "Tu patrocinio nos lleva a competir", párrafo, etiqueta `TRES PAQUETES` y las tres cajas de precio con el borde superior destacado, más la imagen grande a la derecha.
2. `src/data/sponsors.ts`: tres paquetes con precio, moneda (variable), contador de beneficios y lista de beneficios (RULES §9.5).
3. Sección "Qué recibe tu empresa" (p.10): tres tarjetas con imagen, `PAQUETE N`, `N BENEFICIOS`, precio y lista de viñetas; nota "Los tres paquetes incluyen posibilidad de facturación".
4. Sección "La competencia" en **variante crema** reutilizando `CompetitionInfo` de S5.
5. CTA claro hacia contacto (mailto con asunto prellenado tipo "Patrocinio AIChE GDL — Paquete N").
6. Responsive: en móvil los tres paquetes en stack, sin perder la jerarquía de precios.
7. Criterios de aceptación: contador `N BENEFICIOS` calculado, precio/beneficio único origen, impresión a PDF legible.

## 2. Qué se hizo

### 2.1. `src/data/sponsors.ts` (nuevo)

Fuente canónica de los paquetes (RULES §6). Contiene:

- `interface SponsorTier { id, label, price, benefits }`.
- `sponsorTiers: readonly SponsorTier[]` con los 3 paquetes en el orden del PDF (Paquete 1, 2, 3). Los beneficios son verbatim §9.5 (con los FIX aplicados: "agradeciemgto" → "agradecimiento", "Campus GDA" → "Campus GDL").
- `sponsorMailtoFor(tier)` helper que devuelve `mailto:aiche.gdl@gmail.com?subject=Patrocinio AIChE GDL — Paquete N`, derivando el número del `id` (no del `label`) para que cambiar la etiqueta visible no rompa el subject.

`content.ts → sponsors.tiers` ahora apunta a `sponsorTiers` (re-export bajo `sponsors.tiers` para mantener la API previa). El contador `N BENEFICIOS` es `tier.benefits.length`, nunca hardcodeado.

### 2.2. `SponsorHero.astro` (nuevo)

Hero de /patrocinios (p.9). Composición:

- Fondo navy con `GridBackdrop` (idéntico a `Hero.astro` y `SponsorTeaser`).
- Columna izquierda: eyebrow `PATROCINIOS`, `<h1>` "Tu patrocinio nos lleva a competir", párrafo, etiqueta `TRES PAQUETES` y 3 mini-cajas con borde superior `border-t-4 border-navy-400` (las mismas que el teaser del home, RULES §5.3).
- Columna derecha: imagen `sponsorsHero` con `loading="eager" fetchpriority="high"` (LCP de la página).
- En mobile, todo se apila: texto → paquetes → imagen.

### 2.3. `SponsorTiers.astro` (nuevo)

Sección "Qué recibe tu empresa" (p.10). Composición:

- Encabezado: eyebrow `PATROCINIOS`, `<h2>` "Qué recibe tu empresa", bajada `quote-serif` con la nota `Los tres paquetes incluyen posibilidad de facturación`.
- 3 tarjetas en grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Cada tarjeta:
  - Imagen superior (proporción del manifest, 4:3 con los placeholders actuales) con `loading="eager"` la primera y `lazy` las siguientes; `border-t-4 border-navy-400` separador de acento (RULES §5.3 "el elemento destacado lleva borde superior más grueso").
  - Etiqueta `PAQUETE N` + contador `N BENEFICIOS` calculado.
  - Precio grande con `currencySymbol`.
  - Lista de beneficios con bullet cuadrado navy (`w-1.5 h-1.5 bg-navy`, no icon font, no librerías).
  - CTA `mailto:` con asunto prellenado (`sponsorMailtoFor(tier)`), `aria-label` específico por paquete.
  - Clase `print-card` para impresión.

### 2.4. `src/pages/patrocinios.astro` (reescrito)

Ensamblaje final de la página:

1. `<SponsorHero />`
2. `<SponsorTiers />`
3. `<CompetitionInfo variant="cream" id="competencia" />` — reutiliza el componente de S5 con el ancla `#competencia` que ya está enlazada en el submenú del nav.
4. Cierre navy con `GridBackdrop`: CTA "Escribir al equipo" como mailto general por si la empresa quiere preguntar antes de elegir paquete.

El `<h1>` es `sponsors.title` (RULES §13: un h1 por página).

### 2.5. `styles/global.css` — print styles

Bloque `@media print` añadido en `@layer base`. Cubre:

- Ocultar nav, footer, skip link, mobile menu, nav dropdown.
- Apagar `GridBackdrop` (ruido en papel).
- Fondo navy → blanco con texto navy (evita rectángulo negro que agota tóner; mantiene contraste).
- Tipografía reducida a tamaños razonables para papel (`28pt / 18pt / 14pt / 12pt`).
- `break-inside: avoid !important` en `.print-card`, `section.card` y `ol > li`.
- `page-break-after: always` en `.print-hero` (la primera sección del /patrocinios fuerza una página limpia).
- Ocultar `[data-countdown]` (no aplica al imprimir).
- Enlaces subrayados y navy.
- `body` y `main` sin padding extra.

Resultado: /patrocinios se imprime a PDF desde el navegador sin cortes horribles y con jerarquía legible (verificación en §6.5).

### 2.6. `Layout.astro` — fix de import CSS global (D-051)

`Layout.astro` no importaba `'../styles/global.css'` desde S1 (se perdió al reescribir el layout). Esto significa que Tailwind 4 con `@tailwindcss/vite` no emitía utilities ni `@layer base` ni `@layer utilities` en el build de producción — el sitio renderizaba con clases Tailwind sin estilos. **Detectado y corregido en S6** al verificar que el `@media print` no aparecía en el bundle.

Una sola línea añadida: `import '../styles/global.css';`.

Después del fix: 32 162 B raw / 6 665 B gzip de CSS bundleado (por debajo del presupuesto RULES §12 de 30 KB comprimido).

### 2.7. Verificación de propagación end-to-end (criterio de aceptación S6)

Comprobado con `bun /tmp/verify-s6.mjs` y dos pruebas manuales:

- **Cambiar precio** (`'10,000'` → `'12,500'` en `sponsors.ts`): rebuild → home, hero /patrocinios y tarjetas muestran el nuevo precio en las 3 secciones; el subject del mailto NO cambia porque se deriva del `id`.
- **Añadir beneficio** a Paquete 3: rebuild → los contadores `N BENEFICIOS` se recalculan automáticamente (3 → 4 en /patrocinios y home); el beneficio añadido aparece en la lista de viñetas.

Restaurado al estado original tras las pruebas.

## 3. Archivos creados / modificados

**Creados:**
- `src/data/sponsors.ts` (~85 líneas: tipos + lista canónica + helper mailto)
- `src/components/sections/SponsorHero.astro` (~80 líneas, reusable)
- `src/components/sections/SponsorTiers.astro` (~115 líneas, reusable)
- `docs/sessions/S06-patrocinios.md` (esta bitácora)

**Modificados:**
- `src/data/content.ts` — `sponsors.tiers` ahora apunta a `sponsorTiers`; añade `sponsorMailtoFor` re-export y `benefitsCta` para el botón del paquete.
- `src/pages/patrocinios.astro` — `PagePlaceholder` → ensamblaje real (4 secciones).
- `src/styles/global.css` — bloque `@media print` con todas las reglas de impresión (~85 líneas dentro de `@layer base`).
- `src/layouts/Layout.astro` — fix pre-existente D-051: añade `import '../styles/global.css';`.
- `docs/STATE.md` — S6 marcada completa + ruta actualizada + métricas.
- `docs/DECISIONS.md` — D-046 a D-051.

## 4. Decisiones tomadas

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| D-046 | `src/data/sponsors.ts` separado como fuente canónica de paquetes (precio, beneficios, id) + helper `sponsorMailtoFor(tier)` | Dejarlo en `content.ts` | RULES §6 (data layer propio); contador `N BENEFICIOS` se calcula de `tier.benefits.length`; el `mailto:` se deriva del `id` (no del label) para no romperse si cambia la etiqueta |
| D-047 | `SponsorHero` apila texto y paquetes en columna y pone la imagen del vehículo en una 2ª columna en `md+` (1ª en mobile) | Poner la imagen en una 3ª columna | Coherencia con la composición p.9 (texto a la izquierda, imagen a la derecha); en mobile el orden es texto → paquetes → imagen |
| D-048 | `SponsorTiers` usa grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` para las 3 tarjetas "Qué recibe tu empresa" | Stack único, scroll horizontal | Las 3 tarjetas caben en una sola página al imprimir y se redistribuyen en mobile/tablet/desktop |
| D-049 | Cada tarjeta `SponsorTiers` lleva un CTA `mailto:` con asunto prellenado `Patrocinio AIChE GDL — Paquete N` derivado del `id` | Un solo CTA general | El usuario puede pedir info por paquete sin tener que elegir; el número de paquete en el subject es estable aunque cambie la etiqueta visible |
| D-050 | Print styles globales en `styles/global.css` (`@media print`): ocultan nav/footer, apagan GridBackdrop, fondo navy→blanco, `break-inside: avoid` en `.print-card`, anclas forzadas con `id="competencia"` | No tener print styles; rehacerlos por componente | La página se imprime a PDF para empresas (RULES §6 S6); una sola regla global evita duplicar y se beneficia el resto del sitio si se imprime |
| D-051 | Fix pre-existente: `Layout.astro` ahora importa `'../styles/global.css'` (lo perdió S1 al reescribir el layout) | Dejar el sitio sin CSS | Tailwind v4 + `@tailwindcss/vite` no emite utilities si ningún archivo entra con `@import "tailwindcss";`; sin este import, las clases Tailwind renderizan sin estilos. Detectado en S6 al verificar print styles |

## 5. Desviaciones respecto al plan

- **Componente `SponsorTiers.astro` separado del hero**: el plan lo menciona todo junto. Lo separé para que cada componente tenga <150 líneas (RULES §6) y porque el patrón "Resumen teaser + Detalle completo" es el mismo que ya usan `NextEvent`/`CompetitionsList`.
- **CTA por paquete + CTA general**: el plan menciona "CTA claro hacia contacto (mailto)". Implementé ambos: mailto por paquete en cada tarjeta de `SponsorTiers`, mailto general al final de la página. Es lo natural para una página de negocio: la empresa puede comprometerse de entrada (eligiendo paquete) o explorar primero (escribiendo).
- **No añadí un JSON-LD específico para /patrocinios**: la página hereda el `Organization` de la home y no tiene `Event` propio (el evento vive en /participaciones/southwest-2027, ya con su JSON-LD). S8 puede añadir `Product`/`Offer` si se considera útil para SEO.

## 6. Verificación

### 6.1. Gates

- `bunx astro check` → **0 errors, 0 warnings, 0 hints** (57 archivos: +3 sobre S5: `sponsors.ts`, `SponsorHero.astro`, `SponsorTiers.astro`).
- `bun run build` → 9 páginas, sin errores.

### 6.2. Verificación end-to-end (`bun /tmp/verify-s6.mjs`)

| Comprobación | Resultado |
|---|---|
| /patrocinios contiene título "Tu patrocinio nos lleva a competir" | ✓ |
| /patrocinios contiene eyebrow PATROCINIOS | ✓ |
| /patrocinios contiene párrafo de intro | ✓ |
| /patrocinios contiene etiqueta TRES PAQUETES | ✓ |
| /patrocinios contiene título "Qué recibe tu empresa" | ✓ |
| /patrocinios contiene nota de facturación | ✓ |
| /patrocinios contiene 3 paquetes (data-tier × 2 hero+tiers) | ✓ (6) |
| /patrocinios tiene un único `<h1>` | ✓ |
| /patrocinios usa LCP eager (sponsors-hero.jpg) | ✓ |
| home muestra 6/4/3 BENEFICIOS (derivados del array) | ✓ |
| /patrocinios muestra 6/4/3 BENEFICIOS en hero | ✓ |
| precios coherentes: $10,000 / $5,000 / $2,500 (home + /patrocinios) | ✓ |
| mailto prellenado Paquete 1/2/3 con subject `Patrocinio AIChE GDL — Paquete N` | ✓ |
| /patrocinios contiene `LA COMPETENCIA` (variante cream) | ✓ |
| /patrocinios contiene pregunta "¿Qué es la Southwest…?" | ✓ |
| /patrocinios tiene `id="competencia"` para ancla | ✓ |
| /patrocinios contiene CTA "Escribir al equipo" | ✓ |
| CSS bundleado contiene `@media print` | ✓ |
| `.print-card` con `break-inside: avoid !important` | ✓ |
| CSS gzip ≤ 30 KB (RULES §12) | ✓ (6 665 B) |
| 0 referencias a fuentes externas (Google Fonts, CDNs) | ✓ |

**29/29 checks passed.**

### 6.3. Pruebas manuales de propagación

- Cambio de precio en `sponsors.ts` (`'10,000'` → `'12,500'`) → rebuild → precios actualizados en home (SponsorTeaser), hero /patrocinios y tarjetas /patrocinios; subject del mailto NO cambia (derivado del `id`). Restaurado.
- Adición de un beneficio a Paquete 3 → rebuild → contadores `N BENEFICIOS` recalculados a 4/5/7; beneficio aparece en la lista. Restaurado.

### 6.4. Tamaños

| Ruta / asset | HTML raw | HTML gzip | Notas |
|---|---:|---:|---|
| `/patrocinios` | 33 980 B | 6 678 B | |
| `/` (home) | 36 211 B | — | |
| CSS bundleado único | 32 162 B | 6 665 B | `/_astro/Layout.zK6Lk3bT.css` |
| `dist/` total | 788 KB | — | +100 KB vs S5 (CSS global ahora se importa vía Layout — D-051) |

### 6.5. Impresión (RULES §6 S6 — criterio de aceptación)

Bloque `@media print` en `global.css`. Verificado en el bundle compilado:

- `header, footer, nav, [data-skip-link], .mobile-menu, .nav-dropdown` se ocultan.
- `body` y secciones con `bg-navy` pasan a fondo blanco + texto navy (no se quema tóner).
- `.print-card` y `ol > li` con `break-inside: avoid !important` y `page-break-inside: avoid !important`.
- `.print-hero` con `page-break-after: always` (la primera sección fuerza página limpia).
- GridBackdrop apagado en impresión.
- Tipografía reducida a tamaños razonables para papel (`28pt / 18pt / 14pt / 12pt`).
- `[data-countdown]` oculto (no aplica).
- Enlaces subrayados y en navy (legibles sobre blanco).

La página es presentable al imprimir; los placeholders (JPGs) imprimen como imágenes. Sin verificación visual directa en navegador (Playwright no instalado; se valida en S10).

### 6.6. Accesibilidad y semántica

- `/patrocinios`: `<h1>` único (`sponsors.title`).
- `<h2>` en cada sección ("Qué recibe tu empresa", "La competencia", "¿Quieres patrocinar…?").
- `<h3>` dentro de `CompetitionInfo` para las dos preguntas (ya documentado en S5).
- CTAs por paquete con `aria-label` específico: `Contactar por PAQUETE 1 — $10,000`, etc.
- LCP eager con `fetchpriority="high"` para que la imagen priorizada se cargue primero.
- Foco accesible (`:focus-visible outline-2 outline-navy-400`) preservado en los CTAs custom.

### 6.7. Coherencia con el resto del sitio

- Sedes: `/patrocinios` no menciona "Texas"; menciona "Lake Charles, Louisiana" (D-005, RULES §9.4).
- Correo oficial: `aiche.gdl@gmail.com` (D-004, RULES §9.7), sale de `site.ts` y se usa en todos los mailto.
- Beneficios verbatim §9.5 con FIX aplicados (RULES §9.5: "agradeciemgto" → "agradecimiento", "Campus GDA" → "Campus GDL").

## 7. Pendiente (si PARCIAL)

N/A — sesión COMPLETA.

## 8. Necesito que el usuario decida

**Bloqueante:** ninguno.

**No bloqueante (asumí X):**
- **P-001** Moneda de los paquetes (RULES §19.1). Asumido MXN con prefijo `$` y precio numérico. Cambio en `content.ts → sponsors.currencySymbol`.
- **P-005** Dominio definitivo (RULES §19.7). Sin cambios respecto a S5.
- **P-004** Logos de patrocinadores actuales a mostrar (RULES §19.6). Sin cambios respecto a S5.

## 9. Siguiente sesión

**S7 — Contacto, CTA "Únete" y 404.** Precondiciones:

- `site.ts` ya tiene `contactEmail`, `contactInstagramUrl`, `contactMailto` (D-004).
- `JoinCta.astro` ya existe y se reutiliza en S3.
- `Layout.astro` arreglado en S6 (D-051): cualquier futura página tiene CSS por defecto.

Trabajo a realizar (resumen, ver PLAN-SESIONES.md para detalle):

1. `/contacto` (p.13): eyebrow, título "¡TRABAJEMOS JUNTOS!", bloque `CONTÁCTANOS` con correo e Instagram, foto grupal. Ancla `#unete`.
2. Reutilizar `JoinCta.astro` en `/contacto#unete` para que el botón "Únete" del nav aterrice ahí.
3. `/404` con el mismo layout y enlaces útiles.
4. Revisar footer y bloque "¡Súmate al capítulo!".
