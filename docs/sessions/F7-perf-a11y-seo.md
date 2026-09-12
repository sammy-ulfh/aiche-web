# F7 — Rendimiento, accesibilidad y SEO (2026-08-21)

> **Estado: COMPLETA.** Los once presupuestos de RULES §12 se cumplen,
> medidos con Lighthouse 13.4.1 sobre el build de producción, en móvil y
> en escritorio, en las 7 rutas.
>
> Las cifras nuevas están en `docs/PERFORMANCE.md`, reescrito entero.
> Esta bitácora cuenta **qué se midió, qué estaba mal y qué se hizo**.

## Alcance pedido

1. Medir de nuevo todas las rutas sobre producción: Lighthouse móvil y
   escritorio, peso de `dist/`, JS y CSS por ruta, requests a terceros.
   Sin heredar ningún número.
2. Verificar en red que el video no descarga un byte hasta entrar al
   viewport y que siguen siendo 0 los requests a terceros.
3. Corregir lo que no cumpla, y decir el número real de lo que no llegue.
4. Auditoría de accesibilidad completa.
5. Revisar SEO.
6. Reescribir `docs/PERFORMANCE.md` con fecha de medición.

Los seis puntos están hechos.

---

## 0. La decisión que había que tomar primero: Lighthouse

F0 dejó esto abierto (`docs/AUDIT-F2.md` §5.1): «Lighthouse no se puede
ejecutar sin romper una regla», porque el paquete no está en la whitelist
de RULES §16.4 y la regla 9 obliga a preguntar antes de añadir nada.

Se preguntó al usuario, que eligió **ejecutarlo fuera del repositorio**
(**D-162**): se instaló `lighthouse@13.4.1` en un directorio temporal y se
ejecutó contra el Chromium del sistema. `package.json` y `bun.lock` no se
tocaron — verificado con `git status` después de instalarlo.

La justificación de F0 era en parte incorrecta y queda corregida: la
regla habla de las **dependencias del proyecto**, y un instrumento de
medición que no viaja con el sitio no lo es. Lo que sí era cierto es que
no se podía añadir a `devDependencies` sin permiso.

---

## 1. Lo que decían las cifras heredadas y en qué se equivocaban

`docs/PERFORMANCE.md` se reescribió entero, así que aquí queda constancia
de lo que se ha borrado y por qué (ADENDA §A5).

| Lo que afirmaba | Lo medido en F7 | Veredicto |
|---|---|---|
| «Lighthouse: n/d, no medible sin romper la whitelist» | **Medido**, 4 categorías × 7 rutas × 2 perfiles | Era una conclusión precipitada |
| LCP de `/` en el límite, «~2,0 s, pendiente de F7» (F1) | **1,95 s** al empezar; **1,28 s** al cerrar | Confirmado y corregido |
| CSS 6,75–6,91 KB gz por ruta (F1) | **10,34 KB gz** | Desfasado: ha crecido un 50 % desde F1 |
| JS 2,5–3,5 KB gz por ruta (F1) | **2,30–3,33 KB gz** | Confirmado |
| `dist/` 881 KB (F1) | **1 054 KB** | Desfasado |
| Peso de `/` 71 KB transferidos (F1) | **158 KiB** | Desfasado (F1 medía 8 rutas y otra estructura) |
| Requests a terceros: 0 | **0** | Confirmado |
| CLS 0 en todas las rutas | **0,0000**, salvo 0,0005 en `/participaciones` escritorio | Confirmado |
| «Accesibilidad ✓ en todo» (S8) | **92 móvil / 87 escritorio** en `/` al empezar | **Falso** |
| «Contraste AA ✓, 12 pares corregidos» (S8) | **2 pares por debajo de AA** en el nav | **Falso** |

Las dos últimas filas son las importantes: S8 se dio por bueno a sí mismo
en accesibilidad sin medirla, y no estaba bien.

Los números de F1 no eran mentira, pero tampoco comparables: se tomaron
sobre 8 rutas, antes de que F6b eliminara `/acerca` y `/acerca/equipo` y
reordenara el home.

---

## 2. Lo que se midió

- **Lighthouse 13.4.1**, `performance`+`accessibility`+`best-practices`+`seo`,
  7 rutas × 2 perfiles = 28 informes.
- **Red**, con Playwright: origen de cada petición, códigos de estado,
  momento en que se pide cada video y cada póster, peso por ruta. Dos
  viewports.
- **Peso**: `dist/` archivo a archivo; HTML, CSS inline y JS inline
  comprimidos con gzip nivel 9 sobre los bytes servidos.
- **Accesibilidad**, recorriendo el DOM renderizado: jerarquía de
  encabezados, landmarks, nombre accesible de cada `<section>` y de cada
  interactivo, `alt` y dimensiones de cada imagen, y **contraste de todos
  los nodos de texto visibles** en los dos viewports.
- **`prefers-reduced-motion`** con los dos valores del medio.
- **SEO**, campo a campo sobre el HTML generado, más sitemap, robots y
  manifest.

Un detalle que estuvo a punto de falsear la auditoría de contraste:
Tailwind 4 emite los colores con alfa como `oklab(0.99 … / 0.65)`. Leerlos
con una expresión regular da tres números que no son RGB, y la primera
pasada devolvió 37 «fallos» inventados con ratios de 1,71:1 y 1:1. Se
resolvió pintando cada color en un canvas de 1×1 y leyendo el píxel, que
resuelve cualquier espacio de color y el alfa real.

---

## 3. Estado al empezar

| Ruta | Perf | A11y | BP | SEO | | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|---|---:|---:|---:|---:|
| | *móvil* | | | | | *escritorio* | | | |
| `/` | 99 | **92** | 100 | 100 | | 100 | **87** | 100 | 100 |
| `/equipo/` | 100 | 100 | 100 | 100 | | 100 | **95** | 100 | 100 |
| `/participaciones/` | 100 | 100 | 100 | 100 | | 100 | **96** | 100 | 100 |
| `/participaciones/southwest-2027/` | 100 | 100 | 100 | 100 | | 100 | **95** | 100 | 100 |
| `/patrocinios/` | 100 | 100 | 100 | 100 | | 100 | **95** | 100 | 100 |
| `/contacto/` | 100 | 100 | 100 | 100 | | 100 | **96** | 100 | 100 |
| `/404.html` | 100 | 100 | 100 | 69 | | 100 | **95** | 100 | 69 |

Y el LCP de `/` en móvil: **1,95 s**, a 50 ms del presupuesto.

---

## 4. Los diez defectos y sus correcciones

### 4.1 `<ol>` con `<div>` dentro — el que hundía la home (D-167)

`SponsorTeaser` envolvía cada `PackageCard` en su propio `<Reveal>` para
escalonar la entrada. Pero `PackageCard` **es** el `<li>`, así que el
árbol quedaba `<ol> → <div data-reveal> → <li>`: lista inválida, dos
fallos de axe (`list` y `listitem`), y la accesibilidad de `/` en 92
móvil / 87 escritorio.

No cabe un envoltorio intermedio entre `<ol>` y `<li>`, así que el
`Reveal` pasa a envolver la lista entera. Se pierde el escalonado de las
tres tarjetas y se gana una entrada de grupo. `SponsorHero`, que ya
componía la misma lista sin `Reveal`, no cambia.

### 4.2 Dos contrastes por debajo de AA, heredados del PDF (D-164, D-165)

| | Antes | Ahora |
|---|---:|---:|
| Bajada del nav, `ink/55` sobre `#d0d4d7` | 4,29:1 | **5,03:1** con `ink/60` |
| Bloque «Únete», blanco sobre `navy-500` #2e86c6 | 3,93:1 | **4,70:1** con `navy-600` #2979b2 |

El segundo mereció comprobarse contra el diseño antes de tocar nada,
porque `navy-500` es un color medido del PDF. Se rasterizó la p.1 y se
midió el bloque: es **#2e86c8** con «Únete» en blanco, y los glifos ocupan
10,88 px de altura de mayúscula a escala 1920 — un cuerpo de ~15,5 px en
negrita, por debajo de los 18,66 px que WCAG considera texto grande. Es
decir: **el diseño original no pasa AA en ese bloque**, y con su color
literal no hay forma de que lo pase con texto blanco.

Se resolvió con un token nuevo, `--color-navy-600: #2979b2` (el azul del
PDF con la luminancia bajada un 10 %), aplicado **sólo donde hay texto
encima**. `navy-500` sigue intacto en el degradado de `GridBackdrop` y en
el subrayado de 3 px del item activo. Comparado el nav renderizado contra
la p.1 a 1920×1080: la diferencia no se aprecia.

La bajada del PDF es aún más floja (`#67737e` sobre `#d3d8d9` = 3,37:1),
así que el sitio ya iba por delante del diseño y ahora pasa con margen.

### 4.3 El enlace de marca incumplía WCAG 2.5.3 (D-166)

`aria-label="AIChE GDL — ir al inicio"` **sustituye** al texto visible. La
bajada «TEC DE MONTERREY · CAMPUS GUADALAJARA» no estaba en el nombre
accesible, así que quien navega por voz no podía activar el enlace
diciendo lo que ve. Lighthouse lo marcaba como
`label-content-name-mismatch` en las 7 rutas de escritorio.

Fuera el `aria-label`. El nombre sale ahora del texto visible más un
`<span class="sr-only">— ir al inicio</span>`, que es contenido, no
sustitución. El isotipo pasa a `alt=""` para que el nombre no diga «AIChE
GDL» dos veces: `Logo` acepta un prop `alt` que sobreescribe el del
manifiesto, y sólo el nav lo usa.

`chrome.brandAriaTemplate` desaparece de `data/nav.ts` y en su lugar queda
`chrome.brandLinkSuffix`.

### 4.4 Once `<section>` sin nombre accesible (D-168)

RULES §13 pide `section` con `aria-labelledby` y `Screen.astro` ya sabía
pasarlo, pero sólo lo usaban `Hero`, `TeamGrid` y `CompetitionInfo`. Las
otras once instancias no aparecían como regiones en el listado de
landmarks de un lector de pantalla.

Cada una apunta ahora al `id` de su propio titular. Donde la pantalla es
el `h1` de la página, ese id es el `page-title` que ya esperaba
`<main aria-labelledby>`; donde no, uno propio (`about-title`,
`participations-title`, `contact-title`, `sponsor-teaser-title`,
`sponsor-benefits-title`, `join-title`). Los cuatro componentes que
cambiaban de nivel según la ruta calculan el id en una sola constante en
lugar de repetir el ternario.

Esto **no lo detecta Lighthouse**: un `<section>` sin nombre no es un
error de axe, simplemente no se expone como región.

### 4.5 La flecha `→` de `/404`, a 3,40:1

Nueve flechas en `navy-400` sobre blanco. Llevan `aria-hidden`, así que
axe no las mira, pero son texto visible. A `navy-700`: 8,30:1. La página
404 no está en el PDF, así que no hay fidelidad que respetar.

### 4.6 113 KB de pósters descargados antes de pintar nada (D-163)

El defecto de rendimiento real de la sesión.

El atributo `poster` de `<video>` **se descarga siempre**: no lo detiene
`preload="none"` ni que el elemento esté a 2 000 px del pliegue. La home
se traía `about-poster.jpg` (70 KB) y `chem-e-car.jpg` (43 KB) antes de
pintar, y eso era lo que dejaba su LCP en 1,95 s.

El póster pasa a ser una capa `<img loading="lazy">` dentro del mismo
`<figure>`, colocada **antes** del `<video>` para que éste la tape en
cuanto tiene fotogramas. Es decorativa (`alt=""` + `aria-hidden`) porque
el `<video>` ya lleva el nombre accesible.

Sin JavaScript no se pierde nada: antes el póster lo pintaba el atributo,
ahora lo pinta la imagen (ADENDA §A2). De hecho mejora, porque la capa
`<img>` respeta el viewport y el atributo no.

**LCP de `/` en móvil: 1,95 s → 1,28 s.**

### 4.7 `competition-car-cutout.png`, 283 KB para 489×334 px (D-173)

El recorte del Chem-E-Car que F5 extrajo del PDF era RGBA de 8 bits sin
cuantizar. Recomprimido a paleta de 256 colores con dithering: **58 452 B,
un 79 % menos**, mismo nombre, mismo formato, alfa intacto. Comparadas las
dos versiones al 100 % sobre fondo navy, no se distinguen.

`/participaciones/southwest-2027/` baja de 329 KB a 102 KB.

### 4.8 El manifiesto de medios mentía sobre dos imágenes (D-172)

`about-poster.jpg` se declaraba 1920×1080 y mide **730×487**;
`chem-e-car.jpg` se declaraba 1600×900 y mide **574×383**. Son las fotos
que F6b extrajo del PDF, y el manifiesto conservó las medidas de los
placeholders que sustituyeron.

Además la ruta de cada póster estaba escrita **dos veces**: como cadena
suelta en el `VideoAsset` y en un `ImageAsset` gemelo (`media.aboutPoster`,
`media.chemECar`) que no consumía nadie. `VideoAsset.poster` pasa de
`string` a `ImageAsset`, los dos declaran las dimensiones reales y la capa
`<img>` de §4.6 las usa.

### 4.9 Dos anillos de foco invisibles en `/contacto` (D-175)

`docs/BACKLOG.md` lo pedía desde F6: «la sonda de foco no comprueba el
contraste del indicador, sólo que exista — remedirlo en F7». Tenía razón.

Los enlaces `aiche.gdl@gmail.com` y `aiche.gdl` del bloque de contacto
sólo declaraban `focus-visible:underline` y heredaban el outline global,
`navy-700`, que está elegido para el fondo crema. Sobre el navy del bloque
son **1,28:1**. Con `focus-visible:outline-cream`: **9,40:1**.

Se midieron los **132 indicadores** de las 7 rutas en dos viewports. Los
131 restantes ya pasaban.

**Dos trampas de medición que hay que anotar**, porque las dos generaron
fallos falsos antes de dar con el número bueno:

1. **`.transition-colors` anima `outline-color`**, y su valor de partida
   es `currentColor`. Leyendo el color justo después de `focus()` se lee a
   mitad de la transición: salían 38 «fallos», entre ellos botones cuyo
   anillo definitivo es `navy-400` o `navy-200`, medidos mientras aún
   valían el color del texto. Hay que desactivar las transiciones antes.
2. **`outline-offset` negativo pinta el anillo dentro del elemento**,
   sobre su propio fondo, no sobre el del contenedor. Sin tenerlo en
   cuenta salían como fallidos los bloques «Inicio» y «Únete» del nav, que
   llevan cream sobre navy: 9,40:1.

De 38 supuestos fallos, **uno solo era real** (repetido en dos enlaces y
dos viewports). Merece decirse: una sonda mal calibrada produce trabajo
inventado tan fácilmente como oculta el de verdad.

### 4.10 Tres rutas no usaban la capa de datos de SEO (D-169)

`/participaciones`, `/patrocinios` y `/contacto` tomaban el título de
`seoRoutes` pero la descripción del copy visible de la diapositiva:

| Ruta | Antes | Ahora |
|---|---:|---:|
| `/patrocinios` | 288 chars (`sponsors.paragraph`) | 100 |
| `/participaciones` | 194 chars (`participations.subtitle`) | 77 |
| `/contacto` | 34 chars (`contact.title` + subtítulo) | 64 |

Las tres pasan a `seoRoutes.*.description`, que ya existía y estaba
escrita para esto. **No se ha inventado copy**: sólo se ha usado el que ya
había en la capa de datos.

---

## 5. Mejoras de SEO añadidas

- **JSON-LD `Event`**: `url` (la página de Southwest) e `image` (`og.jpg`),
  las dos propiedades recomendadas que faltaban para un resultado
  enriquecido. **No** se añade `endDate`: el PDF no da fecha de cierre y
  aquí no se inventan datos (regla 7).
- **JSON-LD `Organization`**: `logo` (el isotipo) y `sameAs` (Instagram).
- **Sin `canonical` en páginas `noindex`** (D-170). Google desaconseja
  combinarlos: son señales contradictorias, y en `/404` el canonical
  apuntaba a una URL que no queremos que exista.

---

## 6. Estado al cerrar

Las 7 rutas, en los dos perfiles: **Performance 100, Accessibility 100,
Best Practices 100, SEO 100**, salvo el SEO de `/404`.

**La única cifra con poco margen es el LCP de `/equipo/`.** Se midió siete
veces sobre el mismo build: 1,58 · 1,58 · 1,58 · 1,58 · 1,65 · 1,81 ·
1,89 s. Todas cumplen, la peor por 0,11 s. El FCP es 0,90 s en las siete,
así que lo que varía es la decodificación de imágenes bajo CPU ×4, no la
red: `/equipo/` lleva 145 KB de JPG (seis retratos y la foto de grupo)
casi todos en el primer viewport. Son placeholders; con las fotos reales
esta es la primera ruta que puede cruzar los 2,0 s y donde habrá que
aplicar `srcset` + AVIF/WebP.

**`/404` saca 66 en SEO y es correcto.** Falla un único audit,
`is-crawlable`, porque lleva `noindex,nofollow` — que es justo lo que debe
llevar una página de error. Ese audit pesa 4,04 de los 12,04 puntos de la
categoría. Una página de error no puede sacar 100 en SEO sin dejar de ser
una página de error.

Bajó de 69 a 66 al quitarle el `canonical`: el audit `canonical` pasa de
«pasa, peso 1» a «no aplica, peso 0» y encoge el denominador. El sitio
está mejor y el número es más pequeño. Se deja como está: optimizar contra
la guía de Google para subir tres puntos de un número sería exactamente la
medición deshonesta que esta sesión venía a eliminar.

| Presupuesto RULES §12 | Objetivo | Peor valor | |
|---|---|---:|:---:|
| Performance / A11y / BP / SEO | ≥ 95 | 100 / 100 / 100 / 100 | ✅ |
| LCP | < 2,0 s | **1,89 s** (`/equipo/` móvil, peor de 7 ejecuciones; mediana 1,58 s) | ✅ |
| CLS | < 0,02 | 0,0005 | ✅ |
| TBT | < 150 ms | 0 ms | ✅ |
| JS por ruta | < 25 KB gz | 3,33 KB | ✅ |
| CSS por ruta | < 30 KB gz | 10,34 KB | ✅ |
| Peso de `/` sin video | < 500 KB | 158 KiB | ✅ |
| Requests a terceros | 0 | 0 | ✅ |

---

## 7. `check:network`, quinto control automático (D-174)

`scripts/check-network.mjs` deja reproducible lo que antes era una
afirmación en un documento. Recorre las 7 rutas en 390×844 y 1920×1080 y
comprueba:

1. Cero peticiones a terceros.
2. Cero respuestas 4xx/5xx.
3. Ningún `<video>` con `src` ni con `poster` en el HTML de `dist/`.
4. Los videos que arrancan fuera del viewport no piden un byte antes del
   scroll, y sí lo piden después.
5. Los pósters de esos videos tampoco se piden antes (se exige en móvil).

**Dos matices que el script distingue a propósito**, porque la primera
versión los daba por fallos y no lo eran:

- **El video de `/participaciones/` sí se pide al cargar.** La p.7 lo
  coloca en la primera pantalla, a 348–377 px del borde. Está dentro del
  viewport, así que cargarlo es la regla cumplida, no incumplida. El
  script mide la posición de cada `<figure>` y sólo exige «cero bytes» a
  los que arrancan fuera.
- **En escritorio a 1920×1080 los pósters de `/` sí se piden.** La segunda
  pantalla empieza a 1 096 px, a 16 px del pliegue, y ahí entra el umbral
  de proximidad de `loading="lazy"`, que en Chrome sin limitar la red pasa
  de los 1 000 px. Es para lo que existe el atributo. Bajo la red móvil
  emulada —la que mide el presupuesto— no ocurre. El script lo exige en
  móvil y lo informa en escritorio.

`scripts/check-states.mjs` se adaptó al cambio del póster: antes exigía el
atributo `poster` en el `<video>`; ahora exige la capa
`<img loading="lazy">` y que lleve efectivamente el `loading`.

---

## 8. Gates de cierre

| Control | Resultado |
|---|---|
| `bunx astro check` | 0 errores, 0 warnings, 0 hints (64 archivos) |
| `bun run build` | 7 páginas, sin errores |
| `bun run check:render` | 28 comprobaciones, todo visible con y sin JS |
| `bun run check:overflow` | sin scroll horizontal en 10 resoluciones |
| `bun run check:states` | 78 comprobaciones, 0 fallos |
| `bun run check:layers` | 151 imports, arquitectura respetada |
| `bun run check:network` | 0 terceros, 0 errores, video y póster diferidos |
| Lighthouse × 14 | 100/100/100/100, salvo SEO de `/404` |
| Contraste de indicadores de foco | 132 medidos, 0 por debajo de 3:1 |
| Contraste de texto | todos los nodos visibles × 7 rutas × 2 viewports, 0 fallos |

---

## 9. Archivos tocados

**Componentes y datos**

- `src/styles/global.css` — token `--color-navy-600`.
- `src/components/layout/Nav.astro` — bloque «Únete» a `navy-600`, bajada
  a `ink/60`, enlace de marca sin `aria-label` y con sufijo sr-only.
- `src/components/ui/Logo.astro` — prop `alt` que sobreescribe el del
  manifiesto.
- `src/components/media/LazyVideo.astro` — póster como capa
  `<img loading="lazy">`, fuera del atributo `poster`.
- `src/components/sections/SponsorTeaser.astro` — un solo `Reveal` sobre
  la lista.
- `src/components/sections/{About,ParticipationsOverview,SponsorTeaser,SponsorHero,SponsorTiers,ContactBlock,JoinCta}.astro`
  — `aria-labelledby` y `headingId`.
- `src/pages/404.astro` — `aria-labelledby` en las dos pantallas, flecha a
  `navy-700`.
- `src/components/ui/ContactActions.astro` — anillo de foco cream en los
  dos enlaces sobre navy.
- `src/pages/{participaciones,patrocinios,contacto}.astro` — descripción
  desde `seoRoutes`.
- `src/layouts/Layout.astro` — sin `canonical` si `noindex`.
- `src/data/media.ts` — `VideoAsset.poster` como `ImageAsset`, dimensiones
  reales, fin de la duplicación de rutas.
- `src/data/nav.ts` — `brandAriaTemplate` → `brandLinkSuffix`.
- `src/data/seo.ts` — `Event.url`/`image`, `Organization.logo`/`sameAs`.

**Activos**

- `public/media/images/competition-car-cutout.png` — 283 455 B → 58 452 B.

**Scripts**

- `scripts/check-network.mjs` — nuevo.
- `scripts/check-states.mjs` — adaptado al póster en capa.
- `package.json` — `check:network`.

**Documentación**

- `docs/PERFORMANCE.md` — reescrito entero.
- `docs/STATE.md`, `docs/DECISIONS.md`, `docs/ASSETS.md`,
  `docs/BACKLOG.md`, `README.md`.

---

## 10. Lo que queda (no bloqueante)

- **El CSS ha crecido un 50 % desde F1** (6,9 → 10,34 KB gz). Está al 34 %
  del presupuesto, pero conviene mirarlo en F8.
- **`srcset` + AVIF/WebP**: pendiente de las imágenes definitivas. 17 de
  19 son placeholders y montar el pipeline ahora es trabajo que habría que
  rehacer.
- **Títulos largos**: `/` (82 chars) y Southwest (102) pasan de lo que
  muestra Google, por el sufijo obligatorio de RULES §14. Cambiarlo es
  decisión del usuario.
- **`Disallow: /kit`** en `robots.txt` apunta a una ruta que S9 eliminó.
  Inofensivo.
- **Dominio definitivo** (P-005): sigue el placeholder.

---

# F7b · Aire vertical y sangrado de las p.6 y p.7 (2026-08-21)

> Petición del usuario tras revisar F7. Tres cosas: «Acerca de nosotros»
> está muy ajustado a la página, el texto del video no se lee sobre él, y
> Participaciones necesita lo mismo, más ancho y sin desfase con la
> pantalla anterior. Las tres eran ciertas y las tres se midieron.

## F7b.1 El diagnóstico común: las dos diapositivas componen más de 1000px

Medido sobre la p.6 rasterizada, columna de texto (x 40..560):

```
margen superior  61px
contenido       985px   (titular + caja de la pregunta + caja del cuerpo)
margen inferior  34px
                ─────
                1080px   ← la altura del lienzo del PDF
```

El nav ocupa 80px, así que una pantalla deja **1000**. F5b resolvió la
diferencia borrando el aire (`padding-block: 0`, D-140). El resultado
medido antes de esta sesión:

| | Diseño (a escala de 1000px) | Antes de F7b |
|---|---:|---:|
| margen superior | 56px | **16px** |
| margen inferior | 31px | **−13px** (se salía) |

Eso es lo que se veía «muy ajustado»: no era una impresión, el cuerpo
literalmente rebasaba la pantalla por abajo.

La p.7 tenía la variante extrema del mismo problema: compone 1000px
exactos y estaba pegada a los cuatro bordes, con el chip «PRÓXIMO EVENTO»
en y=0 —contra la diapositiva anterior— y el video terminando en y=1000.

## F7b.2 La solución: que cada diapositiva declare su altura de composición

`--screen-fs` se sobreescribe **en el mismo elemento que lleva `.screen`**.
Eso es lo que hace que funcione: `--spacing`, `--text-*` y `--container-*`
se declaran ahí y resuelven contra el valor propio del elemento, así que
la diapositiva entera escala en bloque —tipografía, huecos, ancho de la
columna de texto y el `36em` de la rejilla— sin tocar una sola utilidad.

| | Unidades declaradas | `--screen-fs` a 1920×1080 | Factor |
|---|---:|---:|---:|
| p.6 (`.about-screen`) | 68.25 | 14,65px | ×0,916 |
| p.7 (`.participations-screen`) | 66.5 | 15,04px | ×0,940 |

**68.25 y no 67.5**, que es lo que suman las medidas del PDF: nuestra
columna compone 997px donde el diseño pone 985. Los 12px de más son de la
pila tipográfica —Arial en lugar de la Segoe UI del PDF, con las 20 líneas
justificadas del cuerpo (D-137)— y con 67.5 la pantalla se pasaba 11px. El
divisor sale de medir el render, no de sumar el diseño (D-176).

Resultado medido: **About 1001px, Participaciones 1000px**, con 56/31px y
30/30px de aire respectivamente.

**Sólo afecta a viewports anchos y bajos.** `--screen-fs` es
`min(0.833vw, alto/N)`: a 1440×900 y a 1280×800 manda el término de ancho
(12,00px y 10,66px) y el divisor no interviene, así que esas resoluciones
no cambian ni un pixel. A 1920×1080 manda el de alto, que es justo donde
estaba el problema.

## F7b.3 La p.7, a lo ancho: `1fr` en vez de escalar y centrar

Aquí había que tener cuidado de no repetir el error de F5. Lo que el
usuario rechazó entonces (D-156) fue una composición «más pequeña y
centrada»: F5 encogía la diapositiva y repartía el sobrante a los lados.

La diferencia ahora es que la columna derecha pasa de `80.5625em` a
**`1fr`** y `padding-right` a **0**, así que el sobrante se lo come el
media, que **sangra hasta x=1920**. Ése era además el «desfase feo» que
reportó el usuario:

| | Antes | Ahora |
|---|---:|---:|
| foto de la p.6 (arriba) termina en | x=1920 | x=1920 |
| media de la p.7 terminaba en | **x=1877** | **x=1920** |

43px de escalón entre dos pantallas pegadas, que es exactamente lo que se
ve al hacer scroll. Con los 30px de aire de F7b.2 las dos dejan además de
estar pegadas, que era la otra mitad de la queja (D-177).

Un intento intermedio que **no** funcionó y conviene anotar: poner el
media en `flex-1` para que absorbiera el alto sobrante. La altura de la
rejilla es automática, así que no hay nada que repartir y el
`aspect-ratio` del `<figure>` vuelve a mandar — la pantalla se iba a
1085px. El `canvas:h-[45.75em]` original ya escala solo con `--screen-fs`;
no hacía falta tocarlo.

## F7b.4 El texto sobre el video: 3,18:1 en el peor punto

La tercera queja también era medible. El titular del overlay va en blanco
sobre el fotograma, y el fondo **no es conocido**: es video, cambia. No
vale calibrar contra el póster de hoy.

Medido sobre el póster real, **ocultando el texto** para no medir los
propios glifos (la primera pasada los incluía y daba un absurdo 1:1):

| | Medio | Peor píxel |
|---|---:|---:|
| Velo anterior | 6,56:1 | **3,18:1** |
| Velo de F7b | **9,63:1** | **6,48:1** |

El velo anterior repartía `transparent → navy-900/75` por toda la altura,
así que en la banda del texto (72–92 %) iba por la mitad del recorrido. El
nuevo llega al 70 % justo donde empieza esa banda y sube al 88 % abajo,
donde va la chapa de la fecha. Por encima del 40 % sigue transparente: la
foto se ve entera.

**Sobre blanco puro** —el peor fotograma concebible, y lo que hay que
cubrir tratándose de video— navy-900 al 70 % da **5,30:1**, con margen
sobre el 4,5 de AA (D-178).

## F7b.5 Gates

| Control | Resultado |
|---|---|
| `bunx astro check` | 0 errores, 0 warnings, 0 hints |
| `bun run build` | 7 páginas, sin errores |
| `bun run check:render` | 28 comprobaciones |
| `bun run check:overflow` | sin scroll horizontal en 10 resoluciones |
| `bun run check:states` | 78 comprobaciones, 0 fallos |
| `bun run check:layers` | 151 imports |
| `bun run check:network` | 0 terceros, 0 errores |
| Lighthouse móvil × 7 | 100/100/100/100 (SEO de `/404`: 66, a propósito) |

Encaje verificado en las tres resoluciones de lienzo: la p.7 mide 1000px
en 1920×1080, 820 en 1440×900 y 720 en 1280×800, y el media llega al borde
derecho en las tres.
