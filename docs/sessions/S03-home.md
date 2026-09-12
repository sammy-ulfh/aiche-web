# Sesión S3 — Home (`/`)
**Fecha:** 2026-08-19 · **Estado:** COMPLETA

## 1. Alcance planeado

1. `Hero.astro` con `GridBackdrop` + isotipo + títulos + párrafo de `hero` (RULES §9.1).
2. Contador regresivo completo: `src/scripts/countdown.ts`, valor inicial en build (cero flash), `tabular-nums`, pausa fuera de foco y con pestaña oculta, estado post-evento (RULES §15).
3. Resumen "Acerca de" con `<VideoHighlight />` (reutilizando S2).
4. Bloque "Próximo evento" con `<Card>` + `<DataRow>`.
5. Teaser de los tres paquetes con CTA a `/patrocinios`.
6. `JoinCta.astro` reutilizable, usado aquí y en `/contacto`.
7. Responsive de todo lo anterior.

## 2. Qué se hizo

### 2.1. Contador regresivo (RULES §15)

- **`src/scripts/countdown.ts`** (vanilla TS, IIFE): un solo `setInterval(1s)`. Pausa con `visibilitychange` cuando la pestaña está oculta. Pausa con `IntersectionObserver` cuando el contador sale del viewport. Al reanudar recalcula desde `Date.now()` (sin drift). Estado post-evento: muestra el mensaje de `data-post-event` y oculta las cajas. **Nunca** números negativos. Respeto a `prefers-reduced-motion: reduce`.
- **`src/components/ui/Countdown.astro`**: cálculo en build (`new Date(countdownTargetIso) - new Date()`) → valor inicial correcto, **cero flash de 00**. Las 4 cajas (DÍAS/HORAS/MIN/SEG) usan la clase `.stat-num` de global.css (utilidad `tabular-nums` + `font-variant-numeric: tabular-nums`) → sin CLS al cambiar dígitos. `aria-live="off"` en cada número (RULES §13). Texto accesible alterno en `<span data-cd-sr class="sr-only">` con la fórmula "Faltan N días, H horas, M minutos y S segundos para…".

### 2.2. Secciones (`src/components/sections/`)

- **`Hero.astro`**: GridBackdrop + isotipo hexagonal 88px + `h1` con dos líneas (AIChE GDL / Capítulo estudiantil) con `clamp()` fluido + párrafo + `Countdown` + pie `¡PARA NUESTRA PRÓXIMA COMPETENCIA!`. Sin imagen LCP (todo SVG/CSS) → evita el bug del `og.jpg` preloadeado inexistente.
- **`AboutTeaser.astro`**: grid 2 columnas con pregunta en cursiva (Libre Baskerville italic) + `VideoHighlight` 16:9 + CTA "Conoce más" a `/acerca`. Reveal escalonado.
- **`NextEvent.astro`**: `Card` con eyebrow "PRÓXIMO EVENTO", título del evento, 3 filas con `DataRow` (FECHA / SEDE / UBICACIÓN) y CTA "Ver participaciones" + lista de las 4 competencias a la derecha.
- **`SponsorTeaser.astro`**: fondo navy con eyebrow "PATROCINIOS", título + párrafo, "TRES PAQUETES" y 3 mini-tarjetas con borde superior destacado (border-t-4 border-navy-400), `PAQUETE N` + precio + contador de beneficios (calculado desde el array, no hardcodeado). CTA "Ver paquetes" a `/patrocinios`.
- **`JoinCta.astro`**: fondo navy, isotipo 120px, "¡Súmate al capítulo!" + bajada + 2 botones (correo + Instagram). **Reutilizable**: prop `id` para ancla `#unete` en S7. Acepta `emailButton` e `instagramButton` para que la home use el copy del PDF p.8 (`hola@aichegdl.org`) y `/contacto` use el oficial.

### 2.3. Home ensamblada (`src/pages/index.astro`)

Orden: Hero → AboutTeaser → NextEvent → SponsorTeaser → JoinCta. El Footer lo renderiza el Layout.

### 2.4. SEO (RULES §14)

- Title y description desde `seoRoutes.home`.
- Canonical automático via Layout (`siteUrl` + `Astro.url.pathname`).
- **JSON-LD `Event`** con `startDate` ISO, `location` (McNeese State University, Lake Charles, LA) y `organizer` (AIChE GDL).
- **JSON-LD `Organization`** con `parentOrganization` (Tecnológico de Monterrey, Campus Guadalajara).
- OG y Twitter ya los inyecta el Layout.

## 3. Archivos creados / modificados

**Creados:**
- `src/scripts/countdown.ts`
- `src/components/ui/Countdown.astro`
- `src/components/sections/Hero.astro`
- `src/components/sections/AboutTeaser.astro`
- `src/components/sections/NextEvent.astro`
- `src/components/sections/SponsorTeaser.astro`
- `src/components/sections/JoinCta.astro`
- `docs/sessions/S03-home.md` (esta bitácora)

**Modificados:**
- `src/pages/index.astro` (PagePlaceholder → ensamblado de 5 secciones + JSON-LD)

## 4. Decisiones tomadas

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| D-030 | Contador: valor inicial en build + `tabular-nums` | Calcular en cliente y mostrar 00:00:00:00 | RULES §15 explícito: "valor inicial renderizado en build (evita el flash de 00)"; `tabular-nums` evita CLS |
| D-031 | Contador pausa con `visibilitychange` + `IntersectionObserver`; al reanudar recalcula desde `Date.now()` | `setInterval` sin pausa | RULES §15: "pausa con visibilitychange y al salir del viewport; al reanudar recalcula desde Date.now()" |
| D-032 | `aria-live="off"` en cajas + texto accesible en `<span class="sr-only">` | `aria-live="polite"` o nada | RULES §13: el contador no debe leerse cada segundo; RULES §15: "texto accesible alterno" |
| D-033 | Estado post-evento: `data-post-event` con mensaje; nunca números negativos | Mantener 00:00:00:00 o negativos | RULES §15: "estado post-evento definido en datos, nunca números negativos" |
| D-034 | JSON-LD `Event` + `Organization` en la home | Sin JSON-LD | RULES §14 |
| D-035 | 5 secciones en `src/components/sections/` (Hero, AboutTeaser, NextEvent, SponsorTeaser, JoinCta) | Inline en la página | RULES §3.2 (cero duplicación); JoinCta se reutiliza en S7 |

## 5. Desviaciones respecto al plan

- **Participations sub-lista a la derecha del NextEvent card:** en la p.6 del PDF la lista de las 4 competencias va a la derecha del título "Participaciones" en lugar de debajo. En la home la coloco a la derecha del Card del NextEvent porque la p.1 (resumen) no muestra la lista completa. Si prefieres que la home muestre las 4 competencias en una sección aparte, se mueve en S9.
- **`Hero.astro` no usa imagen de fondo:** el PDF p.1 tiene un fondo navy con rejilla que ya está cubierto por `GridBackdrop`. La única "imagen" del hero es el isotipo (SVG inline, no pesa). Esto evita el problema del `og.jpg` preloadeado inexistente y mantiene el LCP rápido.

## 6. Verificación

### 6.1. Contador sin CLS (parser Node + grep)

```
data-target:           2027-03-27T09:00:00-06:00     ✓
data-post-event:       ¡Ya estamos compitiendo!     ✓
Valor inicial (build):
  DÍAS:    219                                (no es 0, no hay flash ✓)
  HORAS:   15
  MIN:     11
  SEG:     58
Flash de 00:            NO ✓
Cajas con .stat-num:    4 / 4                      ✓ (todas tienen tabular-nums)
aria-live="off" en cajas: 4 / 4                    ✓ (ninguna se lee cada segundo)
SR text:                "Faltan 219 días, 15 horas, 11 minutos y 58 segundos para The 2027 AIChE Southwe..."
Script del countdown inlineado: SÍ ✓
```

### 6.2. Estructura de la home

| # | Sección | Verificación |
|---|---|---|
| 1 | Hero | 1 h1 con `id="hero-title"` ✓ |
| 2 | AboutTeaser | 2 preguntas en cursiva (la del teaser + la del VideoHighlight) ✓ |
| 3 | NextEvent | 1 eyebrow "PRÓXIMO EVENTO" ✓ |
| 4 | SponsorTeaser | 1 título "Tu patrocinio nos lleva a competir" ✓ |
| 5 | JoinCta | 1 título "¡Súmate al capítulo!" ✓ |

### 6.3. JSON-LD (RULES §14)

- 2 bloques `application/ld+json`:
  - **Event** — `name: "The 2027 AIChE Southwest Student Regional Conference"`, `startDate: 2027-03-27T09:00:00-06:00`, `location: McNeese State University, Lake Charles, LA`.
  - **Organization** — `AIChE GDL`, `parentOrganization: Tecnológico de Monterrey, Campus Guadalajara`.

### 6.4. Resto de gates

- **astro check:** 0 errores, 0 warnings, 3 hints (cosméticos sobre `interface Props` no usado).
- **build:** verde. 9 páginas.
- **dist/ total:** 664 KB.
- **`/index.html`:** 35.9 KB raw, 8 KB gzip.
- **Preview:** `GET /` → 200, 35.9 KB, 5.8 ms.
- **JSON-LD presente en HTML servido:** verificado.
- **Nav + footer en la home:** `data-nav` (2 ocurrencias) + `<footer>` (1) ✓.

## 7. Pendiente (si PARCIAL)

N/A — sesión COMPLETA.

## 8. Necesito que el usuario decida

**Bloqueante:** ninguno. La home cumple todos los criterios.

**No bloqueante:**
- **Sub-lista de competencias en la home:** ¿la dejas a la derecha del NextEvent (actual) o prefieres una sección aparte? (D-035 propone mover en S9 si lo decides.)
- **P-005** Dominio definitivo (sigue pendiente).

## 9. Siguiente sesión

**S4 — Acerca de nosotros + Equipo.**

Precondiciones: kit de UI completo, `LazyVideo` verificado, `VideoHighlight` listo para reutilizar, `data/team.ts` por crear, placeholders hex de retratos ya generados.

Trabajo de S4:
1. `src/data/team.ts` con 6 entradas `{ name: "Nombre Apellido", role: "Cargo" }` claramente marcadas como placeholder.
2. `/acerca`: composición de dos columnas (p.5): izquierda navy con título + pregunta cursiva + párrafo largo justificado; derecha el `VideoHighlight` con copy de Acerca.
3. Colapso móvil documentado (video arriba, texto abajo).
4. `/acerca/equipo`: `TeamGrid.astro` con dos columnas: `MESA DIRECTIVA` (6 retratos 3:4) y `EQUIPO` (foto grupal).
5. Reutilizar `<Img>` con los placeholders generados en S2.
6. `Reveal` escalonado en ambas rutas.
7. Respetar la regla §10.2: los retratos son placeholders siluetas hexagonales hasta que el usuario entregue los reales.
