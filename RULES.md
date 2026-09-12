# RULES.md — Reglas del proyecto: sitio web AIChE GDL (Astro + Tailwind + Bun)

> **Este archivo se lee ENTERO al inicio de cada sesión de trabajo.** No es un prompt de una sola ejecución: es el contrato permanente del proyecto. El trabajo está dividido en sesiones descritas en `PLAN-SESIONES.md`.
> Ubicación esperada en el repo: raíz del proyecto, junto a `AGENTS.md`.

---

## 0. ROL Y OBJETIVO

Eres un ingeniero frontend senior especializado en **Astro 5, Tailwind CSS 4 y web performance**. Construyes el sitio web estático oficial del **Capítulo Estudiantil AIChE GDL — Tec de Monterrey, Campus Guadalajara**, replicando con **alta fidelidad** el diseño de `design/landing.pdf`.

Propósito del sitio: presentar al capítulo, mostrar sus participaciones en competencias AIChE y **conseguir patrocinadores** para la *2027 AIChE Southwest Student Regional Conference*. Público: **empresas patrocinadoras** y **estudiantes que quieren unirse**.

Criterio rector: **calidad sobre velocidad**. Es preferible terminar una sesión con menos alcance pero impecable, que avanzar dejando deuda.

---

## 1. CONTEXTO DEL REPOSITORIO

Estado inicial (proyecto Astro recién iniciado, gestor de paquetes **Bun**):

```
.
├── AGENTS.md
├── astro.config.mjs
├── bun.lock
├── CLAUDE.md -> AGENTS.md
├── design/            <-- contiene landing.pdf (SOLO LECTURA)
├── package.json
├── public/{favicon.ico, favicon.svg}
├── README.md
├── src/
│   ├── assets/{astro.svg, background.svg}
│   ├── components/Welcome.astro
│   ├── layouts/Layout.astro
│   └── pages/index.astro
└── tsconfig.json
```

**Reglas de repo:**

1. Lee `AGENTS.md` antes que nada. Si contradice este archivo, **`AGENTS.md` gana** y lo reportas explícitamente en la bitácora.
2. `design/` es **solo lectura**. Nunca modifiques, muevas ni borres `landing.pdf`. Las páginas rasterizadas van a `.cache/design-pages/` (ignorado por git).
3. Elimina el scaffolding de demo (`Welcome.astro`, `astro.svg`, `background.svg`) solo cuando ya esté reemplazado.
4. Usa **Bun** para todo (`bun install`, `bun run build`, `bunx …`). No generes `package-lock.json` ni `yarn.lock`. El servidor de desarrollo se arranca **siempre en background**: `bunx astro dev --background`, y se gestiona con `bunx astro dev stop | status | logs`.
5. `git` obligatorio: al menos un commit por sesión, en **Conventional Commits** (`feat(s3): hero + contador`, `chore(s0): auditoría y tokens`).

---

## 2. PROTOCOLO DE SESIONES (lee esto siempre)

El trabajo está partido en sesiones (`PLAN-SESIONES.md`). En **cada** sesión:

> **Cada sesión ocurre en un chat nuevo, sin memoria de la anterior.** Lo único que viaja entre sesiones son los archivos del repositorio. Por eso `docs/STATE.md` y las bitácoras no son burocracia: son el único canal. Escríbelos para alguien que abre el proyecto por primera vez y no tiene ningún contexto previo — sin referencias del tipo "como comentamos antes" ni pronombres sin antecedente.

### 2.1 Al abrir la sesión

1. Lee, en este orden: `AGENTS.md` → `RULES.md` (este archivo) → `docs/STATE.md` → `docs/DECISIONS.md` → la última bitácora de `docs/sessions/`.
2. Lee la ficha de la sesión que toca en `PLAN-SESIONES.md`.
3. Verifica que el estado real del repo coincide con `docs/STATE.md`. Si no coincide, corrige `STATE.md` primero y anótalo.
4. Ejecuta `bun install && bunx astro check && bun run build` para confirmar que arrancas desde verde. Si arrancas en rojo, **arreglar eso es la primera tarea de la sesión**.
5. Escribe un plan corto (5–10 puntos) de lo que harás en esta sesión y síguelo.

### 2.2 Durante la sesión

- **Trabaja únicamente el alcance de la sesión.** No adelantes trabajo de sesiones futuras aunque parezca fácil. Lo que descubras fuera de alcance va a `docs/BACKLOG.md` (excepción: arreglos triviales de <5 min que desbloquean tu trabajo, anotados en la bitácora).
- **Nunca te bloquees esperando una decisión mía.** Si falta un dato, aplica el valor por defecto documentado, márcalo como `[PENDIENTE-USUARIO]` en `docs/DECISIONS.md` y sigue. Diseña el código para que cambiar esa decisión después toque un solo archivo.
- Registra cada decisión técnica no trivial en `docs/DECISIONS.md` en el momento, no al final.

### 2.3 Al cerrar la sesión (obligatorio, sin excepciones)

1. Ejecuta los gates de §16.1. **No se cierra una sesión en rojo.**
2. Actualiza `docs/STATE.md` (estado real del proyecto, es la fuente de verdad para reanudar).
3. Escribe la bitácora `docs/sessions/SXX-<slug>.md` con la plantilla de `PLAN-SESIONES.md`.
4. Actualiza `docs/DECISIONS.md`, `docs/TODO.md` y `docs/BACKLOG.md`.
5. Haz commit (Conventional Commits) con todo lo anterior incluido.
6. Entrega en el chat un **reporte corto** (máx. ~20 líneas) con: qué quedó hecho, decisiones tomadas, métricas si aplica, **qué necesito decidir yo** (separando bloqueante / no bloqueante) y qué sigue.

### 2.4 Si la sesión queda incompleta

Ciérrala igual: marca en la bitácora el estado `PARCIAL`, lista exactamente qué falta y déjalo como primer punto de la siguiente sesión. El repo **siempre** debe quedar en estado compilable.

---

## 3. REGLAS ABSOLUTAS (NO NEGOCIABLES)

Si alguna se rompe, el trabajo se considera fallido:

1. **TODA página muestra el NAV y el FOOTER.** El PDF tiene diapositivas sin barra de navegación: es un artefacto de cómo se diseñó, no una instrucción. En el sitio real la navegación está **siempre** presente, en todas las rutas, en desktop y móvil.
2. **Cero duplicación.** Lo que aparezca dos veces (nav, footer, sección de la competencia, tarjetas de paquetes, textos) vive en **un solo componente o un solo archivo de datos**. Si copias y pegas markup, lo estás haciendo mal.
3. **Cero JavaScript innecesario.** Astro no envía JS por defecto y así se queda. Solo se permite JS para: contador regresivo, menú móvil/dropdowns, lazy-play de video y reveal on scroll. Todo en **vanilla JS/TS**, sin frameworks de UI (nada de React/Vue/Svelte/Preact), sin librerías de animación (nada de GSAP/AOS/Framer), sin jQuery, sin icon fonts.
4. **Nada se carga si no está en el foco del usuario.** Imágenes fuera del primer viewport en `loading="lazy"`; videos con `preload="none"` y **sin `src` hasta entrar al viewport**; una sola webfont.
5. **No inventes contenido de texto.** Todo el copy visible sale del PDF y está transcrito en §9. Si falta un dato, placeholder neutro + registro en `docs/TODO.md`. **Prohibido lorem ipsum en texto visible**; prohibido inventar nombres de personas o de empresas patrocinadoras.
6. **Dependencias solo de la whitelist** (§16.4).
7. **El build pasa limpio**: `bun run build` y `bunx astro check` sin errores ni warnings; `dist/` navegable con `bun run preview` sin errores en consola.
8. **Sitio 100 % estático** (`output: 'static'`). Sin SSR, sin adaptadores, sin endpoints de servidor.
9. **Cero requests a terceros** en producción (sin Google Fonts, sin CDNs, sin analytics, sin embeds externos).

---

## 4. CÓMO LEER `design/landing.pdf`

El PDF mezcla **diseño a implementar** con **anotaciones de instrucciones**. Clasificación obligatoria:

| Pág. | Contenido | Qué hacer |
|---|---|---|
| 1 | Hero azul con rejilla, logo, "AIChE GDL / Capítulo estudiantil", párrafo y contador | **Implementar** |
| 2 | "ANOTACIONES, VISTA 1 (SLIDE1)" — referencia externa "Noche Retro 2026" | **NO implementar.** Notas: gustan el degradado, la cuadrícula, la disposición y el temporizador; el contador apunta al **27 de marzo de 2027**; la barra de navegación sigue el estilo de `https://www.aiche.org/` |
| 3 | "ANOTACIONES: I. Tipografías / II. Colores" | **NO implementar.** Sistema de diseño → §5 |
| 4 | "ANOTACIONES: III. Identidad visual" (logo) | **NO implementar.** Guía de logo |
| 5 | "Acerca de Nosotros" + espacio de video 16:9 con overlay HIGHLIGHTS | **Implementar** |
| 6 | "Participaciones" + próximo evento + lista de competencias | **Implementar** |
| 7 | "¿Qué es la SWSRC?" / "¿Por qué queremos participar?" (versión azul) | **Implementar** (ver nota) |
| 8 | "¡Súmate al capítulo!" + footer crema | **Implementar** |
| 9 | Patrocinios — hero "Tu patrocinio nos lleva a competir" + 3 paquetes | **Implementar** |
| 10 | Patrocinios — "Qué recibe tu empresa" (3 tarjetas de beneficios) | **Implementar** |
| 11 | "LA COMPETENCIA" sobre fondo crema (versión web de la p.7) | **Implementar** |
| 12 | "Conoce a nuestra mesa directiva y equipo" | **Implementar** |
| 13 | Contacto "¡TRABAJEMOS JUNTOS!" | **Implementar** |

**Jerarquía de fidelidad:** las páginas **9–13 ya incluyen la barra de navegación final** y representan el lenguaje visual definitivo. Las páginas 1 y 5–8 son mockups tipo diapositiva: toma de ellas el **contenido, la composición y el tono**, pero adáptalas al lenguaje de 9–13 (mismo nav, márgenes, rejilla de fondo y tratamiento de tarjetas).

Las páginas 7 y 11 son **el mismo contenido en dos versiones**: implementa **una sola sección** con prop `variant: "navy" | "cream"`.

Para inspeccionar visualmente (no solo el texto):

```bash
mkdir -p .cache/design-pages
pdftoppm -r 150 -png design/landing.pdf .cache/design-pages/page
```

---

## 5. SISTEMA DE DISEÑO (tokens obligatorios)

Todo estilo pasa por tokens. **Prohibido escribir hex sueltos en el markup.** Se definen una sola vez en `src/styles/global.css` con `@theme` de Tailwind 4.

### 5.1 Colores (hex exactos del PDF)

| Token | Hex | Uso según el diseño |
|---|---|---|
| `navy` | `#123f72` | Fondos y botones importantes |
| `white` | `#ffffff` | Texto con contraste en fondos oscuros |
| `cream` | `#f4f1e9` | Complemento (footer, sección "La competencia", secciones claras) |
| `ink` | `#000000` | Texto con contraste en fondos claros |

Se permiten **únicamente** derivaciones de `#123f72` para degradados y hover (`navy-900 #0d2f57`, `navy-700 #1a4f8a`, `navy-400 #4a8fd4`). Cada derivación se documenta en `docs/DESIGN-SYSTEM.md`. No introduzcas colores de marca nuevos.

```css
@import "tailwindcss";

@theme {
  --color-navy-900: #0d2f57;
  --color-navy: #123f72;
  --color-navy-700: #1a4f8a;
  --color-navy-400: #4a8fd4;
  --color-cream: #f4f1e9;
  --color-ink: #000000;

  --font-sans:  "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --font-serif: "Libre Baskerville", Georgia, "Times New Roman", serif;
  --font-ui:    Arial, Helvetica, sans-serif;
}
```

### 5.2 Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| **Principal** | **Segoe UI** (regular y bold) | Textos largos, información, nombre del grupo |
| **Secundaria** | **Libre Baskerville *Italic*** | Preferentemente MAYÚSCULAS con tracking: subtítulos y números del contador |
| **Terciaria** | **Arial** | Preferentemente MAYÚSCULAS con tracking: etiquetas (`FECHA`, `SEDE`, `PAQUETE 1`, `DÍAS`) |

Implementación **obligatoria por rendimiento**:

- Segoe UI y Arial son de sistema → **cero descargas**, solo font-stack.
- Libre Baskerville Italic es la **única webfont**: `@fontsource/libre-baskerville`, solo `400-italic`, subset `latin`, `font-display: swap`. Preload únicamente si se usa above the fold.
- Utilidades semánticas: `.eyebrow` (Arial, uppercase, tracking amplio), `.quote-serif` (Libre Baskerville italic), `.stat-num` (`font-variant-numeric: tabular-nums`).

### 5.3 Superficies

- **Fondo insignia**: degradado azul (de `navy-700` a `navy-900`, radial/diagonal) + **rejilla técnica** de líneas blancas finas al 6–10 % de opacidad.
- La rejilla se hace con **CSS puro** (`repeating-linear-gradient`), nunca con imagen ni SVG pesado. Componente único `GridBackdrop.astro`.
- Bordes: 1px `rgba(255,255,255,.25)` sobre navy; 1px `rgba(18,63,114,.2)` sobre crema. Radio **0 o ≤4px** — el diseño es rectilíneo.
- El elemento destacado de las tarjetas lleva **borde superior más grueso** (ver p.9).

### 5.4 Layout y ritmo

- Contenedor máx. ~1440px, padding lateral fluido (`clamp`), secciones `py-20 md:py-28`.
- Escala tipográfica fluida con `clamp()`; nada de px fijos en H1/H2.
- **Mobile-first obligatorio.** El diseño está en 16:9 de escritorio; tú decides y documentas cómo colapsa cada bloque (columnas → stack, tabla de evento → lista, 3 paquetes → stack o scroll con snap).

---

## 6. ARQUITECTURA DE ARCHIVOS

```
src/
├── components/
│   ├── layout/   Nav.astro, NavDropdown.astro, MobileMenu.astro, Footer.astro, SkipLink.astro
│   ├── ui/       Section.astro, SectionTitle.astro, Eyebrow.astro, Button.astro, Card.astro,
│   │             DataRow.astro, Badge.astro, GridBackdrop.astro, Reveal.astro
│   ├── media/    Img.astro, LazyVideo.astro, VideoHighlight.astro, Figure.astro
│   └── sections/ Hero.astro, About.astro, CompetitionInfo.astro, NextEvent.astro,
│                 CompetitionsList.astro, SponsorTiers.astro, TierBenefits.astro,
│                 TeamGrid.astro, ContactBlock.astro, JoinCta.astro
├── data/         site.ts, nav.ts, content.ts, sponsors.ts, competitions.ts, team.ts, media.ts
├── layouts/      Layout.astro
├── pages/
├── scripts/      countdown.ts, lazy-video.ts, nav.ts, reveal.ts
├── styles/       global.css
└── assets/
```

- **Ningún string de copy vive en un `.astro`.** Todo entra por `src/data/content.ts`, tipado (`interface` / `as const`).
- Props tipadas en cada componente (`interface Props`), con defaults sensatos.
- Máx. ~150 líneas por archivo `.astro`; si crece, divídelo.
- Nombres de archivo y componentes en inglés; **copy visible en español (es-MX)**.

---

## 7. NAV Y LAYOUT (regla crítica)

`src/layouts/Layout.astro` es el **único** punto de entrada de todas las páginas y siempre renderiza `<Nav />` + `<slot />` + `<Footer />`.

**Anatomía del nav (páginas 9–13, estilo `aiche.org`):**

- Bloque izquierdo con **icono de casa + "INICIO"** sobre navy más oscuro (enlace a `/`).
- Isotipo hexagonal + wordmark **"AIChE GDL"** y bajada **"TEC DE MONTERREY · CAMPUS GUADALAJARA"** (Arial, mayúsculas, tracking).
- Enlaces: **Acerca de nosotros +**, **Participaciones +**, **Patrocinios +**, **Contacto**. El "+" indica submenú.
- Botón **"Únete"** al extremo derecho, en bloque azul, llegando al borde.
- Estado activo: **subrayado azul claro** bajo la sección actual.

**Requisitos técnicos:**

1. `position: sticky; top: 0`, con cambio de estilo al hacer scroll resuelto con un **sentinel de 1px + `IntersectionObserver`** (preferido) en vez de listener de scroll.
2. **Dropdowns accesibles**: abren con click y teclado (`Enter`/`Espacio`), cierran con `Escape` y click fuera; `aria-expanded`, `aria-controls`, roles correctos, navegación con flechas. Hover solo como refuerzo.
3. **Menú móvil**: hamburguesa, panel completo con acordeones, `inert`/`aria-hidden` al cerrar, focus trap, bloqueo de scroll del body.

> ⚠️ **Los puntos 2 y 3, y el «+» de la anatomía, están derogados desde F5b
> (2026-08-20) por petición explícita del usuario.** Los tres items con página
> propia son enlaces directos sin «+»; el submenú se abre en CSS con `:hover` /
> `:focus-within` y el panel móvil lista los hijos sin acordeón. No revertirlo:
> el motivo y las alternativas descartadas están en **D-138**
> (`docs/DECISIONS.md`) y la verificación en `docs/sessions/F5-fidelidad-2.md`
> §F5b.7.
4. `aria-current="page"` calculado desde `Astro.url.pathname`.
5. **Skip link** como primer elemento enfocable.
6. `scroll-margin-top` en los targets de ancla; nunca `padding-top` mágico en el body.
7. Altura fija reservada desde el primer render: **el nav no genera CLS**.

---

## 8. MAPA DEL SITIO

| Ruta | Título | Contenido (páginas del PDF) |
|---|---|---|
| `/` | Inicio | Hero + contador (1) · resumen "Acerca de" + video highlight (5) · próximo evento (6) · teaser de paquetes (9) · CTA "¡Súmate al capítulo!" (8) |
| `/acerca` | Acerca de nosotros | Bloque completo + video 16:9 (5) |
| `/acerca/equipo` | Mesa directiva y equipo | (12) |
| `/participaciones` | Participaciones | (6) completa |
| `/participaciones/southwest-2027` | Southwest Student Regional Conference | (7)/(11) + galería |
| `/patrocinios` | Patrocinios | (9) + (10) + (11 variante crema) |
| `/contacto` | Contacto | (13) + "¡Súmate al capítulo!" (8) |
| `/404` | No encontrado | Mismo layout |

- Los submenús (`+`) apuntan a estas subrutas y/o anclas dentro de ellas.
- El botón **"Únete"** apunta a `/contacto#unete`, definido como constante en `site.ts`.
- `sitemap-index.xml` con `@astrojs/sitemap` + `robots.txt`.

---

## 9. COPY VERBATIM (transcrito del PDF — no reescribir)

> Úsalo tal cual, salvo las correcciones marcadas **[FIX]**, que son erratas evidentes. Cada FIX se registra en `docs/TODO.md`.

### 9.1 Hero (p.1)

- Título: **AIChE GDL** / **Capítulo estudiantil**
- Párrafo:
  > Somos un grupo estudiantil del Instituto Tecnológico y de Estudios Superiores de Monterrey, Campus Guadalajara, que desarrolla talento, transforma conocimiento en proyectos y genera impacto mediante la participación en competencias, divulgación científica, innovación y colaboración, con la meta de representar a la institución en las distintas competencias impulsadas por el American Institute of Chemical Engineers (AIChE).
- Contador: etiqueta **FALTAN**; cajas **DÍAS · HORAS · MIN · SEG**; pie **¡PARA NUESTRA PRÓXIMA COMPETENCIA!**

### 9.2 Acerca de nosotros (p.5)

- Título: **Acerca de Nosotros**
- Pregunta (Libre Baskerville italic): *¿Qué puede lograr una comunidad con el deseo de crear algo significativo?*
- Párrafo:
  > En la comunidad de AIChE GDL, creemos firmemente que la ingeniería también se construye fuera del aula: al compartir ideas, enfrentar desafíos y aprender unos de otros. Aunque nuestro origen está en la Ingeniería Química, colaboramos en un espacio interdisciplinario que involucra estudiantes de distintas carreras STEM, donde cada integrante puede descubrir sus capacidades únicas, aportar desde su perspectiva y crecer junto a personas que comparten el deseo de crear algo significativo. Más allá de formar equipos para concursos, buscamos construir una comunidad capaz de aprender de cada experiencia, ampliar sus horizontes e imaginar nuevas posibilidades, con el objetivo de avanzar con conocimiento, colaboración y visión hacia el futuro.
- Bloque de video 16:9: badge **HIGHLIGHTS**; titular **Así se vive la experiencia AIChE GDL**; bajada en itálica *Más de 200 estudiantes de distintas carreras y niveles educativos han participado en el proyecto.*; chip inferior derecho **19 SEP · 19:00 H**.

### 9.3 Participaciones (p.6)

- Título: **Participaciones**
- Subtítulo (italic):
  > ¡Conoce los equipos, proyectos y capacidades que estamos desarrollando para representar a la institución en las competencias internacionales del American Institute of Chemical Engineers (AIChE)!

  **[FIX]** el PDF dice "compentencias" y "de el".
- Tarjeta **PRÓXIMO EVENTO** — **The 2027 AIChE Southwest Student Regional Conference**
  - **FECHA** — 27 de marzo de 2027
  - **SEDE** — McNeese State University
  - **UBICACIÓN** — Lake Charles, Louisiana
- Bloque **Rumbo a las competencias AIChE**:
  > Nos preparamos para llevar nuestro talento, creatividad y trabajo en equipo a las competencias AIChE del próximo año.

  | Etiqueta | Competencia | Bajada |
  |---|---|---|
  | SPRING 2027 | Chem-E-Car Competition | Química que impulsa |
  | SPRING 2027 | ChemE Jeopardy | Conocimiento bajo presión |
  | OPEN CALL 2027 | Chem-E-Cube Competition | Ingeniería en acción |
  | OPEN CALL 2027 | K12 STEM Outreach | Inspirando vocaciones científicas |

### 9.4 La competencia (p.7 y p.11 — sección única, dos variantes)

Eyebrow: **LA COMPETENCIA**

- **¿Qué es la Southwest Student Regional Conference?**
  > La Regional South West de Chem-E-Car es una competencia organizada por AIChE donde equipos universitarios del suroeste de Estados Unidos y México diseñan y construyen un vehículo a pequeña escala impulsado y detenido mediante reacciones químicas. El objetivo es recorrer con precisión una distancia anunciada el mismo día de la competencia, demostrando innovación, seguridad y aplicación práctica de la ingeniería química. Esta regional se llevará a cabo en McNeese State University, en Lake Charles, Louisiana, el 27 de marzo de 2027, y funciona como clasificatoria para la competencia nacional.

  **[FIX importante]** El PDF tiene dos versiones contradictorias: "McNeese State University, en la primavera del 2027" vs. "en Texas el 27 de marzo". McNeese State University está en **Lake Charles, Louisiana**. Unifica a la versión de arriba y reporta la discrepancia.

- **¿Por qué queremos participar?**
  > Participar en esta competencia nos permite aplicar conocimientos de ingeniería química en un reto real, desarrollar habilidades clave como trabajo en equipo, liderazgo y resolución de problemas, y representar a nuestra institución a nivel internacional. Además, es una oportunidad para vincularnos con la industria, ganar visibilidad como capítulo estudiantil y prepararnos para competir en la conferencia anual de AIChE.

- Debajo, fila de **3 imágenes** (equipo en laboratorio, trabajo de laboratorio, taller IQ-Móvil).

### 9.5 Patrocinios (p.9 y p.10)

- Eyebrow **PATROCINIOS**, título **Tu patrocinio nos lleva a competir**
- Párrafo:
  > Somos un capítulo estudiantil y cada competencia depende del apoyo que conseguimos. Un patrocinio nos permite diseñar y construir el vehículo de Chem-E-Car y llevarlo a la Southwest Student Regional Conference, el 27 de marzo, representando al Tecnológico de Monterrey Campus Guadalajara.

  **[FIX]** el PDF dice "en Texas" — misma discrepancia de §9.4.
- Etiqueta **TRES PAQUETES**: **PAQUETE 1 — $10,000**, **PAQUETE 2 — $5,000**, **PAQUETE 3 — $2,500**.
  **[PENDIENTE-USUARIO]** confirmar moneda (MXN asumido). Moneda como variable en `sponsors.ts`; mostrar solo `$10,000` como en el diseño hasta confirmar.
- Sección **Qué recibe tu empresa**, nota: *Los tres paquetes incluyen posibilidad de facturación.* Cada tarjeta: imagen arriba, `PAQUETE N`, contador `N BENEFICIOS`, precio.

**Paquete 1 — $10,000 — 6 beneficios**
1. Mención especial redes sociales de la Federación de Estudiantes (FETEC).
2. Logo/banner en coche y uniforme del equipo.
3. Certificado de reconocimiento.
4. Post de agradecimiento en redes sociales oficiales del equipo. **[FIX]** el PDF escribe "agradeciemgto".
5. Espacio para hablar sobre su empresa a alumnos de ingeniería química del Tecnológico de Monterrey Campus GDA.
6. Posibilidad de facturación.

**Paquete 2 — $5,000 — 4 beneficios**
1. Logo/banner en uniformes del equipo.
2. Certificado de reconocimiento.
3. Post de agradecimiento en redes sociales oficiales del equipo.
4. Posibilidad de facturación.

**Paquete 3 — $2,500 — 3 beneficios**
1. Post de agradecimiento en redes sociales oficiales del equipo.
2. Certificado de reconocimiento.
3. Posibilidad de facturación.

### 9.6 Equipo (p.12)

- Eyebrow **ACERCA DE NOSOTROS**, título **Conoce a nuestra mesa directiva y equipo**
- Izquierda **MESA DIRECTIVA**: grid de **6 retratos** verticales sobre fondo negro.
- Derecha **EQUIPO**: foto grupal grande.
- **[PENDIENTE-USUARIO]** No hay nombres ni cargos en el PDF. `data/team.ts` con 6 entradas `{ name: "Nombre Apellido", role: "Cargo" }` claramente marcadas como placeholder.

### 9.7 Contacto (p.13)

- Eyebrow **CONTACTO**, título **¡TRABAJEMOS JUNTOS!**, subtítulo **CONTÁCTANOS**
- **CORREO**: `aiche.gdl@gmail.com` (`mailto:`)
- **INSTAGRAM**: `aiche.gdl` (`https://instagram.com/aiche.gdl`)
- Foto grupal a la derecha.
- **[PENDIENTE-USUARIO]** La p.8 muestra `hola@aichegdl.org`. Se usa el de la p.13 como oficial.

### 9.8 CTA de cierre y footer (p.8)

- Isotipo grande, **¡Súmate al capítulo!**, bajada **El siguiente reto empieza contigo**, dos botones (correo e Instagram).
- Footer sobre **crema `#f4f1e9`**: logo AIChE a la izquierda y a la derecha, en Arial mayúsculas con tracking:
  **CAPÍTULO ESTUDIANTIL AICHE · TEC DE MONTERREY GUADALAJARA © 2026**
  → año **dinámico** (`new Date().getFullYear()` en build).

---

## 10. SISTEMA DE MEDIOS Y PLACEHOLDERS

Todas las imágenes y videos son **temporales**: el usuario los sustituirá por los definitivos en máxima calidad. Diseña para que **reemplazar un archivo no requiera tocar código**.

### 10.1 Reglas del sistema

1. Manifiesto único `src/data/media.ts`:
   ```ts
   export const media = {
     heroPoster: { src: "/media/images/hero-poster.jpg", alt: "…", w: 1920, h: 1080 },
     aboutVideo: { src: "/media/video/about-highlight.mp4", poster: "/media/images/about-poster.jpg",
                   ratio: "16/9", label: "…" },
   } as const;
   ```
2. Estructura en **`src/assets/media/`**: `images/`, `team/`, `sponsors/`, `logo/` (los videos siguen en `public/media/video/` y el isotipo SVG en `public/media/logo/`). Desde F8 los rasterizados viven bajo `src/` para que `astro:assets` los optimice (D-180). Nombres **estables y semánticos** (`chem-e-car-01.jpg`, `team-group.jpg`, `board-01.jpg` … `board-06.jpg`). El usuario solo sobrescribe el archivo con el mismo nombre.
3. **Toda** imagen y video declara `width`/`height` o `aspect-ratio` → **CLS = 0**.
4. Decorativas: `alt=""` + `role="presentation"`. De contenido: alt descriptivo en español (aunque sea placeholder, escribe el alt **real** que corresponderá a la foto definitiva).
5. Los placeholders viven en `src/assets/media/` (reemplazo en caliente, mismo nombre de archivo). **Pasan por `astro:assets`**: cada uno se sirve como AVIF, WebP y su formato original en varios anchos. Detalle en `docs/ASSETS.md` §3.
6. Solo la imagen LCP del hero puede ir `loading="eager" fetchpriority="high"`; **todo lo demás lazy**.
7. `docs/ASSETS.md` mantiene la tabla: `clave · dónde se usa · ruta esperada · proporción · resolución recomendada · peso máx. sugerido · alt actual`.

### 10.2 Cómo generar los placeholders

Deben **verse intencionales**, no rotos ni genéricos: mismo lenguaje visual del sitio (navy + rejilla + etiqueta del slot), con la proporción real de cada hueco. Se generan con un script reproducible `scripts/gen-placeholders.mjs` (usando **sharp**, ya disponible) que compone SVG → JPG/WebP y escribe en `src/assets/media/`.

Proporciones requeridas: 16:9 (video y hero), 3:4 (retratos de mesa directiva), 4:3 y 3:2 (galerías), 1:1 (logos de patrocinadores, si aplica).

**Restricciones de los placeholders:**

- Nada de fotos de stock con derechos ni logotipos de empresas reales.
- Para los 6 retratos de la mesa directiva **no uses caras generadas ni fotos de personas reales**: usa una silueta/figura geométrica sobre fondo negro con la etiqueta `RETRATO 01`, etc. Así nadie confunde el placeholder con un integrante real y no se publica por accidente una cara falsa.
- Cada placeholder lleva su etiqueta visible (`VIDEO 16:9`, `GALERÍA 3:2 · 01`) para que sea obvio qué se sustituye.

### 10.3 Videos placeholder

Genera clips cortos (15–20 s, sin audio, ≤2 MB) con ffmpeg, con movimiento sutil para que se note que son video:

```bash
ffmpeg -f lavfi -i "gradients=s=1920x1080:c0=0x0d2f57:c1=0x1a4f8a:speed=0.015:d=20:r=30" \
  -vf "drawgrid=w=120:h=120:t=1:c=white@0.08,drawtext=text='VIDEO PLACEHOLDER · 16\\:9':\
fontcolor=white@0.85:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2" \
  -an -c:v libx264 -crf 30 -preset veryfast -pix_fmt yuv420p -movflags +faststart \
  public/media/video/about-highlight.mp4

# Poster a partir del propio clip
ffmpeg -ss 00:00:02 -i public/media/video/about-highlight.mp4 -frames:v 1 -q:v 3 \
  src/assets/media/images/about-poster.jpg
```

Si `ffmpeg` no está disponible en el entorno, documenta el comando en `docs/ASSETS.md` y usa un poster estático + un `<video>` apuntando a un archivo que el usuario colocará (el sitio no debe romperse por un video faltante: el componente muestra el poster).

---

## 11. VIDEO — DECISIÓN CERRADA: **AUTO-ALOJADO**

**Decisión tomada, no la reconsideres:** los videos se sirven **desde el propio proyecto** (`public/media/video/`) con `<video>` nativo. **Nada de YouTube, Vimeo ni iframes de terceros.** Motivo: un embed de YouTube arrastra ~1 MB de JS de terceros, cookies y múltiples conexiones externas, y rompe tanto el presupuesto de rendimiento (§12) como la regla de cero requests a terceros (§3.9).

### 11.1 Restricciones de los archivos finales

- **≤ 8 MB** por video (ideal 4–6 MB), duración **≤ 30–40 s**, resolución 1080p o 720p.
- **Sin pista de audio** (`-an`): garantiza el autoplay y ahorra peso.
- **MP4/H.264** (`yuv420p`, `+faststart`) como fuente universal; **WebM/VP9** opcional como fuente adicional más ligera.

```bash
ffmpeg -i input.mov -an -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow \
       -pix_fmt yuv420p -movflags +faststart public/media/video/nombre.mp4
ffmpeg -i input.mov -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 \
       public/media/video/nombre.webm
ffmpeg -ss 00:00:01 -i input.mov -frames:v 1 -q:v 3 src/assets/media/images/nombre-poster.jpg
```

`docs/VIDEO.md` debe incluir estos comandos y una advertencia clara: **si un video definitivo supera ~15 MB o dura minutos, hay que avisar al usuario antes de publicarlo** (se evaluaría entonces Cloudflare Stream/Bunny, decisión suya). El componente debe estar aislado para que ese cambio afecte a un solo archivo.

### 11.2 Componente `LazyVideo.astro` — comportamiento exigido

1. Renderiza `<video>` **sin `src`**: las URLs van en `data-src` / `data-src-webm`. No se descarga **ni un byte** hasta que hace falta.
2. Atributos: `muted playsinline loop preload="none" poster={poster}` + `width`/`height` reales. **No** uses el atributo `autoplay`.
3. Un único `IntersectionObserver` compartido (threshold ~0.25, `rootMargin: "200px 0px"`):
   - Primer intersect: inyecta los `<source>`, `video.load()`, `video.play().catch(() => {})`.
   - Al salir del viewport: `video.pause()`.
   - `visibilitychange` → pausa si la pestaña se oculta.
4. `prefers-reduced-motion: reduce` → sin autoplay: poster + botón de play accesible.
5. `navigator.connection.saveData === true` o `effectiveType` `2g`/`slow-2g` → sin autoplay: poster + botón.
6. Controles ocultos por defecto (video ambiental), pero con botón accesible de **play/pause** (y **mute/unmute** si algún video final llevara audio), con `aria-label` en español.
7. Si `play()` es rechazada, muestra el botón de play. **Nunca** dejes un rectángulo negro.
8. El script vive en `src/scripts/lazy-video.ts`, importado una sola vez, no repetido por instancia.

---

## 12. RENDIMIENTO (presupuestos obligatorios)

Verificados con Lighthouse **móvil** sobre `bun run preview` (build de producción):

| Métrica | Objetivo |
|---|---|
| Performance / Accessibility / Best Practices / SEO | **≥ 95** cada una |
| LCP | **< 2.0 s** |
| CLS | **< 0.02** |
| TBT | **< 150 ms** |
| JS enviado (sin video) | **< 25 KB** comprimido |
| CSS total | **< 30 KB** comprimido |
| Peso de `/` sin videos | **< 500 KB** |
| Requests de terceros | **0** |

Reglas:

1. Sin scripts de terceros. Si más adelante se quiere analítica, se decide aparte (preferencia: sin cookies y diferida).
2. Fuentes self-hosted (§5.2): una sola webfont, `swap`, subset latin.
3. Imágenes: AVIF/WebP con fallback, `srcset` + `sizes`, lazy salvo LCP.
4. Videos: §11.
5. **Reveal on scroll** con `IntersectionObserver` + clases CSS (`opacity`/`translateY`), `once: true`, desactivado con `prefers-reduced-motion`. Prohibido animar propiedades distintas de `transform`/`opacity`.
6. Sin listeners de `scroll`/`resize` sin throttling; preferir `IntersectionObserver`/`ResizeObserver`.
7. `prefetch` de Astro con estrategia `hover` (o `viewport` solo para el nav).
8. `ClientRouter` (view transitions) **opcional**: solo si no rompe la reinicialización de scripts (contador, video, menú) y no añade peso perceptible. Ante la duda, **no lo uses**.
9. `astro.config.mjs`: `output: 'static'`, `site: "<URL final>"`, `compressHTML: true`, `build.inlineStylesheets: 'auto'`.
10. Reporta el **tamaño real de `dist/`** y el desglose por ruta en `docs/PERFORMANCE.md`.

---

## 13. ACCESIBILIDAD

- HTML semántico con landmarks (`header`, `nav`, `main`, `section` con `aria-labelledby`, `footer`), un solo `<h1>` por página, jerarquía correcta.
- `<html lang="es-MX">`.
- Contraste AA mínimo en todo texto (verifica especialmente itálicas pequeñas y grises).
- `:focus-visible` visible y con contraste; no elimines outlines.
- Navegación completa por teclado, incluidos dropdowns y menú móvil.
- Iconos informativos con `aria-label`; decorativos con `aria-hidden="true"`.
- Contador: `aria-live="off"` (no debe leerse cada segundo) + texto accesible alterno del tipo "Faltan 49 días para nuestra próxima competencia".
- Respeta `prefers-reduced-motion` en **todas** las animaciones y en el autoplay.

---

## 14. SEO Y METADATOS

- `Layout.astro` recibe props `title`, `description`, `image`, `noindex?` y genera `<title>`, meta description, canonical, Open Graph completo, Twitter card `summary_large_image`, `theme-color` `#123f72`.
- Títulos únicos: `Página | AIChE GDL — Tec de Monterrey Campus Guadalajara`.
- `@astrojs/sitemap` + `robots.txt` **generado en el build** desde `siteUrl`
  (hook `astro:build:done` en `astro.config.mjs`; no hay `public/robots.txt`
  desde F8, D-183).
- JSON-LD: `Organization`/`EducationalOrganization` y `Event` para *The 2027 AIChE Southwest Student Regional Conference* (2027-03-27, McNeese State University, Lake Charles, LA).
- Imagen OG 1200×630 en `public/og.jpg` con el lenguaje visual del sitio (placeholder, pero real y con medidas correctas).
- Favicon/manifest coherentes con la marca (isotipo hexagonal).

---

## 15. CONTADOR REGRESIVO

- Fecha objetivo **27 de marzo de 2027**, definida **una sola vez** en `src/data/site.ts` como ISO con zona (`2027-03-27T09:00:00-06:00`, ajustable), con `label` (`¡PARA NUESTRA PRÓXIMA COMPETENCIA!`) y `eventName`.
- Cajas **DÍAS / HORAS / MIN / SEG**, números con la tipografía del PDF y `tabular-nums` para que **no salten de ancho**.
- Valor inicial renderizado en build (evita el flash de `00`), actualizado en cliente.
- Un solo `setInterval` de 1 s; **pausa** con `visibilitychange` y al salir del viewport; al reanudar recalcula desde `Date.now()`.
- Estado post-evento definido en datos (p. ej. "¡Ya estamos compitiendo!"), nunca números negativos.

---

## 16. CALIDAD Y VERIFICACIÓN

### 16.1 Gates de cierre de sesión

```bash
bun install
bunx astro check          # 0 errores, 0 warnings
bun run build             # sin errores
bun run preview           # navegar TODAS las rutas, 0 errores en consola
```

Más: revisar cada ruta en **360×800, 768×1024, 1440×900 y 1920×1080**, sin scroll horizontal, con nav funcional y sin roturas de layout.

### 16.2 Verificación sin acceso web

Puede que no tengas navegación web disponible. **Nunca supongas de memoria** cómo se configura una dependencia: verifica contra lo que hay instalado en el repositorio (`node_modules/<paquete>/package.json`, su README, los tipos, los peer dependencies). Si después de eso sigue habiendo duda sobre una decisión de configuración, **reporta la versión exacta y la duda, y espera confirmación** en vez de improvisar. Una configuración inventada que "parece funcionar" es peor que una pregunta.

### 16.3 Prohibiciones de código

- Sin `!important`, sin `style=""` inline (salvo variables CSS dinámicas), sin números mágicos sin token.
- Sin `any` en TypeScript.
- Sin CSS global fuera de `global.css` (tokens, reset y utilidades base).
- Sin `<div>` cuando existe un elemento semántico.
- Sin comentarios `TODO` sueltos: todo TODO va en `docs/TODO.md`.

### 16.4 Dependencias permitidas (whitelist)

`astro`, `tailwindcss`, `@tailwindcss/vite`, `@astrojs/sitemap`, `@fontsource/libre-baskerville`, `sharp`, y `playwright` **como devDependency** para las capturas. Cualquier otra: preguntar antes.

---

## 17. DOCUMENTACIÓN VIVA

| Archivo | Contenido | Se actualiza |
|---|---|---|
| `docs/STATE.md` | Estado real del proyecto: stack, rutas y su grado de avance, componentes, sesión actual, bloqueos | **cada sesión** |
| `docs/sessions/SXX-<slug>.md` | Bitácora de cada sesión | al cerrar cada sesión |
| `docs/DECISIONS.md` | Decisiones técnicas (ADR-lite) y `[PENDIENTE-USUARIO]` | cuando ocurren |
| `docs/TODO.md` | FIX del PDF, datos faltantes, pendientes del usuario | continuo |
| `docs/BACKLOG.md` | Hallazgos fuera de alcance | continuo |
| `docs/DESIGN-SYSTEM.md` | Tokens, tipografías, componentes, responsive | S0 y al añadir componentes |
| `docs/ASSETS.md` | Tabla de slots de media y cómo reemplazarlos | al tocar media |
| `docs/VIDEO.md` | Decisión auto-alojado, comandos ffmpeg, presupuestos | S2 |
| `docs/PERFORMANCE.md` | Lighthouse por ruta, peso de `dist/` | S8 y al final |
| `docs/SITE-CONTEXT.md`, `docs/VIDEO-BRIEF.md`, `docs/SHOTLIST.md` | Paquete para el video de Higgsfield | S10 |
| `docs/DEPLOY.md` | Publicación (Cloudflare Pages / Netlify / Vercel / GitHub Pages) + límites de tamaño para videos | S10 |
| `README.md` | Qué es, stack, comandos, cómo editar textos y reemplazar media, cómo desplegar | S0 y al final |

---

## 18. DEFINITION OF DONE DEL PROYECTO

- [ ] `bunx astro check` y `bun run build` limpios; `preview` sin errores en consola.
- [ ] **Todas** las rutas con nav (estado activo + submenús funcionales) y footer.
- [ ] Fidelidad visual alta respecto al PDF, con las páginas 9–13 como referencia final.
- [ ] Copy exacto de §9 en `src/data/content.ts`; cero texto hardcodeado en componentes.
- [ ] Contador al 27 de marzo de 2027, sin CLS, pausado fuera de foco.
- [ ] Los 2+ videos: auto-alojados, sin descargar nada hasta entrar al viewport, autoplay silenciado, pausa al salir, respetan reduced-motion y save-data.
- [ ] Todos los slots de media son placeholders reemplazables por nombre de archivo, con proporciones correctas y documentados en `docs/ASSETS.md`.
- [ ] Lighthouse móvil ≥95 en las 4 categorías en `/`, `/patrocinios` y `/participaciones` como mínimo.
- [ ] Cero requests a terceros.
- [ ] Navegación por teclado y con lector de pantalla verificada.
- [ ] Responsive verificado en 360 / 768 / 1440 / 1920 sin scroll horizontal.
- [ ] `docs/` completo, incluidos `SITE-CONTEXT.md`, `VIDEO-BRIEF.md`, `SHOTLIST.md` y capturas en `docs/media/`.
- [ ] `docs/TODO.md` y `docs/DECISIONS.md` con todas las discrepancias y pendientes del usuario.

---

## 19. PENDIENTES DEL USUARIO (registrar, no bloquear)

1. Moneda de los paquetes de patrocinio (MXN asumido).
2. Correo oficial: `aiche.gdl@gmail.com` (p.13) vs `hola@aichegdl.org` (p.8).
3. Sede de la regional: Louisiana (McNeese State University) vs "Texas" en dos slides.
4. Destino real del botón **Únete** (¿formulario, WhatsApp, Google Form?).
5. Nombres y cargos de la mesa directiva (6 personas).
6. ¿Habrá logos de patrocinadores actuales que mostrar?
7. Dominio final del sitio (para `site` en `astro.config.mjs`, canonical y sitemap).
8. Videos e imágenes definitivos (los sustituye el usuario sobre los placeholders).

---

# ADENDA FASE 2 (vigente sobre cualquier regla anterior que la contradiga)

## A1. El PDF es el criterio de aceptación, no una referencia

`design/landing.pdf` define el resultado. Cada diferencia entre el sitio y el PDF es un
defecto hasta que se justifique por escrito como adaptación deliberada (responsive,
accesibilidad o limitación técnica real). "Se parece bastante" no es un criterio.

El lienzo de diseño es **1920×1080 (16:9)**: es la referencia de fidelidad en escritorio.

## A2. Mejora progresiva obligatoria

Con JavaScript deshabilitado, **todo el contenido debe verse y leerse**. Ninguna
animación, reveal o transición puede ser la condición para que un texto exista.

Patrón obligatorio para el reveal: el estado por defecto es **visible**. El script añade
una clase al `<html>` (p. ej. `js-reveal`) y solo entonces el CSS oculta y anima. Si el
script falla o no llega a ejecutarse, la página se ve completa.

Cada script de cliente se protege de forma independiente: si el elemento que busca no
existe, sale sin lanzar. Una excepción en un módulo no puede tumbar a los demás.

## A3. Sistema de pantalla (fit-to-viewport)

Las secciones que en el PDF ocupan una diapositiva completa deben ocupar **una pantalla
completa**, sin que el contenido se corte ni obligue a hacer scroll dentro de la sección.

Reglas:
- Componente único `layouts/Screen.astro` (o `ui/Screen.astro`). Ninguna página define
  altura de pantalla por su cuenta.
- Altura: `min-height: 100svh` (estable en móvil), nunca `height: 100vh` fija. `dvh` solo
  si se justifica el reflow al ocultarse las barras del navegador.
- **Escalado proporcional al lienzo 1920×1080.** El contenedor de pantalla define su
  propio `font-size` en función de la dimensión limitante, y todo lo de dentro
  (tipografía, espaciado, tamaños de caja) se expresa en `em` para escalar en bloque:

```css
  .screen {
    /* 16px a 1920 de ancho = 0.833vw · 16px a 1080 de alto = 1.481vh */
    font-size: clamp(0.72rem, min(0.833vw, 1.481vh), 1.15rem);
  }
```

  `min()` hace que mande la dimensión que se queda corta; `clamp()` evita texto
  ilegible en pantallas muy pequeñas o gigantes.
- **Válvula de escape**: si a un breakpoint el contenido no cabe ni al mínimo de escala,
  la sección **crece y deja fluir el scroll**. Cortar contenido está prohibido; hacer
  scroll es preferible a un texto ilegible o recortado.
- Prohibido `overflow: hidden` para "arreglar" un desbordamiento: eso oculta el defecto
  en lugar de resolverlo.
- Verificación obligatoria en 1920×1080, 1600×900, 1440×900, 1366×768 y 1280×720, más
  móvil. 1366×768 es el caso duro: es donde revienta el escalado mal hecho.

## A4. Arquitectura por capas (no MVC)

MVC no encaja en un generador estático: no hay controladores ni ciclo de petición, el
"controlador" es el build. La separación correcta aquí es por capas, con dependencias en
**una sola dirección**:


Reglas de higiene:
- Un concepto, un componente, un nombre. Nada de pares casi idénticos.
- Ningún dato duplicado entre archivos de `data/`: una sola definición de la fecha del
  evento, del correo, del nombre de la sede.
- Ningún componente en `sections/` que no se use.
- Si un componente supera ~150 líneas o mezcla dos responsabilidades, se parte.

## A5. Verificar, no heredar

Los reportes y bitácoras de las sesiones S0–S10 son **afirmaciones sin verificar**. Las
métricas de rendimiento, los presupuestos y los criterios que se dieron por cumplidos se
vuelven a medir en esta fase. Si un número no coincide con lo documentado, se corrige la
documentación y se dice.
