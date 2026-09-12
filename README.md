# AIChE GDL — Sitio web del Capítulo Estudiantil

Sitio web oficial del **Capítulo Estudiantil del American Institute of
Chemical Engineers** en el **Tecnológico de Monterrey, Campus
Guadalajara** (México).

**Objetivo:** presentar al capítulo y conseguir patrocinadores para
**The 2027 AIChE Southwest Student Regional Conference** (27 de marzo
de 2027, McNeese State University, Lake Charles, Louisiana).

---

## ⚠️ Importante — Re-sustituir imágenes y videos

> **Tras sustituir las imágenes y videos reales** en `public/media/`,
> **volver a ejecutar `bun run capture`** para regenerar las capturas
> del sitio antes de producir el video o de publicar.
>
> Las capturas están en `docs/media/screenshots/` y los screencasts en
> `docs/media/screencasts/`. Se regeneran todas con un solo comando:
>
> ```bash
> bun run capture
> ```
>
> Detalle de los slots a sustituir: [`docs/ASSETS.md`](docs/ASSETS.md).

---

## 🚀 Stack

- **Astro 7.2.2** (build estático, sin SSR).
- **Tailwind CSS 4.3.3** vía `@tailwindcss/vite` (no `@astrojs/tailwind` legacy).
- **TypeScript** (`astro/tsconfigs/strict`).
- **Bun 1.3.14** como gestor de paquetes y runtime de scripts.
- **Webfont única:** `@fontsource/libre-baskerville` latin-400-italic.
- **Integraciones:** `@astrojs/sitemap` (whitelist RULES §16.4).
- **Cero JavaScript de framework** (sin React, Vue, Svelte, jQuery).
- **Cero requests a terceros** en producción.

---

## 🧞 Comandos

| Comando | Acción |
|---|---|
| `bun install` | Instala dependencias |
| `bun run dev` | Servidor de desarrollo en `http://localhost:4321` (background) |
| `bun run build` | Build de producción en `./dist/` |
| `bun run preview` | Preview del build en `http://localhost:4321` (background) |
| `bun run capture` | Capturas deterministas con Playwright → `docs/media/` |
| `bun run check:render` | **Guard de render**: verifica que el contenido se ve en las 7 rutas, con y sin JS |
| `bun run check:overflow` | **Guard de encaje**: mide cada pantalla en 10 resoluciones |
| `bun run check:states` | **Guard de estados**: foco, hover, teclado, menú móvil, video, contador y textos largos |
| `bun run check:layers` | **Guard de arquitectura**: verifica la dirección única de dependencias |
| `bun run check:network` | **Guard de red**: cero terceros, cero 4xx/5xx, video y póster diferidos |
| `bun run astro` | CLI de Astro (`astro add`, `astro check`, `astro --help`) |
| `bunx astro check` | Type-check y validación de archivos `.astro` |
| `bunx astro preview stop` | Detiene el preview de background |
| `bunx astro dev stop` | Detiene el dev server de background |

---

## 📁 Estructura

```
.
├── astro.config.mjs          # Astro + Tailwind + Sitemap
├── package.json
├── tsconfig.json
├── public/                   # Assets servidos tal cual
│   ├── favicon.svg, favicon.ico
│   ├── og.jpg                # 1200×630 Open Graph
│   ├── robots.txt
│   ├── site.webmanifest
│   └── media/                # Imágenes y videos (placeholders temporales)
├── scripts/
│   ├── capture.mjs           # Genera el material en docs/media/
│   └── gen-placeholders.mjs  # Regenera los placeholders JPG
├── src/
│   ├── assets/               # Assets procesados por Vite/Astro
│   ├── components/
│   │   ├── layout/           # Layout, Nav, Footer, Logo, SkipLink, MobileMenu
│   │   ├── ui/               # Section, Card, Button, Reveal, Countdown, …
│   │   ├── sections/         # Hero, About, SponsorTiers, JoinCta, …
│   │   └── media/            # Img, LazyVideo, VideoHighlight, MediaFrame
│   ├── data/                 # site.ts, content.ts, nav.ts, media.ts, …
│   ├── layouts/Layout.astro
│   ├── pages/                # Rutas (7 rutas finales)
│   ├── scripts/              # nav.ts, countdown.ts, lazy-video.ts, reveal.ts
│   └── styles/global.css     # Tokens, utilidades, print styles, focus
└── docs/                     # Documentación completa del proyecto
```

---

## 🗺️ Rutas (7)

| Ruta | Contenido |
|---|---|
| `/` | Home — 5 pantallas encadenando el PDF en su orden: p.1 (hero + contador) → p.6 (Acerca, con video) → p.7 (Participaciones) → p.10 (teaser de patrocinios) → p.9 (CTA) |
| `/equipo` | Nuestro equipo — mesa directiva y foto grupal (p.13) |
| `/participaciones` | La p.7 con su propio `h1` |
| `/participaciones/southwest-2027` | Detalle del evento regional |
| `/patrocinios` | **Página de negocio** — paquetes $10k/$5k/$2.5k |
| `/contacto` | Correo + Instagram (ancla `#unete` para el botón "Únete") |
| `/404` | Página de error con enlaces útiles |

---

## 📚 Documentación

| Archivo | Contenido |
|---|---|
| [`RULES.md`](RULES.md) | Reglas permanentes del proyecto (diseño, tokens, copy, rendimiento, accesibilidad, SEO) |
| [`PLAN-SESIONES.md`](PLAN-SESIONES.md) | Mapa de sesiones S0–S10 con criterios de aceptación |
| [`docs/STATE.md`](docs/STATE.md) | Estado real del proyecto — fuente de verdad para reanudar |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Decisiones técnicas (ADR-lite) y `[PENDIENTE-USUARIO]` |
| [`docs/TODO.md`](docs/TODO.md) | FIX aplicados del PDF + datos pendientes del usuario |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | Hallazgos fuera de alcance de la sesión actual |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Tokens, tipografías, componentes, responsive |
| [`docs/ASSETS.md`](docs/ASSETS.md) | Inventario de medios y cómo sustituirlos (⚠️ re-capturar tras sustituir) |
| [`docs/VIDEO.md`](docs/VIDEO.md) | Decisión auto-alojado, comandos ffmpeg, presupuestos |
| [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) | Lighthouse por ruta, peso de `dist/`, accesibilidad y SEO — **medido en F7 (2026-08-21)** |
| [`docs/SITE-CONTEXT.md`](docs/SITE-CONTEXT.md) | Contexto autocontenido del sitio (entendible sin verlo) |
| [`docs/VIDEO-BRIEF.md`](docs/VIDEO-BRIEF.md) | Storyboard + prompts Higgsfield + guion de locución |
| [`docs/SHOTLIST.md`](docs/SHOTLIST.md) | Tabla accionable para el agente de video |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Cómo desplegar (Cloudflare Pages / Netlify / GitHub Pages) |
| [`docs/sessions/SXX-*.md`](docs/sessions/) | Bitácora de cada sesión |

---

## 🛠️ Cómo editar contenido

El sitio está construido sobre la regla de **un solo archivo por
concepto** (RULES §6). El copy verbatim vive en
[`src/data/content.ts`](src/data/content.ts) — ningún string de copy
debe escribirse dentro de un `.astro`.

| Quiero cambiar… | Edito… |
|---|---|
| Texto del hero / about / contacto / paquetes | `src/data/content.ts` |
| Menú del nav | `src/data/nav.ts` |
| Datos del evento (sede, fecha) | `src/data/event.ts` |
| Lista de competiciones | `src/data/competitions.ts` |
| Paquetes de patrocinio | `src/data/sponsors.ts` |
| Correo / Instagram / dominio | `src/data/site.ts` |
| Imágenes y videos | Sobrescribo el archivo en `public/media/...` |
| Logo / favicon | Sobrescribo `public/favicon.svg` |
| Open Graph | Sustituyo `public/og.jpg` (1200×630) |
| SEO por ruta | `seoRoutes` en `src/data/content.ts` |
| Colores / tipografía | `src/styles/global.css` (`@theme`) |

Tras cualquier cambio, regenero el material visual:

```bash
bun run build       # regenera dist/
bun run capture     # regenera docs/media/screenshots y screencasts
```

---

## 📦 Cómo desplegar

Ver [`docs/DEPLOY.md`](docs/DEPLOY.md). Resumen:

| Host | Comando | Tamaño máx por archivo |
|---|---|---|
| **Cloudflare Pages** (recomendado) | Conectar repo, build = `bun run build`, output = `dist` | 25 MB |
| Netlify | Conectar repo, build = `bun run build`, output = `dist` | 25 MB |
| GitHub Pages | Workflow de GitHub Actions | 100 MB (1 GB total) |

---

## ✅ Guard de render (`bun run check:render`)

Comprueba que el sitio **se ve de verdad**. Existe porque entre S02 y F1 el
proyecto se publicó con todo el contenido invisible en un navegador normal y
ninguna sesión lo detectó: `bun run capture` fuerza
`prefers-reduced-motion: reduce`, que resultó ser el único modo en el que el
bug no se manifestaba. Este guard cierra ese agujero.

```bash
bun run build          # imprescindible: el guard prueba el build de producción
bun run check:render
```

Levanta `astro preview` por su cuenta, recorre las **8 rutas** en **4
configuraciones** (JS activado/desactivado × motion por defecto/`reduce`) y
falla con código 1 si encuentra alguna de estas cosas:

- el `<h1>` de la página falta, está vacío o no se ve;
- algún elemento del primer viewport tiene opacidad computada 0 nada más cargar;
- algún bloque de texto principal sigue invisible **después de recorrer la
  página entera** (contando la opacidad heredada de sus ancestros, que es
  justo lo que hacía indetectable el bug original);
- con JS activado, `reveal.ts` no llegó a inicializarse — aunque la página se
  vea gracias al fallback, eso significa que la animación está muerta;
- cualquier error de consola o excepción, incluidos recursos 4xx/5xx.

Contra un servidor que ya tengas levantado:

```bash
bun run check:render -- --base http://localhost:4321
```

Devuelve 0 o 1, así que sirve tal cual en CI. **Ejecútalo antes de cerrar
cualquier sesión que toque CSS, scripts de cliente o el componente `Reveal`.**

---

## 📐 Guard de encaje (`bun run check:overflow`)

Controla el sistema de pantalla (ADENDA §A3): que cada sección que en el PDF es
una diapositiva ocupe una pantalla, sin cortar nada.

```bash
bun run build
bun run check:overflow
```

Recorre las 7 rutas en **diez resoluciones** —1920×1080, 1600×900, 1440×900,
1366×768, 1280×720, 1024×768, 768×1024, 844×390 (móvil apaisado), 390×844 y
360×800— y reporta, por resolución:

- el factor de escala efectivo y el alto útil (`100svh − --nav-h`);
- toda `.screen` que desborde ese alto, y por cuántos px;
- todo elemento más ancho que el viewport;
- cualquier `.screen` con `overflow: hidden`.

**Qué hace fallar el script (código 1):** scroll horizontal y `overflow: hidden`
sobre una pantalla. Los desbordes de altura se reportan pero no fallan por sí
solos, porque §A3 admite la válvula de escape: si el contenido no cabe ni al
mínimo de escala, la sección crece y deja fluir el scroll. Con `--strict` los
desbordes también fallan.

Por debajo de **1280px de ancho** no se comprueba la altura: ahí el sitio está
en régimen apilado (ver `docs/DESIGN-SYSTEM.md` §4.2), la composición es de una
sola columna y que una sección sea más alta que la pantalla es lo esperado. El
control de scroll horizontal sí se aplica en las diez.

---

## 🎛️ Guard de estados (`bun run check:states`)

Lo que no se ve en una captura estática. Recorre el build en dos viewports
—1440×900 (lienzo) y 390×844 (apilado)— y comprueba:

```bash
bun run build
bun run check:states
```

| Qué verifica | Criterio |
|---|---|
| **Foco visible** | cada elemento enfocable recibe el foco y se mide su `outline` / `box-shadow`. RULES §13 prohíbe quitarlo |
| **Enlace activo** | `aria-current="page"` apunta a la ruta actual y sólo a ella; `/404` no marca ninguno |
| **Hover** | color, fondo, borde, opacidad y subrayado del elemento **y de sus hijos**, antes y después de pasar el ratón |
| **Teclado** | primera parada = skip link, la tabulación llega al footer y el foco nunca cae en un elemento sin caja renderizada |
| **Submenú** | cerrado de partida, abre con `:focus-within`, cierra al salir el foco |
| **Menú móvil** | `aria-expanded`, el foco entra, el trap aguanta ida y vuelta, `Escape` cierra y devuelve el foco, el scroll del body se libera |
| **Video** | sin `src` ni `<source>` fuera del viewport, con `poster` y `preload="none"`; inyecta al entrar; pausa al salir |
| **Contador post-evento** | reescribe `data-target` al pasado: cajas y eyebrow ocultos, mensaje visible, **cero números negativos** |
| **Textos largos** | triplica cada título y párrafo y añade una palabra inseparable de 40 caracteres: no puede aparecer scroll horizontal |

Falla (código 1) ante cualquier incumplimiento. Se puede apuntar a un servidor
ya levantado con `bun run check:states -- --base http://localhost:4321`.

---

## 🧱 Guard de arquitectura (`bun run check:layers`)

Verifica la separación por capas de la ADENDA §A4 y su regla de **dependencias
en una sola dirección**. No necesita build ni navegador: lee los `import` reales
de `src/`.

```bash
bun run check:layers
```

Falla (código 1) si se rompe alguna de estas reglas:

| Regla | Por qué |
|---|---|
| `ui/` no importa **valores** de `data/` | Una primitiva atada a un dato concreto no es reutilizable |
| `sections/` no importa `sections/` | Lo compartido se sube a `ui/` y se parametriza |
| `sections/` no importa `layout/` | El chrome lo monta `layouts/` |
| `data/` no importa nada de UI | Es la fuente de verdad |
| `ui/` no importa `sections/` | La dirección es `sections → ui` |
| `layouts/` no importa `sections/` | Las secciones las compone `pages/` |

`ui/` **sí** puede hacer `import type` desde `data/`: un tipo desaparece en el
build y la alternativa sería duplicar la forma del dato. El script lo distingue
y lo lista aparte.

El árbol de capas completo está en `docs/DESIGN-SYSTEM.md` §6.

---

## 🌐 Guard de red (`bun run check:network`)

Comprueba sobre el build de producción, en las 7 rutas y en dos viewports
(390×844 y 1920×1080), lo que RULES §11.2 y §12 exigen de la red:

```bash
bun run build
bun run preview     # en otra terminal
bun run check:network
```

Falla (código 1) si:

| Comprobación | Por qué |
|---|---|
| Alguna petición sale a un origen que no sea el propio servidor | RULES regla 6: cero terceros |
| Alguna respuesta es 4xx/5xx | Un recurso roto es un defecto, aunque no se vea |
| Algún `<video>` lleva `src` o `poster` en el HTML | Los dos hacen que el navegador descargue antes de tiempo |
| Un video que arranca **fuera** del viewport pide bytes antes del scroll | RULES §11.2 |
| Un video no carga al acercarlo al viewport | El diferido tiene que funcionar, no sólo no descargar |
| Un póster bajo el pliegue se pide antes del scroll (en móvil) | El atributo `poster` se descarga siempre; por eso va como `<img loading="lazy">` |

Dos comportamientos que **no** son fallos y el script distingue: el video de
`/participaciones/` carga al abrir la página porque el diseño lo pone en la
primera pantalla, y en escritorio a 1920×1080 los pósters del home entran
dentro del umbral de proximidad de `loading="lazy"` de Chrome. Detalle en
`docs/PERFORMANCE.md` §4.

Imprime además el peso y el número de peticiones por ruta.

---

## 🔍 Cómo regenerar las capturas y screencasts

El comando `bun run capture` (definido en `package.json`):

1. Ejecuta `bun run build` → genera `dist/`.
2. Arranca `bunx astro preview --background` → `http://localhost:4321`.
3. Lanza Chromium headless con Playwright.
4. Para cada ruta (`/`, `/equipo`, `/participaciones`,
   `/participaciones/southwest-2027`, `/patrocinios`, `/contacto`):
   - Captura desktop (1920×1080) full page + hero.
   - Captura mobile (390×844, DPR 3) full page.
   - Graba scroll-through (~8 s) en WebM.
5. Captura cada sección marcada con `data-section="…"` (15 archivos).
6. Detiene el preview.

**Salida:**

```
docs/media/screenshots/desktop/<ruta>-{hero,full}.png
docs/media/screenshots/mobile/<ruta>-full.png
docs/media/screenshots/sections/<ruta>-<seccion>.png
docs/media/screencasts/<ruta>.webm
```

Tiempo total: ~3–4 min. Ver [`scripts/capture.mjs`](scripts/capture.mjs)
para detalles.

---

## 🤝 Sobre el equipo y el proyecto

- **Capítulo Estudiantil:** AIChE GDL (Tecnológico de Monterrey, Campus
  Guadalajara).
- **Mantenido por:** el equipo de AIChE GDL.
- **Licencia:** propiedad del capítulo. Todos los assets, copy y código
  son para uso del capítulo.
- **Contacto:** `aiche.gdl@gmail.com` · Instagram `@aiche.gdl`.