# F8 — Re-captura, documentación y cierre de la fase 2 (2026-08-21)

> **Estado: COMPLETA.** Cierra la fase 2 (F0–F8).
>
> Tres trabajos: los dos pendientes que quedaban del backlog de F7 —el CSS
> y el pipeline de imágenes— y el cierre propiamente dicho: re-capturar el
> material y poner la documentación al día con la estructura real del
> sitio.

## 1. El CSS crecía con la documentación

F7 avisó de que el CSS había crecido un 50 % desde F1 (6,9 → 10,34 KB gz)
sin haber revisado por qué. Al mirarlo apareció una causa que no era el
diseño.

**Tailwind 4 detecta las fuentes desde la raíz del proyecto**, y eso
incluía `docs/**` y `scripts/`. Cada vez que una bitácora citaba una clase
en prosa —`pt-20`, `border-t-4`, `min-h-screen`, `flex-wrap`, y hasta
`text-ink/55`, que F7 había dejado de usar esa misma semana— Tailwind la
emitía y la regla viajaba en el CSS de las **7 páginas**.

Medido: **99 clases fantasma, 694 B gz por ruta.** Y creciendo: cada
sesión que se documenta añade unas cuantas.

```css
@import "tailwindcss" source(none);
@source "../";
```

`source(none)` apaga la detección automática y `@source` la reabre sólo
sobre `src/`. Se prefirió a una lista de `@source not` porque no obliga a
acordarse de cada carpeta nueva de documentación (D-179).

**10 427 → 9 733 B gz.** Verificado con diff de píxeles: las dos pantallas
del home salen **idénticas**, 0 subpíxeles de diferencia.

El resto del crecimiento sí es real —el sistema de pantalla de F2, la
frontera `canvas:` de F6, las composiciones 1:1 de F6b— y queda al 32 %
del presupuesto.

## 2. Las imágenes se servían enteras

RULES §12.3 pide AVIF/WebP con fallback y `srcset`. Estaba sin hacer, y la
razón que se había anotado —«son placeholders, montarlo ahora es trabajo
que habría que rehacer»— era un mal cálculo: **lo que se rehace son los
archivos, no el pipeline.**

Al medir los huecos reales el argumento se dio la vuelta del todo:

| Imagen | Se servía | Hueco real (móvil / 1920) |
|---|---:|---:|
| Retrato de mesa directiva | 600 px | **159 / 262** |
| Foto de grupo | 1800 px | 342 / 824 |
| Hero de Patrocinios | 1600 px | 340 / 823 |
| Imagen de paquete | 800 px | 340 / 542 |
| Galería de competencia | 1200 px | 342 / 544 |
| Lockup institucional | 319 px | 230 / 230 |

Los 20 rasterizados se movieron de `public/media/` a
**`src/assets/media/`** —lo único que Astro puede procesar— y `Img.astro`
emite un `<picture>` con AVIF, WebP y el formato original, con `srcset` de
hasta seis anchos y un `sizes` tomado hueco por hueco de esa tabla
(D-180).

| Ruta | Peso antes | Peso ahora | | LCP móvil antes | ahora |
|---|---:|---:|---|---:|---:|
| `/` | 158 KiB | **81** | −49 % | 1,28 s | 1,28 s |
| `/equipo/` | 185 KiB | **47** | −75 % | **1,58–1,89 s** | **1,21 s** |
| `/participaciones/` | 109 KiB | **60** | −45 % | 1,35 s | 1,28 s |
| `/southwest-2027/` | 102 KiB | **39** | −62 % | 1,05 s | 1,05 s |
| `/patrocinios/` | 68 KiB | **32** | −53 % | 1,43 s | 1,07 s |
| `/contacto/` | 67 KiB | **27** | −60 % | 1,05 s | 1,05 s |
| `/404.html` | 44 KiB | **23** | −48 % | 1,05 s | 1,05 s |

`/equipo/` era la única ruta con poco margen —F7 la midió siete veces:
1,58 a 1,89 s sobre un presupuesto de 2,0— y era también la que más
imágenes servía de más. Ya no es la peor de la tabla.

**Tres decisiones de diseño del cambio:**

- **`Img.astro` resuelve el archivo, no `data/`** (D-181). El manifiesto
  sigue declarando `/media/team/board-01.jpg`; esa cadena pasa de URL
  pública a **clave**, que `Img` resuelve con `import.meta.glob`. Así
  `data/` no sabe nada del pipeline (§A4) y los cuatro consumidores de
  `Img` no cambian de API. Como el significado de la cadena cambió, **el
  build falla** si la clave no existe: sin eso, un nombre mal escrito se
  publicaría como un `<img>` roto.
- **`<picture>` con `display: contents`** (D-182), para no meter una caja
  donde antes no la había. Verificado con diff de píxeles.
- **Qué se queda en `public/`**: los dos MP4 (Astro no los optimiza), el
  isotipo SVG (no lo necesita) y `og.jpg` (necesita una URL absoluta y
  estable para las redes).

`dist/` pasa de 1,03 MB a **3,16 MB en disco** (265 archivos, 245
variantes). No es una regresión: es el coste de tener las variantes
disponibles, y el navegador se lleva una sola de cada imagen.

**Sustituir un placeholder sigue siendo dejar otro archivo con el mismo
nombre** (regla 8), pero ahora en `src/assets/media/`. Documentado en
`docs/ASSETS.md` §3 y en RULES §10.

## 3. Re-captura: la comprobación encontró un defecto

La ficha de la sesión pedía comprobar «aparte que lo capturado coincide
con lo que se ve en un navegador normal», porque `capture.mjs` fuerza el
estado final de los reveals. Valió la pena.

Comparando la captura de `/` con una navegación real —bajando en pasos de
400px para que el `IntersectionObserver` dispare como con un usuario—
salieron diferencias en dos bandas. Una era el contador (los segundos
cambian entre ejecuciones, es esperable). **La otra era el footer: el
lockup institucional no salía en ninguna captura.**

La causa: forzar los reveals no basta. El navegador decide qué imágenes
descarga por **proximidad al viewport**, no por opacidad, y ese lockup
está al final de la página con `loading="lazy"`. Nunca llegaba a pedirse.

`capture.mjs` recorre ahora la página y espera a que todas las imágenes
estén completas antes de disparar. Repetida la comparación: en `/` la
única banda que difiere es la del contador, y el lockup aparece.

También se limpió la lista de selectores de sección, que arrastraba cuatro
que ya no existen desde F6b (`about-teaser`, `next-event`, `competitions`,
`cta-final`) y le faltaba `participations`, que es la p.7 y sale en dos
rutas.

**Material regenerado: 39 archivos, 48 MB** — 12 capturas de escritorio, 6
de móvil, 15 de sección y 6 screencasts.

### Segunda verificación: las 6 rutas, no sólo el home

La primera comprobación sólo miró `/`. Al cierre se repitió sobre las seis
rutas y **dos veces por ruta**, para poder separar el ruido inherente de
una diferencia real: pasada A contra pasada B da el ruido; pasada A contra
el archivo commiteado da la desviación.

El navegador de la comparación va **sin `reducedMotion`, sin forzar
reveals y bajando en pasos de 400 px**: exactamente lo que hace una
persona.

| Ruta | ruido A↔B | A ↔ commiteada | Bandas reales |
|---|---:|---:|---|
| `/` | 2 046 px | 3 928 px | ninguna fuera del contador (y 860–907) |
| `/equipo` | 0 | 80 px | y 287–299, delta máx **37** |
| `/participaciones` | 0 | **0** | ninguna |
| `/participaciones/southwest-2027` | 0 | **0** | ninguna |
| `/patrocinios` | 0 | 8 680 px (0,14 %) | bordes de glifo, delta máx 242 |
| `/contacto` | 0 | **0** | ninguna |

Tres rutas salen **idénticas al píxel**. En `/` la única banda que difiere
es la del contador, y coincide con la banda de ruido: son los segundos.

Las de `/equipo` y `/patrocinios` se localizaron y se recortaron para
mirarlas: caen **sobre los bordes de los glifos** —`$10,000`, `$5,000`,
`$2,500` y el rótulo de `/equipo`—, no sobre la caja ni la posición del
texto. Es la diferencia de rasterizado entre un elemento que **terminó su
transición** (el navegador le deja la capa compuesta) y uno al que se le
puso la clase `is-revealed` de golpe. Los recortes ampliados son
indistinguibles. Se acepta.

### Lo que sí encontró: el overlay de los paneles de video

Los dos paneles de video salen en el material con el póster **bajo el velo
`bg-black/30` y con el botón de play** encima. Leído el DOM en vez de
suponerlo por los píxeles, la causa está clara y son **dos caminos que
llevan al mismo sitio**:

- `capture.mjs` fija `reducedMotion: 'reduce'` para que los reveals sean
  deterministas. Eso también apaga el autoplay: `lazy-video.ts` muestra el
  botón manual desde el arranque (RULES §11.2). Comprobado 6 de 6
  ejecuciones — es determinista, no una carrera.
- Y en un navegador **normal** pasa lo mismo, por otra razón: los dos MP4
  son **stubs de 20 bytes** (`ftypisom` y nada más). `video.play()` se
  rechaza y `lazy-video.ts` cae al botón manual, que es lo correcto.

Por eso `/participaciones` sale a **0 px** contra el navegador real: el
material es fiel a lo que se ve **hoy**. Pero ese overlay **no es el
diseño**, es el estado de reserva de un video roto: al dejar los MP4
reales, el `play()` prospera y desaparecen velo y botón.

**No hay nada que arreglar en el código.** Lo que hay que hacer es no
tomar ese fotograma por bueno en el paquete de video, y **volver a
capturar cuando lleguen los MP4**. Anotado en `docs/TODO.md` (M-001,
M-005), en `docs/SHOTLIST.md` §7 y en la cabecera del storyboard de
`docs/VIDEO-BRIEF.md`.

## 4. Documentación al día

Toda la documentación de S10 describía el mapa de rutas anterior a F6b.

| Archivo | Qué estaba mal |
|---|---|
| `docs/SHOTLIST.md` | El inventario listaba 12 archivos que ya no se generan (`acerca-*`, `home-next-event`, `cta-final`) y le faltaban los nuevos. Regenerado desde el contenido real de `docs/media/`, con tamaños medidos |
| `docs/SITE-CONTEXT.md` | §4 describía `/acerca` y `/acerca/equipo` como rutas, y el home con `AboutTeaser` + `NextEvent`. Reescrito con las 5 pantallas reales |
| `docs/VIDEO-BRIEF.md` | Dos planos apuntaban a rutas muertas y a stills inexistentes |
| `docs/DEPLOY.md` | Lista de URLs a verificar con `/acerca`; ruta de sustitución de assets |
| `docs/DESIGN-SYSTEM.md` | `NextEvent` en el árbol de componentes |
| `README.md` | «Rutas (8)» con `/acerca`; la lista de rutas de `bun run capture` |
| `RULES.md` §10 | Los placeholders viven ahora en `src/assets/media/` y sí pasan por el optimizador |
| `docs/ASSETS.md` | Aviso destacado del cambio de carpeta y qué se queda en `public/` |
| `docs/VIDEO.md`, `docs/TODO.md` | Rutas de assets |
| `scripts/gen-placeholders.mjs` | Escribía en `public/media/` |

### Segunda pasada sobre la documentación

Cerrando la sesión se cruzó la documentación contra el árbol real en vez de
releerla, y quedaban cinco referencias muertas:

| Archivo | Qué estaba mal |
|---|---|
| `docs/STATE.md` | Describía `dist/robots.txt` como archivo de `public/` y con el `Disallow: /kit` que F8 retiró; y repetía la promesa de propagación del dominio sin la corrección |
| `RULES.md` §14 | `@astrojs/sitemap` + `public/robots.txt`, que ya no existe |
| `RULES.md` §10/§11.1 | Los dos comandos de `ffmpeg` escribían el póster en `public/media/images/`, que se vació en F8 |
| `docs/ASSETS.md` §5 | Marcos de `/acerca/equipo` y «panel de video de `/acerca`»: rutas muertas desde F6b |
| `README.md` | El árbol decía «Rutas (8 rutas finales)» tres líneas antes del encabezado «Rutas (7)» |

Comprobado además de forma automática, no a ojo:

- **Componentes:** los 33 `.astro` de `src/components/` aparecen en
  `docs/DESIGN-SYSTEM.md` y no se cita ninguno que no exista.
- **Inventario de capturas:** las **33 filas** de `docs/SHOTLIST.md` existen
  en `docs/media/`, **ninguna** de las 33 capturas queda sin citar, y las
  33 medidas del documento coinciden con las del archivo. 0 desajustes.
- **CSS:** tras editar `RULES.md`, `README.md`, `ASSETS.md`, `STATE.md`,
  `TODO.md`, `BACKLOG.md`, `SHOTLIST.md` y `VIDEO-BRIEF.md`, el CSS del
  build sale **byte a byte idéntico** (46 143 B raw / 9 738 B gz). Es la
  prueba de que D-179 hace lo que dice: la documentación ya no entra en el
  CSS.

## 5. El dominio no vivía en una sola línea

Al confirmar el usuario que el dominio **aún no está comprado**, se
comprobó la afirmación que la documentación repetía desde S8: que cambiar
`siteUrl` en `src/data/site.ts` lo propaga todo.

**No era verdad.** Estaba escrito a mano en tres sitios:

```
astro.config.mjs      site: 'https://aichegdl.example.com'   ← el sitemap
src/data/site.ts      siteUrl                                 ← canonical, OG, JSON-LD
public/robots.txt     Sitemap: https://aichegdl.example.com/…
```

Cambiar sólo `site.ts` el día del lanzamiento habría publicado el sitio con
el sitemap y el `robots.txt` apuntando al dominio de prueba — el tipo de
fallo que sólo se ve cuando ya está en producción y Google lo ha leído.

Ahora `astro.config.mjs` importa `siteUrl` y `robots.txt` **se genera en el
build** desde esa misma constante; `public/robots.txt` desaparece. Es un
hook `astro:build:done`, no un endpoint, así que la regla 10 (sitio 100 %
estático) se mantiene — un `src/pages/robots.txt.ts` sí la habría rozado
(D-183).

Verificado como lo hará el usuario: se sustituyó el dominio por otro, build,
y `grep -rl 'aichegdl.example.com' dist/` no devolvió nada. Propaga a
canonical, `og:url`, `og:image`, `twitter:image`, el JSON-LD de
`Organization` y `Event`, los dos sitemaps y la línea `Sitemap:` de
`robots.txt`, en las 7 páginas.

De paso se retiran el `Disallow: /kit` y el `filter` del sitemap, muertos
desde S9 (estaban en el backlog).

## 6. Gates

| Control | Resultado |
|---|---|
| `bunx astro check` | 0 errores, 0 warnings, 0 hints |
| `bun run build` | 7 páginas, 245 variantes de imagen |
| `bun run check:render` | 28 comprobaciones, todo visible con y sin JS |
| `bun run check:overflow` | sin scroll horizontal en 10 resoluciones |
| `bun run check:states` | 78 comprobaciones, 0 fallos |
| `bun run check:layers` | 152 imports, arquitectura respetada |
| `bun run check:network` | 0 terceros, 0 respuestas 4xx/5xx |
| Lighthouse × 14 | **100/100/100/100**, salvo el SEO de `/404` (66, deliberado) |

### Re-ejecución al cierre (2026-08-21, tras el arreglo del dominio)

Los gates se repitieron sobre el árbol final, ya con `robots.txt` generado
en el build:

| Control | Resultado |
|---|---|
| `bunx astro check` | 64 archivos, **0 errores, 0 warnings, 0 hints** |
| `bun run build` | **7 páginas**, 225 variantes de imagen, `robots.txt` generado |
| `bun run check:render` | **28 comprobaciones**, todo visible con y sin JS |
| `bun run check:overflow` | **10 resoluciones**, sin scroll horizontal ni `overflow:hidden` |
| `bun run check:states` | **78 comprobaciones, 0 fallos** |
| `bun run check:layers` | **152 imports**, arquitectura respetada |
| `bun run check:network` | **0 terceros, 0 respuestas 4xx/5xx** en 14 combinaciones |
| `dist/robots.txt` | `Allow: /` + `Sitemap:`, sin el `Disallow: /kit` muerto |
| `dist/` | 265 archivos, 248 en `_astro/` |

`check:network` **necesita `bun run preview` levantado en otro proceso** y,
si no lo está, no avisa: revienta con un `ERR_CONNECTION_REFUSED` y una
traza de Node. Está documentado en `README.md` §Guard de red, pero el
mensaje de error debería decirlo; anotado en `docs/BACKLOG.md`.

## 7. Cierre de la fase 2

### Qué estaba mal al empezar

La fase arrancó porque **el sitio se publicaba con todo el contenido
invisible** en un navegador normal (`docs/AUDIT-F2.md`): `reveal.ts` y
`lazy-video.ts` no se importaban desde ningún sitio y no llegaban al
build. S10 había declarado el proyecto cerrado.

De ahí salieron, en orden: el contenido no se veía (F1), la diapositiva no
cabía en pantalla (F2, F6), la fidelidad al PDF no se había medido (F4,
F5, F5b), el mapa del sitio no decía lo que había dentro (F6b), y las
métricas de rendimiento y accesibilidad se habían dado por buenas sin
medirlas (F7).

### Lo que se corrigió

- **Render:** los cuatro scripts se emiten y están verificados; el
  contenido se ve con y sin JS en las 7 rutas (`check:render`).
- **Encaje:** una frontera única con nombre (`--breakpoint-canvas`) y una
  sola palanca de escala; 10 resoluciones sin un desborde
  (`check:overflow`).
- **Fidelidad:** las 6 desviaciones sistémicas de la auditoría, cerradas y
  medidas contra el PDF, no estimadas.
- **Estados:** 78 comprobaciones de foco, teclado, menú, video y contador
  (`check:states`).
- **Rendimiento y accesibilidad:** 100/100/100/100 en Lighthouse, 0 fallos
  de contraste sobre todos los nodos de texto, 132 indicadores de foco por
  encima de 3:1, 0 peticiones a terceros (`check:network`).

### Lo que quedó deliberadamente distinto al PDF

Cinco cosas, todas medidas y razonadas:

1. **Nav y footer en todas las páginas** (regla 1). En el PDF hay
   diapositivas sin barra: es un artefacto del diseño.
2. **El bloque «Únete» es un 10 % más oscuro** que el azul del PDF
   (`navy-600` #2979b2 en vez de #2e86c8). Con el color literal, el texto
   blanco de 15,5 px en negrita da 3,93:1 y **el diseño original no pasa
   AA**. Sólo se cambia donde hay texto encima (D-164).
3. **La bajada del nav es más oscura** que en el PDF, que da 3,37:1
   (D-165).
4. **El eyebrow de `/equipo` dice «NUESTRO EQUIPO»** y no «ACERCA DE
   NOSOTROS». Es la única desviación de copy del sitio y fue decisión
   explícita del usuario (D-161).
5. **La p.6 y la p.7 se escalan para que quepan con sus márgenes.** Las
   dos componen más de los 1000 px que deja el nav; el diseño se reproduce
   proporcionalmente en lugar de comerse el aire (D-176, D-177).

### Lo que necesita decidir el usuario antes de publicar

Sigue todo en `docs/TODO.md` y en RULES §19:

| # | Pendiente | Qué bloquea |
|---|---|---|
| P-005 | **Dominio definitivo** | `siteUrl` en `src/data/site.ts` propaga a canonical, OG, Twitter, JSON-LD, sitemap y robots. Hoy es `aichegdl.example.com` |
| M-001 / M-005 | **Los dos videos reales** | Hoy son stubs de 20 B. Se ve el póster |
| P-002 | **Nombres y cargos de la mesa directiva** | `data/team.ts` tiene placeholders |
| P-001 | **Moneda de los paquetes** | Los precios se muestran sin divisa |
| P-006 | **Logos de patrocinadores actuales** | No hay sección que los liste todavía |
| — | **Las 18 imágenes reales** | Todo son placeholders. Se sustituyen por nombre de archivo en `src/assets/media/` |

Nada de eso bloquea el build: el sitio compila, encaja y cumple los
presupuestos con los placeholders puestos.
