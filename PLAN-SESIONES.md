# PLAN-SESIONES.md — AIChE GDL

> Trabajo dividido en **11 sesiones** (S0–S10). Cada una es una unidad cerrada: entra en verde, sale en verde, deja bitácora.
> Las reglas permanentes están en `RULES.md`. Este archivo define **qué** se hace en cada sesión y **cómo se arranca**.

---

## CÓMO SE USA ESTO

1. **Antes de la primera sesión**: coloca en la raíz del repo `RULES.md`, `PLAN-SESIONES.md` y el `AGENTS.md` de este paquete (`CLAUDE.md` es un symlink y se actualiza solo).
2. **Al iniciar cada sesión**: chat nuevo y se pega el prompt correspondiente de **`PROMPTS.md`**. Nada más.
3. **Al terminar**: el agente deja bitácora, actualiza `docs/STATE.md` y entrega un reporte corto con las decisiones que necesita del usuario.
4. **Entre sesiones**: el usuario responde lo marcado `[PENDIENTE-USUARIO]` y esa respuesta se aplica con la micro-sesión de decisiones de `PROMPTS.md`.

> **Cada sesión es un chat nuevo sin memoria del anterior.** Lo único que viaja entre sesiones son los archivos del repo. `docs/STATE.md` y las bitácoras son el único canal: se escriben para alguien sin ningún contexto previo.

Los prompts de cada sesión están en `PROMPTS.md`, no aquí, para no mantener dos copias.

---

## MAPA DE SESIONES

| # | Sesión | Entrega principal | Depende de |
|---|---|---|---|
| S0 | Auditoría, configuración y sistema de diseño | Stack verificado, tokens, fuentes, docs base | — |
| S1 | Layout, Nav, Footer y esqueleto de rutas | Todas las rutas existen con nav/footer | S0 |
| S2 | Kit de UI, sistema de medios y `LazyVideo` | Componentes base + placeholders generados | S1 |
| S3 | Home (`/`) | Hero + contador + secciones resumen | S2 |
| S4 | Acerca de nosotros + Equipo | `/acerca`, `/acerca/equipo`, video highlight | S2 |
| S5 | Participaciones + Southwest 2027 | `/participaciones` y subruta | S2 |
| S6 | Patrocinios | `/patrocinios` completa (página de negocio) | S2 |
| S7 | Contacto, CTA "Únete" y 404 | `/contacto`, `/404` | S2 |
| S8 | Rendimiento, accesibilidad y SEO | Presupuestos cumplidos, metadatos, JSON-LD | S3–S7 |
| S9 | QA de fidelidad y responsive | Revisión contra el PDF, correcciones | S8 |
| S10 | Capturas, documentación y paquete Higgsfield | `SITE-CONTEXT`, `VIDEO-BRIEF`, `SHOTLIST`, capturas | S9 |

**Regla de orden:** S3–S7 pueden reordenarse entre sí si te urge una página (por ejemplo, adelantar S6 Patrocinios para enseñársela a una empresa). S0→S1→S2 y S8→S9→S10 no se reordenan.

---

## S0 — Auditoría, configuración y sistema de diseño

**Objetivo:** dejar la base técnica verificada y los tokens del diseño listos. Sin UI todavía.

**Alcance:**
1. Auditar el repo: versiones de Astro, Tailwind, TypeScript, Bun, Node; contenido de `package.json`, `astro.config.mjs`, `tsconfig.json`; `AGENTS.md`.
2. **Verificar/corregir la configuración de Tailwind.** En Astro 5 + Tailwind 4 lo correcto es el plugin de Vite (`@tailwindcss/vite` + `@import "tailwindcss";` en `src/styles/global.css`), **no** la integración legacy `@astrojs/tailwind`. Verifica la versión instalada leyendo `node_modules/tailwindcss/package.json` y su README (RULES §16.2). Si hay duda, reporta la versión y espera confirmación; no improvises.
3. `tsconfig.json` extendiendo `astro/tsconfigs/strict`. Confirmar que `sharp` funciona para `astro:assets`.
4. Configurar `astro.config.mjs`: `output: 'static'`, `compressHTML: true`, `build.inlineStylesheets: 'auto'`, `prefetch`, `site` (placeholder documentado si aún no hay dominio).
5. Rasterizar `design/landing.pdf` a `.cache/design-pages/` e **inspeccionar visualmente las 13 páginas**. Clasificarlas según RULES §4 y confirmar la clasificación en la bitácora. Si no puedes ver las imágenes, **deténte y repórtalo**: sin inspección visual no se pueden definir los tokens con fidelidad.
6. Escribir `src/styles/global.css` con `@theme` (colores, fuentes), reset mínimo y utilidades `.eyebrow`, `.quote-serif`, `.stat-num`.
7. Instalar y configurar `@fontsource/libre-baskerville` (solo 400-italic, latin).
8. Crear `src/data/site.ts` (nombre, URLs, correo, Instagram, fecha objetivo del contador, textos SEO por defecto) y `src/data/content.ts` con **todo el copy de RULES §9**.
9. Crear el andamiaje de documentación: `docs/STATE.md`, `docs/DECISIONS.md`, `docs/TODO.md`, `docs/BACKLOG.md`, `docs/DESIGN-SYSTEM.md`, `docs/sessions/`.
10. `.gitignore` con `.cache/`, `dist/`, `node_modules/`.

**Fuera de alcance:** cualquier componente visual, nav, páginas.

**Criterios de aceptación:**
- `bunx astro check` y `bun run build` en verde.
- Una página de prueba temporal demuestra que los tokens funcionan (`bg-navy`, `text-cream`, `font-serif` en itálica renderizando Libre Baskerville).
- `docs/DESIGN-SYSTEM.md` documenta cada token y cada derivación de color.
- `content.ts` contiene el copy completo, con los `[FIX]` aplicados y registrados en `docs/TODO.md`.

**Decisiones típicas de esta sesión:** versión de Tailwind y método de integración; nomenclatura de tokens; dominio provisional.

---

## S1 — Layout, Nav, Footer y esqueleto de rutas

**Objetivo:** la regla número uno del proyecto —nav y footer en todas las páginas— resuelta de una vez y bien.

**Alcance:**
1. `src/layouts/Layout.astro`: `<html lang="es-MX">`, `<head>` con props `title`/`description`/`image`, skip link, `<Nav />`, `<main>` con `<slot />`, `<Footer />`.
2. `src/data/nav.ts` con la estructura completa del menú, incluidos los submenús de "Acerca de nosotros", "Participaciones" y "Patrocinios".
3. `Nav.astro` completo según RULES §7: bloque INICIO con icono de casa, isotipo + wordmark + bajada, enlaces con `+`, botón "Únete", estado activo con subrayado, sticky con sentinel + `IntersectionObserver`.
4. `NavDropdown.astro` accesible (teclado, `Escape`, click fuera, ARIA) y `MobileMenu.astro` (hamburguesa, acordeones, focus trap, bloqueo de scroll).
5. `Footer.astro` sobre crema con isotipo y la línea legal con **año dinámico**.
6. Crear **todas** las rutas de RULES §8 como esqueletos: `<h1>` + un `<section>` con nota "en construcción (SXX)". Todas usan el Layout.
7. `GridBackdrop.astro` (rejilla + degradado en CSS puro) — se necesita ya para que el esqueleto se vea correcto.
8. Eliminar el scaffolding de demo de Astro.

**Fuera de alcance:** contenido real de las páginas.

**Criterios de aceptación:**
- Las 8 rutas navegables, todas con nav y footer, sin scroll horizontal en 360px.
- Menú y submenús operables **solo con teclado**, con foco visible y `Escape` funcionando.
- `aria-current="page"` correcto en cada ruta.
- Nav sin CLS (verificar en Lighthouse o con el panel de rendimiento).
- JS total de la ruta `/` por debajo de 10 KB comprimido en este punto.

---

## S2 — Kit de UI, sistema de medios y `LazyVideo`

**Objetivo:** todas las piezas reutilizables listas, para que S3–S7 sean puro ensamblaje.

**Alcance:**
1. Primitivas en `src/components/ui/`: `Section`, `SectionTitle`, `Eyebrow`, `Button` (variantes primario/secundario/enlace), `Card`, `DataRow` (las filas `FECHA / SEDE / UBICACIÓN`), `Badge` (chips `HIGHLIGHTS`, `SPRING 2027`), `Reveal`.
2. `src/data/media.ts` (manifiesto) y estructura `public/media/{images,video,team,sponsors}/`.
3. `scripts/gen-placeholders.mjs` con **sharp**: genera todos los placeholders con el lenguaje visual del sitio, en las proporciones reales (16:9, 3:4, 4:3, 3:2, 1:1) y con etiqueta visible. Retratos de mesa directiva: **silueta geométrica, nunca caras generadas** (RULES §10.2).
4. Generar los **videos placeholder** con ffmpeg (RULES §10.3): mínimo dos (`about-highlight`, `sponsors-hero` o el que corresponda), sin audio, ≤2 MB, con su poster.
5. `media/Img.astro` (picture con lazy, dimensiones y alt obligatorio) y `media/LazyVideo.astro` + `src/scripts/lazy-video.ts` según RULES §11.2.
6. `VideoHighlight.astro`: el bloque 16:9 con overlay (badge HIGHLIGHTS, titular, bajada en itálica, chip de fecha) de la p.5.
7. `src/scripts/reveal.ts` (reveal on scroll, `once`, respeta reduced-motion).
8. Página temporal `/_kit` (excluida del sitemap y con `noindex`) que muestra todos los componentes para revisarlos de un vistazo. Se elimina en S9.
9. `docs/ASSETS.md` y `docs/VIDEO.md`.

**Criterios de aceptación:**
- En `/_kit`, un video no descarga **nada** hasta entrar al viewport (verificar en la pestaña Network: 0 bytes hasta el scroll), arranca en silencio, se pausa al salir y muestra poster + botón con `prefers-reduced-motion` activado.
- Todos los placeholders se ven intencionales y con la proporción correcta; ningún hueco roto.
- `docs/ASSETS.md` tiene la tabla completa de slots (aunque algunas páginas aún no existan).

---

## S3 — Home (`/`)

**Alcance:**
1. `Hero.astro`: fondo con `GridBackdrop`, isotipo, títulos, párrafo (RULES §9.1), composición centrada de la p.1.
2. Contador regresivo completo (RULES §15): `src/scripts/countdown.ts`, valor inicial en build, `tabular-nums`, pausa fuera de foco y con pestaña oculta, estado post-evento.
3. Resumen "Acerca de" con el bloque de video highlight (reutilizando `VideoHighlight`).
4. Bloque "Próximo evento" (tarjeta con `DataRow`).
5. Teaser de los tres paquetes con CTA a `/patrocinios`.
6. `JoinCta.astro` ("¡Súmate al capítulo!") reutilizable, usado aquí y en `/contacto`.
7. Responsive de todo lo anterior.

**Criterios de aceptación:**
- El contador no provoca ningún salto de layout al actualizarse (verificar con el ancho de dígitos más ancho posible).
- Lighthouse móvil preliminar en `/` ≥90 en Performance (el objetivo ≥95 se cierra en S8).
- El hero se ve correcto en 360×800 sin cortar el contador ni el título.

---

## S4 — Acerca de nosotros + Equipo

**Alcance:**
1. `/acerca`: composición de dos columnas de la p.5 (izquierda navy con título, pregunta en Libre Baskerville italic y párrafo largo justificado; derecha el video 16:9 con overlay), adaptada al lenguaje final con nav.
2. Colapso móvil documentado (video arriba, texto abajo, o el orden que decidas y justifiques).
3. `/acerca/equipo`: `TeamGrid.astro` con las dos columnas `MESA DIRECTIVA` (6 retratos 3:4) y `EQUIPO` (foto grupal).
4. `src/data/team.ts` con 6 entradas placeholder claramente marcadas + nombre y cargo visibles bajo cada retrato.
5. Enlaces cruzados entre ambas rutas y desde el submenú del nav.

**Criterios de aceptación:**
- El párrafo largo mantiene una medida legible (≈60–75 caracteres por línea) en escritorio.
- Los 6 retratos mantienen 3:4 exacto sin recortes raros en ningún breakpoint.
- Sustituir `board-03.jpg` por otro archivo del mismo nombre no requiere tocar código (prueba real y anótala en la bitácora).

---

## S5 — Participaciones + Southwest 2027

**Alcance:**
1. `/participaciones`: título grande + subtítulo en itálica, tarjeta `PRÓXIMO EVENTO` con `DataRow`, bloque "Rumbo a las competencias AIChE" con las 4 competencias y sus etiquetas `SPRING 2027` / `OPEN CALL 2027`, imagen grande del Chem-E-Car.
2. `src/data/competitions.ts` como fuente única de las competencias.
3. `/participaciones/southwest-2027`: `CompetitionInfo.astro` con prop `variant: "navy" | "cream"` (RULES §9.4), usado aquí en variante navy, más la fila de 3 imágenes.
4. Verificar que la misma sección se pueda insertar en `/patrocinios` en variante crema sin duplicar markup (se consume en S6).

**Criterios de aceptación:**
- `CompetitionInfo` renderiza ambas variantes correctamente (demuéstralo en `/_kit`).
- El texto unificado de la sede (Lake Charles, Louisiana) es el único que aparece en todo el sitio.
- La lista de competencias sale enteramente de `competitions.ts`.

---

## S6 — Patrocinios (página de negocio)

**Objetivo:** es la página que se le enseña a una empresa. Máximo cuidado.

**Alcance:**
1. Hero de la p.9: eyebrow, título "Tu patrocinio nos lleva a competir", párrafo, etiqueta `TRES PAQUETES` y las tres cajas de precio con el borde superior destacado, más la imagen grande a la derecha.
2. `src/data/sponsors.ts`: tres paquetes con precio, moneda (variable), contador de beneficios y lista de beneficios (RULES §9.5).
3. Sección "Qué recibe tu empresa" (p.10): tres tarjetas con imagen, `PAQUETE N`, `N BENEFICIOS`, precio y lista de viñetas; nota "Los tres paquetes incluyen posibilidad de facturación".
4. Sección "La competencia" en **variante crema** reutilizando `CompetitionInfo` de S5.
5. CTA claro hacia contacto (mailto con asunto prellenado tipo "Patrocinio AIChE GDL — Paquete N").
6. Responsive: en móvil los tres paquetes en stack (o scroll horizontal con snap), sin perder la jerarquía de precios.

**Criterios de aceptación:**
- El contador `N BENEFICIOS` se **calcula** desde el array, no se escribe a mano.
- Cambiar un precio o añadir un beneficio en `sponsors.ts` se refleja en las dos secciones y en el teaser del home.
- La página se lee bien impresa en PDF desde el navegador (es probable que se comparta así con empresas): sin cortes horribles, con el fondo legible.

---

## S7 — Contacto, CTA "Únete" y 404

**Alcance:**
1. `/contacto` según la p.13: eyebrow, título "¡TRABAJEMOS JUNTOS!", bloque `CONTÁCTANOS` con correo e Instagram como enlaces reales, foto grupal.
2. Ancla `#unete` operativa (destino del botón del nav) y bloque `JoinCta`.
3. Decidir y documentar si hay formulario: **por defecto NO** (sitio estático, cero terceros) → enlaces `mailto:` e Instagram. Si más adelante se quiere formulario, dejar anotado en `docs/BACKLOG.md` el camino (Formspree/Netlify Forms) con su impacto en la regla de terceros.
4. `/404` con el mismo layout y enlaces útiles.
5. Revisión final del footer y del bloque "¡Súmate al capítulo!".

**Criterios de aceptación:**
- Correo e Instagram salen de `site.ts` y aparecen idénticos en contacto, CTA y footer.
- `mailto:` incluye asunto por defecto.
- El 404 conserva nav, footer y estilo.

---

## S8 — Rendimiento, accesibilidad y SEO

**Alcance:**
1. Lighthouse móvil sobre `bun run preview` en todas las rutas; corregir hasta cumplir los presupuestos de RULES §12.
2. Auditar el peso real: `dist/` total, JS y CSS por ruta; recortar lo que sobre.
3. Verificar la carga diferida real de videos e imágenes en la pestaña Network (ruta por ruta).
4. Auditoría de accesibilidad: recorrido completo por teclado, contraste, encabezados, landmarks, `aria-*`, reduced-motion.
5. SEO: metadatos por ruta, canonical, OG/Twitter, `og.jpg` 1200×630, `@astrojs/sitemap`, `robots.txt`, JSON-LD `Organization` + `Event`.
6. `docs/PERFORMANCE.md` con los resultados por ruta (antes/después).

**Criterios de aceptación:**
- ≥95 en las cuatro categorías en `/`, `/patrocinios` y `/participaciones` como mínimo; el resto documentado.
- 0 requests a terceros (verificado en Network con el build de producción).
- LCP < 2.0 s y CLS < 0.02 en móvil simulado.

---

## S9 — QA de fidelidad y responsive

**Alcance:**
1. Comparar **cada** página del sitio contra su página del PDF (usa las rasterizaciones de `.cache/design-pages/` lado a lado) y listar diferencias.
2. Corregir las diferencias que sean errores; documentar como decisión razonada las que sean adaptaciones deliberadas (por ejemplo, un bloque que en el PDF vive en 16:9 y en web necesita otra proporción).
3. Pasada de responsive real en 360 / 390 / 768 / 1024 / 1440 / 1920, incluidas orientaciones horizontales de móvil.
4. Revisión de estados: hover, focus, activo, submenú abierto, video sin cargar, video pausado, contador post-evento, textos largos.
5. Eliminar `/_kit` y cualquier resto temporal.
6. Revisión ortográfica y de acentos de todo el copy visible frente a RULES §9.

**Criterios de aceptación:**
- `docs/sessions/S9-*.md` incluye la tabla "PDF vs implementación" página por página con veredicto.
- Cero diferencias sin explicar.

---

## S10 — Capturas, documentación y paquete Higgsfield

**Objetivo:** que otro agente pueda producir el video de presentación **sin acceso al repositorio**.

**Alcance:**
1. `scripts/capture.mjs` con **Playwright**: build + preview, y captura de
   - `docs/media/screenshots/desktop/<ruta>-full.png` (1920×1080, página completa)
   - `docs/media/screenshots/desktop/<ruta>-hero.png` (solo viewport)
   - `docs/media/screenshots/mobile/<ruta>-full.png` (390×844, DPR 3)
   - una captura por sección marcada con `data-capture="nombre"` → `docs/media/screenshots/sections/`
   - un scroll-through por ruta en `docs/media/screencasts/<ruta>.webm`
   Espera `document.fonts.ready`, fuerza reduced-motion y el estado final de los reveals para capturas deterministas. Script `bun run capture`.
2. Ejecutarlo y dejar el material commiteado.
3. `docs/SITE-CONTEXT.md`: contexto autocontenido (qué es AIChE GDL, propósito, público, tono, paleta con hex, tipografías, inventario ruta por ruta con mensajes clave y CTA, datos del evento, los tres paquetes, contacto).
4. `docs/VIDEO-BRIEF.md`:
   - Duración: 60–90 s (larga) y 30 s (corta). Formatos 16:9 (1920×1080) y 9:16 (1080×1920) para Instagram.
   - Storyboard de 6–10 escenas: número, ruta/sección, descripción del plano (scroll lento, zoom suave, foco en el contador, hover en el nav), texto en pantalla, narración en español (1–2 frases), duración y still asociado.
   - **Prompts sugeridos para Higgsfield**, uno por escena, en inglés, listos para copiar (movimiento de cámara, ritmo, estilo: limpio, corporativo-técnico, azul institucional, transiciones suaves).
   - Guion de locución completo en bloque continuo con marcas de tiempo, listo para TTS.
   - Música: mood (electrónica corporativa optimista, sin voz) y puntos de acento.
   - Cierre con correo e Instagram y el frame "¡Súmate al capítulo!".
5. `docs/SHOTLIST.md`: tabla `escena → still/screencast → ruta → prompt → narración → duración`.
6. `docs/DEPLOY.md` y `README.md` final.
7. Nota destacada en `README.md` y `docs/ASSETS.md`: **tras sustituir imágenes y videos reales, volver a ejecutar `bun run capture`** para regenerar el material del video.

**Criterios de aceptación:**
- Las capturas cubren todas las rutas en desktop y móvil, sin fuentes sin cargar ni animaciones a medias.
- `SITE-CONTEXT.md` se entiende sin ver el sitio.
- `SHOTLIST.md` es directamente accionable por el agente de video.

---

## PLANTILLAS

### `docs/STATE.md`

```markdown
# Estado del proyecto — actualizado: <fecha> (sesión SXX)

## Stack
Astro <v> · Tailwind <v> · TypeScript <v> · Bun <v> · Node <v>
Integraciones: <lista>

## Sesiones
- [x] S0 Auditoría y sistema de diseño — <fecha>
- [ ] S1 …
**Siguiente sesión:** S<N> — <nombre>

## Rutas
| Ruta | Estado | Sesión | Notas |
|---|---|---|---|
| / | esqueleto / en progreso / completa / pulida | S3 | |

## Componentes existentes
<lista por carpeta, una línea cada uno>

## Medios
<nº de placeholders, cuáles faltan, cuáles ya sustituyó el usuario>

## Métricas actuales
dist/: <tamaño> · JS `/`: <KB> · CSS: <KB> · Lighthouse: <si aplica>

## Bloqueos y pendientes del usuario
<lista con enlace a DECISIONS.md>
```

### `docs/sessions/SXX-<slug>.md`

```markdown
# Sesión SXX — <nombre>
**Fecha:** <fecha> · **Estado:** COMPLETA | PARCIAL

## 1. Alcance planeado
<copiado de PLAN-SESIONES.md>

## 2. Qué se hizo
<viñetas concretas>

## 3. Archivos creados / modificados
<lista agrupada>

## 4. Decisiones tomadas
| # | Decisión | Alternativas | Motivo |
|---|---|---|---|

## 5. Desviaciones respecto al plan
<qué cambió y por qué>

## 6. Verificación
- astro check: <resultado>
- build: <resultado> · dist/: <tamaño>
- preview: rutas revisadas <lista> · errores de consola: <0/…>
- responsive: <breakpoints revisados>
- Lighthouse: <si aplica>

## 7. Pendiente (si PARCIAL)
<lista exacta para retomar>

## 8. Necesito que el usuario decida
**Bloqueante:** <…>
**No bloqueante (asumí X):** <…>

## 9. Siguiente sesión
S<N+1> — <nombre>. Precondiciones: <…>
```

### `docs/DECISIONS.md`

```markdown
# Decisiones

| ID | Fecha | Sesión | Decisión | Alternativas | Motivo | Estado |
|---|---|---|---|---|---|---|
| D-001 | | S0 | Tailwind 4 vía @tailwindcss/vite | @astrojs/tailwind | Integración vigente en Astro 5 | Aceptada |
| D-002 | | S0 | Video auto-alojado, sin YouTube | Embed / facade | Cero terceros, presupuesto de rendimiento | Aceptada (fijada en RULES §11) |
| P-001 | | S6 | Moneda de paquetes | MXN / USD | — | **PENDIENTE-USUARIO** (se asume MXN) |
```

---

## REGLAS DE ORO ENTRE SESIONES

1. Una sesión **nunca** se cierra con el build en rojo.
2. Lo que no esté en `docs/STATE.md` **no existe** para la sesión siguiente.
3. Ninguna decisión pendiente detiene el trabajo: se aplica un valor por defecto documentado y aislado en un solo archivo.
4. Si una sesión se está desbordando, **córtala**: mejor PARCIAL bien documentada que completa a medias.
5. Los placeholders son temporales pero deben verse intencionales: el sitio tiene que poder enseñarse a alguien en cualquier momento del proceso.
