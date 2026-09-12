# Sistema de diseño — AIChE GDL

> Documentación viva de tokens, tipografías, superficies y layout.
> Se actualiza cuando se añaden componentes o se modifican tokens
> (RULES §5, §17).

## 1. Colores

Tokens exactos del PDF (RULES §5.1). Definidos en `src/styles/global.css`
con la directiva `@theme` de Tailwind 4.

| Token | Hex | Uso | Origen |
|---|---|---|---|
| `navy` | `#123f72` | Fondos y botones principales | RULES §5.1 |
| `navy-900` | `#0d2f57` | Fondo base de las páginas navy y final del degradado | RULES §5.1 · medido `#0b2e54` en las p.9-14 |
| `navy-700` | `#1a4f8a` | Parada intermedia del degradado del fondo insignia | RULES §5.1 · medido `#1b5c96` a 0.32 del radio |
| `navy-500` | `#2e86c6` | Bloque «Únete», subrayado del item activo, cima del degradado | **F4** · medido en el bloque Únete de las p.10-14 y en las etiquetas FECHA/SEDE de la p.7 |
| `navy-400` | `#4a8fd4` | Hover y acento claro | RULES §5.1 |
| `navy-200` | `#8fc7ea` | Etiquetas cortas sobre fondo oscuro, bordes de caja (contador, cajas de la p.6 en el home), punto de las chapas | **F4** · medido en DÍAS/HORAS/MIN/SEG (p.1), en el borde de las cajas del contador y en los eyebrows de las p.10-14 |
| `chrome` | `#d0d4d7` | Superficie de la barra de navegación | **F4** · medido en las p.10, p.13 y p.14 |
| `chrome-ink` | `#0e2033` | Texto de los items del nav y de la línea legal del footer | **F4** · medido en las p.1 y p.9 |
| `cream` | `#f4f1e9` | Footer, sección "La competencia", secciones claras | RULES §5.1 |
| `ink` | `#000000` | Texto sobre fondos claros | RULES §5.1 |
| `white` | `#ffffff` | Texto sobre fondos oscuros | RULES §5.1 |

**Reglas:**
- Solo se permiten derivaciones de `#123f72`. Cada nueva derivación se documenta aquí.
- No se introducen colores de marca nuevos. Los cuatro tokens añadidos en F4 no
  son invenciones: son **muestras del propio PDF**, y `chrome`/`chrome-ink` son
  superficie de chrome, no color de marca.
- Bordes sobre navy: `1px navy-200` (medido en el contador de la p.1 y en las
  cajas de la p.6; el valor anterior, `rgba(255,255,255,.25)`, no coincidía).
- Bordes sobre crema: `1px rgba(18,63,114,.2)`.

## 2. Tipografía

| Rol | Familia | Stack | Webfont |
|---|---|---|---|
| Principal | **Segoe UI** | `"Segoe UI", Arial, Helvetica, sans-serif` | No (sistema) |
| Secundaria | **Libre Baskerville Italic** | `"Libre Baskerville", Georgia, "Times New Roman", serif` | **Sí** — único, 400-italic, latin |
| Terciaria | **Arial** | `Arial, Helvetica, sans-serif` | No (sistema) |

**Reglas (RULES §5.2):**
- Libre Baskerville es la única webfont; `font-display: swap`.
- Segoe UI y Arial son de sistema → cero descargas.
- **La pila no lleva `system-ui`** (F5b, D-137). Donde no hay Segoe UI,
  `system-ui` resuelve a DejaVu Sans en Linux y ensancha el texto un **18,6 %**:
  «Tu patrocinio nos» ocupaba 703px en vez de los 595 del diseño y los títulos
  rompían donde no debían en todo el sitio. Arial (Liberation Sans) se queda en
  **+2,7 %** de media y en **±1,5 %** en los cuerpos.
- Subset: solo `latin` (sin `latin-ext`).
- Utilidades semánticas en `global.css`:
  - `.eyebrow` — Arial uppercase, tracking **`0.30em`** (medido en F4: "F A L T A N"
    ocupa 85.7px a 15.6px de Arial Bold contra 62.4 de ancho natural). Variantes
    `.eyebrow-unit` (0.24em, unidades del contador) y `.eyebrow-tagline` (0.14em,
    bajada del nav). `ui/Eyebrow` aplica además `.t-eyebrow`: 15.6px sobre el
    lienzo, `navy-200` en fondo oscuro y `navy-700` en crema (unificado en F5).
  - `.quote-serif` — Libre Baskerville italic.
  - `.stat-num` — `font-variant-numeric: tabular-nums` para que el contador no salte de ancho.

### 2.1 Escala tipográfica (recalibrada en F4)

Los multiplicadores son los **tamaños medidos sobre el PDF a 1920×1080**
divididos por la base de 16px del lienzo. No es una escala genérica.

| Clase | Múltiplo | px a 1920 | Interlínea | Dónde se midió |
|---|---|---|---|---|
| `.h-hero` | 6.5875 | 105.4 | 1.053 | p.1 «AIChE GDL / Capítulo estudiantil» |
| `.h-display` | 5.25 | 84 | 1.07 | p.14 «¡TRABAJEMOS JUNTOS!» |
| `.h-section` | 4.625 | 74 | **0.89** | p.6 «Acerca de Nosotros» (p.10: 73px) |
| `.h-page` | 3.5 | 56 | 1.1 | p.13 «Conoce a nuestra mesa directiva y equipo» |
| `.h-card` | 2.94 | 47.1 | 1.15 | p.6 «Así se vive la experiencia AIChE GDL» |
| `.h-card-sm` | 2.04 | 32.7 | 1.13 | p.6 bajada del video |
| `.t-lead` | 1.33 | 21.3 | 1.549 | p.1 párrafo del hero |
| `.t-body` | 1.494 | 23.9 | 1.167 | p.6 cuerpo justificado |
| `.t-quote` | 2.306 | 36.9 | 1.003 | p.6 pregunta en Libre Baskerville |
| `.t-num` | 4.194 | 67.1 | 1 | p.1 cifras del contador |
| `.t-eyebrow` | 0.975 | 15.6 | — | p.1 FALTAN y eyebrows de las p.10-14 |
| `.t-label` | 0.9 | 14.4 | — | p.1 DÍAS / HORAS / MIN / SEG |
| `.t-tag` | 0.8 | 12.8 | — | p.10/p.11 PAQUETE N · N BENEFICIOS (F5b) |

Todas se derivan de `--screen-fs`, así que escalan en bloque con la pantalla
(ADENDA §A3). En móvil (`≤767px`) vuelven a una escala fluida por ancho.

> **Limitación conocida.** El PDF está compuesto en Segoe UI, que el sitio no
> puede descargar (RULES §5.2 y §12.2: una sola webfont, y es Libre Baskerville).
> En Windows el navegador la tiene; en otros sistemas la pila cae a la fuente de
> sistema, más ancha, y el número de líneas de los bloques largos puede cambiar.
> Desde F5b la pila cae a **Arial**, no a `system-ui`, y la divergencia baja de
> +18,6 % a +2,7 % en toda la ruta (D-137 — sustituye al parche local de D-136).
> Los cuerpos, interlíneas y medidas de línea siguen siendo los medidos sobre el
> PDF: **no se compensan encogiendo la tipografía**, porque en Windows la fuente
> del diseño sí existe. Diferencias residuales medidas en F5b: ±3 % en cuerpos,
> hasta +7 % en etiquetas con tracking. Ver `docs/sessions/F5-fidelidad-2.md`
> §F5b.1 y la adenda de `docs/sessions/F4-fidelidad-1.md`.

## 3. Superficies

- **Fondo insignia** (`GridBackdrop.astro`, remedido en F4/F5 sobre las p.10-14):
  - **Degradado radial elíptico**, no diagonal. El preset `brand` conserva el
    centro de F4 en x=55 %, y=46 % dentro de la pantalla; el preset `centered`
    usa x=50 % para las seis diapositivas de F5. Radios rx ≈ 1037 (54 %) y ry ≈
    497 (50 %). Paradas: `navy-500` 0 %, `navy-700` 32 %, `navy` 58 %,
    `navy-900` 100 %.
  - **Rejilla técnica** de celda **104px** sobre el lienzo (medida por los
    máximos locales de luminancia: x = 76, 180, 284, 388…), expresada como
    `calc(var(--screen-fs) * 6.5)` para que escale con la pantalla. Líneas de
    1px de blanco al 7 % (delta de luma medido 14.8 sobre una base de 42.9).
    F5 fija también la fase: x=76px, y=95px global, o y=15px dentro de la
    pantalla que empieza bajo el nav.
  - `tone="cream"` conserva la misma celda y fase, con líneas navy al 12 % y sin
    radial. Se usa en la p.12 real de Patrocinios.
  - Sigue siendo CSS puro: cero JS, cero imagen, cero SVG (RULES §5.3).
- Radio: **0 o ≤ 4 px**. Diseño rectilíneo.
- **Sombras** (token derivado de `navy`):
  - `--shadow-card`: `0 1px 0 rgb(18 63 114 / 0.15)` — línea fina navy al 15 % bajo cada tarjeta (SponsorTiers, p.10). Tokenizado en `src/styles/global.css → @theme`; genera automáticamente la utility `shadow-card` de Tailwind 4.

## 4. Layout (remedido en F4)

- **Lienzo 1920×1080.** El contenido va de x=96 a x=1826 en las páginas 10-14 del
  PDF: **1728px de caja con 96px de margen a cada lado**. En unidades base del
  lienzo, `--screen-canvas: 108` y `--screen-gutter: 6`.
  El `max-w-[1440px]` anterior dejaba 240px muertos a cada lado (desviación S-2
  de `docs/AUDIT-F2.md`).
- **Barra de navegación: 80px** (`--nav-h: 5rem`), medida en las p.10-14. Es la
  única chrome fija; la pantalla dispone de `100svh - 80px`.
- **Footer: 192px** (`--footer-h: 12rem`), medido en la banda crema de la p.9. Lo
  declara el propio `Footer.astro`.
- **Aire vertical de la pantalla: 8px** arriba y abajo. Las diapositivas del PDF
  llegan casi al borde; el aire de cada composición lo pone la sección.
- La **última pantalla de tipo `join-cta`** resta el alto del footer, porque en la
  p.9 el bloque «¡Súmate al capítulo!» y el footer **comparten diapositiva**.
- Escala tipográfica derivada de `--screen-fs` (§2.1).
- Mobile-first obligatorio: por debajo de **1280px** el lienzo 16:9 se desactiva (§4.2).

### 4.1 Geometría de las pantallas F5

| Pantalla | Composición medida a 1920×1080 |
|---|---|
| Participaciones, p.7 real | columnas 477 + 33 + 1197px; tarjeta 477×395; video 1197×677 |
| Southwest, p.8 real | una pantalla; bloques verticales 536 + 161 + 303px |
| Patrocinios hero, p.10 real | columnas 838 + 64 + 826px; imagen 826×683 |
| Beneficios, p.11 real | tres tarjetas 544×731px con huecos de 48px; imagen 544×177 |
| Competencia crema, p.12 real | columnas 824 + 75 + 824px; galería 3×544×300 |
| Contacto, p.14 real | columnas 838 + 67 + 826px; imagen 826×655 |

`MediaFrame.ratio` expresa la proporción visible cuando difiere de la imagen
intrínseca. La caja queda reservada y la imagen usa `object-fit: cover`, así que
el contrato de sustitución y CLS no cambia.

## 4.2 Los dos regímenes y cómo colapsa cada bloque (F6)

El sitio tiene **dos** composiciones y **una sola** frontera entre ellas:
`--breakpoint-canvas: 80rem` (**1280px**), que en el markup es el prefijo
`canvas:` y en `global.css` la media query `(min-width: 80rem)` / su
complemento exacto `not all and (min-width: 80rem)`.

| | Régimen **lienzo** (≥1280px) | Régimen **apilado** (<1280px) |
|---|---|---|
| Composición | la diapositiva del PDF, 16:9 | una columna |
| Escala | `--screen-fs` = `clamp(0.62rem, min(0.833vw, alto×0.016), 1.15rem)` | `--screen-fs` = `1rem` |
| Alto de sección | `min-height: 100svh − 80px` | `min-height: 0`, el scroll fluye |
| Caja de contenido | 108 unidades (1728px a 1920) con 6 de margen | 100 % hasta un techo de **52rem**, margen de 24px |
| Navegación | barra completa con submenús en `:hover`/`:focus-within` | hamburguesa + panel a pantalla completa |

**Por qué 1280 y no 768.** El lienzo pide 120 unidades de `--screen-fs`
(108 de contenido + 6+6 de margen). Mientras la escala vale `0.833vw`,
120 × 0.00833 × ancho ≈ el ancho entero y encaja por construcción. Pero por
debajo de **1191px** manda el suelo del `clamp()` (9.92px) y el lienzo pasa a
pedir 1190px fijos **haya el ancho que haya**. Entre 768 y 1190 eso producía las
dos cosas que F6 midió: barra de navegación de 1161px sobre viewports de 768 y
1024 (scroll horizontal en las 8 rutas) y etiquetas del diseño a **7.9–9.9px**.
1280 es el primer valor redondo por encima del límite y coincide con la
resolución mínima que ADENDA §A3 obliga a verificar con lienzo.

### Cómo colapsa cada bloque complejo

| Bloque | En el lienzo (≥1280) | Apilado (<1280) |
|---|---|---|
| **Nav** (`Nav`, `NavDropdown`) | INICIO + lockup + 4 items centrados + Únete al borde; submenús desplegables | INICIO + lockup + hamburguesa. El panel ocupa la pantalla, lista los tres padres **con sus hijos siempre visibles** (sin acordeón, D-138) y termina con Únete |
| **Hero** (`/`) | logo, título a 105px, párrafo y contador en 4 cajas | misma pila; el título pasa a `clamp(2.25rem…3.25rem)` y el contador a **2×2** cajas (`sm:grid-cols-4` recupera la fila única a partir de 640px) |
| **Acerca de nosotros** (p.6, en el home) | columna de texto de 502px + media a sangre de x=576 al borde y de arriba abajo | texto primero, media después, ambos a ancho completo. La media deja de ser `h-full`: **el overlay pasa a flujo normal y es él quien da la altura** (mín. 13rem), con el video estirado por detrás. El titular y la chapa de fecha dejan de ir en fila y se apilan |
| **Participaciones** (p.7, en el home y en `/participaciones`) | rejilla `32.1875em 80.5625em` de una fila, a sangre y a escala 1:1: tarjeta + panel a la izquierda, título + video a la derecha | orden de lectura: tarjeta de evento → panel de competencias → título → video. Alturas fijas (`canvas:h-*`) retiradas: cada bloque mide su contenido |
| **Southwest / La competencia** (p.8 y p.12) | bandas verticales con el recorte del coche superpuesto; galería de 3×544px | columna con `padding: 3rem 1.5rem`; los títulos pasan a `clamp(2rem, 7vw, 4rem)`, el recorte del coche a `min(22rem, 80vw)` en flujo y la galería a `grid-cols-1` (3 columnas desde 640px) |
| **Patrocinios hero** (p.10) | 2 columnas `52.4em 51.6em` + fila de 3 paquetes de 7.69em de alto | texto → imagen → paquetes en columna (3 columnas desde 640px). La etiqueta «TRES PAQUETES» pierde `shrink-0` para no arrastrar la pantalla si el copy crece |
| **Beneficios** (p.11) | 3 tarjetas de 34em con huecos de 3em, altura fija | 1 columna → **2 columnas desde 640px** → 3 en el lienzo. `sponsor-package-full` deja de tener altura fija |
| **Equipo** (p.13, en `/equipo`) | rejilla `838fr 825fr`: 6 retratos 3×2 a la izquierda, foto de grupo a la derecha | retratos primero en **2 columnas** (3 desde 640px), foto de grupo debajo |
| **Contacto** (p.14) | 2 columnas `52.375em 51.5625em`, título a 84px | título → datos → foto. `contact-value` pasa a `clamp(1.5rem, 7vw, 2.5rem)` y se retiran los `translateY` de ajuste fino del lienzo |
| **Footer** | lockup a la izquierda, línea legal a la derecha, margen de 96px | apilado y centrado por debajo de 640px; en fila desde 640px, con margen de 24px |
| **CTA «¡Súmate al capítulo!»** | comparte diapositiva con el footer y le resta 192px | `min-height: 0`; el footer va detrás con normalidad |

### La p.7 no usa la caja de contenido (F6b)

Es la única diapositiva con su propia caja: compone de **x=35 a x=1878**, casi a
sangre, y no respeta el margen de 96px del resto del sitio. Meterla dentro de la
caja de 1728px obliga a escalar toda la composición por 1728/1843 = 0.938, que
es lo que hacía F5 y lo que el usuario percibió como «más pequeño y centrado».

Verticalmente cabe a 1:1: su contenido mide 1003px y el nav obligatorio deja
1000, así que sólo se recortan 3px de aire. La geometría completa, en unidades
de `--screen-fs`, está documentada en la cabecera de
`sections/ParticipationsOverview.astro`.

Corolario práctico: **cuando un número es una medida del lienzo, se escribe
`calc(var(--screen-fs) * k)`, nunca en `em`.** `em` se resuelve contra el cuerpo
del propio elemento, así que un «1.5 unidades» sobre un párrafo de 26.6px acaba
valiendo 40px en vez de 24 (D-157).

### Reglas que hacen que esto no se rompa

1. **`--screen-fs` es la única palanca de escala.** En el régimen apilado se
   redefine a `1rem` en `:root`, **sin capa** — dentro de `@layer components`
   perdería contra el `:root` sin capa que declara el token. De ahí cuelgan
   `--text-*`, `--container-*`, `--spacing` y todas las utilidades del diseño
   (`.h-*`, `.t-*`, `.about-*`, `.sponsor-*`, `.contact-*`…). Antes cada una
   necesitaba su excepción a mano y las que faltaban se quedaban en 7.9px.
2. **Suelo de legibilidad de 11px** en `.t-eyebrow`, `.t-label` y `.t-tag`
   (`max(0.6875rem, …)`), igual que `--text-xs`/`--text-sm`. A 1920 los tres
   valores nominales están por encima y el `max()` no interviene: la fidelidad
   del lienzo de referencia no se toca.
3. **`overflow-wrap: anywhere` en `body`.** Ninguna palabra puede romper la
   composición. `anywhere` y no `break-word` porque sólo el primero reduce el
   tamaño *min-content*, que es lo que flex y grid usan para decidir cuánto
   encoge un hijo.
4. **`min-w-0` en vez de `shrink-0`** en las etiquetas que acompañan a un filete
   o a un titular.
5. **Excepción documentada a la regla 3:** `.competition-tag` lleva
   `overflow-wrap: normal`. Son etiquetas cortas y fijas («SPRING», «OPEN
   CALL», «2027»), cada palabra en su propio `<span>`, dentro de una caja
   dimensionada para la más larga. Con `anywhere` se leía «SPRIN / G» (D-158).

## 5. Clasificación del PDF (RULES §4)

Inspección visual de las 14 páginas rasterizadas en `.cache/design-pages/`:

| Pág PDF | Contenido | Acción | Coincide con RULES §4 |
|---|---|---|---|
| 1 | Hero AIChE GDL + nav | **Implementar** | p.1 |
| 2 | Anotaciones Vista 1 (Noche Retro 2026) | NO | p.2 |
| 3 | Anotaciones: tipografías + colores | NO | p.3 |
| 4 | Anotaciones: identidad visual (logo + wordmark) | NO | p.4 |
| 5 | Anotaciones: logo duplicado (sin wordmark) | NO | — |
| 6 | Acerca de Nosotros + video HIGHLIGHTS | **Implementar** | p.5 |
| 7 | Participaciones + tarjeta próximo evento | **Implementar** | p.6 |
| 8 | ¿Qué es la SWSRC? versión azul | **Implementar** | p.7 |
| 9 | ¡Súmate al capítulo! + footer crema | **Implementar** | p.8 |
| 10 | Patrocinios — Tu patrocinio nos lleva a competir | **Implementar** | p.9 |
| 11 | Patrocinios — Qué recibe tu empresa | **Implementar** | p.10 |
| 12 | La competencia versión crema | **Implementar** | p.11 |
| 13 | Mesa directiva y equipo | **Implementar** | p.12 |
| 14 | Contacto ¡TRABAJEMOS JUNTOS! | **Implementar** | p.13 |

**Nota importante (D-009):** la numeración del PDF está desordenada respecto a RULES §4. El contenido es el mismo; el orden de las páginas en el PDF no. Las páginas 9–14 del PDF son la referencia final de fidelidad (RULES §4 jerarquía).

## 6. Arquitectura por capas (ADENDA §A4) — actualizado en F3

MVC no encaja en un generador estático: no hay controladores ni ciclo de
petición, el "controlador" es el build. La separación aquí es **por capas, con
dependencias en una sola dirección**.

```
data/       Fuente de verdad. Datos y copy tipados. No importa nada de UI.
   ↑
ui/         Primitivas sin dominio (Button, Card, Screen, Logo…).
media/      Primitivas de imagen y video (Img, MediaFrame, LazyVideo…).
   ↑
sections/   Bloques con dominio. Consumen data/ y componen ui/ + media/.
layout/     Chrome del sitio (Nav, Footer, SkipLink, MobileMenu).
   ↑
layouts/    Chrome de página: head, nav, footer, slot.
   ↑
pages/      Composición y SEO. Sin estilos propios más allá del orden.

scripts/    Comportamiento de cliente. Un módulo por responsabilidad,
            aislado (IIFE + try/catch). Nadie lo importa salvo layouts/
            y el componente dueño de su comportamiento.
```

### Reglas verificadas automáticamente

`bun run check:layers` (`scripts/check-layers.mjs`) recorre los imports reales y
falla si se rompe alguna:

| Regla | Por qué |
|---|---|
| `ui/` no importa **valores** de `data/` | Una primitiva atada a un dato concreto no es reutilizable y crea una dependencia hacia arriba |
| `sections/` no importa `sections/` | Lo compartido entre secciones se sube a `ui/` y se parametriza |
| `sections/` no importa `layout/` | El chrome lo monta `layouts/`; lo compartido va a `ui/` |
| `data/` no importa nada de UI | Es la fuente de verdad, no puede depender de cómo se pinta |
| `ui/` no importa `sections/` | La dirección es `sections → ui`, nunca al revés |
| `layouts/` no importa `sections/` | `layouts/` es el chrome de página; las secciones las compone `pages/` |

**Matiz sobre los tipos.** `ui/` **sí** puede hacer `import type` desde `data/`.
Un tipo desaparece en el build y no crea dependencia en tiempo de ejecución; la
alternativa —redeclarar la forma del dato dentro del componente— sería
duplicación, justo lo que §A4 quiere evitar. Hoy son cuatro imports en tres
componentes: `ui/Logo` (`ImageAsset`), `ui/CompetitionList` (`Competition`) y
`ui/PackageCard` (`SponsorTier`, `ImageAsset`).

### Responsabilidad de cada archivo de `data/`

Cada dato se define **una sola vez** y tiene **un solo camino de import**.

| Archivo | Responsabilidad | Ojo |
|---|---|---|
| `event.ts` | **Fuente única del evento**: fecha ISO, nombre, sede, fecha legible y etiquetas | Cambiar la fecha o la sede aquí se propaga al contador, al JSON-LD, a las filas FECHA/SEDE/UBICACIÓN y a la prosa |
| `site.ts` | Identidad del sitio, URLs, contacto, SEO por defecto | **No** contiene datos del evento |
| `content.ts` | El **texto visible**, y sólo eso | No re-exporta datos de otros módulos (se eliminó en F3) |
| `competitions.ts` | Lista canónica de las 4 competencias | |
| `sponsors.ts` | Paquetes de patrocinio, moneda y paquete destacado | La moneda sigue pendiente P-001; las tarjetas no generan `mailto` |
| `team.ts` · `media.ts` · `nav.ts` · `seo.ts` | Equipo · manifiesto de medios · mapa del menú · JSON-LD | |

## 7. Componentes

| Capa | Componentes |
|---|---|
| `ui/` | `Screen`, `Button`, `Card`, `Badge`, `Eyebrow`, `DataRow`, `SectionTitle`, `GridBackdrop`, `Reveal`, `Countdown`, `ContactActions`, `CompetitionList`, `EventCard`, `PackageCard`, `Logo` |
| `media/` | `Img`, `MediaFrame`, `LazyVideo`, `VideoHighlight` |
| `layout/` | `Nav`, `NavDropdown`, `MobileMenu`, `Footer`, `SkipLink` |
| `sections/` | `Hero`, `About`, `ParticipationsOverview`, `CompetitionInfo`, `SponsorHero`, `SponsorTeaser`, `SponsorTiers`, `TeamGrid`, `ContactBlock`, `JoinCta` |
| `layouts/` | `Layout` |

**`Screen` es el único componente que define alto de pantalla y escala**
(ADENDA §A3, sesión F2). `ui/Section.astro` fue eliminado.

## 8. Próximos pasos documentados

- Confirmar dominio real (D-003, P-005) — afecta canonical, sitemap y OG.
- Confirmar moneda de paquetes (P-001) — afecta copy y `sponsors.ts`.
- Confirmar nombres de mesa directiva (P-002) — afecta `team.ts` y la página `/equipo`.
