# F4 — Fidelidad al PDF: Inicio, Acerca y Equipo

**Fecha:** 2026-08-20 · **Estado:** COMPLETA
**Alcance:** el hero de `/`, la página `/acerca`, la página `/acerca/equipo` y el
CTA de cierre de `/` (con su footer), contra `design/landing.pdf` (ADENDA §A1).

**Gates al arrancar:** verde (`bunx astro check` 0/0/0, `bun run build` 8 páginas).
**Gates al cerrar:** verde. Detalle en §7.

---

## 0. Método

Todo lo que sigue está **medido**, no estimado.

1. **Rasterizado del PDF a 1920×1080 exactos**
   `pdftoppm -png -r 96 -scale-to-x 1920 -scale-to-y 1080 design/landing.pdf .cache/design-1920/p`
   (`design/` sigue siendo solo lectura, RULES §1.2; la salida va a `.cache/`).
2. **Extracción de métricas tipográficas.** Las páginas 1-9 del PDF son
   vectoriales: `mutool draw -F stext` devuelve, glifo a glifo, la familia, el
   cuerpo, el color y la caja. De ahí salen todos los tamaños de esas páginas
   sin margen de interpretación.
3. **Medición por píxel** de lo que no es texto (cajas, filetes, chapas,
   fotos, rejilla, degradado) y de las páginas 10-14, que son **mapas de bits**
   (2880×1620) y no tienen texto extraíble. Ahí el cuerpo se deduce de la altura
   de caja alta dividida por 0.702 (relación cap-height/em de Segoe UI Bold,
   calibrada contra dos casos conocidos de las páginas vectoriales: la p.1 a
   105.4px da 74px de caja alta y la p.6 a 74px da 52px).
4. **Captura de la implementación** a 1920×1080 con Playwright y
   `reducedMotion: 'reduce'`, y **medición del DOM** (`getBoundingClientRect` +
   `getComputedStyle`) para comparar cifra contra cifra, no "a ojo".
5. Iteración hasta que la única diferencia fuese contenido placeholder o quedase
   justificada por escrito (§6).

### 0.1 Correspondencia de páginas

`RULES §4` numera 13 páginas y el PDF tiene 14. La correspondencia real,
verificada abriendo cada página, es:

| RULES / usuario | PDF real | Ruta |
|---|---|---|
| p.1 | **p.1** | `/` (hero) |
| p.5 | **p.6** | `/acerca` |
| p.6 | **p.7** | `/participaciones` (F5) |
| p.7 | **p.8** | `/participaciones/southwest-2027` (F5) |
| p.8 | **p.9** | CTA de cierre + footer |
| p.9 · p.10 · p.11 | p.10 · p.11 · p.12 | `/patrocinios` (F5) |
| p.12 | **p.13** | `/acerca/equipo` |
| p.13 | p.14 | `/contacto` (F5) |

En esta bitácora **los números son los del PDF real**. El desfase ya estaba
anotado como D-009 y se confirma aquí.

### 0.2 Los videos

El usuario indicó que los videos van "en las páginas que muestran los slides 6 y
7 del PDF". La evidencia del propio archivo lo resuelve sin ambigüedad: bajo la
foto de la **p.6** hay un rótulo oculto —recuperado con `mutool draw -F stext`—
que dice **`ESPACIO PARA EL VIDEO · 16:9`**. Esa página es `/acerca`, y la
siguiente diapositiva de contenido es la p.7, `/participaciones`. Así que:

- `/acerca` → video (ya montado, `media.aboutVideo`; el archivo sigue siendo el
  stub de 20 B de M-001).
- `/participaciones` → video, **pendiente: lo monta F5** (anotado como M-005 en
  `docs/TODO.md`).

Ninguna otra página del PDF lleva rótulo de video.

---

## 1. Correcciones sistémicas (afectan a todo el sitio)

### 1.1 Las seis desviaciones de `docs/AUDIT-F2.md` §2.0

| # | Desviación de la auditoría | Resultado en F4 |
|---|---|---|
| **S-1** | Inversión tonal (páginas navy renderizadas sobre crema) | **Corregida** para el alcance de F4: `/acerca/equipo` pasa a navy a sangre. `/acerca` ya se había corregido en F3. |
| **S-2** | Composiciones encerradas en `max-w-[1440px]` sobre un lienzo de 1920 | **Corregida.** Medido en las p.10, p.13 y p.14: el contenido va de x=96 a x=1826, o sea **1728px de caja con 96px de margen**. `--screen-canvas` pasa de 90 a 108 unidades base y `.screen` gana `--screen-gutter` de 6. |
| **S-3** | "La barra del PDF es navy con la pestaña Inicio en crema" | **La auditoría se equivocó** (§A5). La barra del PDF es un **gris neutro claro** —muestreado `#ced2d5`…`#d0d4d7` en las p.10, p.13 y p.14— con el bloque INICIO en navy y el de Únete en azul. Lo implementado (barra clara, INICIO navy) era lo correcto en estructura; lo que estaba mal eran el tono exacto (crema en vez de gris), la tipografía y las medidas. Corregido en §1.3. |
| **S-4** | Escala tipográfica menor que el PDF | **Corregida.** Toda la escala se recalculó a partir de medidas (§1.2). |
| **S-5** | El isotipo dibujado no reproduce el hexágono de capas | **Corregida.** Se usa el **isotipo real**: `design/aiche_logo.svg` copiado a `public/media/logo/aiche-gdl-isotipo.svg`. Coincide con el del PDF (proporción 149×172 = 0.866, la del hexágono regular; medido en la p.1: 148×170). |
| **S-6** | Ninguna sección ocupa una pantalla | Resuelta en F2. En F4, `/acerca/equipo` pasa de **dos** pantallas (una para el título, otra para las fotos) a **una**, que es lo que es en el PDF. |

### 1.2 Hallazgos nuevos de F4

| # | Medida en el PDF | Antes | Ahora |
|---|---|---|---|
| N-01 | Alto de la barra de navegación: **80px** (y 0..79 en las p.10-14) | 65px (`--nav-h: 4.0625rem`) | `--nav-h: 5rem` |
| N-02 | Coeficiente vertical de la escala de pantalla | `--screen-h × 0.014815` (16/1080) | `× 0.016` (16/1000). El nav se come 80 de los 1080, así que la diapositiva dispone de **1000px**, no de 1080. Con el valor viejo la escala salía a **14.8px** en vez de 16 y toda la página se quedaba un 7.5 % corta. Se vio en la primera comparación. |
| N-03 | Celda de la rejilla técnica: **104px** (máximos locales de luminancia en las p.1 y p.13 a x = 76, 180, 284, 388… → paso 104) | 96px fijos, sin escalar | `calc(var(--screen-fs) * 6.5)` — escala con el lienzo |
| N-04 | Fondo: **degradado radial elíptico**, centro (1056, 540), rx ≈ 1037, ry ≈ 497, de `#2e86c6` a `#0b2e54` | `linear-gradient(135deg, …)` diagonal inventado | Radial elíptico `54% 50% at 55% 46%` con cuatro paradas medidas. Verificación numérica en §5.3 |
| N-05 | Tracking de las etiquetas cortas: **0.30em** ("F A L T A N" mide 85.7px a 15.6px de Arial Bold, cuando su ancho natural es 62.4px → 4.66px por hueco; "ACERCA DE NOSOTROS" de la p.13 da lo mismo) | 0.18em | `.eyebrow { letter-spacing: 0.3em }`, con `.eyebrow-unit` (0.24em, unidades del contador) y `.eyebrow-tagline` (0.14em, bajada del nav) |
| N-06 | Cuatro colores del PDF que no estaban en la paleta | — | `navy-500 #2e86c6` (bloque Únete, subrayado activo, cima del degradado), `navy-200 #8fc7ea` (etiquetas y bordes de caja sobre navy), `chrome #d0d4d7` (superficie del nav), `chrome-ink #0e2033` (texto del nav). Documentados en `docs/DESIGN-SYSTEM.md` |
| N-07 | Padding vertical de la pantalla | `py-12 md:py-16` (48/64px fijos) | `calc(var(--screen-fs) * 1.5)` → **8px** arriba y abajo. Las diapositivas del PDF llegan casi al borde: la p.6 ocupa 990 de sus 1080px |
| N-08 | La p.9 **comparte diapositiva** entre el bloque "¡Súmate al capítulo!" (0..831) y el footer crema (833..1024, **192px**) | El footer iba siempre por debajo de una pantalla completa y nunca se veía sin scroll | `--footer-h: 12rem` lo declara el Footer, y `global.css` hace que **sólo** la pantalla `join-cta` final reste ese alto. Las demás diapositivas siguen ocupando la pantalla entera |

**Nota sobre el nav (§A5).** `docs/BACKLOG.md` afirmaba que "en el PDF la barra
ocupa ~4,3 %" de la altura. Es incorrecto: mide 80 de 1080 = **7,4 %**. La barra
implementada (65px = 6 %) era la que se quedaba corta, no al revés.

### 1.3 Barra de navegación, reconstruida (p.10 · p.13 · p.14)

| Elemento | Medida del PDF | Implementado |
|---|---|---|
| Alto de la barra | 80px + 1px de filete | `h-[var(--nav-h)]` + `border-b` |
| Superficie | `#d0d4d7` plano (no crema, no degradado) | `bg-chrome` |
| Bloque INICIO | x 0..99 (100px), navy, **icono de casa encima de la etiqueta**, "INICIO" en Arial Bold ~12.6px con tracking | `w-[6.25rem]`, `flex-col`, `.eyebrow text-[0.7875rem]` |
| Isotipo | teja clara de ~56px con el hexágono dentro, x 128..184 | `h-14 w-14 bg-white/45` con `<Logo size={38}>` |
| Wordmark | "AIChE GDL" 22.8px bold, navy, línea base y=39 | `text-[1.425rem] font-bold text-navy` |
| Bajada | "TEC DE MONTERREY · CAMPUS GUADALAJARA" 13.2px, gris, tracking 0.14em | `.eyebrow .eyebrow-tagline text-[0.825rem] text-ink/55` |
| Items | Arial Bold **15.6px**, `#0e2033`, **caja y baja** (no versalitas), hueco de 40px, con "+" en los que tienen submenú | `font-ui text-[0.975rem] font-bold`, `gap-10` |
| Posición del grupo de items | centrado en el hueco entre la identidad (termina en 582) y Únete (empieza en 1786): 312px a cada lado | `flex-1 justify-center` |
| Item activo | filete de **3px** en `#3086ca` a 13px del borde inferior | `after:` a `bottom-[0.8125rem] h-[3px] bg-navy-500` |
| Bloque Únete | x 1786..1919 (134px), `#2e86c6`, "Únete" caja y baja | `w-[8.375rem] bg-navy-500` |

---

## 2. Hero de `/` ← p.1 del PDF

Datos de partida (`mutool draw -F stext`, ya convertidos al lienzo de 1920):

```
isotipo            148×170,  y 154..323
h1  «AIChE GDL»    SegoeUI-Bold 105.4px, líneas base 459.2 y 570.2 → interlínea 111
párrafo            SegoeUI 21.3px, interlínea 33, medida 921px, centrado, 5 líneas
«FALTAN»           Arial-BoldMT 15.6px, blanco, tracking 0.30em
cajas del contador 181×138, hueco 16, y 834..971, borde #8fc7ea, relleno blanco 8 %
cifras             Arial-BoldMT 67.1px, blanco
unidades           Arial-BoldMT 14.4px, #8fc7ea, tracking 0.24em
«¡PARA NUESTRA…!»  Arial-BoldMT 15.6px, blanco, tracking 0.30em, caja alta y=993
```

| # | Diferencia detectada | Corregida / justificada |
|---|---|---|
| H-01 | Isotipo: galón geométrico inventado de 88px | **Corregida** — isotipo real a 148px (`size={148}`, `eager` por ser candidato a LCP) |
| H-02 | h1 a 5.25 unidades (84px) con interlínea 1.05 | **Corregida** — `.h-hero` = 6.5875u = **105.36px**, interlínea 110.94 (objetivo 105.4 / 111) |
| H-03 | Párrafo `max-w-3xl` con `text-base md:text-lg` | **Corregida** — `.t-lead` (21.27px, interlínea 32.95) y `max-w-[43.24em]` = **920px** (objetivo 921) |
| H-04 | Cajas del contador con relleno `navy-900/40` y borde `white/25`, ancho `max-w-2xl` | **Corregida** — 4 × **181×138** con hueco de 16 y borde `navy-200`: medido x 574..1345 contra 575..1344 del PDF |
| H-05 | Cifras `text-4xl md:text-6xl` en la fuente de texto | **Corregida** — `.t-num` (67.08px) en `font-ui` (Arial), como el PDF |
| H-06 | Unidades DÍAS/HORAS/MIN/SEG en `text-cream` a 12px | **Corregida** — `.t-label` 14.39px, `navy-200`, tracking 0.24em |
| H-07 | "FALTAN" y "¡PARA NUESTRA PRÓXIMA COMPETENCIA!" a 12px, crema, tracking 0.18em | **Corregida** — 15.59px, blanco, tracking 4.68px (0.30em) |
| H-08 | Ritmo vertical sin relación con el PDF | **Corregida** — huecos derivados de las líneas base medidas: 42 / 25 / 18 / 15 / 16px, expresados en unidades de pantalla |
| H-09 | Fondo diagonal y rejilla de 96px | **Corregida** — §1.2 N-03 y N-04 |
| H-10 | El párrafo ocupa **6 líneas** en vez de 5 | **Justificada** — sustitución de fuente, ver §6.1 |

**Verificación DOM a 1920×1080** (escala efectiva 15.99px):

| Elemento | PDF | Implementado |
|---|---|---|
| isotipo | 148×170 en y=154 | 148×171 en y=137 (§6.1) |
| h1 | 105.4px / 111 de interlínea | 105.36 / 110.94 |
| párrafo | x 499.5, ancho 921, 21.3px / 33 | x 500, ancho 920, 21.27 / 32.95 |
| cajas | x 575, 772 de ancho total, 138 de alto | x 574, 772, 138 |

---

## 3. `/acerca` ← p.6 del PDF

Datos de partida:

```
columna de texto   502px (x 40..542 en el PDF)
asterisco          110×113, ocho brazos rectos de extremo plano
título             SegoeUI-Bold 74px, interlínea 65 (0.878) — muy apretado a propósito
caja pregunta      502×167, borde 1px #8fc7ea, relleno 28, Libre Baskerville Italic 36.9px centrada
caja cuerpo        502 de ancho, misma caja, raya de 57×5 arriba, cuerpo SegoeUI 23.9px
                   interlínea 27.9 justificado, medida 435
panel de video     rótulo oculto «ESPACIO PARA EL VIDEO · 16:9»
chapa HIGH LIGHTS  211×47, punto + Arial Bold 16px, esquina superior izquierda
titular            Arial Bold 47.1px, abajo a la izquierda
bajada             Arial Italic 32.7px, dos líneas, interlínea 37
chapa de fecha     195×37, esquina inferior derecha
```

| # | Diferencia detectada | Corregida / justificada |
|---|---|---|
| A-01 | Dos columnas 1fr/1fr, ambas centradas verticalmente | **Corregida** — `502fr / 1162fr` con hueco de 64px, alineadas arriba. Medido: 502 + 64 + 1162 = 1728 exactos |
| A-02 | Falta el asterisco a la izquierda del título | **Corregida** — cuatro barras cruzadas de extremo plano (ampliando el original a 2× se ve que no es una estrella de puntas), 110×113 |
| A-03 | Título a `.h-section` de 3 unidades (48px) con interlínea 1.15 | **Corregida** — 4.625u = **73.97px**, interlínea **65.83** (0.89) |
| A-04 | La pregunta va suelta, sin caja | **Corregida** — caja de 502×169 (PDF: 167) con borde `navy-200` y relleno de 28 |
| A-05 | El cuerpo va suelto, sin justificar | **Corregida** — segunda caja con la misma caja, raya de 57×5 arriba, cuerpo justificado a 23.89px / 27.88 |
| A-06 | El video es un rectángulo con el badge arriba y el titular debajo, todo apilado dentro del flujo | **Corregida** — overlay absoluto sobre el panel 16:9: chapa arriba a la izquierda, titular + bajada abajo a la izquierda, chapa de fecha abajo a la derecha, con 46px de margen interno |
| A-07 | Titular del video a `.h-card` de 2u (32px) y bajada en Libre Baskerville | **Corregida** — titular 2.94u = **47px** en Arial, bajada 2.04u = **32.7px** en Arial cursiva, como el PDF |
| A-08 | Fondo navy plano | **Corregida** — rejilla + radial |
| A-09 | La foto sangra hasta el borde derecho y ocupa la pantalla completa de alto | **Justificada** — RULES §4 manda adaptar los márgenes de las diapositivas al lenguaje de las p.10-14, que respetan los 96px. La proporción 16:9 la impone el propio rótulo del PDF |
| A-10 | El título ocupa **3 líneas** en vez de 2 y el cuerpo **22** en vez de 20 | **Justificada** — sustitución de fuente, §6.1 |
| A-11 | La sección **desborda la pantalla** (+135px a 1920×1080) | **Justificada** — §6.2 |
| A-12 | La chapa dice `HIGHLIGHTS` y el PDF `HIGH LIGHTS` | **Justificada** — RULES §9.2 es la autoridad de copy (regla 7). Anotado como F-06 en `docs/TODO.md` para que lo confirme el usuario |

---

## 4. `/acerca/equipo` ← p.13 del PDF

La p.13 es un mapa de bits, así que todo se midió por píxel:

```
fondo              navy a sangre con rejilla y radial
eyebrow            «ACERCA DE NOSOTROS» x=97, caja alta y 120..130, #93c4e7
título             x=96, caja alta y 163..204 → ~56px, línea base 205
etiquetas          «MESA DIRECTIVA» x 98..262 y «EQUIPO» x 1002..1073, caja alta y 258..267,
                   con filete a media altura hasta el borde de su columna
retratos           3×2 de 263×334, huecos de 25, bloque x 97..935 · y 297..988
foto de grupo      825×692, x 1002..1826 · y 297..988
hueco de columnas  67px
```

| # | Diferencia detectada | Corregida / justificada |
|---|---|---|
| E-01 | La diapositiva estaba partida en **dos** `Screen`: una con el título (que se llevaba una pantalla entera para él solo) y otra con las fotos | **Corregida** — una sola pantalla, como en el PDF |
| E-02 | Fondo crema con título en negro | **Corregida** — navy a sangre, título blanco, eyebrow `navy-200` |
| E-03 | La rejilla de retratos vivía dentro de una tarjeta `bg-navy-900` con relleno | **Corregida** — la rejilla va directa sobre el fondo de la página |
| E-04 | Debajo de cada retrato aparecían **nombre y cargo**, que el PDF no muestra (y que además son literalmente "Nombre Apellido / Cargo") | **Corregida** — retirados de la vista. Los datos siguen en `data/team.ts` y ahora alimentan el `alt` de cada retrato, así que no se pierde información para lectores de pantalla |
| E-05 | Cada retrato llevaba una cinta "Placeholder" superpuesta | **Corregida** — el propio JPG ya lleva impreso "RETRATO 01 · MESA DIRECTIVA", que es lo que pide RULES §10.2; la cinta era una segunda marca redundante |
| E-06 | Retratos en 3:4 y foto de grupo en 3:2 | **Corregida** — `aspect-[263/334]` y `aspect-[825/692]`. Medido: retrato 262×333, foto 824×691 |
| E-07 | Las etiquetas MESA DIRECTIVA / EQUIPO eran títulos sueltos, sin filete | **Corregida** — etiqueta + filete `navy-200/35` hasta el borde de la columna |
| E-08 | Columnas 1fr/1fr | **Corregida** — `838fr / 825fr` con hueco de 67px. Medido: columna izquierda 96..933, derecha 1000..1824 (PDF: 97..935 y 1002..1826) |
| E-09 | El bloque entero queda **29px más abajo** que en el PDF | **Justificada** — §6.3 |

---

## 5. CTA de cierre y footer ← p.9 del PDF

```
isotipo        244×281, centrado en x=960, y 71..351
título         Arial Bold 69.3px, línea base 460
bajada         Arial 26.7px, línea base 520
botones        66px de alto, hueco 18, y 584..649; el primero blanco, el segundo con borde
banda navy     0..831
footer crema   833..1024 → 192px, con el lockup institucional de AIChE a la izquierda
               (230×86) y la línea legal a la derecha, Arial Bold 16px #0e2033 con tracking
```

| # | Diferencia detectada | Corregida / justificada |
|---|---|---|
| C-01 | Isotipo a 120px | **Corregida** — 244×282 (PDF: 244×281) |
| C-02 | Bajada `text-lg md:text-xl` | **Corregida** — 26.7px |
| C-03 | Botones con `px-6 py-3 text-sm` | **Corregida** — 66px de alto exactos, hueco de 18px, texto Arial Bold 18.7px, relleno lateral de 2em |
| C-04 | En el footer, isotipo + wordmark "AIChE GDL" | **Corregida** — el PDF pone ahí el **lockup institucional del American Institute of Chemical Engineers**. Se extrajo del propio PDF (`mutool extract` → `image-0663.png`, 319×120) a `public/media/logo/aiche-institucional.png`. Su fondo ya es crema `#f4f1e9`, el mismo de la banda, así que encaja sin recorte. Medido: 230×87 contra 230×86 del PDF |
| C-05 | El footer añadía correo e Instagram, que el PDF no pone ahí | **Corregida** — retirados. El contacto vive en `/contacto` (que está en el nav) y en el propio bloque "¡Súmate al capítulo!" justo encima |
| C-06 | El footer no tenía alto definido y quedaba siempre fuera de la pantalla de cierre | **Corregida** — 192px (`--footer-h`) y la pantalla `join-cta` final resta ese alto, igual que la p.9 |
| C-07 | En el PDF el fondo de esta página es navy **plano**, sin rejilla ni degradado | **Justificada** — RULES §4 obliga a adaptar las diapositivas al lenguaje de las p.10-14, y "rejilla de fondo" está en la lista explícita |
| C-08 | Márgenes del footer: el PDF usa 63px a la izquierda y 54 a la derecha | **Justificada** — se usan los 96px del lienzo, por la misma cláusula de RULES §4 ("mismos márgenes") |
| C-09 | El bloque está centrado en vertical; el PDF lo sesga hacia arriba (71 arriba, 182 abajo) | **Justificada** — §6.3 |

### 5.3 Verificación numérica del fondo

Muestreo del mismo píxel en el PDF y en la implementación:

| Punto | PDF | Implementado |
|---|---|---|
| p.13 (965, 500) — núcleo del radial | `#297dbd` | `#2772b0` |
| p.13 (965, 900) | `#113c6f` | `#113a69` |
| p.13 (20, 500) — borde izquierdo | `#0b2e56` | `#0d2f57` |
| p.14 (300, 540) | `#113d6e` | `#103968` |
| p.14 (960, 1000) | `#0f3563` | `#0d315b` |

Diferencias de 3 a 6 unidades de luminancia: el degradado del PDF interpola
entre colores continuos y el nuestro entre los cuatro tokens de la paleta
(RULES §5.1 prohíbe introducir colores de marca nuevos).

---

## 6. Diferencias que quedan, justificadas

### 6.1 Sustitución de tipografía (afecta a las tres páginas)

El PDF está compuesto en **Segoe UI**. RULES §5.2 la fija como principal y
prohíbe descargarla (§12.2: una sola webfont, y es Libre Baskerville). En
Windows el navegador la tiene; **en el entorno de captura de esta sesión, no**:
la pila cae a la fuente de sistema de Linux, que es sensiblemente más ancha.

Consecuencias medidas:

| Texto | Con Segoe UI (PDF) | En la captura |
|---|---|---|
| Párrafo del hero | 5 líneas | 6 líneas (+33px) |
| Título de `/acerca` | 2 líneas | 3 líneas (+66px) |
| Cuerpo de `/acerca` | 20 líneas | 22 líneas (+56px) |

**Qué sí está garantizado y verificado:** cuerpo, interlínea, tracking, color,
medida de línea, tamaño de caja y posición de cada bloque, comprobados contra el
DOM. Lo que no puede garantizarse en este entorno es la **forma del glifo** ni,
por tanto, el número exacto de líneas. No es corregible sin romper RULES §5.2 o
§12.2.

Una mejora tipográfica sí se aplicó, y además acerca al PDF: el cuerpo
justificado de `/acerca` lleva `hyphens: auto` con `lang="es"`. Una columna
justificada de 435px sin partición de palabras produce ríos; con ella se ahorra
además una línea.

### 6.2 `/acerca` no cabe en una pantalla

**La diapositiva original no cabe bajo una barra de navegación.** La p.6 mide
**990px de contenido** (del alto del asterisco, y=56, al borde inferior de la
caja del cuerpo, y=1046) sobre un lienzo de 1080 **sin nav**. Al añadir la barra
que exige la regla 1 del proyecto, a la diapositiva le quedan **1000px**: con
las medidas del PDF hacen falta ~1010. Es un conflicto real entre el diseño tal
como está dibujado y la regla de tener nav en todas las páginas.

Se resuelve con la **válvula de escape de §A3**: la sección crece y el scroll
fluye. No se recorta contenido, no hay `overflow: hidden` y no hay scroll
horizontal.

Cifras medidas (`bun run check:overflow`):

| Resolución | Desborde de `about` |
|---|---|
| 1920×1080 | +135px |
| 1600×900 | +111px |
| 1440×900 | +60px |
| 1366×768 | +94px |
| 1280×720 | +88px |
| 390×844 | — (en móvil el lienzo 16:9 no aplica) |

De esos 135px de 1920×1080, **~122 son la sustitución de fuente** (§6.1) y ~13
son el déficit estructural de la diapositiva.

### 6.3 Centrado vertical uniforme

`Screen` centra el contenido en vertical. Las diapositivas del PDF no siempre
están centradas: la p.13 deja 34px arriba y 92 abajo; la p.9, 71 y 182. El
resultado es un desplazamiento de **29px en `/acerca/equipo`** y de **57px en el
CTA de cierre**, siempre hacia abajo.

Se acepta a propósito: una regla de composición única y auto-equilibrada es más
robusta a cambios de alto de contenido y de resolución que replicar el sesgo
particular de cada diapositiva, y ese sesgo no es consistente entre páginas
(la p.10 sí está prácticamente centrada).

### 6.4 Contenido placeholder

Sigue siendo placeholder, como marca la regla 8, y por eso no cuenta como
desviación: el video de `/acerca` (stub de 20 B, M-001), los seis retratos, la
foto de grupo y el póster del video. Los marcos ya tienen la proporción exacta
del PDF y las imágenes van con `object-fit: cover`, así que **sustituir el
archivo con el mismo nombre basta**; no hay que tocar código (M-003 y M-004 en
`docs/TODO.md`).

---

## 7. Gates y verificación

| Gate | Resultado |
|---|---|
| `bunx astro check` | **0 errores, 0 warnings, 0 hints** (64 archivos) |
| `bun run build` | 8 páginas, sin errores |
| `bun run check:render` | **32/32** — todo el contenido visible con JS y sin JS, con y sin `prefers-reduced-motion` |
| `bun run check:layers` | 184 imports, arquitectura respetada, cero componentes huérfanos |
| `bun run check:overflow` | **cero scroll horizontal** y **cero `overflow: hidden`** en las 6 resoluciones |

### 7.1 Encaje en pantalla

| Resolución | Escala | Pantallas | Desbordan |
|---|---|---|---|
| 1920×1080 | 15.99px | 21 | 2 — `about` +135, `sponsor-tiers` +161 |
| 1600×900 | 13.12px | 21 | 2 — `about` +111, `sponsor-tiers` +137 |
| 1440×900 | 12.00px | 21 | 2 — `about` +60, `sponsor-tiers` +60 |
| 1366×768 | 11.01px | 21 | 2 — `about` +94, `sponsor-tiers` +124 |
| 1280×720 | 10.24px | 21 | 2 — `about` +88, `sponsor-tiers` +119 |
| 390×844 | — | 21 | 0 |

Las pantallas bajan de 22 a 21 porque `/acerca/equipo` deja de estar partida en
dos (E-01). La escala efectiva sube de 15.04 a **15.99px** a 1920×1080, que es
el valor correcto del lienzo (N-02).

**`sponsor-tiers` empeora: de +35…+74px a +119…+161px.** Es una consecuencia
directa y esperada de recalibrar la escala tipográfica (S-4): los títulos de esa
sección estaban pequeños y ahora tienen el tamaño del PDF. La sección es alcance
de **F5**, que además debe retirar el botón inventado «Quiero este paquete»
(corrección C-12 de `docs/AUDIT-F2.md`, 62px por tarjeta) y recomponer las
tarjetas según la p.11. **Queda anotado como no bloqueante y como deuda de F5.**

---

## 8. Archivos tocados

**Nuevos**
- `public/media/logo/aiche-gdl-isotipo.svg` — copia de `design/aiche_logo.svg`
- `public/media/logo/aiche-institucional.png` — extraído del PDF con `mutool extract`

**Retoque de móvil (no es alcance de F4, pero lo rompió F4)**
El nav reconstruido dejaba el wordmark cortado por la hamburguesa a 390px,
porque el bloque «Únete» —que es quien llevaba el `ml-auto`— está oculto en
móvil. Corregido: la hamburguesa lleva ahora el `ml-auto`, el bloque INICIO
mide 72px por debajo de `md` y la identidad puede encogerse (`min-w-0` +
`truncate`). El resto del responsive sigue siendo alcance de F6.

**Reescritos**
- `src/components/layout/Nav.astro`, `src/components/layout/Footer.astro`
- `src/components/ui/Logo.astro`, `src/components/ui/Badge.astro`, `src/components/ui/GridBackdrop.astro`
- `src/components/sections/Hero.astro`, `src/components/sections/About.astro`, `src/components/sections/TeamGrid.astro`, `src/components/sections/JoinCta.astro`
- `src/components/media/VideoHighlight.astro`
- `src/pages/acerca/equipo.astro`

**Modificados**
- `src/styles/global.css` — tokens, escala de pantalla, escala tipográfica, utilidades de texto, regla del footer
- `src/components/ui/Screen.astro` — margen lateral del lienzo
- `src/components/ui/Countdown.astro` — geometría de las cajas
- `src/components/ui/ContactActions.astro` — botones del CTA
- `src/components/layout/NavDropdown.astro` — tipografía y subrayado activo
- `src/data/media.ts` — isotipo y lockup institucional

---

## 9. Qué queda abierto

**No bloqueante, para F5:**
- `sponsor-tiers` desborda (§7.1).
- `ui/Eyebrow.astro` y `ui/SectionTitle.astro` siguen con la escala vieja
  (`docs/BACKLOG.md`).
- El video de `/participaciones` (M-005).
- Las cuatro páginas restantes: `/participaciones`,
  `/participaciones/southwest-2027`, `/patrocinios`, `/contacto`.

**Pendiente del usuario:**
- F-06: `HIGHLIGHTS` vs `HIGH LIGHTS` (`docs/TODO.md`).
- Todo lo ya registrado en `docs/DECISIONS.md` (P-001…P-005) sigue igual.

---

## 10. Adenda posterior — `/acerca` ya encaja (D-136)

El desborde aceptado en A-11 y §6.2 quedó corregido después de F5 por petición
del usuario. La medición aisló dos causas:

| Causa | Antes | Corrección |
|---|---|---|
| Fallback `system-ui` de Linux | título 3 líneas + cuerpo 22 = ~122px extra | pila localizada `"Segoe UI", Arial, Helvetica, sans-serif`: **2 + 20 líneas**, como el PDF |
| Padding genérico de `Screen` | ~13px adicionales al alto del contenido | `about-screen` no aplica padding vertical en desktop; conserva el margen lateral y todo el contenido |

No se redujo el cuerpo tipográfico, no se cambió la interlínea, no se recortó
copy y no se añadió `overflow:hidden`. Resultado de `check:overflow`:
**cero desbordes en las 16 pantallas** a 1920×1080, 1600×900, 1440×900,
1366×768, 1280×720 y 390×844. A 1920, `/acerca` mide 1000px exactos bajo el
nav, con documento total de 1272px.
