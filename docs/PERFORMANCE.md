# Rendimiento, accesibilidad y SEO — medición F7

> **Todo lo que hay en este documento se midió el 21 de agosto de 2026**,
> en las sesiones F7 y **F8**, sobre el build de producción
> (`bun run build`) servido con `bun run preview` en
> `http://localhost:4321`.
>
> **Las cifras de peso son las de F8**, posteriores al pipeline de
> imágenes (`astro:assets`) y al acotado del escaneo de Tailwind: §3
> y §3.4. Lo que F7 midió y corrigió está en §7.
>
> **No se hereda ni una cifra de las versiones anteriores de este archivo**
> (ADENDA §A5). Las tablas de S8 y de F1 se han borrado, no archivado: no
> eran comparables, porque S8 midió páginas cuyo contenido era invisible
> (`docs/AUDIT-F2.md` §1) y F1 midió una estructura de rutas que F6b
> cambió. Lo que decían aquellas tablas y en qué se equivocaban está en
> `docs/sessions/F7-perf-a11y-seo.md` §1.

## Entorno de medición

| | |
|---|---|
| Fecha | **2026-08-21** |
| Build | `astro build`, `output: 'static'`, 7 rutas |
| Servidor | `astro preview` (Astro 7.2.2), `localhost:4321` |
| Lighthouse | **13.4.1**, categorías `performance`, `accessibility`, `best-practices`, `seo` |
| Navegador | Chromium del sistema (`/usr/bin/chromium`), headless |
| Perfil móvil | preset por defecto de Lighthouse: Moto G Power emulado, 4G lento (1,6 Mbps, 150 ms RTT), CPU ×4 |
| Perfil escritorio | preset `desktop` de Lighthouse: 1350×940, red y CPU sin limitar |
| Red / terceros / video | Playwright + Chromium, `bun run check:network`, viewports 390×844 y 1920×1080 |

**Sobre Lighthouse y la whitelist de dependencias.** El paquete
`lighthouse` **no** está en `package.json` ni en `bun.lock`, y la
whitelist de RULES §16.4 sigue intacta. Se instaló y se ejecutó **fuera
del repositorio**, en un directorio temporal, contra el Chromium del
sistema: es un instrumento de medición, no una dependencia del sitio, y
no viaja con él. Decisión del usuario, registrada como **D-162**.

Hasta F7 este documento decía que Lighthouse «no se puede ejecutar sin
romper una regla». Era una conclusión precipitada: la regla habla de las
dependencias del proyecto, y medir desde fuera no añade ninguna.

---

## 1. Resumen: presupuestos de RULES §12

Peor valor de las 7 rutas en cada columna.

| Métrica | Presupuesto | Móvil | Escritorio | Estado |
|---|---|---:|---:|:---:|
| Performance | ≥ 95 | **100** | **100** | ✅ |
| Accessibility | ≥ 95 | **100** | **100** | ✅ |
| Best Practices | ≥ 95 | **100** | **100** | ✅ |
| SEO | ≥ 95 | **100** (`/404`: 66) | **100** (`/404`: 66) | ✅ salvo `/404`, a propósito — §6.4 |
| LCP | < 2,0 s | **1,28 s** | **0,33 s** | ✅ |
| CLS | < 0,02 | **0,0000** | **0,0008** | ✅ |
| TBT | < 150 ms | **0 ms** | **0 ms** | ✅ |
| JS enviado (sin video) | < 25 KB gz | **3,33 KB** | igual | ✅ holgura 7,5× |
| CSS total | < 30 KB gz | **9,52 KB** | igual | ✅ holgura 3,2× |
| Peso de `/` sin videos | < 500 KB | **81 KiB** | **81 KiB** | ✅ |
| Requests de terceros | 0 | **0** | **0** | ✅ |

**Los once presupuestos se cumplen.** El único número por debajo de 95 es
el SEO de `/404`, y es correcto que lo esté: ver §6.4.

Cuatro de estos valores **no se cumplían al empezar la sesión**. Lo que
fallaba y qué se corrigió está en §7.

---

## 2. Lighthouse, ruta por ruta

### 2.1 Móvil

| Ruta | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Peso |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 1,05 s | 1,28 s | 0 ms | 0,0000 | 81 KiB |
| `/equipo/` | 100 | 100 | 100 | 100 | 0,90 s | 1,21 s | 0 ms | 0,0000 | 47 KiB |
| `/participaciones/` | 100 | 100 | 100 | 100 | 1,05 s | 1,28 s | 0 ms | 0,0000 | 60 KiB |
| `/participaciones/southwest-2027/` | 100 | 100 | 100 | 100 | 0,90 s | 1,05 s | 0 ms | 0,0000 | 39 KiB |
| `/patrocinios/` | 100 | 100 | 100 | 100 | 0,90 s | 1,07 s | 0 ms | 0,0000 | 32 KiB |
| `/contacto/` | 100 | 100 | 100 | 100 | 0,90 s | 1,05 s | 0 ms | 0,0000 | 27 KiB |
| `/404.html` | 100 | 100 | 100 | **66** | 0,90 s | 1,05 s | 0 ms | 0,0000 | 23 KiB |

### 2.2 Escritorio

| Ruta | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 100 | 100 | 100 | 100 | 0,30 s | 0 ms | 0,0000 |
| `/equipo/` | 100 | 100 | 100 | 100 | 0,33 s | 0 ms | 0,0000 |
| `/participaciones/` | 100 | 100 | 100 | 100 | 0,30 s | 0 ms | 0,0008 |
| `/participaciones/southwest-2027/` | 100 | 100 | 100 | 100 | 0,28 s | 0 ms | 0,0000 |
| `/patrocinios/` | 100 | 100 | 100 | 100 | 0,29 s | 0 ms | 0,0000 |
| `/contacto/` | 100 | 100 | 100 | 100 | 0,28 s | 0 ms | 0,0000 |
| `/404.html` | 100 | 100 | 100 | **66** | 0,28 s | 0 ms | 0,0000 |

### 2.3 Lo que cambió entre F7 y F8

El pipeline de imágenes de F8 (§3.4) es lo que mueve estas cifras:

| Ruta | Peso F7 | Peso F8 | | LCP móvil F7 | LCP móvil F8 |
|---|---:|---:|---|---:|---:|
| `/` | 158 KiB | **81** | −49 % | 1,28 s | 1,28 s |
| `/equipo/` | 185 KiB | **47** | −75 % | **1,58–1,89 s** | **1,21 s** |
| `/participaciones/` | 109 KiB | **60** | −45 % | 1,35 s | 1,28 s |
| `/participaciones/southwest-2027/` | 102 KiB | **39** | −62 % | 1,05 s | 1,05 s |
| `/patrocinios/` | 68 KiB | **32** | −53 % | 1,43 s | 1,07 s |
| `/contacto/` | 67 KiB | **27** | −60 % | 1,05 s | 1,05 s |
| `/404.html` | 44 KiB | **23** | −48 % | 1,05 s | 1,05 s |

`/equipo/` era la única ruta con poco margen —F7 la midió siete veces y
daba de 1,58 a 1,89 s sobre un presupuesto de 2,0— y era también la que
más imágenes servía de más. Ya no es la peor de la tabla.

## 3. Peso: `dist/`, CSS y JS

### 3.1 `dist/` completo

**3 316 770 B = 3,16 MB en 265 archivos.**

| Tipo | Archivos | Tamaño |
|---|---:|---:|
| JPG | 90 | 1 342,21 KB |
| PNG | 6 | 541,07 KB |
| WebP | 75 | 510,09 KB |
| HTML | 7 | 494,74 KB |
| AVIF | 75 | 295,81 KB |
| WOFF / WOFF2 | 2 | 46,83 KB |
| SVG | 2 | 3,31 KB |
| JS | 1 | 2,43 KB |
| resto (sitemap, robots, manifest, ico) | 5 | 2,51 KB |

**Ese total ya no dice nada sobre lo que descarga nadie.** Desde F8 cada
imagen se publica en tres formatos y hasta seis anchos, así que `dist/`
pasa de 1,03 MB a 3,16 MB **en disco** mientras el peso por visita **baja
entre un 45 % y un 75 %** (§2.3): el navegador se lleva una sola variante
de cada imagen. La cifra útil es la de §4.4, no ésta.

### 3.2 CSS y JS por ruta (gzip nivel 9 sobre los bytes servidos)

| Ruta | HTML gz | CSS inline gz | JS inline gz | JS externo gz | **JS total gz** |
|---|---:|---:|---:|---:|---:|
| `/` | 19,41 KB | 9,52 KB | 2,24 KB | 1,09 KB | **3,33 KB** |
| `/equipo/` | 15,31 KB | 9,52 KB | 1,21 KB | 1,09 KB | **2,30 KB** |
| `/participaciones/` | 16,29 KB | 9,52 KB | 1,67 KB | 1,09 KB | **2,76 KB** |
| `/participaciones/southwest-2027/` | 15,20 KB | 9,52 KB | 1,21 KB | 1,09 KB | **2,30 KB** |
| `/patrocinios/` | 17,29 KB | 9,52 KB | 1,21 KB | 1,09 KB | **2,30 KB** |
| `/contacto/` | 15,01 KB | 9,52 KB | 1,21 KB | 1,09 KB | **2,30 KB** |
| `/404.html` | 14,50 KB | 9,52 KB | 1,21 KB | 1,09 KB | **2,30 KB** |

- **CSS: 45,06 KB raw / 9,52 KB gz**, idéntico en las 7 rutas. Presupuesto
  30 KB gz: queda al **32 %**.

  F7 midió 10,34 KB gz y avisó de que había crecido un 50 % desde F1. F8
  encontró parte de la causa y no era el diseño: **Tailwind 4 escaneaba
  `docs/**` y `scripts/`**, así que cada clase citada en prosa en una
  bitácora —`pt-20`, `border-t-4`, `min-h-screen`, `text-ink/55`— se
  emitía y viajaba en el CSS de las 7 páginas. Eran **99 clases fantasma
  y 694 B gz por ruta**, creciendo con cada sesión documentada. Con
  `source(none)` + `@source "../"` el escaneo se limita a `src/`
  (D-179). Verificado con diff de píxeles: las pantallas salen idénticas.

- **JS: 2,30–3,33 KB gz**, presupuesto 25 KB. Holgura de **7,5×**.
  - Un solo `.js` externo: `dist/_astro/page.BDh2vuYI.js` (2 487 B raw /
    1 118 B gz), el shim de prefetch de Astro con estrategia `hover`.
  - El resto inline: `nav.ts` + `reveal.ts` en todas las rutas,
    `countdown.ts` sólo en `/`, `lazy-video.ts` sólo en `/` y
    `/participaciones/`.
- **JSON-LD:** 552 B con `Organization`, 1 236 B en las tres que además
  llevan `Event`.

### 3.3 Tipografía

Una sola webfont: `libre-baskerville-latin-400-italic.woff2`, **21,06 KB**,
`font-display: swap`, sin preload. Segoe UI y Arial son de sistema.

El `.woff` de 25,77 KB que hay al lado es el fallback de `@fontsource`;
ningún navegador moderno lo descarga, porque el `woff2` va primero en la
declaración. Ocupa sitio en `dist/` y cero bytes en la red.

---

### 3.4 Imágenes: `astro:assets` (F8)

Hasta F8 los rasterizados vivían en `public/`, que Astro no procesa: se
servía el archivo entero, en su formato original, a cualquier tamaño de
pantalla. Medido, la desproporción era grande:

| Imagen | Se servía | Hueco real (móvil / 1920) |
|---|---:|---:|
| Retrato de mesa directiva | 600 px | **159 / 262** |
| Foto de grupo | 1800 px | 342 / 824 |
| Hero de Patrocinios | 1600 px | 340 / 823 |
| Imagen de paquete | 800 px | 340 / 542 |
| Galería de competencia | 1200 px | 342 / 544 |
| Lockup institucional | 319 px | 230 / 230 |

Los 20 archivos se movieron a **`src/assets/media/`** —lo único que Astro
puede optimizar— y `Img.astro` emite ahora un `<picture>` con AVIF, WebP y
el formato original, con `srcset` de hasta seis anchos y un `sizes`
tomado de esa tabla, hueco por hueco (D-180).

- El manifiesto `data/media.ts` **no cambia**: su ruta `/media/…` pasa de
  URL pública a clave, y `Img` la resuelve con `import.meta.glob`. Si no
  existe, **el build falla** en vez de publicar un `<img>` roto (D-181).
- El `<picture>` va con `display: contents` para no introducir una caja
  donde antes no la había (D-182). Verificado con diff de píxeles.
- **Siguen en `public/`**: los dos MP4 (no los optimiza), el isotipo SVG
  (no lo necesita) y `og.jpg` (necesita URL absoluta estable).

Resultado: 245 variantes generadas y el peso por visita entre un 45 % y un
75 % menor (§2.3).

## 4. Red: video y terceros

Verificado con `bun run check:network` (`scripts/check-network.mjs`), que
recorre las 7 rutas en 390×844 y en 1920×1080 y deja el resultado
reproducible en vez de en una afirmación de esta página.

### 4.1 Cero peticiones a terceros

**0 en las 14 combinaciones ruta × viewport.** El único origen que
aparece en la pestaña Network es `localhost:4321`. También **0 respuestas
4xx/5xx**.

La única URL externa del sitio es `https://instagram.com/aiche.gdl` en un
`href` del footer y del bloque de contacto: es un enlace, no se pide al
cargar.

### 4.2 El video no descarga un byte hasta entrar al viewport

Comprobado en tres niveles:

1. **Estructural, sobre `dist/`:** ningún `<video>` lleva `src`. Las URLs
   viven en `data-src` dentro de un `<template>`, así que el navegador no
   las procesa. `preload="none"` declarado.
2. **En red, antes del scroll:** los dos videos de `/` arrancan fuera del
   viewport (a 1 955 px y 2 486 px en móvil) y **no generan ninguna
   petición** a `.mp4`.
3. **En red, después del scroll:** al acercarlos, los dos se piden. El
   `IntersectionObserver` funciona.

**Un matiz que hay que decir:** en `/participaciones/` el video **sí** se
pide al cargar, en los dos viewports. Es correcto y no es una excepción a
RULES §11.2: la p.7 lo coloca en la primera pantalla (a 348–377 px del
borde superior), así que ya está dentro del viewport. La regla es «no
descargar lo que no se ve», y eso se ve.

### 4.3 El póster tampoco se descarga (corregido en F7)

El atributo `poster` de `<video>` **se descarga siempre**, aunque el
elemento esté a 2 000 px del pliegue y aunque `preload="none"`. Eso hacía
que la home se trajera 113 KB antes de pintar nada: `about-poster.jpg`
(70 KB) + `chem-e-car.jpg` (43 KB), los dos por debajo del pliegue.

Desde F7 el póster es una capa `<img loading="lazy">` dentro del mismo
`<figure>`, por debajo del `<video>` (**D-163**). Medido después: en móvil
los dos pósters de `/` ya no se piden hasta acercarse, y el LCP de la home
baja de **1,95 s a 1,28 s**.

Sin JavaScript no se pierde nada: la capa `<img>` sigue mostrando el
póster igual que antes lo mostraba el atributo (ADENDA §A2).

En escritorio a 1920×1080 los dos pósters de `/` **sí** se piden al
cargar. No es un fallo: la segunda pantalla empieza a 1 096 px, a 16 px
del pliegue, y ahí entra el umbral de proximidad de `loading="lazy"`, que
en Chrome sin limitar la red es de más de 1 000 px. Es exactamente para lo
que existe el atributo. Bajo la red móvil emulada —la que mide el
presupuesto— no ocurre.

### 4.4 Peso real por ruta en red

`content-length` sumado de todo lo que se pide, ya con el video cargado.
Es **la cifra que importa**: lo que descarga una visita, no lo que ocupa
`dist/` en disco (§3.1).

| Ruta | Móvil | Escritorio |
|---|---:|---:|
| `/` | 45 KB (9 req) | 58 KB (9 req) |
| `/equipo/` | 23 KB (11 req) | 25 KB (11 req) |
| `/participaciones/` | 33 KB (7 req) | 37 KB (7 req) |
| `/participaciones/southwest-2027/` | 12 KB (5 req) | 17 KB (5 req) |
| `/patrocinios/` | 5 KB (7 req) | 15 KB (11 req) |
| `/contacto/` | 4 KB (5 req) | 5 KB (5 req) |
| `/404.html` | 3 KB (4 req) | 3 KB (4 req) |

Estos números son más bajos que los KiB de §2 porque no cuentan el HTML
ni la webfont, que Lighthouse sí suma. Los dos conjuntos coinciden en lo
esencial: **ninguna ruta pasa de 81 KiB.**

Que `/patrocinios` baje a 5 KB en móvil no es un error de medida: sus seis
imágenes están lejos del pliegue en la pila de una columna y
`loading="lazy"` no las pide; en la diapositiva de 1920 sí se ven, y por
eso ahí sube a 15 KB.

## 5. Accesibilidad (RULES §13)

Lighthouse da **100 en las 7 rutas y en los dos perfiles**. Ese 100 cubre
alrededor de un tercio de los criterios WCAG, así que lo demás se auditó
aparte, recorriendo el DOM renderizado en los dos viewports.

### 5.1 Comprobaciones estructurales

| Comprobación | Resultado |
|---|---|
| `<html lang="es-MX">` | ✅ las 7 rutas |
| Un solo `<h1>` por página | ✅ las 7 rutas |
| Jerarquía de encabezados sin saltos | ✅ `/` va `1,2,3,2,3,3,2,2`; `/patrocinios` `1,2,2,3,3`; el resto `1,2` o `1,2,2` |
| Landmarks `header` / `nav` / `main` / `footer` | ✅ los cuatro en las 7 rutas |
| `<main>` con nombre accesible que resuelve | ✅ `aria-labelledby="page-title"`, y el id existe |
| Todos los `<nav>` con nombre | ✅ |
| **`<section>` con nombre accesible** | ✅ 17 de 17 — **11 no lo tenían al empezar** (§7) |
| Interactivos sin nombre accesible | ✅ 0 |
| Imágenes sin atributo `alt` | ✅ 0 (10 decorativas con `alt=""`) |
| Imágenes sin `width`/`height` | ✅ 0 → CLS 0 |
| Foco visible en cada enfocable | ✅ `bun run check:states`, 78 comprobaciones |
| **Contraste del indicador de foco** | ✅ **132 indicadores medidos, 0 por debajo de 3:1** — 2 no llegaban (§7.10) |
| Focus trap y `Escape` en el menú móvil | ✅ 23 tabulaciones sin escaparse |

### 5.2 Contraste sobre los colores finales

No se auditó una muestra: se recorrió **cada nodo de texto visible** de
las 7 rutas en los dos viewports, resolviendo el color efectivo y el
fondo apilado. Los colores de Tailwind 4 con alfa se emiten como
`oklab(… / .65)`, así que no valen las expresiones regulares: se pintan en
un canvas de 1×1 y se lee el píxel.

**Resultado: 0 fallos.** Todo el texto llega a AA (4,5:1 normal, 3:1 para
≥24 px o ≥18,66 px en negrita).

Pares representativos:

| Combinación | Ratio | AA |
|---|---:|:---:|
| `cream` #f4f1e9 sobre `navy` #123f72 | 9,40:1 | ✅ |
| `cream` sobre `navy-900` #0d2f57 | 11,92:1 | ✅ |
| `white/80` sobre `navy` | 6,61:1 | ✅ |
| `navy` sobre `cream` | 9,40:1 | ✅ |
| Bajada del nav `ink/60` #535556 sobre `chrome` #d0d4d7 | **5,03:1** | ✅ (era 4,29:1) |
| Bloque «Únete»: blanco sobre `navy-600` #2979b2 | **4,70:1** | ✅ (era 3,93:1) |
| Flecha `→` de `/404`: `navy-700` sobre blanco | 8,30:1 | ✅ (era 3,40:1) |
| Outline de foco `navy-700` sobre `cream` | 7,36:1 | ✅ |
| Outline de foco `cream` sobre `navy` | 9,40:1 | ✅ (era 1,28:1 en Contacto) |
| Titular del overlay de video sobre el velo | 6,48:1 peor píxel | ✅ (era 3,18:1) |

**El velo del overlay de video** (`.video-scrim`) merece su propio párrafo
porque es el único sitio del sitio donde el fondo del texto **no es
conocido**: es un fotograma de video que cambia. No sirve calibrar contra
el póster de hoy; hay que cubrir el peor caso posible, que es blanco puro.

Medido sobre el póster real, ocultando el texto para no medir los propios
glifos: el velo anterior dejaba el titular a 6,56:1 de media pero a
**3,18:1** en el punto más claro (las batas del laboratorio). El velo de
F7b llega a navy-900 al 70 % justo donde empieza la banda de texto (72 %
de la altura) en lugar de al final, y sube al 88 % abajo, donde va la
chapa de la fecha: **9,63:1 de media y 6,48:1 en el peor píxel**. Sobre
blanco puro —el peor fotograma concebible— da **5,30:1**, con margen sobre
el 4,5 de AA (D-178).

**Dos de estos fallos venían del propio diseño**, no de la
implementación, y están explicados en §7.2.

### 5.3 `prefers-reduced-motion`

Medido con los dos valores del medio en las 7 rutas:

| | `reduce` | `no-preference` |
|---|---|---|
| Duración de transiciones y animaciones | 0,01 ms (regla global `*` con `!important`) | 21–36 elementos con transición real |
| Contenido con `[data-reveal]` oculto | **0** — nunca se oculta nada | se oculta y entra al intersectar |
| `scroll-behavior` | `auto` | `smooth` |
| Autoplay del video | **no** — queda en pausa con su póster y su botón de play | sí, al entrar al viewport |

El video de `/participaciones/`, que está en el primer viewport, inyecta
sus fuentes también con `reduce`, pero **no se reproduce**: `paused:true`.
Es lo correcto — se prepara, no se mueve.

### 5.4 Contador (RULES §15)

- Las cuatro cifras llevan `aria-live="off"`: no se leen cada segundo.
- Texto alterno para lector de pantalla, en un `.sr-only` fuera de flujo:
  *«Faltan 218 días, 2 horas, 23 minutos y 47 segundos para nuestra
  próxima competencia.»*
- `font-variant-numeric: tabular-nums` + `font-feature-settings: "tnum"`
  confirmados en cómputo: las cajas no saltan de ancho.
- Estado post-evento verificado por `check:states`: cajas ocultas, sin
  números negativos.

---

## 6. SEO (RULES §14)

Lighthouse da **100 en las 7 rutas** salvo `/404` (§6.4). Auditado además
sobre el HTML generado, campo por campo.

### 6.1 Metadatos por ruta

| Ruta | Título (chars) | Descripción (chars) | Canonical |
|---|---:|---:|---|
| `/` | 82 | 118 | `/` |
| `/equipo/` | 64 | 75 | `/equipo/` |
| `/participaciones/` | 65 | 77 | `/participaciones/` |
| `/participaciones/southwest-2027/` | 102 | 112 | `/participaciones/southwest-2027/` |
| `/patrocinios/` | 61 | 100 | `/patrocinios/` |
| `/contacto/` | 58 | 64 | `/contacto/` |
| `/404.html` | 63 | 115 | **ninguno** (a propósito, §6.4) |

- **7 títulos únicos y 7 descripciones únicas.**
- Los títulos siguen el patrón obligatorio de RULES §14
  (`Página | AIChE GDL — Tec de Monterrey Campus Guadalajara`), que por sí
  solo ocupa 50 caracteres. Por eso `/` y Southwest pasan de los ~60 que
  muestra Google y se verán cortados en el resultado. **Es la plantilla
  que fija la regla**, no un descuido; anotado en `docs/BACKLOG.md` por si
  el usuario prefiere acortar el sufijo.
- Las descripciones quedan entre 64 y 118 caracteres. **Tres rutas no
  usaban `seoRoutes` y volcaban el copy visible** en la meta: 288
  caracteres en `/patrocinios`, 194 en `/participaciones` y 34 en
  `/contacto`. Corregido (§7.4).
- Open Graph completo en las 7 rutas: `og:title`, `og:description`,
  `og:url`, `og:image`, `og:image:alt`, `og:image:width=1200`,
  `og:image:height=630`, `og:type`, `og:site_name`, `og:locale=es_MX`.
- Twitter completo: `summary_large_image`, título, descripción, imagen y
  `image:alt`.
- `theme-color` `#123f72` y `<link rel="manifest">` en las 7 rutas.

### 6.2 JSON-LD

`Organization` en las 7 rutas; `Event` sólo en las tres que hablan del
evento (`/`, `/participaciones/`, `/participaciones/southwest-2027/`).

```
Event   name       The 2027 AIChE Southwest Student Regional Conference
        startDate  2027-03-27T09:00:00-06:00
        location   Place · McNeese State University · Lake Charles, LA, US
        organizer  Organization · AIChE GDL
        url        …/participaciones/southwest-2027/     ← añadido en F7
        image      …/og.jpg                              ← añadido en F7
        eventStatus / eventAttendanceMode  EventScheduled / OfflineEventAttendanceMode

Organization  name, url, email, description
              logo     …/media/logo/aiche-gdl-isotipo.svg  ← añadido en F7
              sameAs   [instagram.com/aiche.gdl]           ← añadido en F7
              parentOrganization  CollegeOrUniversity · Tecnológico de
                                  Monterrey, Campus Guadalajara
```

Los datos del evento coinciden con RULES §14. **No se declara `endDate`**:
el PDF no da fecha de cierre y aquí no se inventan datos (regla 7).

### 6.3 Sitemap y robots

- `dist/sitemap-index.xml` → `dist/sitemap-0.xml`, **6 URLs**: las 7 rutas
  menos `/404`, que Astro excluye por convención de código de estado. Las
  6 son las indexables. Correcto.
- `dist/robots.txt`: `User-agent: *`, `Allow: /` y la línea `Sitemap:`.
  **Se genera en el build desde `siteUrl`** (D-183); antes era un archivo
  estático con el dominio escrito a mano, que se habría quedado apuntando
  al de prueba al cambiarlo. Se retiró el `Disallow: /kit`, muerto desde
  S9.
- `dist/site.webmanifest`: `theme_color` y `background_color` `#123f72`,
  `display: standalone`, `lang: es-MX`, iconos SVG + ICO.

### 6.4 Por qué `/404` saca 66 en SEO, y por qué está bien

Falla **un solo audit**, `is-crawlable`, porque la página lleva
`<meta name="robots" content="noindex,nofollow">`. Es exactamente lo que
debe llevar una página de error. Los otros 8 audits de la categoría pasan.

Ese audit pesa 4,04 de los 12,04 puntos de la categoría, de ahí el 66.
**Una página de error no puede sacar 100 en SEO sin dejar de ser una
página de error**, así que se declara cumplido el presupuesto para las 6
rutas indexables y se documenta la excepción.

En F7 bajó de 69 a 66 al quitarle el `canonical` (**D-170**). No es una
regresión: Google desaconseja combinar `noindex` con `rel=canonical`
porque son señales contradictorias. Al desaparecer, el audit `canonical`
pasa de «pasa, peso 1» a «no aplica, peso 0» y el denominador encoge. El
sitio está mejor y el número es más pequeño; el número no manda.

### 6.5 Pendiente del usuario

El dominio sigue siendo el placeholder `https://aichegdl.example.com`
(P-005). El usuario aún no lo ha comprado.

Cambiar `siteUrl` en `src/data/site.ts` propaga a canonical, OG, Twitter,
JSON-LD, sitemap y robots — **y desde F8 eso es verdad**: hasta entonces
el dominio estaba también escrito a mano en `astro.config.mjs` y en
`public/robots.txt`, así que el sitemap y el robots se habrían publicado
apuntando al dominio de prueba. Verificado sustituyendo `siteUrl` y
comprobando que no queda ni una aparición del anterior en `dist/`
(D-183).

---

## 7. Lo que no cumplía y se corrigió en F7

Diez defectos. Los cuatro primeros los encontró Lighthouse; el resto
salieron de la auditoría propia, de medir la red y de leer el HTML
generado.

### 7.1 La lista de paquetes de la home era HTML inválido

`SponsorTeaser` envolvía cada `PackageCard` en un `<Reveal>` para
escalonar la entrada, pero `PackageCard` **es** el `<li>`: quedaba
`<ol> → <div> → <li>`. Dos fallos de axe (`list` y `listitem`) que dejaban
la accesibilidad de `/` en **92 en móvil y 87 en escritorio**.

El `Reveal` pasa a envolver la lista entera y la entrada escalonada se
cambia por una del grupo (**D-167**).

### 7.2 Dos contrastes por debajo de AA — heredados del PDF

| Elemento | Antes | Ahora |
|---|---:|---:|
| Bajada del nav, `ink/55` sobre `#d0d4d7` | 4,29:1 | **5,03:1** (`ink/60`) |
| Bloque «Únete», blanco sobre `navy-500` #2e86c6 | 3,93:1 | **4,70:1** (`navy-600` #2979b2) |

**El del bloque «Únete» no es un error de implementación: es del diseño.**
Se midió el PNG rasterizado de la p.1 y el bloque es `#2e86c8` con
«Únete» en blanco; los glifos miden 10,88 px de altura de mayúscula, o sea
un cuerpo de ~15,5 px en negrita — por debajo de los 18,66 px que WCAG
considera texto grande. Con el color literal del diseño no hay forma de
llegar a 4,5:1 con texto blanco.

Se añade el token `--color-navy-600: #2979b2`, el azul del PDF oscurecido
un 10 %, **sólo donde hay texto encima** (**D-164**). `navy-500` sigue
intacto en el degradado de `GridBackdrop` y en el subrayado de 3 px del
item activo, que no llevan texto. Comparado el nav renderizado contra la
p.1 a 1920: la diferencia no se aprecia.

La bajada del PDF es aún más floja (`#67737e` sobre `#d3d8d9` = 3,37:1);
el sitio ya iba por delante y ahora pasa AA con margen.

### 7.3 El enlace de marca incumplía WCAG 2.5.3 «Label in Name»

Llevaba `aria-label="AIChE GDL — ir al inicio"`, que **sustituye** al
texto visible. Como la bajada «TEC DE MONTERREY · CAMPUS GUADALAJARA» no
estaba en el nombre accesible, quien usa control por voz no podía activar
el enlace diciendo lo que ve. Lighthouse lo marcaba como
`label-content-name-mismatch` en las 7 rutas de escritorio.

Fuera el `aria-label`: el nombre sale del texto visible más un sufijo
`.sr-only` con «— ir al inicio» (**D-166**). El isotipo pasa a `alt=""`
—`Logo` acepta ahora un `alt` que sobreescribe el del manifiesto— para que
el nombre no diga «AIChE GDL» dos veces.

### 7.4 Once `<section>` sin nombre accesible

RULES §13 pide `section` con `aria-labelledby`, y `Screen.astro` ya sabía
pasarlo, pero sólo lo usaban `Hero`, `TeamGrid` y `CompetitionInfo`. Se
quedaban fuera siete componentes —`About`, `ParticipationsOverview`,
`SponsorTeaser`, `SponsorHero`, `SponsorTiers`, `ContactBlock` y
`JoinCta`— más las dos secciones de `/404`: **once instancias** repartidas
por cinco rutas (`/` 4, `/patrocinios` 2, `/contacto` 2, `/404` 2,
`/participaciones` 1). Ninguna llegaba al árbol de accesibilidad como
región, así que no aparecían en el listado de landmarks de un lector de
pantalla.

Cada una apunta ahora al `id` de su propio titular (**D-168**). Donde la
pantalla es el `h1` de la página, ese id es el `page-title` que ya
esperaba `<main aria-labelledby>`; donde no, uno propio.

### 7.5 La flecha `→` de `/404`, a 3,40:1

Nueve flechas en `navy-400` sobre blanco. Van con `aria-hidden`, así que
axe no las mira, pero son texto visible. A `navy-700`: 8,30:1.

### 7.6 113 KB de pósters de video antes de pintar nada

Descrito en §4.3. LCP de la home: **1,95 s → 1,28 s** (**D-163**).

Era el defecto de rendimiento real de la sesión: la home entraba con
LCP 1,95 s, a 50 ms del presupuesto, y era el único número que F1 había
dejado marcado como pendiente para F7.

### 7.7 `competition-car-cutout.png` pesaba 283 KB

El recorte del Chem-E-Car extraído del PDF era RGBA de 8 bits sin
cuantizar: 283 455 B para 489×334 px, el archivo más pesado del sitio con
diferencia. Recomprimido a paleta de 256 colores con dithering:
**58 452 B, un 79 % menos**, mismo nombre, mismo formato, alfa intacto y
sin diferencia visible en una comparación al 100 % (**D-173**).
`/participaciones/southwest-2027/` baja de 329 KB a 102 KB.

### 7.8 El manifiesto de medios mentía sobre dos imágenes

`about-poster.jpg` se declaraba 1920×1080 y mide **730×487**;
`chem-e-car.jpg` se declaraba 1600×900 y mide **574×383**. Son las fotos
que F6b extrajo del PDF; el manifiesto conservó las medidas de los
placeholders anteriores.

Además, la ruta de cada póster estaba escrita **dos veces**: en el
`VideoAsset` como cadena suelta y en un `ImageAsset` gemelo que no usaba
nadie. `VideoAsset.poster` pasa a ser un `ImageAsset` y los dos consumen
la misma entrada, con las dimensiones reales (**D-172**).

### 7.9 Dos anillos de foco invisibles en `/contacto`

Los enlaces `aiche.gdl@gmail.com` y `aiche.gdl` del bloque de contacto sólo
declaraban `focus-visible:underline`, así que heredaban el outline global
de `global.css` — `navy-700`, elegido para el fondo crema. Sobre el navy
del bloque eso son **1,28:1**: el anillo no se veía. El subrayado sí, así
que había indicador, pero el anillo que el navegador pintaba encima era
invisible. Con `focus-visible:outline-cream`: **9,40:1** (**D-175**).

Lo encontró la sonda que `docs/BACKLOG.md` pedía desde F6: `check:states`
comprobaba que **existe** un indicador de foco, no que se **vea**. Se
midieron los 132 indicadores de las 7 rutas en dos viewports.

**Un aviso para quien repita la medida:** `.transition-colors` anima
`outline-color`, y su valor de partida es `currentColor`. Si se lee el
color justo después de `focus()`, se lee a mitad de la transición y
aparecen 38 «fallos» que no existen — botones cuyo anillo definitivo es
`navy-400` o `navy-200` medidos mientras todavía valían el color del
texto. Hay que desactivar las transiciones antes de medir. Lo mismo con
`outline-offset`: un offset negativo pinta el anillo **dentro** del
elemento, sobre su propio fondo, no sobre el del contenedor; ignorarlo
daba por fallidos los bloques «Inicio» y «Únete» del nav, que en realidad
llevan cream sobre navy a 9,40:1.

### 7.10 Tres rutas no usaban la capa de datos de SEO

`/participaciones`, `/patrocinios` y `/contacto` tomaban el título de
`seoRoutes` pero la descripción del copy visible de la diapositiva: 288,
194 y 34 caracteres. Las tres pasan a usar `seoRoutes.*.description`
(**D-169**), que ya existía y estaba escrita para esto.

---

## 8. Lo que no se hizo, y por qué

- ~~**`srcset` + AVIF/WebP.**~~ **Hecho en F8** (§3.4). El aplazamiento
  anterior —«son placeholders, habría que rehacerlo»— era un mal cálculo:
  lo que se rehace son los archivos, no el pipeline. Y el argumento se
  volvió del revés al medir: los huecos reales van de 159 px a 824 px
  mientras se servían archivos de 600 a 1800.
- **Preload del `woff2`.** La itálica de Libre Baskerville no aparece por
  encima del pliegue en ninguna ruta y entra con `font-display: swap`. Un
  preload añadiría un round-trip antes del primer paint para nada.
- **Lighthouse en CI.** Requiere decidir el runner y no bloquea F8.
- **Acortar el sufijo del título.** Lo fija RULES §14; cambiarlo es
  decisión del usuario.
- **`Disallow: /kit` en robots.txt.** Ruta muerta desde S9. Inofensiva;
  anotada en el backlog para no tocar configuración fuera de alcance.

---

## 9. Cómo repetir estas mediciones

```bash
bun run build
bun run preview          # en otra terminal

bun run check:network    # terceros, 4xx/5xx, video y póster diferidos
bun run check:render     # contenido visible con y sin JS
bun run check:overflow   # sin scroll horizontal en 10 resoluciones
bun run check:states     # foco, teclado, menú, video, contador
bun run check:layers     # arquitectura por capas
```

Para Lighthouse, **fuera del repositorio** (D-162):

```bash
mkdir -p /tmp/lh && cd /tmp/lh && bun add lighthouse
CHROME_PATH=/usr/bin/chromium ./node_modules/.bin/lighthouse \
  http://localhost:4321/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new --no-sandbox" --output=json --quiet
# añadir --preset=desktop para el perfil de escritorio
```
