# BACKLOG — hallazgos fuera del alcance de la sesión actual

> Todo lo que se descubre durante una sesión y no entra en su alcance
> va aquí. La siguiente sesión decide si lo absorbe o lo sigue dejando.

## S0

- El PDF tiene la página 5 (rasterizada) que repite la identidad visual
  del logo sin wordmark — probablemente un duplicado. Sin acción: el
  contenido no se implementa (es anotación, RULES §4).
- En la p.7 (rasterizada, equivalente a la p.5 RULES — Acerca de Nosotros)
  aparece un asterisco decorativo grande junto al título "Acerca de
  Nosotros". El asterisco podría ser un detalle del lenguaje visual a
  explorar; en web probablemente se sustituye por una sección visual
  coherente con el nav. **A resolver en S4**.
  - **Resuelto en S4** (D-041): no se implementó. Decidido mantener el
    `<h1>` limpio; el asterisco añadiría ruido sin valor semántico.
    Documentado para que el usuario lo confirme si lo quiere.
- En la p.8 del PDF (no la p.8 RULES, sino la equivalente a RULES §9.7
  Contacto) el correo mostrado es `hola@aichegdl.org`, distinto del
  oficial `aiche.gdl@gmail.com`. Decisión D-004: se usa el de p.13
  (RULES §9.7). El botón del CTA de cierre (p.9 PDF / §9.8) usa el
  `hola@aichegdl.org` original — se mantiene **solo** como botón del
  CTA "¡Súmate!" porque es el dato del PDF para esa zona específica;
  se documenta para que el usuario confirme si debe unificarse.

## S7

- Si más adelante el usuario quiere un formulario de contacto (más
  cómodo para gente sin cliente de correo), el camino es **Formspree**
  o **Netlify Forms** (si el host es Netlify). Ambos rompen la regla
  §3.9 (cero requests a terceros) salvo que se sirva en el mismo
  origen. Anotado para S8 si el usuario lo pide; por ahora D-052
  deja el flujo en `mailto:` + Instagram.

## S8

- **`srcset` + AVIF/WebP** para imágenes reales. Cuando el usuario
  entregue las fotos definitivas (más pesadas que los placeholders de
  ~10–40 KB), se justifica migrar `public/media/` → `src/assets/` y
  activar el pipeline `astro:assets` para generar `srcset` por densidad
  + AVIF/WebP con fallback. Documentado en RULES §10.5 ("al final
  pueden moverse a `src/assets/`"). Aplica cuando entren los archivos
  reales.

- **Lighthouse numérico en CI.** No se ejecuta en el sandbox actual
  (sin Chrome con permisos). Opciones para una próxima sesión si se
  quiere un score objetivo:
  1. **Local:** `npx lighthouse http://localhost:4321/<ruta>
     --form-factor=mobile --throttling-method=simulate` (necesita
     Chrome).
  2. **CI:** GitHub Action `treosh/lighthouse-ci-action` o similar.
  Necesita decisión del usuario (cuánto se automatiza) y runner con
  Chrome. La auditoría manual de señales (LCP, CLS, contraste, JSON-LD,
  etc.) está cubierta en `docs/PERFORMANCE.md §9`.

- **Preload de la webfont.** Descartado en S8 (D-061) porque Libre
  Baskerville italic nunca está above the fold. Si en una iteración
  futura se mueve el uso de italic al hero (p. ej. una cita destacada
  en `/`), reconsiderar preload (`<link rel="preload" as="font"
  type="font/woff2" href="..." crossorigin>`).

- **Service Worker / offline.** Fuera de S8. Útil si el sitio se va a
  usar como recurso en zonas con mala conectividad (eventos en
  campus). Plugin Astro: `@vite-pwa/astro`. No bloquea S9/S10.

- **Reducir `dist/` size.** Tras S8 el HTML es ~30 KB más grande por
  ruta por el CSS inline. Si en algún momento se prioriza el tamaño
  de `dist/` sobre el LCP, se podría revertir a `inlineStylesheets:
  'auto'` y aceptar el request CSS render-blocking. Decisión
  conscientemente tomada en S8 (D-061).

- **Auditoría periódica de contraste.** El cambio de paleta de
  `text-navy-400` a `text-cream` / `text-navy` cubre los casos
  auditados en S8, pero cualquier clase nueva añadida en S9+ debería
  pasar por la misma verificación (12 combinaciones que antes fallaban
  — ver `docs/PERFORMANCE.md §7`). Sugerencia: añadir un check a un
  eventual CI con `axe-core` (`@axe-core/cli`).

## S9

- **Captura visual pixel-a-pixel vs PDF.** S9 hizo auditoría por
  inspección de HTML/CSS/clases (sin Playwright en el entorno). Las
  diferencias pendientes de comparar visualmente son las del tipo
  "tamaño de espaciado", "grosor de borde", "padding interno". S10
  resuelve esto con `scripts/capture.mjs` + Playwright. Si alguna
  captura muestra una divergencia notable contra el PDF, se reporta
  en S10.

- **Recuadros del PDF p.5** alrededor de la pregunta italic y del
  párrafo largo (`A-02`/`A-27` en `docs/sessions/S09-qa-fidelidad-responsive.md
  §2`). Hoy son solo espaciado; si el usuario prefiere los recuadros
  del slide original, son ~10 líneas de cambio en `About.astro` y
  `AboutTeaser.astro`.

- **Tags de las competencias como chips** (`A-04`). El PDF p.6 los
  muestra en chips con borde; la implementación los muestra como
  texto eyebrow plano (consistente con el home). Migrar a
  `Badge.astro` con `tone="navy"` rompería el layout actual (chips
  demasiado anchos). Si el usuario quiere chips, redefinir la fila.

- **Lighthouse numérico en CI.** Sigue pendiente de runner con Chrome
  (anotado también en S8). La auditoría de señales (LCP, CLS,
  contraste, JSON-LD, etc.) está en `docs/PERFORMANCE.md §9`.

## S11 (auditoría y refactor de duplicación)

- **`media/Figure.astro`** (RULES §6 lo lista). No creado: el único
  `<figure>+<figcaption>` del proyecto está inline en
  `CompetitionsList.astro` (4 líneas de `<div>` + `<Img>`). Crear un
  componente dedicado para un único uso sería deuda futura. **Cuándo
  hacerlo:** cuando aparezca un segundo `<figure>` en el sitio o se
  quiera parametrizar la proporción/poster.
- **`sections/TierBenefits.astro`** (RULES §6 lo lista). No creado:
  la lista de beneficios del paquete vive inline en
  `SponsorTiers.astro → <PackageCard variant="full" />`. Si se
  reutilizara (p.ej. para añadirla a la página `/participaciones`
  individual), se extrae.
- **Recuadros del PDF p.5** alrededor de la pregunta italic y del
  párrafo largo (`A-02`/`A-27` en `docs/sessions/S09-qa-fidelidad-responsive.md
  §2`). Hoy son solo espaciado; si el usuario prefiere los recuadros
  del slide original, son ~10 líneas de cambio en `About.astro` y
  `AboutTeaser.astro`.
- **Tags de las competiciones como chips** (`A-04`). El PDF p.6 los
  muestra en chips con borde; la implementación los muestra como
  texto eyebrow plano (consistente con el home). Migrar a
  `Badge.astro` con `tone="navy"` rompería el layout actual (chips
  demasiado anchos). Si el usuario quiere chips, redefinir la fila.

## Hallazgos de F1 (fuera del alcance de la sesión)

- **Navegación móvil sin JavaScript.** El panel móvil se abre con JS; los
  enlaces de escritorio están en un `<ul>` con `hidden md:flex` y el footer
  sólo enlaza a `/`. Resultado: un usuario en móvil **y** con el JS caído
  puede leer entera la página en la que está —A2 se cumple para el
  contenido— pero sólo puede navegar a `/`.
  **Por qué no se arregló en F1:** la solución limpia es convertir el panel
  en una divulgación de CSS puro (`<details>` o similar), lo que rehace el
  marcado de `MobileMenu.astro` y su focus trap. Eso es alcance de **F6
  (responsive y estados)**, y F1 tenía prohibido tocar fidelidad visual.
  **Alternativa barata mientras tanto:** añadir al footer los enlaces de
  `data/nav.ts`, que además acerca el footer al PDF p.9.
- **`data-stuck` no tiene ninguna regla CSS.** `scripts/nav.ts` mantiene
  `data-stuck` en el `<header>` mediante el sentinel + IntersectionObserver,
  pero no existe ningún estilo que reaccione a ese atributo: hoy el
  observer no produce ningún efecto visible. O se le da un estilo de nav
  "pegado" (sombra, borde), o se retira el mecanismo. Candidato a F6.

## Hallazgos de F2 (fuera del alcance de la sesión)

- **`sponsor-tiers` no cabe en una pantalla por 65px, y la causa es un elemento
  inventado.** Medido a 1920×1080: la sección mide 1080px contra 1015 útiles. El
  botón «Quiero este paquete» de cada tarjeta mide **43px**, más su `gap-5`
  (19px) = **62px**, prácticamente el desborde exacto. Ese botón **no existe en
  la p.11 del PDF** (`docs/AUDIT-F2.md` §2.1, elemento inventado; corrección
  C-12). **Al retirarlo en F5, la sección encaja sin tocar el sistema de
  pantalla.** No se hizo en F2 porque quitar contenido es fidelidad, no encaje.
  **Resuelto en F5 (D-131):** se retiraron CTA y helper; la sección mide 1000px
  exactos en las seis resoluciones del guard.
- **El nav mide 65px fijos y no escala.** Es la única chrome fuera del lienzo.
  A 1920 se come el 6 % de la altura; a 1280×720, el 9 %. En el PDF la barra
  ocupa ~4,3 %. Escalarla con el lienzo devolvería ~20px de alto útil a las
  resoluciones bajas, pero cambia la identidad del chrome: es decisión de F4.
  **Resuelto en F4 (D-114):** la medida correcta del PDF es 80px, no 4.3 %.
- **`competitions` sólo encaja gracias al techo de altura de los medios.** La
  foto del Chem-E-Car a ancho completo medía 761px de los 1015 disponibles. El
  techo (`.screen-media`) la recorta, pero la composición correcta es la del PDF
  p.7: la foto **al lado** del texto, en dos columnas, no debajo. Es F5.
  **Resuelto en F5 (D-130):** la sección separada desaparece y
  `ParticipationsOverview` reproduce las dos columnas en una pantalla.

## Hallazgos de F4 (fuera del alcance de la sesión)

- **`ui/Eyebrow.astro` y `ui/SectionTitle.astro` se han quedado desincronizados
  del PDF.** F4 midió la etiqueta corta del diseño (Arial Bold 15.6px, tracking
  0.30em, color `navy-200` sobre fondo oscuro) y la aplicó con las utilidades
  `.eyebrow` + `.t-eyebrow` en las tres páginas de su alcance. `Eyebrow.astro`
  sigue con `text-xs` (12px) y `text-cream`, y lo usan siete secciones de F5
  (`SponsorHero`, `SponsorTiers`, `NextEvent`, `Competitions`,
  `CompetitionInfo`, `ContactBlock`, `EventCard`) más `/404`. **F5 debe
  unificarlo**: o `Eyebrow` adopta las medidas del PDF, o desaparece a favor de
  las utilidades. Mientras tanto hay dos tratamientos de la misma etiqueta, que
  es duplicación (regla 2).
  **Resuelto en F5:** `Eyebrow` usa `.t-eyebrow`, tracking 0.30em y los tonos
  medidos `navy-200`/`navy-700`. `SectionTitle` no participa en las pantallas F5.
- **`data-stuck` sigue sin regla CSS** (heredado de F1; ver arriba). F4 rehizo
  el Nav sin tocar ese mecanismo.
- **`.screen-media` (techo de altura de los medios) sigue vivo en
  `Competitions.astro`.** F4 no lo necesitó porque las tres páginas de su
  alcance declaran la proporción exacta del PDF. Cuando F5 recomponga
  `/participaciones` en dos columnas como la p.7, ese techo debería
  desaparecer.
  **Resuelto en F5:** `Competitions.astro` fue eliminado y ya no hay usos de
  `.screen-media` en la composición de Participaciones.
- **El `<video>` de `/acerca` no lleva `aria-label` visible ni transcripción.**
  Fuera de alcance de F4; revisarlo en F7 (accesibilidad).

## Hallazgos de F5 (fuera del alcance de la sesión)

- **Responsive fino y estados.** F5 verificó que no hubiera scroll horizontal
  ni recorte en las seis resoluciones del guard y dejó fallbacks de una columna,
  pero el recorrido visual completo en 360×800, 390×844, 768×1024, 1024×768,
  1366×768, 1440×900 y 1920×1080 corresponde a F6.
- **Medios finales.** Las fotos de Participaciones, paquetes y Contacto siguen
  siendo placeholders. Los dos MP4 son stubs de 20 B. Los slots y marcos ya
  están cerrados; la sustitución del usuario está en `docs/TODO.md` y no exige
  cambios de componentes.
- **Impresión de Patrocinios.** F5 cambió las tarjetas completas de crema a navy.
  Las reglas de impresión siguen convirtiendo fondos y texto, pero F7 debe
  incluir una inspección de PDF impreso junto con accesibilidad y rendimiento.

## Hallazgos de F5b (fuera del alcance de la sesión)

- **Las herramientas de comparación viven en `.cache/`, que está en
  `.gitignore`.** `overlay.py` (superposición por canales), `overlay2.py`
  (superposición reencajada para las diapositivas sin nav), `measure.py`
  (perfilado de luminancia) y `span.py` (bbox de texto) son lo que hizo visible
  lo que las tablas de F5 no veían, y se pierden al limpiar la caché. **Si F6 o
  F8 van a volver a comparar contra el PDF, merecen subir a `scripts/` como un
  `check:design` con el resto de guards.** No se hizo en F5b para no ampliar el
  alcance ni tocar `package.json` fuera de sesión.
- **Cifras de JS de `docs/PERFORMANCE.md` desactualizadas.** `scripts/nav.ts`
  bajó de 259 a 153 líneas al quitar los dropdowns y el acordeón (D-138), pero
  los bytes por ruta de esa sección son de F1. Volver a medirlos en F7.
- **Cantarell mide mejor que Arial** contra las cadenas del PDF (−1,7 % de
  media frente a +2,7 %, y menos dispersión). No se adoptó porque no está en
  RULES §5.2 ni en la whitelist de la regla 9 y sólo existe en escritorios
  GNOME. Si alguna vez se autoriza una webfont métrica, ése es el sitio por
  donde atacar el ±3 % residual (D-137).
- **Sin `Escape` para cerrar el submenú de escritorio.** Al ser CSS puro, se
  cierra al mover el ratón o al tabular fuera, que es el comportamiento natural
  de una lista de enlaces anidada, pero no responde a `Escape`. Revisar en F7
  si la auditoría de accesibilidad lo considera necesario.
- **Los saltos de línea de los cuerpos largos no coinciden palabra por palabra**
  con el PDF en p.8, p.11 y p.12. Parte es copy (RULES §9 difiere del PDF,
  ver F-02/F-03 en `docs/TODO.md`) y parte métrica de la tipografía sustituida.
  Los cuerpos, interlíneas y medidas de línea sí son los medidos.
- **`data-stuck` sigue sin regla CSS** (heredado de F1 y F4). F5b tampoco lo
  tocó: el atributo se escribe y nadie lo lee.

## Hallazgos de F6 (fuera de alcance)

- **`scripts/capture.mjs` sólo captura 1920×1080 y 390×844.** Desde F6 el sitio
  tiene dos composiciones y la frontera está en 1280px, así que la banda
  768–1279 —donde vive un portátil de 1024 y una tablet en vertical— no aparece
  en ninguna captura. **F8 debería añadir 1024×768 al conjunto** para que el
  paquete de material muestre los dos regímenes.
- **`--footer-h` no se aplica en el régimen apilado.** El footer usa
  `min-h-[var(--footer-h)]` (192px) siempre, incluso en móvil, donde su
  contenido apilado ya mide más. No es un defecto visible —es un mínimo, no una
  altura— pero el token se documentó como medida del lienzo y ahí no lo es.
- **El submenú de escritorio nunca aparece por debajo de 1280px**, ni siquiera
  con teclado: el panel móvil lista los hijos directamente, que es lo correcto.
  Lo que queda sin cubrir es el caso de un puntero fino en un viewport estrecho
  (ventana de escritorio a media pantalla): ahí el usuario ve la hamburguesa.
  Es coherente, pero conviene confirmarlo con el usuario en F8.
- **`check:states` mide hover con `page.hover`, no con un puntero real.** Cubre
  `:hover` en CSS, que es lo que importa, pero no detectaría un handler de
  `mouseenter` en JS. Hoy no hay ninguno; si aparece, hay que ampliar la sonda.
- ~~**La sonda de foco no comprueba el contraste del indicador**, sólo que
  exista.~~ **Resuelto en F7.** Se midieron los 132 indicadores de las 7 rutas
  en dos viewports: uno fallaba (los dos enlaces del bloque de contacto,
  1,28:1) y se corrigió (D-175). `check:states` sigue comprobando sólo la
  existencia; la medida de contraste se hizo con una sonda aparte y **no ha
  quedado en un script permanente** — si se quiere protección contra
  regresiones, hay que integrarla. Ojo con dos trampas documentadas en la
  bitácora §4.9: `.transition-colors` anima `outline-color` desde
  `currentColor`, y un `outline-offset` negativo pinta el anillo sobre el
  fondo del propio elemento.

## Hallazgos de F6b (fuera de alcance)

- **`docs/SITE-CONTEXT.md`, `docs/SHOTLIST.md` y `docs/DEPLOY.md` describen el
  mapa de rutas viejo** (`/acerca`, `/acerca/equipo`). Son documentos de S10
  pensados para el paquete de material; F8 los reescribe al recapturar. No se
  tocaron aquí para no ampliar el alcance de una petición puntual.
- **`docs/media/` está entero desactualizado.** Las 43 capturas y los 7
  screencasts de S10 muestran la estructura anterior. `bun run capture` ya
  apunta a `/equipo`, pero regenerarlo son ~25 MB: es trabajo de F8.
- **`data/competitions.ts` menciona `NextEvent` en su cabecera**, que ya no
  existe. Es un comentario, no código; se corrige al pasar por ahí.
- ~~**El home carga dos videos y dos fotos reales por encima del pliegue.**~~
  **Resuelto en F7.** El aviso era correcto: el LCP de `/` estaba en 1,95 s, a
  50 ms del presupuesto, porque los dos pósters se descargaban antes de pintar
  (113 KB). Ahora van diferidos y el LCP es **1,28 s** (D-163).

## Hallazgos de F7 (fuera de alcance)

- ~~**El CSS ha crecido un 50 % desde F1**~~ **Revisado en F8.** Parte de la
  causa no era el diseño: Tailwind escaneaba `docs/**` y `scripts/` y
  emitía las clases citadas en prosa en las bitácoras (99 clases, 694 B gz
  por ruta). Acotado a `src/` (D-179): 10,34 → **9,52 KB gz**. El resto del
  crecimiento sí es real —sistema de pantalla, `canvas:`, composiciones
  1:1— y sigue al 32 % del presupuesto.
- ~~**El CSS ha crecido un 50 % desde F1**~~: de 6,75–6,91 KB gz por ruta a
  **10,34 KB gz** (51,00 KB raw), idéntico en las 7 porque va inlineado. El
  presupuesto de RULES §12 son 30 KB gz, así que estamos al 34 % y no urge,
  pero el crecimiento viene del sistema de pantalla (F2), la frontera
  `canvas:` (F6) y las composiciones 1:1 (F6b), y no se ha revisado si hay
  utilidades que ya no usa nadie. Mirar en F8.
- ~~**`srcset` + AVIF/WebP siguen sin hacerse.**~~ **Hecho en F8** (D-180):
  los rasterizados se movieron a `src/assets/media/` y salen como AVIF +
  WebP + original con `srcset` y `sizes` medido. El peso por ruta bajó
  entre un 45 % y un 75 %. Lo que queda es aplicar el mismo criterio a las
  fotos definitivas cuando lleguen: el pipeline ya está.
- ~~**`srcset` + AVIF/WebP (texto original)** RULES §12.3 lo permite pero
  no lo obliga. 17 de las 19 imágenes son placeholders que el usuario va a
  sustituir (regla 8): montar el pipeline de `astro:assets` sobre archivos
  que van a desaparecer es trabajo que habría que rehacer. Con las
  definitivas, sí. `competition-car-cutout.png` bajaría de 57 KB a 37 KB en
  WebP, pero eso obliga a `<picture>` con fallback y rompe la sustitución
  por nombre de archivo.
- **Dos títulos pasan de lo que muestra Google**: `/` (82 caracteres) y
  Southwest (102). La causa es el sufijo obligatorio de RULES §14
  (`| AIChE GDL — Tec de Monterrey Campus Guadalajara`, 50 caracteres por
  sí solo). Acortarlo es decisión del usuario, no un defecto.
- ~~**`Disallow: /kit` en `public/robots.txt`**~~ **Resuelto en F8**: al
  pasar `robots.txt` a generarse desde `siteUrl` (D-183) se retiraron tanto
  el `Disallow` como el `filter` del sitemap, muertos desde S9.
- ~~**`/equipo/` es la ruta con menos margen de LCP**~~ **Resuelto en F8**:
  con el pipeline de imágenes pasa de 1,58–1,89 s a **1,21 s** y de 185 a
  47 KiB. El aviso sobre las fotos definitivas sigue en pie, pero ahora
  entran por un pipeline que las redimensiona.
- ~~**`/equipo/` (texto original)**: 1,58–1,89 s en móvil
  sobre siete ejecuciones, con un presupuesto de 2,0 s. Lleva 145 KB de JPG
  (seis retratos + foto de grupo) casi todos en el primer viewport, y el FCP
  es estable en 0,90 s, así que lo que varía es la decodificación bajo CPU
  ×4. Los siete archivos son placeholders: **con las fotos reales es la
  primera ruta que puede cruzar el presupuesto**, y es donde primero hay que
  aplicar `srcset` + AVIF/WebP.
- **`about-poster.jpg` pesa 70 KB para 730×487** (0,20 B/px, calidad JPEG
  alta). Es un placeholder extraído del PDF y el usuario lo sustituirá, así
  que recomprimirlo tiene poco recorrido; si el material definitivo llega
  con la misma calidad, sí conviene.
- **Lighthouse en CI** sigue sin decidirse: requiere elegir runner con
  Chrome headless. En F7 se midió en local y fuera del repositorio (D-162),
  que resuelve la medición pero no la regresión automática.
- **El umbral de `loading="lazy"` no es comprobable de forma estricta en
  escritorio.** En 1920×1080 la segunda pantalla del home empieza a
  1 096 px, a 16 px del pliegue, dentro del margen de proximidad de Chrome.
  `check:network` exige el diferido en móvil y sólo informa en escritorio
  (D-174). Si algún día se quiere exigir en los dos, hay que limitar la red
  desde el propio script.

## Hallazgos de F8 (fuera de alcance)

- **`check:network` no explica que necesita el preview levantado.** Si
  `bun run preview` no está corriendo, el guard no falla con un mensaje:
  revienta con `ERR_CONNECTION_REFUSED` y una traza de Node de 15 líneas.
  El requisito está en `README.md` §Guard de red, pero quien lo ejecute sin
  leerlo no lo va a deducir de la traza. Un `try/catch` sobre el primer
  `page.goto` con un mensaje de una línea lo arregla. Los otros cuatro
  guards levantan su propio servidor; éste es el único que no.
- **`capture.mjs` captura los paneles de video en su estado de reserva.**
  Fija `reducedMotion: 'reduce'` para que los reveals sean deterministas, y
  eso apaga de paso el autoplay: el panel sale con velo y botón de play
  (F8 §3). Hoy da igual —con los MP4 en stub un navegador normal muestra lo
  mismo—, pero cuando lleguen los videos reales el material dejará de
  parecerse a lo que ve un visitante. La salida limpia es dejar el motion
  por defecto (el `forceReveal` ya hace determinista el reveal por su
  cuenta) y pausar el video en el fotograma 0 antes de disparar, que da
  determinismo **sin** falsear el estado.
- **Las capturas difieren del navegador real en los bordes de los glifos.**
  Medido: 80 px en `/equipo` y 8 680 px (0,14 %) en `/patrocinios`, todos
  sobre el contorno del texto, ninguno sobre la caja o la posición. Es el
  rasterizado distinto entre un elemento que terminó su transición y uno al
  que se le puso `is-revealed` de golpe. Indistinguible al ojo y se acepta;
  se anota para que una comparación futura no lo lea como una regresión.
