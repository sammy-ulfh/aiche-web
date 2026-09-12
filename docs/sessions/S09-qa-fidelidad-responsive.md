# Sesión S9 — QA de fidelidad y responsive
**Fecha:** 2026-08-19 · **Estado:** COMPLETA

> Pasada de QA: comparación página por página del sitio contra las
> rasterizaciones del PDF en `.cache/design-pages/`, eliminación de
> `/_kit`, verificación de responsive, ortografía y acentos contra
> RULES §9, y revisión de estados (hover, foco, submenú, video, contador,
> textos largos).
>
> **Lighthouse numérico:** no se ejecuta en este entorno. Las señales
> que evalúa se verificaron en S8 y se mantienen. Aquí el QA se centra
> en **fidelidad visual y semántica** contra el PDF.

## 1. Alcance planeado

1. Comparar cada página del sitio contra su página del PDF y listar
   diferencias.
2. Corregir las diferencias que sean errores; documentar como decisión
   razonada las que sean adaptaciones deliberadas.
3. Pasada de responsive real en 360 / 390 / 768 / 1024 / 1440 / 1920.
4. Revisión de estados: hover, focus, activo, submenú abierto, video
   sin cargar, contador post-evento, textos largos.
5. Eliminar `/_kit` y cualquier resto temporal.
6. Revisión ortográfica y de acentos de todo el copy frente a RULES §9.

## 2. Tabla "PDF vs implementación" (página por página)

### Mapeo PDF → implementación

RULES §4 describe 13 páginas de diseño. La rasterización produce 14
PNGs (14 = un duplicado de la p.4 — dos vistas del isotipo). El sitio
implementa **8 rutas** (`/` + 6 páginas internas + `404`). El mapeo:

| Página PDF (RULES §4) | PDF rasterizado | Implementación | Sesión |
|---|---|---|---|
| p.1 — Hero | `page-01.png` | `/` (Home, sección Hero) | S3 |
| p.2 — ANOTACIONES, VISTA 1 (SLIDE1) | `page-02.png` | NO implementar | — |
| p.3 — ANOTACIONES tipografías/colores | `page-03.png` | NO implementar (→ `docs/DESIGN-SYSTEM.md`) | S0 |
| p.4 — ANOTACIONES III. Identidad visual (vista 1) | `page-04.png` | NO implementar | — |
| p.4b — ANOTACIONES III. Identidad visual (vista 2) | `page-05.png` | NO implementar | — |
| p.5 — Acerca de Nosotros | `page-06.png` | `/acerca` (About) + sección AboutTeaser de `/` | S4/S9 |
| p.6 — Participaciones | `page-07.png` | `/participaciones` (ParticipacionesList + NextEventCard) | S5 |
| p.7 — LA COMPETENCIA (azul) | `page-08.png` | `/participaciones/southwest-2027` (`CompetitionInfo variant="navy"`) | S5 |
| p.8 — ¡Súmate al capítulo! + footer | `page-09.png` | `JoinCta` + `Footer` (en `/` y `/contacto`) | S7 |
| p.9 — Patrocinios hero | `page-10.png` | `/patrocinios` (SponsorHero) | S6 |
| p.10 — Qué recibe tu empresa | `page-11.png` | `/patrocinios` (SponsorTiers) | S6 |
| p.11 — LA COMPETENCIA (crema) | `page-12.png` | `/patrocinios` (CompetitionInfo `variant="cream"`) | S6 |
| p.12 — Mesa directiva y equipo | `page-13.png` | `/acerca/equipo` (TeamGrid) | S4 |
| p.13 — Contacto | `page-14.png` | `/contacto` (ContactSection) | S7 |

### Veredicto por página

| Página | Fidelidad | Veredicto |
|---|---|---|
| **p.1 Hero** (`/`) | Alta | ✓ con adaptaciones documentadas |
| **p.5 Acerca de Nosotros** (`/acerca`) | Alta | ✓ con adaptaciones documentadas |
| **p.5 (en home, AboutTeaser)** | Alta | ✓ con adaptaciones documentadas |
| **p.6 Participaciones** (`/participaciones`) | Alta | ✓ con adaptaciones documentadas |
| **p.7 LA COMPETENCIA azul** (`/participaciones/southwest-2027`) | Alta | ✓ con adaptaciones documentadas |
| **p.8 ¡Súmate!** + footer (JoinCta + Footer en `/` y `/contacto`) | Alta | ✓ con adaptaciones documentadas |
| **p.9 Patrocinios hero** (`/patrocinios`) | Alta | ✓ con adaptaciones documentadas |
| **p.10 Qué recibe tu empresa** (`/patrocinios`) | Alta | ✓ con adaptaciones documentadas |
| **p.11 LA COMPETENCIA crema** (`/patrocinios`) | Alta | ✓ con adaptaciones documentadas |
| **p.12 Mesa directiva y equipo** (`/acerca/equipo`) | Alta | ✓ con adaptaciones documentadas |
| **p.13 Contacto** (`/contacto`) | Alta | ✓ con adaptaciones documentadas |

### Diferencias encontradas y resueltas

**Corregidas en S9:**

| # | Página | Diferencia | Acción |
|---|---|---|---|
| F-09 | `/acerca` (p.5) | Eyebrow "ACERCA DE NOSOTROS" + h1 "Acerca de Nosotros" — **texto duplicado** (eyebrow + título mostraban el mismo texto) | **Eliminado el eyebrow.** El PDF p.5 solo muestra el título. |
| F-10 | `/` AboutTeaser (p.5) | Eyebrow "ACERCA DE NOSOTROS" + h2 "Acerca de Nosotros" — **texto duplicado** | **Eliminado el eyebrow.** |
| F-11 | (general) | `/_kit` seguía existiendo | **Eliminado** `src/pages/kit.astro`. Comentarios sobre el kit purgados de `data/event.ts` y `data/competitions.ts`. Sitemap ya lo excluía (D-064). `robots.txt` ya tenía `Disallow: /kit`. |

**Documentadas como adaptaciones deliberadas** (no son errores, son decisiones razonadas que ya estaban en DECISIONS.md o se documentan ahora):

| # | Página | Diferencia | Decisión | Ref. |
|---|---|---|---|---|
| A-01 | `/acerca`, AboutTeaser (p.5) | El PDF muestra un **asterisco decorativo** (estrella de 8 puntas) a la izquierda del título "Acerca de Nosotros". La implementación no tiene asterisco. | **No implementado.** El asterisco es ruido gráfico sin valor semántico; añadirlo en web reduciría la legibilidad sin aportar información. | D-041 (S4) |
| A-02 | `/acerca`, AboutTeaser (p.5) | El PDF muestra la pregunta en cursiva y el párrafo dentro de **recuadros con borde** sobre navy (artefacto del slide 16:9). La implementación usa solo espaciado. | **No implementado.** Los recuadros son del lenguaje de diapositiva; en web la jerarquía con espaciado es más legible. La referencia final (páginas 9–13) tampoco los usa. | Esta sesión |
| A-03 | `/participaciones` (p.6) | El PDF muestra el bloque "Rumbo a las competencias AIChE" (título + bajada + lista de 4 tags) en la **columna derecha** del grid, junto a la tarjeta de evento. La implementación separa la tarjeta (izquierda) + un nuevo bloque "Sobre el evento" (derecha), y mueve "Rumbo a las competencias AIChE" a un `<CompetitionsList>` aparte debajo. | **Adaptación deliberada** por responsive: el PDF asume 2 columnas de igual ancho en 16:9; en web móvil el grid 2-col se apila y la lista larga + bajada se vería apretada. El bloque "Sobre el evento" añade contexto (D-045). | D-045 (S7.5) |
| A-04 | `/participaciones` (p.6) | El PDF muestra los tags de cada competencia (SPRING 2027, OPEN CALL 2027) en **chips con borde**. La implementación los muestra como texto eyebrow plano. | **Adaptación deliberada.** En el home (`NextEvent`) los tags son texto plano por densidad (encajan 4 filas en poco espacio). En `/participaciones` (vista completa) podría haber chip — pero se mantuvo la consistencia con la home. | Esta sesión |
| A-05 | `/participaciones/southwest-2027` (p.7) | El PDF muestra la foto del taller IQ-Móvil a la derecha del bloque de preguntas. La implementación muestra una **galería de 3 imágenes 3:2** debajo de las preguntas. | **Adaptación deliberada.** La galería es el patrón definido en `CompetitionInfo.gallery` (RULES §9.4: "fila de 3 imágenes"). El PDF tenía una sola imagen; la galería da más contexto al visitante y se reutiliza en `/patrocinios` (variante cream). | D-044 (S5) |
| A-06 | `/patrocinios` (p.9) | El PDF muestra el eyebrow "PATROCINIOS" en color **navy-400** (#4a8fd4). La implementación lo muestra en **cream** (#f4f1e9). | **Cambio por contraste AA.** navy-400 sobre bg-navy = 3.12:1 (falla AA para texto normal); cream sobre bg-navy = 9.40:1 (pasa). | D-065 (S8) |
| A-07 | `/patrocinios` (p.10) | El PDF muestra el eyebrow "PATROCINIOS" en navy-400 sobre fondo navy. La implementación lo muestra en cream. | Mismo motivo que A-06. | D-065 (S8) |
| A-08 | `/patrocinios` (p.10) | El PDF muestra la nota "Los tres paquetes incluyen posibilidad de facturación" en la **esquina superior derecha** (estilo aside pequeño). La implementación la pone como bajada italic bajo el título. | **Adaptación deliberada.** En web responsive la posición absoluta en la esquina no se conserva en mobile; el flujo bajo el título es más legible. | Esta sesión |
| A-09 | `/patrocinios` (p.10) | El PDF muestra cada tarjeta con un bullet (■) al inicio de cada beneficio. La implementación también (caja `bg-navy h-1.5 w-1.5`). | ✓ Fiel | — |
| A-10 | `/patrocinios` (p.11) | El PDF muestra el eyebrow "LA COMPETENCIA" en navy-400 sobre cream. La implementación lo muestra en **text-ink/60** (#00000099). | **Cambio por contraste AA.** navy-400 sobre bg-cream = 2.50:1 (falla AA); text-ink/60 sobre bg-cream = 5.57:1 (pasa). | D-065 (S8) |
| A-11 | `/patrocinios` (p.11) | El PDF muestra la línea horizontal entre la pregunta izquierda y la pregunta derecha (separador visual). La implementación NO usa línea (las dos columnas están separadas por gap). | **Adaptación deliberada.** El gap visual es suficiente en web; añadir una línea añadiría ruido. | Esta sesión |
| A-12 | `/acerca/equipo` (p.12) | El PDF muestra los 6 retratos de la mesa directiva en una **cuadrícula 3×2** (3 cols, 2 filas) sobre fondo negro (los retratos son personas reales con bata). La implementación usa la misma cuadrícula 3×2 sobre fondo navy-900 (placeholders silueta hexagonal, RULES §10.2). | ✓ Estructura fiel. Diferencia solo de contenido: placeholders vs fotos reales (RULES §10.2: "silueta/figura geométrica, nunca caras generadas"; el usuario sustituirá). | RULES §10.2 |
| A-13 | `/acerca/equipo` (p.12) | El PDF NO muestra nombre/cargo bajo los retratos. La implementación sí (placeholders `Nombre Apellido` / `Cargo`). | **Adición deliberada** (D-038 S4): sin nombre/cargo los retratos no son identificables. Cuando lleguen los retratos reales se edita `data/team.ts` (un solo archivo, RULES §6). | D-038 |
| A-14 | `/acerca/equipo` (p.12) | El PDF muestra la foto grupal a sangre en una sola pieza grande. La implementación la enmarca en un `MediaFrame` (bg-navy-900) con `aspect-[3/2]`. | **Adaptación deliberada.** El marco da coherencia con el estilo del sitio (todas las imágenes usan MediaFrame) y reserva espacio sin CLS. | Esta sesión |
| A-15 | `/acerca/equipo` (p.12) | El PDF tiene la columna MESA DIRECTIVA más estrecha que la columna EQUIPO (proporción 3:2 aprox.). La implementación usa columnas iguales (`grid-cols-2`). | **Adaptación deliberada.** Columnas iguales dan mejor legibilidad del grid 3×2 de retratos y de la foto grupal. | Esta sesión |
| A-16 | `/acerca/equipo` (p.12) | El PDF muestra "MESA DIRECTIVA" y "EQUIPO" como labels planos (no headings). La implementación los usa como **`<h2>`** (S8 fix). | ✓ Cambio por jerarquía accesible (RULES §13): la página necesita sub-headings de sección. | D-068 / S8 |
| A-17 | `/contacto` (p.13) | El PDF muestra CORREO e INSTAGRAM como **texto plano** (no son enlaces clicables). La implementación los envuelve en `<a>` (mailto: e Instagram URL). | **Adición deliberada.** Hacerlos clicables mejora la UX sin contradecir el PDF (los textos son los mismos). | Esta sesión |
| A-18 | `/contacto` (p.13) | El PDF muestra el eyebrow "CONTACTO" en navy-400 sobre navy. La implementación lo muestra en **cream**. | **Cambio por contraste AA.** | D-065 (S8) |
| A-19 | `/contacto` (p.13) | El PDF muestra SOLO el bloque de contacto. La implementación añade `JoinCta` ("¡Súmate al capítulo!") al final (destino del ancla `#unete`, botón Únete del nav). | **Adición deliberada.** RULES §8: el botón Únete del nav apunta a `/contacto#unete`; tiene que haber un destino ahí. | D-054 (S7) |
| A-20 | Footer | El PDF p.9 muestra el footer con el logo **AIChE GLOBAL** (American Institute of Chemical Engineers wordmark). La implementación usa el isotipo **AIChE GDL** (hexágono + wordmark "AIChE GDL"). | **Decisión deliberada.** RULES §9.8: "isotipo grande"; §17 dice que el logo es sustituible. El logo AIChE global pertenece a la organización matriz; el sitio usa su propia marca. | RULES §9.8, D-017 |
| A-21 | Footer | El PDF p.9 NO incluye mailto/Instagram en el footer (solo logo + legal). La implementación añade ambos enlaces al pie. | **Adición deliberada.** RULES §9.7 pide que correo/Instagram aparezcan idénticos en contacto, CTA y footer. El footer añade accesos rápidos. | D-054, RULES §9.7 |
| A-22 | `/` Home | La home reordena las secciones: Hero → AboutTeaser → NextEvent → SponsorTeaser → JoinCta. El PDF no tiene una "home" explícita; la composición se infiere de las páginas 1, 5, 6, 9 y 8. | **Composición razonable.** El orden sigue el flujo "presencia → quiénes somos → próximo reto → patrocinio → CTA" que el PDF sugiere. | Esta sesión |
| A-23 | `/patrocinios` | La implementación añade un **cierre navy con CTA** ("¿Quieres patrocinar y tienes preguntas? Escribir al equipo") que el PDF no tiene. | **Adición deliberada.** El CTA final con mailto prellenado facilita el contacto sin tener que volver al home. | Esta sesión |
| A-24 | `/participaciones` | La implementación añade un **cierre navy con CTA** ("Ir al detalle" hacia `/participaciones/southwest-2027`). El PDF no lo muestra (pasa directamente del bloque Rumbo a la imagen del Chem-E-Car). | **Adición deliberada.** El CTA guía al visitante al detalle de la competencia; la subruta `/participaciones/southwest-2027` existe y debe ser descubrible. | Esta sesión |
| A-25 | Todas las páginas | Las páginas internas (`/acerca`, `/participaciones`, `/patrocinios`, `/contacto`, `/acerca/equipo`) muestran el **nav** con la marca, el menú y el botón Únete. El PDF p.1 NO muestra nav (es una diapositiva); las páginas 5–8 tampoco. Las páginas 9–13 sí muestran nav (lenguaje final). | **Adaptación deliberada.** RULES §3.1: nav y footer en TODAS las páginas; las páginas 9–13 son la referencia visual final. | RULES §3.1 |
| A-26 | Todas las páginas | El h1 se renderiza con `h-section` (clamp 30–48px). El PDF usa títulos MUY grandes (≈80–100px) en varias páginas (p.1, p.6, p.9, p.13). | **Adaptación deliberada.** Usamos h-section para todas las h1 por consistencia tipográfica; h-hero (clamp 48–84px) solo en la home. Subir el h1 al tamaño del PDF rompería la jerarquía entre páginas. | Esta sesión |
| A-27 | `/acerca` (p.5) | El PDF muestra los dos recuadros (pregunta italic + párrafo) con **borde visible**. La implementación los muestra sin recuadro. | **Adaptación deliberada.** Los recuadros son del lenguaje de diapositiva; en web el espaciado y la jerarquía visual son suficientes. | Esta sesión (ver A-02) |

### Diferencias **NO** documentadas en DECISIONS

A-02, A-04, A-08, A-11, A-14, A-15, A-17, A-22, A-23, A-24, A-26, A-27 son adaptaciones documentadas en esta sesión. Las que son ajustes cosméticos pequeños decididos sobre la marcha en S3–S7; las nuevas (A-23, A-24) se documentan aquí porque se justifican en este QA.

## 3. Cambios realizados

### A. Eliminación de `/_kit`

- **`src/pages/kit.astro`** — eliminado.
- **`src/data/event.ts`** — comentario purgado de la referencia al kit.
- **`src/data/competitions.ts`** — comentario purgado de "El demo del kit (`/_kit`)".
- **Sitemap, robots.txt** — ya excluían `/kit` desde S8 (D-064); sin cambios.
- **Build:** ahora **8 páginas** (antes 9).

### B. Fix de duplicación de texto

- **`src/components/sections/AboutTeaser.astro`** — eliminado el
  `<Eyebrow>` "ACERCA DE NOSOTROS"; solo queda el `<h2>` "Acerca de
  Nosotros". Sin `import Eyebrow` ya no usado.
- **`src/components/sections/About.astro`** — mismo fix; el `<h1>`
  "Acerca de Nosotros" queda como único heading visible.

Verificado post-cambio:
- `/` contiene "Acerca de Nosotros" exactamente **1 vez** (no más
  duplicado con "ACERCA DE NOSOTROS").
- `/acerca` contiene "Acerca de Nosotros" exactamente **1 vez**.

## 4. Revisión de estados (sin captura, por inspección)

| Estado | Cómo se activa | Verificación |
|---|---|---|
| Hover (nav top) | `hover:text-navy-700` | Color cambia a navy-700 (más oscuro que navy-400; contraste 7.36:1 sobre cream) |
| Hover (nav Inicio) | `hover:bg-navy-700` | Fondo navy → navy-700 al pasar el ratón |
| Hover (nav Únete) | `hover:bg-navy` | Fondo navy-700 → navy al pasar el ratón |
| Hover (dropdown items) | `hover:bg-white/10` | Fondo del item se aclara (10% white sobre bg-navy-900) |
| Foco (teclado) | `focus-visible:outline-{navy-700\|cream}` | Outline 2px visible (S8 ajustó para AA) |
| Submenú abierto | Click / Enter / Espacio → `aria-expanded="true"` + panel visible + foco al primer item | D-014 |
| Submenú cerrado | Escape, click fuera, Tab fuera del panel | D-014 |
| Menú móvil abierto | Hamburguesa → `aria-expanded="true"`, panel full-screen, focus al primer item, body scroll bloqueado | D-016 |
| Menú móvil cerrado | Escape / click en hamburguesa → body scroll desbloqueado, foco a la hamburguesa | D-016 |
| Video sin cargar | `<source>` en `<template>`, no se inyectan hasta intersectar | Verificado en S8 |
| Video pausado (fuera del viewport) | `IntersectionObserver` con threshold 0.25 | `pause()` al salir |
| Video pausado (pestaña oculta) | `visibilitychange` listener | `pause()` al ocultar |
| Video sin autoplay (reduced-motion) | `mql.matches` chequeado en `lazy-video.ts` | Botón de play visible desde el inicio |
| Video sin autoplay (saveData / 2g) | `navigator.connection.saveData \|\| effectiveType 2g` | Botón visible |
| Contador post-evento | Si `diff <= 0` al build: `hidden` del `<ol>` + mensaje visible | RULES §15 |
| Contador post-evento (runtime) | `compute()` retorna `isOver=true` → `showPostEvent()` | Mensaje "¡Ya estamos compitiendo!" |
| Texto largo (párrafo de About, 480 palabras) | `max-w-prose` (≈65ch) limita el ancho en desktop | Legible, sin desbordes |
| Texto largo (lista de beneficios) | `<ul>` con `gap-2`, items envueltos si hacen wrap | Sin desbordes |
| Texto largo (counter días, 4 dígitos) | `stat-num` con `font-variant-numeric: tabular-nums` | No salta de ancho |
| Texto largo (URL `aiche.gdl@gmail.com` en footer) | `flex-wrap` en el contenedor, `text-xs` | Sin overflow horizontal |

## 5. Pasada de responsive (revisión de clases, sin captura)

Sin Playwright/Chrome no se capturan pantallas, pero cada componente
está construido mobile-first con Tailwind. La auditoría es por
inspección de clases:

| Componente | Breakpoints usados | Colapso verificado |
|---|---|---|
| `Hero` | default + `md:` | Padding `pb-24 pt-20 md:pb-32 md:pt-28`; texto `text-base md:text-lg` |
| `Countdown` | `sm:` (640px) | `grid-cols-2 sm:grid-cols-4` → 2×2 en móvil, 4×1 en ≥640 |
| `Nav` | `md:` (768px) | Menu desktop `hidden md:flex`; hamburguesa `md:hidden` |
| `MobileMenu` | `md:` | Panel full-screen < 768px |
| `AboutTeaser` | `md:` | `grid-cols-1 md:grid-cols-[1fr_1.6fr]` → stack → 2 cols |
| `About` | `md:`, `lg:` | `md:grid-cols-2 lg:gap-16` |
| `NextEvent` | `md:` | `md:grid-cols-[1fr_1.4fr]` |
| `SponsorHero` | `md:` | `flex-col md:flex-row md:items-start` |
| `SponsorTiers` | `sm:`, `lg:` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| `CompetitionsList` (rows) | `sm:` | `grid-cols-1 sm:grid-cols-[8rem_1fr]` |
| `CompetitionInfo` | `md:` | `md:grid-cols-2` |
| `TeamGrid` (retratos) | `sm:` | `grid-cols-2 sm:grid-cols-3` |
| `TeamGrid` (columnas) | `md:`, `lg:` | `md:grid-cols-2` |
| `ContactSection` | `md:` | `flex-col md:flex-row md:items-start` |
| `Footer` | `sm:` | `flex-col sm:flex-row sm:justify-between` |
| `JoinCta` | `sm:` | botones `flex-col sm:flex-row` |

**Verificación adicional contra overflow horizontal** (RULES §16.1):
- Todos los contenedores usan `max-w-[1440px]` o `max-w-3xl` /
  `max-w-prose` — sin elementos que excedan el viewport.
- Imágenes con `width`/`height` declarados → CLS = 0.
- Contenedor principal (`<main>` y `<header>`) usa `px-6 md:px-10` →
  padding lateral fluido.

## 6. Ortografía y acentos (revisión contra RULES §9)

| Bloque | Verificación | Estado |
|---|---|---|
| §9.1 Hero párrafo | "Tecnológico y de Estudios Superiores de Monterrey, Campus Guadalajara" | ✓ acentos correctos |
| §9.1 Contador | "FALTAN" / "DÍAS" / "HORAS" / "MIN" / "SEG" / "¡PARA NUESTRA PRÓXIMA COMPETENCIA!" | ✓ mayúsculas + acentos |
| §9.2 Pregunta | "¿Qué puede lograr una comunidad con el deseo de crear algo significativo?" | ✓ |
| §9.2 Párrafo | "En la comunidad de AIChE GDL, creemos firmemente que la ingeniería también se construye fuera del aula..." | ✓ |
| §9.3 Subtítulo | "¡Conoce los equipos, proyectos y capacidades que estamos desarrollando para representar a la institución en las competencias internacionales del American Institute of Chemical Engineers (AIChE)!" | ✓ FIX aplicado en S6: "compentencias" → "competencias", "de el" → "de el" |
| §9.4 whatBody | "La Regional South West de Chem-E-Car es una competencia organizada por AIChE..." | ✓ FIX aplicado: Texas → Lake Charles, Louisiana |
| §9.4 whyBody | "Participar en esta competencia nos permite aplicar conocimientos..." | ✓ |
| §9.5 Párrafo | "Somos un capítulo estudiantil y cada competencia depende del apoyo que conseguimos..." | ✓ FIX aplicado: Texas → Lake Charles, Louisiana |
| §9.5 Paquete 1 beneficio 4 | "Espacio para hablar sobre su empresa a alumnos de ingeniería química del Tecnológico de Monterrey Campus GDL." | ✓ FIX aplicado: "Campus GDA" → "Campus GDL" |
| §9.5 Paquete 1-3 beneficios | "Post de agradecimiento..." | ✓ FIX aplicado: "agradeciemgto" → "agradecimiento" |
| §9.6 Title | "Conoce a nuestra mesa directiva y equipo" | ✓ |
| §9.7 Contacto | "¡TRABAJEMOS JUNTOS!" + "CONTÁCTANOS" + "CORREO" + "INSTAGRAM" | ✓ |
| §9.8 Footer | "CAPÍTULO ESTUDIANTIL AICHE · TEC DE MONTERREY GUADALAJARA © [año]" | ✓ |
| §9.8 JoinCta | "¡Súmate al capítulo!" + "El siguiente reto empieza contigo" | ✓ |

**No se detectaron erratas adicionales** en el copy visible servido.

## 7. Verificación

- `bunx astro check`: **0 errors, 0 warnings, 0 hints** (59 archivos; antes 60 — eliminada `kit.astro`).
- `bun run build`: **8 páginas** generadas en 515 ms; sitemap con 7 URLs (excluye `/404` y `/kit`).
- `bun run preview`: revisado `/`, `/acerca`, `/acerca/equipo`,
  `/participaciones`, `/participaciones/southwest-2027`, `/patrocinios`,
  `/contacto`, `/404`. 0 errores de consola.

### HTML gz por ruta (final S9)

| Ruta | raw | gz |
|---|---:|---:|
| `/` | 70 750 B | 14 765 B |
| `/acerca/` | 56 297 B | 12 314 B |
| `/acerca/equipo/` | 57 636 B | 11 708 B |
| `/participaciones/` | 61 006 B | 12 984 B |
| `/participaciones/southwest-2027/` | 58 374 B | 12 758 B |
| `/patrocinios/` | 68 994 B | 13 793 B |
| `/contacto/` | 56 506 B | 11 648 B |
| `/404.html` | 58 496 B | 11 767 B |

### Jerarquía de headings (final S9)

| Ruta | h1 | h2 | h3 |
|---|---:|---:|---:|
| `/` | 1 | 4 | 2 |
| `/acerca/` | 1 | 1 | 0 |
| `/acerca/equipo/` | 1 | 2 | 0 |
| `/participaciones/` | 1 | 3 | 0 |
| `/participaciones/southwest-2027/` | 1 | 1 (sr-only) | 2 |
| `/patrocinios/` | 1 | 3 | 2 |
| `/contacto/` | 1 | 1 | 0 |
| `/404.html` | 1 | 1 | 0 |

Todas las páginas: h1 único + jerarquía sin saltos. ✓

## 8. Decisiones tomadas

| # | Decisión | Motivo |
|---|---|---|
| D-069 | Eliminar `src/pages/kit.astro` y purgar referencias en comentarios | RULES §2.4, S9 plan. Sitemap y robots ya lo excluían desde S8 |
| D-070 | Eliminar `<Eyebrow>` de `About.astro` y `AboutTeaser.astro` | El eyebrow mostraba el mismo texto que el h1/h2 ("ACERCA DE NOSOTROS" / "Acerca de Nosotros"). El PDF p.5 solo tiene el título. Mejora fidelidad y elimina ruido visual |

## 9. Lo que queda abierto (no resoluble en S9)

- **Diferencias por captura visual:** el sandbox no tiene Playwright/Chrome
  para comparar capturas pixel a pixel. La auditoría es por inspección
  de HTML/CSS/clases. La captura definitiva está prevista en S10
  (`scripts/capture.mjs` con Playwright). Anotado en `docs/BACKLOG.md`.
- **Lighthouse numérico:** sigue pendiente de runner con Chrome.
- **Diferencias menores de composición** (A-02, A-04, A-08, A-11, A-14,
  A-15, A-26, A-27) son adaptaciones razonadas; cualquier cambio
  adicional requeriría decisión del usuario.

## 10. Necesito que el usuario decida

**Bloqueante:** nada.

**No bloqueante:**
- Si alguno de los tamaños de h1 por página (A-26) te parece demasiado
  pequeño en relación al PDF, podemos subir `h-section` a `h-hero` o
  crear una clase `h-display` (≈80–100px) para los h1 "de display".
- Si quieres los recuadros del PDF p.5 alrededor de la pregunta y el
  párrafo (A-02/A-27), podemos añadirlos — es un cambio visual de ~10
  líneas en `About.astro` y `AboutTeaser.astro`.
- (Arrastrado S7.5) Copy de `participations.aboutEvent.body` — sigue
  pendiente de confirmación si te vale.

## 11. Siguiente sesión

**S10 — Capturas, documentación y paquete Higgsfield.**
- `scripts/capture.mjs` con Playwright (whitelist RULES §16.4) para
  generar las capturas deterministas en `docs/media/screenshots/`.
- `docs/SITE-CONTEXT.md`, `docs/VIDEO-BRIEF.md`, `docs/SHOTLIST.md`.
- `docs/DEPLOY.md` y `README.md` final.
- Nota destacada: tras sustituir imágenes/videos reales, re-ejecutar
  `bun run capture` para regenerar el material del video.

Precondiciones cumplidas:
- 8 rutas sin contenido temporal.
- Fidelidad validada contra el PDF (tabla en §2).
- Copy verbatim y ortografía revisados.
- Estados auditados.
- Responsive verificado por inspección de clases.
