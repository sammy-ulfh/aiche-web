# Estado del proyecto — actualizado: 2026-08-21 (F8 · cierre de la fase 2)

## Stack

- Astro **7.2.2** (build estático)
- Tailwind CSS **4.3.3** vía plugin Vite `@tailwindcss/vite`
- TypeScript (config `astro/tsconfigs/strict`)
- Bun **1.3.14** (gestor de paquetes)
- Node **v24.18.0**
- Webfont única: `@fontsource/libre-baskerville` 5.3.0 (latin 400-italic)
- `sharp` 0.35.3 (depuración instalada explícita)

## Integraciones

- `@tailwindcss/vite`
- `@astrojs/sitemap` **3.7.3** (instalado en S8; whitelist RULES §16.4)

## Sesiones

- [x] S0 Auditoría y sistema de diseño — 2026-08-19
- [x] S1 Layout, Nav, Footer y esqueleto de rutas — 2026-08-19
- [x] S2 Kit de UI, sistema de medios y `LazyVideo` — 2026-08-19
- [x] S3 Home (`/`) — 2026-08-19
- [x] S4 Acerca de nosotros + Equipo — 2026-08-19
- [x] S5 Participaciones + Southwest 2027 — 2026-08-19
- [x] S6 Patrocinios — 2026-08-19
- [x] S7 Contacto, CTA "Únete" y 404 — 2026-08-19
- [x] S7.5 Limpieza de cumplimiento contra RULES — 2026-08-19
- [x] S8 Rendimiento, accesibilidad y SEO — 2026-08-19
- [x] S9 QA de fidelidad y responsive — 2026-08-19
- [x] **S10 Capturas, documentación y paquete Higgsfield — 2026-08-20**

### Fase 2 (F0–F8) — **completa**

- [x] **F0 Diagnóstico y triage — 2026-08-20** → `docs/AUDIT-F2.md`
- [x] **F1 Render y mejora progresiva — 2026-08-20** → `docs/sessions/F1-render.md`
- [x] **F2 Sistema de pantalla — 2026-08-20** → `docs/sessions/F2-screen-system.md`
- [x] **F3 Arquitectura, datos y limpieza — 2026-08-20** → `docs/sessions/F3-arquitectura.md`
- [x] **F4 Fidelidad: Inicio, Acerca, Equipo — 2026-08-20** → `docs/sessions/F4-fidelidad-1.md`
- [x] **F5 Fidelidad: Participaciones, Southwest, Patrocinios, Contacto — 2026-08-20** → `docs/sessions/F5-fidelidad-2.md`
- [x] **F5b Segunda pasada de F5 + `/acerca` + menú — 2026-08-20** → misma bitácora, sección «F5 · segunda pasada»
- [x] **F6 Responsive y estados — 2026-08-20** → `docs/sessions/F6-responsive.md`
- [x] **F6b Reestructuración del sitio + fidelidad de la p.7 — 2026-08-21** → `docs/sessions/F6b-estructura-y-p7.md`
- [x] **F7 Rendimiento, accesibilidad y SEO — 2026-08-21** → `docs/sessions/F7-perf-a11y-seo.md`
- [x] **F7b Aire vertical y sangrado de p.6 y p.7 — 2026-08-21** → misma bitácora, sección «F7b»
- [x] **F8 Re-captura, documentación y cierre — 2026-08-21** → `docs/sessions/F8-cierre-fase-2.md`

**El proyecto NO estaba cerrado.** S10 lo declaró cerrado, pero F0 comprobó
que el sitio se publicaba con **todo el contenido invisible** en un navegador
normal: `reveal.ts` y `lazy-video.ts` no se importaban desde ningún sitio y no
llegaban al build. Ver `docs/AUDIT-F2.md`.

**Lo que cerró F8 (2026-08-21).** Los dos pendientes del backlog de F7 y
el cierre de la fase.

1. **El CSS crecía con la documentación.** Tailwind 4 escaneaba `docs/**`
   y `scripts/`, así que cada clase citada **en prosa** en una bitácora se
   emitía y viajaba en el CSS de las 7 páginas: 99 clases fantasma, 694 B
   gz por ruta. Acotado a `src/` con `source(none)` + `@source`:
   10 427 → **9 733 B gz**, con las pantallas pixel a pixel idénticas
   (D-179).
2. **Las imágenes se servían enteras.** Los huecos reales van de 159px
   —retrato en móvil— a 824px y se descargaban archivos de 600 a 1800px.
   Los 20 rasterizados pasan a `src/assets/media/` y salen por
   `astro:assets` como AVIF + WebP + original, con `srcset` de hasta 6
   anchos y `sizes` medido hueco por hueco. **El peso por ruta baja entre
   un 45 % y un 75 %** y `/equipo` pasa de 1,58–1,89 s de LCP a **1,21 s**
   (D-180 a D-182). Sustituir un placeholder sigue siendo dejar otro
   archivo con el mismo nombre, pero **ahora en `src/assets/media/`**.
3. **Re-captura.** La comprobación que pedía la ficha —contrastar lo
   capturado con un navegador normal— encontró que **el lockup del footer
   no salía en ninguna captura**: forzar los reveals no hace que carguen
   las imágenes `lazy`, que dependen de la proximidad al viewport.
   Corregido en `capture.mjs`; 39 archivos regenerados (48 MB).
   **Verificado después ruta por ruta** (dos pasadas por ruta, para
   separar el ruido de la desviación): `/participaciones`,
   `/participaciones/southwest-2027` y `/contacto` salen **idénticas al
   píxel** al navegador real; en `/` la única banda que difiere es la del
   contador; en `/equipo` (80 px) y `/patrocinios` (8 680 px, 0,14 %) la
   diferencia cae **sobre los bordes de los glifos** —rasterizado de un
   elemento que terminó su transición frente a uno con `is-revealed`
   puesto de golpe— y se acepta.
   **Aviso:** los dos paneles de video salen con velo y botón de play.
   No es el diseño: es el estado de reserva de `lazy-video.ts` porque los
   MP4 son stubs de 20 B y `play()` se rechaza. Hay que **volver a
   capturar** al dejar los videos reales (`docs/TODO.md` M-001/M-005).
4. **El dominio no vivía en una sola línea.** La documentación repetía
   desde S8 que cambiar `siteUrl` lo propagaba todo; no era cierto —
   `astro.config.mjs` y `public/robots.txt` lo tenían escrito a mano.
   `astro.config.mjs` importa ahora `siteUrl` y `robots.txt` **se genera
   en el build** desde esa constante (hook `astro:build:done`, no un
   endpoint: regla 10 intacta). Verificado sustituyendo el dominio y
   comprobando que no queda ni una aparición del anterior en `dist/`
   (D-183).
5. **Documentación al día:** `SHOTLIST` regenerado desde el contenido
   real, `SITE-CONTEXT` §4 reescrito con las 5 pantallas del home, y
   `VIDEO-BRIEF`, `DEPLOY`, `DESIGN-SYSTEM`, `README`, `RULES` §10,
   `ASSETS`, `VIDEO` y `gen-placeholders.mjs` alineados con la estructura
   real.

**Lo que cambió F7b (2026-08-21) — a petición del usuario.** Las dos
diapositivas del home que vienen del PDF a sangre estaban pegadas a los
bordes.

1. **Cada diapositiva declara cuántas unidades de lienzo mide su
   composición** y `--screen-fs` se deriva de ahí, sobreescrito en el
   elemento `.screen` para que escale todo en bloque. La p.6 compone
   1080px —el nav sólo deja 1000— y hasta ahora se pagaba borrando el
   aire: el titular a 16px del borde y el cuerpo **saliéndose 13px por
   abajo**. Ahora 56/31px de margen (D-176).
2. **La p.7 gana aire (30/30px) y su columna derecha pasa a `1fr` con
   `padding-right: 0`**, así que el media sangra hasta x=1920. Ése era el
   «desfase»: la foto de la p.6 justo encima llegaba al borde y ésta se
   quedaba a 43px. El `1fr` es lo que evita repetir el error de D-156
   (composición «más pequeña y centrada»): el sobrante se lo come el
   media, no los lados (D-177).
3. **El velo del overlay de video se recalibró contra la banda de texto**:
   el titular pasa de 3,18:1 a 6,48:1 en el peor píxel del póster, y de
   2,99 a 5,30:1 sobre blanco puro, que es el peor fotograma concebible
   tratándose de video (D-178).

Sólo cambia en viewports anchos y bajos: a 1440×900 y 1280×800 manda el
término de ancho de `--screen-fs` y no se mueve un pixel.

**Estado real tras F7.** Los once presupuestos de RULES §12 se cumplen,
**medidos**, no estimados: Lighthouse 13.4.1 da **100 / 100 / 100 / 100**
en las 7 rutas y en los dos perfiles (móvil y escritorio), con la única
excepción del SEO de `/404` (66, y es correcto: falla sólo `is-crawlable`
porque lleva `noindex`, que es lo que debe llevar una página de error).
Peor LCP 1,89 s (`/equipo/`, la única cifra con poco margen: siete
ejecuciones dan de 1,58 a 1,89 s), CLS ≤ 0,0005, TBT 0 ms, JS ≤ 3,33 KB gz,
CSS 10,34 KB gz, 0 peticiones a terceros. Cifras y método en `docs/PERFORMANCE.md`, que se
reescribió entero con fecha de medición.

F7 encontró y corrigió **diez defectos**: la lista de paquetes de la home
era HTML inválido y dejaba su accesibilidad en 92/87; dos contrastes por
debajo de AA heredados del propio PDF; el enlace de marca incumplía WCAG
2.5.3; once `<section>` sin nombre accesible; 113 KB de pósters de video
que se descargaban antes de pintar nada (LCP de `/` 1,95 → 1,28 s); un PNG
de 283 KB; dos entradas del manifiesto con dimensiones falsas; tres
rutas que volcaban el copy visible en la meta description; y dos anillos
de foco invisibles sobre navy.

**Estado real tras F6:** el contenido se ve en las 8 rutas con y sin JavaScript
(`bun run check:render`, 32/32); el sistema de pantalla de §A3 encaja en **10
resoluciones** sin un solo desborde ni scroll horizontal (`bun run
check:overflow`); los **estados de interfaz y la navegación por teclado** están
verificados por script (`bun run check:states`, 90 comprobaciones, 0 fallos); y
la arquitectura por capas de §A4 es verificable (`bun run check:layers`: 164
imports, cero violaciones).

**Lo que corrigió F6 (2026-08-20).** El barrido de las siete resoluciones del
encargo devolvió 43 de 56 filas con hallazgos, y casi todos tenían **una sola
raíz**: la frontera entre la diapositiva 16:9 y la pila de una columna estaba
puesta en 768px, pero el lienzo deja de caber por debajo de **1191px**. Entre
esos dos valores había scroll horizontal en las 8 rutas (la barra de navegación
pedía 1161px) y las etiquetas del diseño se pintaban a 7.9–9.9px.

1. **Una frontera única y con nombre:** `--breakpoint-canvas: 80rem` (1280px),
   variante `canvas:` de Tailwind. Sustituye a los cuatro valores que había
   (`767px`, `1023px` y `md:`/`lg:`) en `global.css` y en 15 componentes
   (D-142, D-143).
2. **`--screen-fs` es la única palanca de escala.** En el régimen apilado se
   redefine a `1rem` en `:root` **sin capa**; antes había que listar a mano cada
   utilidad y las que faltaban se quedaban en el suelo del `clamp()` (D-144).
3. **Suelo de legibilidad de 11px** en `.t-eyebrow`, `.t-label` y `.t-tag`. No
   toca la fidelidad: a 1920 los tres nominales están por encima (D-145).
4. **Seis defectos de estado** que ninguna captura estática enseña: el overlay
   del video tapaba el botón de play, la media de `/acerca` caía encima del
   footer en móvil, el contador seguía corriendo para siempre tras la fecha y
   tres enlaces no reaccionaban al ratón (D-147…D-150).

**Efecto deliberado que conviene saber:** 1024×768 y 768×1024 muestran ahora la
pila de una columna, no la diapositiva. En esos anchos el lienzo no cabe sin
desbordar o sin bajar el texto a 8px. Ver `docs/DESIGN-SYSTEM.md` §4.2.

**Lo que cambió F6b (2026-08-21) — a petición del usuario.** El mapa del sitio
no decía lo que había dentro: el item «Acerca de nosotros» llevaba a la
diapositiva de presentación del capítulo y la página del equipo colgaba de ella
como subpágina.

1. **Menú y rutas.** El primer item es **«Nuestro equipo» → `/equipo`** (la
   p.13). `/acerca` y `/acerca/equipo` **desaparecen**, sin redirección: el
   sitio no está publicado (D-153, D-154).
2. **El home cuenta la historia del PDF en su orden**: p.1 (hero + contador) →
   **p.6 entera, con su video** → **p.7 entera** → p.10 en resumen → p.9. Sale
   `NextEvent`, que duplicaba la tarjeta de evento y las cuatro competencias en
   la pantalla justo anterior a Participaciones (D-155).
3. **La p.7 pasa a escala 1:1 y a sangre.** F5 la había reencajado en la caja de
   1728px con un factor de 0.938, y por eso «se veía más pequeña y centrada»:
   *toda* la composición estaba un 7 % por debajo del diseño. La p.7 compone de
   x=35 a x=1878 y no usa esa caja. Medido después: tarjeta, caja del título y
   bandas blancas **al píxel**, y los diez cuerpos tipográficos con **0.05px**
   de diferencia máxima (D-156).
4. **Dos defectos que salieron de ahí:** los huecos escritos en `em` se
   resolvían contra el cuerpo del propio elemento y la pantalla se iba a 1018px
   (D-157); y la regla `overflow-wrap: anywhere` de F6 partía «SPRING» como
   «SPRIN / G» (D-158).
5. **Los pósters de los dos videos son ya las fotos reales del PDF**, extraídas
   con `mutool extract`. Siguen siendo placeholders y siguen sustituyéndose por
   nombre de archivo (D-159, M-006).

**Lo que corrigió F5b (2026-08-20).** El usuario reportó que `/acerca` y
`/participaciones` no se parecían al diseño. Al medir aparecieron tres cosas:

1. **La pila tipográfica era la causa transversal.** `--font-sans` caía a
   `system-ui` → DejaVu Sans fuera de Windows, un **18,6 % más ancha** que Segoe
   UI. Los títulos rompían donde no debían en **todo** el sitio. Pila nueva:
   `"Segoe UI", Arial, Helvetica, sans-serif` → +2,7 % de media (D-137).
2. **`/acerca` tenía la composición equivocada.** En la p.6 la foto sangra por
   tres bordes y ocupa el 70 % de la diapositiva con los rótulos encima; F4 la
   había dejado como caja 16:9 dentro del margen, con el titular debajo (D-139).
3. **`/participaciones` estaba descolocada**, no mal dimensionada: los cuerpos
   ya estaban dentro del 1,5 %, pero la composición no arrancaba donde debe.
   Reencajada con el factor 1728/1843 = 0.938 (D-140).

Además, a petición del usuario, los tres items del menú con página propia
perdieron el «+» y son enlaces directos; el submenú se abre en CSS y
`scripts/nav.ts` baja de 259 a 153 líneas (D-138).

**Fidelidad (§A1):** las **6 desviaciones sistémicas** de `docs/AUDIT-F2.md` §2.0
están cerradas. F4 refidelizó el hero de `/`, `/acerca/equipo` y el CTA de
cierre; F5 cerró las seis diapositivas de `/participaciones`, Southwest,
Patrocinios y Contacto; **F5b volvió a medirlas todas** con superposición por
canales y rehizo `/acerca`. Todo se midió contra el PDF, no se estimó: ver las
tablas diferencia → corregida/justificada de `docs/sessions/F4-fidelidad-1.md` y
`docs/sessions/F5-fidelidad-2.md` (§F5b.2 a §F5b.6).

**Cifras finales de F5b (ancho de texto medido, PDF vs sitio a 1920×1080):**

| Elemento | PDF | Sitio | Δ |
|---|---:|---:|---:|
| p.10 título «Tu patrocinio nos» | 595px | 600px | +0,8 % |
| p.10 cuerpo, línea 1 | 757px | 785px | +3,7 % |
| p.10 precio `$10,000` | 142px | 142px | **0** |
| p.11 «Qué recibe tu empresa» | 584px | 590px | +1,0 % |
| p.11 nota de facturación | 470px | 469px | −0,2 % |
| p.14 `aiche.gdl@gmail.com` | 395px | 407px | +3,0 % |

Las posiciones verticales de p.10 coinciden al píxel (título en y=306, tarjetas
en y=801..923); la galería de p.12 arranca en y=661, exacto.

**Ojo con la desviación S-3 de la auditoría: era incorrecta.** La barra de
navegación del PDF no es navy, es gris claro `#d0d4d7` con el bloque INICIO en
navy. Corregido según §A5.

Las **16 pantallas encajan** en las diez resoluciones verificadas.
`/acerca` dejó de usar la válvula de escape mediante un fallback métrico
Segoe UI → Arial y sin el padding vertical genérico de `Screen` en desktop
(D-136). F7 remidió todo desde cero (§A5) y sustituyó las métricas de F1; F8
regeneró las capturas y cerró la fase.

**Material generado en S10:**
- `scripts/capture.mjs` + `bun run capture` → 43 archivos en
  `docs/media/` (14 desktop + 7 mobile + 15 sections + 7 screencasts,
  ~25 MB).
- Documentación nueva: `docs/SITE-CONTEXT.md`, `docs/VIDEO-BRIEF.md`,
  `docs/SHOTLIST.md`, `docs/DEPLOY.md`.
- `README.md` reescrito con aviso destacado de regenerar capturas.
- `docs/ASSETS.md` con aviso y paso 5 al checklist.

## Rutas

| Ruta | Estado | Sesión | Notas |
|---|---|---|---|
| `/` | **5 pantallas**: Hero+Countdown → About (p.6 entera, con video) → ParticipationsOverview (p.7 entera) → SponsorTeaser → JoinCta + JSON-LD Event y Organization | S3/S8/S9/F4/F5/**F6b** | **Reordenada en F6b (D-153).** Encadena el PDF en su orden: p.1 → p.6 → p.7 → p.10 → p.9. Un solo `h1` (el hero); los dos bloques nuevos entran como `h2` |
| `/equipo` | completa: TeamGrid en **una sola pantalla** — eyebrow + h1 + MESA DIRECTIVA (3×2) + EQUIPO | S4/S8/F4/**F6b** | **Movida desde `/acerca/equipo` en F6b.** Es el primer item del menú, «Nuestro equipo», y su rótulo interno dice lo mismo: el PDF ponía «ACERCA DE NOSOTROS» y el usuario lo alineó con el menú (D-161, única desviación de copy del sitio) |
| `/participaciones` | una pantalla `ParticipationsOverview`: evento + competencias + título/subtítulo + video; JSON-LD Event | S5/S8/F5/F5b/**F6b** | **A escala 1:1 y a sangre desde F6b (D-156)**: x 35..1878, tarjeta 515×427, caja del título 1289×161, media 1288×732. Los diez cuerpos, a 0.05px del PDF |
| `/participaciones/southwest-2027` | una pantalla `CompetitionInfo(navy)` + JSON-LD Event | S5/S8/**F5** | **Refidelizada contra p.8 real**; bandas verticales + recorte Chem-E-Car; 1 h1 + 1 h2 |
| `/patrocinios` | 3 pantallas: SponsorHero + SponsorTiers + CompetitionInfo(cream) | S6/S8/F5/**F5b** | **La página más medida del sitio.** F5b corrigió el corte del título, el cuerpo (21,3 → 23,9px, 4 → 5 líneas), el ritmo vertical de las tarjetas y la posición de la galería de p.12 |
| `/contacto` | ContactBlock + JoinCta(id=unete), sin formulario, mailto + Instagram | S7/S8/**F5** | Primera pantalla refidelizada contra p.14 real; `JoinCta` se conserva por `/contacto#unete` (D-133) |
| `/404` | completa: hero navy + grid de enlaces útiles derivados de `data/nav.ts` | S7/S7.5/S8 | noindex, mismo layout, copy en `data/notFound`, main con aria-labelledby |

> **`/acerca` y `/acerca/equipo` ya no existen** (D-154). La diapositiva que
> vivía en `/acerca` es ahora la segunda pantalla del home; la del equipo es
> `/equipo`. No se dejó redirección: el sitio no está publicado.

## Componentes existentes

- `src/layouts/Layout.astro` — completo: es-MX, head completo (canonical, OG/Twitter con image:alt, theme-color, manifest), JSON-LD Organization global, skip link, Nav, main con aria-labelledby, Footer
- `src/components/layout/`: SkipLink, Nav, **NavDropdown (padre enlace + panel CSS, F5b)**, **MobileMenu (sin acordeones, F5b)**, Footer (todos con focus outlines ajustados a AA en S8)
- `src/components/ui/`: GridBackdrop (**F5**: navy/cream, fase y centro medidos), **Screen** (único dueño del alto y escala; `align` + tonos), Logo, Badge, Countdown, SectionTitle, **Eyebrow F5 a 15.6px**, Button, Card, DataRow, Reveal, ContactActions, EventCard, **PackageCard compact/full**, CompetitionList
- `src/components/sections/`: Hero, **About (sin variante `teaser`, F6b)**, **ParticipationsOverview (1:1 con la p.7, F6b)**, SponsorTeaser, SponsorHero (id="paquetes"), SponsorTiers (id="beneficios"), JoinCta, TeamGrid, **CompetitionInfo con composiciones navy/cream**, ContactBlock
- `src/components/media/`: Img, **LazyVideo (video en capa propia + botón de play sobre el overlay, F6)**, **VideoHighlight (`fill` en el lienzo; overlay en flujo y caja que crece en el régimen apilado, F6)**, MediaFrame
- `src/data/nav.ts` (estructura del menú con anclas `#paquetes`, `#beneficios`, `#competencia`)
- `src/data/media.ts` (manifiesto único de medios)
- `src/data/site.ts`, `src/data/content.ts` (copy completo, sin duplicación), `src/data/team.ts`, `src/data/event.ts`, `src/data/seo.ts` (Organization + Event JSON-LD), `src/data/competitions.ts`, `src/data/sponsors.ts`
- **`scripts/check-network.mjs` (F7)** — quinto control automático:
  terceros, 4xx/5xx, video y póster diferidos, peso por ruta, en las 7
  rutas × 2 viewports
- `src/scripts/`: nav.ts (**153 líneas desde F5b: sticky + panel móvil; los
  submenús de escritorio ya no llevan JS**), lazy-video.ts, reveal.ts,
  countdown.ts — **los cuatro emitidos y verificados en F1**. Cada uno con IIFE + try/catch y guardas de
  existencia (ADENDA §A2). Puntos de import: `reveal.ts` y `nav.ts` desde
  `Layout.astro`; `lazy-video.ts` desde `LazyVideo.astro`; `countdown.ts` desde
  `pages/index.astro`.

## Medios

- 18 placeholders JPG en `public/media/` + `public/og.jpg` (19 JPG totales).
- **2 MP4 stub de 20 bytes**: `about-highlight.mp4` y, desde F5,
  `participations-highlight.mp4`. Ambos slots usan `LazyVideo`; faltan clips reales.
- **F5:** `competition-car-cutout.png` (489×334, alfa), extraído del objeto del
  PDF para la variante navy de Southwest.
- **F4: dos activos reales de identidad** en `public/media/logo/` —
  `aiche-gdl-isotipo.svg` (copia de `design/aiche_logo.svg`) y
  `aiche-institucional.png` (extraído del PDF con `mutool extract`, es el
  lockup que la p.9 pone en el footer). Ver `docs/ASSETS.md` §5.
- **F4: los marcos de `/acerca/equipo` usan ya las proporciones del PDF**
  (retratos `263/334`, foto de grupo `825/692`). Las imágenes van con
  `object-fit: cover`, así que sustituirlas sigue sin tocar código.
- **Sustitución real verificada en S4:** `board-03.jpg` se sobreescribió con `board-01.jpg` (mismo nombre), el build la recogió sin tocar código.
- **F5:** marcos visibles remedidos: video Participaciones 4039/2286, hero de
  Patrocinios 826/683, imágenes de paquete 544/177, galería crema 544/300 y
  Contacto 826/655. `MediaFrame.ratio` mantiene el recorte sustituible.

## SEO y meta-infraestructura (S8, revisada en F7)

- `dist/sitemap-index.xml` + `dist/sitemap-0.xml` — **6 URLs**: las 7 rutas
  menos `/404`, que Astro excluye por convención de código de estado.
- `dist/robots.txt` — `Allow: /` + `Sitemap: …`. **No es un archivo de
  `public/`: lo genera el build** desde `siteUrl` (hook `astro:build:done`
  en `astro.config.mjs`, F8). El `Disallow: /kit` que arrastraba desde S8
  apuntaba a una ruta que S9 eliminó y se retiró aquí.
- `dist/site.webmanifest` — `theme_color: #123f72`, `icons: [favicon.svg, favicon.ico]`, `display: standalone`, `lang: es-MX`.
- **7 títulos únicos y 7 descripciones únicas** (64–118 caracteres). Desde
  F7 la descripción sale **siempre** de `seoRoutes`: tres rutas volcaban
  el copy visible de la diapositiva y daban 288, 194 y 34 caracteres
  (D-169).
- Canonical correcto en las 6 rutas indexables y **ausente en `/404`**:
  `noindex` + `canonical` son señales contradictorias (D-170).
- JSON-LD `Organization` en TODAS las páginas (Layout). `parentOrganization: CollegeOrUniversity` "Tecnológico de Monterrey, Campus Guadalajara", y desde F7 también `logo` y `sameAs` (D-171).
- JSON-LD `Event` solo en `/`, `/participaciones`, `/participaciones/southwest-2027` (páginas que mencionan el evento). Desde F7 con `url` e `image`; sin `endDate`, que el PDF no da (D-171).
- OG completo y Twitter `summary_large_image` en las 7 rutas, con
  `og:image:alt`, `og:image:width=1200`, `og:image:height=630`.
- `og.jpg` placeholder en `public/` (12 KB, 1200×630).

## Sistema de pantalla (F2 — ADENDA §A3)

Lienzo de diseño **1920×1080**. Una diapositiva del PDF = una pantalla.

- **`src/components/ui/Screen.astro`** es el **único** componente que define alto
  de pantalla y escala. `ui/Section.astro` fue eliminado; sus 17 consumidores
  migraron. Ninguna página define altura por su cuenta.
- Escala: `--screen-fs: clamp(0.62rem, min(0.833vw, calc(var(--screen-h) * 0.016)), 1.15rem)`,
  con `--screen-h: calc(100svh - var(--nav-h))`. Dos ajustes sobre la fórmula de
  §A3, justificados en la bitácora §3 (D-092, D-093).
- El escalado en bloque se consigue redefiniendo `--spacing`, `--text-*` y
  `--container-*` sobre `.screen`; **no** con `em` literal (D-091, ver bitácora
  §3.3). Las secciones siguen usando utilidades normales de Tailwind.
- Válvula de escape: `min-height`, nunca `height`. **Cero `overflow:hidden`**
  sobre pantallas.
- **Frontera única desde F6: `--breakpoint-canvas: 80rem` (1280px)**, variante
  `canvas:`. Por debajo, el lienzo apaisado no cabe y manda la legibilidad: una
  columna, `--screen-fs: 1rem`, `min-height: 0`, caja de 52rem y nav de
  hamburguesa (D-142, D-144, D-152; detalle en `docs/DESIGN-SYSTEM.md` §4.2).
  Sustituye al `≤767px` de D-099.

| Resolución | Escala | Régimen | Pantallas | Desbordan | Scroll-x |
|---|---|---|---|---|---|
| 1920×1080 | **15.99px** | lienzo | 16 | **0** | 0 |
| 1600×900 | 13.12px | lienzo | 16 | **0** | 0 |
| 1440×900 | 12.00px | lienzo | 16 | **0** | 0 |
| **1366×768** | **11.01px** | lienzo | 16 | **0** | 0 |
| 1280×720 | 10.24px | lienzo | 16 | **0** | 0 |
| 1024×768 | 16px | apilado | 16 | n/a | 0 |
| 768×1024 | 16px | apilado | 16 | n/a | 0 |
| 844×390 | 16px | apilado | 16 | n/a | 0 |
| 390×844 | 16px | apilado | 16 | n/a | 0 |
| 360×800 | 16px | apilado | 16 | n/a | 0 |

En el régimen apilado la altura de sección no es una restricción: `min-height: 0`
y el scroll fluye, que es la válvula de escape de §A3.

**Antes de F2: 13 de 20 secciones desbordaban a 1366×768** (peor caso +733px).

**Cambios de F4/F5 en esta tabla:**
- Las pantallas bajan de 22 a **21** porque `/acerca/equipo` deja de estar
  partida en dos.
- La escala sube de 15.04 a **15.99px** a 1920×1080: es el valor correcto del
  lienzo. El coeficiente vertical era 16/1080 y debe ser 16/1000, porque el nav
  se lleva 80px (D-115).
- **`about` ya encaja (D-136).** Los 135px venían de `system-ui` en Linux:
  título 3 líneas y cuerpo 22, frente a las 2 y 20 de Segoe UI en el PDF. La
  pila localizada Segoe UI → Arial recupera las métricas correctas; la pantalla
  completa usa sus 1000px sin el padding vertical genérico de 8px.
- F5 baja de 21 a **16** pantallas: Participaciones 4→1, Southwest 2→1 y
  Patrocinios 4→3. No se escondió contenido: se retiraron sólo los bloques que
  no existen en el PDF y se recompusieron las diapositivas reales.
- **`sponsor-tiers` ya encaja.** Al retirar «Quiero este paquete» y reproducir
  las tarjetas de p.11 pasa de +119…+161px a 1000px exactos en las seis
  resoluciones. Ya no queda ningún desborde de pantalla.

## Fidelidad al PDF (F4–F5 — ADENDA §A1)

Lienzo de referencia **1920×1080**. Todas las medidas del sistema salen ahora
del PDF, extraídas con `mutool draw -F stext` (páginas 1-9, vectoriales) y por
muestreo de píxel (páginas 10-14, que son mapas de bits).

| Medida | Antes | Ahora | Origen |
|---|---|---|---|
| Alto del nav | 65px | **80px** | p.10-14, barra de y=0 a y=79 |
| Caja de contenido | 1440px centrados | **1728px con 96px de margen** | p.10/13/14, x=96..1826 |
| Coeficiente vertical de la escala | 16/1080 | **16/1000** | el nav se lleva 80px |
| Celda de la rejilla | 96px fijos | **104px que escalan** | máximos de luma a x=76, 180, 284… |
| Degradado del fondo | lineal 135° | **radial elíptico** `54% 50% at 55% 46%` | muestreo de las p.9-14 |
| Tracking de `.eyebrow` | 0.18em | **0.30em** | «F A L T A N» = 85.7px sobre 62.4 naturales |
| Superficie del nav | crema `#f4f1e9` | **gris `#d0d4d7`** | p.10, p.13, p.14 |
| Alto del footer | sin definir | **192px** | p.9, banda crema y=833..1024 |
| Isotipo | galón dibujado a mano | **SVG real del diseño** | `design/aiche_logo.svg` |

Escala tipográfica completa y tokens nuevos (`navy-500`, `navy-200`, `chrome`,
`chrome-ink`): `docs/DESIGN-SYSTEM.md` §1 y §2.1.

**Limitación conocida:** el PDF está compuesto en Segoe UI, que el sitio no
puede descargar (RULES §5.2 y §12.2). Cuerpos, interlíneas, tracking y medidas
de línea son exactos. `/acerca` usa Arial como fallback métrico localizado para
preservar las 2/20 líneas del PDF; otros bloques largos todavía pueden variar
según la fuente del sistema. Detalle en D-136 y la adenda de la bitácora F4.

**F5 completó las seis diapositivas restantes:**

| Página real | Ruta / pantalla | Geometría principal |
|---:|---|---|
| 7 | `/participaciones` | 477px evento/competencias + 1197px título/video |
| 8 | Southwest 2027 | bandas verticales en una pantalla + recorte del coche |
| 10 | Patrocinios hero | columnas 838/826px; imagen 826×683 |
| 11 | Beneficios | 3 tarjetas 544×731; imagen 544×177; sin CTA |
| 12 | Competencia crema | columnas 824/824 + galería 3×544×300 |
| 14 | Contacto | columnas 838/826; foto 826×655 |

Comparación completa y evidencia: `docs/sessions/F5-fidelidad-2.md` y
`.cache/f5-final/`.

## Arquitectura por capas (F3 — ADENDA §A4)

Dependencias en una sola dirección, verificadas por `bun run check:layers`:

```
data/ ← ui/ · media/ ← sections/ · layout/ ← layouts/ ← pages/
```

| Regla | Estado |
|---|---|
| `ui/` no importa valores de `data/` | ✅ 0 (4 `import type` en 3 componentes, permitidos — D-102) |
| `sections/` no importa `sections/` | ✅ 0 (eran 4) |
| `sections/` no importa `layout/` | ✅ 0 (eran 2) |
| `data/` no importa UI | ✅ 0 |
| Componentes sin uso | ✅ 0 |

**Movimientos vigentes:** `PackageCard` y `NextEventCard`→`EventCard` de
`sections/` a `ui/`; `Logo` de `layout/` a `ui/`;
`CompetitionsList`→`Competitions` en F3 y luego
`Competitions`→`ParticipationsOverview` en F5; `About`+`AboutTeaser` fusionados
en `About` con `variant`. `src/assets/` (vacío) eliminado.

**Fuente única de datos:** `data/event.ts` concentra fecha, nombre y sede del
evento; `content.ts` es sólo el texto visible y ya no re-exporta datos de otros
módulos. Detalle de responsabilidades en `docs/DESIGN-SYSTEM.md` §6.

> ⚠️ **Único cambio funcional de F3:** el CTA "Ver participaciones" del home
> enlaza ahora a `/participaciones` y no a `/participaciones/southwest-2027`.
> El dato `homeCtaHref` ya existía y el componente lo ignoraba (D-112).

## Comportamiento de cliente (verificado en F1)

| Qué | Estado | Cómo se comprobó |
|---|---|---|
| Contenido visible sin JS | ✅ las 8 rutas | `bun run check:render`, 32/32 |
| Contenido visible con JS y motion por defecto | ✅ | ídem |
| Reveal por scroll | ✅ | `data-reveal-state="ready"` + recorrido de página |
| Contador | ✅ avanza | 12 → 10 en 1,3 s; valores pintados en build (cero flash) |
| Menú móvil | ✅ abre/cierra | hamburguesa, ✕ y Escape; scroll del body bloqueado; foco atrapado |
| Submenús de escritorio | ✅ sin JS | abren con `:hover` y con `:focus-within`; el padre navega a su página (F5b) |
| Video | ✅ inyecta `src` | `/media/video/about-highlight.mp4` y `/media/video/participations-highlight.mp4`; **ambos son stubs de 20 B** (M-001/M-005) |
| Foco al cargar | ✅ en `body` | ya no salta al último dropdown ni a la hamburguesa |
| Errores de consola / 4xx | ✅ ninguno | |
| Encaje en pantalla | ✅ **16/16** | `bun run check:overflow`; **10 resoluciones**, cero desbordes y cero scroll horizontal |
| Foco visible en todo enfocable | ✅ | `bun run check:states` (F6) |
| Hover en todo elemento interactivo | ✅ | ídem; eran 3 enlaces sin estado por página |
| Recorrido por teclado | ✅ | skip link primero, llega al footer, foco nunca en un elemento sin caja |
| Contador tras la fecha del evento | ✅ | cajas y eyebrow ocultos, cero negativos, intervalo parado |
| Textos ×3 con palabra de 40 caracteres | ✅ 16/16 | sin scroll horizontal (`overflow-wrap: anywhere`) |

**Roto antes de F1 y arreglado en ella:** el menú móvil no se abría nunca, el
video nunca cargaba, el foco se robaba en cada carga de página y el `.webm`
declarado en `media.ts` no existía.

## Métricas actuales (F7 — 2026-08-21, reemplazan a las de F1 y S8)

> Medidas con Lighthouse 13.4.1 y Playwright sobre el build de producción
> servido con `astro preview`. **Detalle completo, método y cómo
> repetirlas: `docs/PERFORMANCE.md`.** Las tablas de F1 y de S8 se
> eliminaron de este archivo: F1 midió 8 rutas y otra estructura, y S8
> midió páginas cuyo contenido era invisible (ADENDA §A5). Lo que decían y
> en qué se equivocaban está en `docs/sessions/F7-perf-a11y-seo.md` §1.

**Lighthouse, peor valor de las 7 rutas (F8):**

| | Móvil | Escritorio |
|---|---:|---:|
| Performance | **100** | **100** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** (`/404`: 66) | **100** (`/404`: 66) |
| LCP | 1,28 s | 0,33 s |
| CLS | 0,0000 | 0,0005 |
| TBT | 0 ms | 0 ms |

`/404` saca 66 en SEO porque falla `is-crawlable`: lleva `noindex`, que es
lo que debe llevar una página de error. Es la única excepción y es
deliberada (D-170).

**Peso:**

- `dist/`: **3,16 MB** en 265 archivos, de los cuales 245 son variantes de
  imagen (AVIF/WebP/original en varios anchos). **Es peso en disco, no lo
  que descarga nadie**: el navegador se lleva una sola variante.
- Un solo `.js` externo: `dist/_astro/page.BDh2vuYI.js`, 2 487 B raw /
  1 118 B gz (prefetch de Astro, estrategia `hover`).
- CSS inline por ruta: **45,06 KB raw / 9,52 KB gz** — idéntico en las 7.
  F8 le quitó 694 B gz de clases que Tailwind emitía por citarlas en la
  documentación (D-179). Al 32 % del presupuesto.
- JS total por ruta: **2,30–3,33 KB gz** frente al presupuesto de 25 KB.
- Peso en red tras F8: `/` 45 KB · `/equipo/` 23 KB · `/participaciones/`
  33 KB · Southwest 12 KB · `/patrocinios/` 5 KB móvil / 15 KB escritorio ·
  `/contacto/` 4 KB · `/404` 3 KB. Medido por Lighthouse (que suma HTML y
  webfont): 81 / 47 / 60 / 39 / 32 / 27 / 23 KiB.

**Red (`bun run check:network`, 7 rutas × 2 viewports):**

- **0 peticiones a terceros**, **0 respuestas 4xx/5xx**.
- Ningún `<video>` con `src` ni con `poster` en el HTML servido.
- Los videos que arrancan fuera del viewport no piden un byte hasta el
  scroll. El de `/participaciones/` sí carga al entrar: el diseño lo pone
  en la primera pantalla, así que eso es la regla cumplida (D-174).
- Los pósters también van diferidos desde F7: eran 113 KB que la home
  descargaba antes de pintar (D-163).

**Accesibilidad, más allá del 100 de Lighthouse:** 0 fallos de contraste
sobre **todos** los nodos de texto visibles de las 7 rutas en dos
viewports; 1 `h1` por página y 0 saltos de nivel; los 4 landmarks en
todas; **17 de 17 `<section>` con nombre accesible** (11 no lo tenían);
0 interactivos sin nombre; 0 imágenes sin `alt`; `reduce` no oculta nada,
no anima nada y no reproduce el video.


## Bloqueos y pendientes del usuario

Ver `docs/DECISIONS.md`. Resumen:
- Dominio definitivo del sitio (RULES §19.7) — **pendiente, confirmado por
  el usuario el 2026-08-21: aún no está comprado.** `siteUrl` en
  `src/data/site.ts` es hoy la **única** línea donde vive el dominio y
  propaga a canonical, OG, Twitter, JSON-LD, los dos sitemaps y
  `robots.txt`. Hasta F8 no era cierto: `astro.config.mjs` y
  `public/robots.txt` lo tenían escrito a mano por su cuenta (D-183).
- Moneda de paquetes (RULES §19.1) — pendiente.
- Correo oficial (RULES §19.2) — unificado a `aiche.gdl@gmail.com`.
- Sede (RULES §19.3) — unificada a Lake Charles, Louisiana.
- Destino del botón Únete (RULES §19.4).
- Nombres y cargos de mesa directiva (RULES §19.5) — placeholders en `data/team.ts`.
- Logos de patrocinadores actuales (RULES §19.6).
- Videos reales de Acerca y Participaciones — los dos archivos actuales son stubs de 20 B (M-001/M-005).
- Decisión sobre el runner de Lighthouse para CI (no bloqueante; `docs/BACKLOG.md`). En F7 se midió en local, fuera del repositorio (D-162).
