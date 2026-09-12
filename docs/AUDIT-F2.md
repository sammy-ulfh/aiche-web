# AUDIT-F2 — Auditoría de diagnóstico, Fase 2

**Fecha:** 2026-08-20 · **Sesión:** diagnóstico (sin correcciones aplicadas)
**Alcance:** reproducir el bug de contenido invisible, inventariar fidelidad contra
`design/landing.pdf`, medir ajuste a pantalla, revisar deuda de arquitectura contra
la ADENDA FASE 2 §A4 y re-verificar las métricas que S08 dio por cumplidas.

**Método:** todo lo que sigue está medido sobre el **build de producción**
(`bun run build` + `bunx astro preview`), con Playwright 1.62.1 / Chromium.
Las bitácoras S0–S10 se tratan como afirmaciones sin verificar (ADENDA §A5).

> **Nota previa.** El encargo pedía leer `PROMPTS-FASE-2.md`. **Ese archivo no existe
> en el repositorio** ni en el historial de git. Las tres hipótesis se tomaron del
> enunciado del usuario. No hay ningún otro contenido de ese documento incorporado
> a esta auditoría.

**Estado de los gates al arrancar:** verde.
`bunx astro check` → 0 errores / 0 warnings / 0 hints (62 archivos).
`bun run build` → 8 páginas, sin errores, 511 ms.

---

## 1. Reproducción del bug — causa raíz

### 1.1 Veredicto

**Causa raíz única, con dos síntomas.** Los módulos `src/scripts/reveal.ts` y
`src/scripts/lazy-video.ts` **nunca se importan desde ninguna página ni desde el
layout**, así que **no se emiten en el build**. `Reveal.astro` deja su contenido en
`opacity: 0` a la espera de una clase `is-revealed` que **ningún código añade jamás**.

En un navegador normal (`prefers-reduced-motion: no-preference`, el valor por defecto)
**el 100 % del contenido envuelto en `<Reveal>` es permanentemente invisible**.

Es exactamente **la hipótesis 1 (reveal invertido)**, pero el mecanismo es más grave
que un orden de clases mal puesto: el script del reveal no llega al navegador.

| Hipótesis del usuario | Veredicto | Evidencia |
|---|---|---|
| **1. Reveal invertido** | ✅ **CONFIRMADA — es la causa** | El estado por defecto es oculto y depende de JS que no existe. §1.3 |
| **2. Excepción temprana en el bundle único de JS** | ❌ **DESCARTADA** | 32 cargas de página, **0 errores de consola y 0 `pageerror`**. Con JS deshabilitado los números son **idénticos** a con JS habilitado: el JS no influye en el bug. §1.2 |
| **3. Fallback de reduced-motion ausente** | ❌ **DESCARTADA — está invertida** | `reduce` es el **único** modo en el que el sitio se ve bien. El fallback que falta es el del caso *normal*, no el de reduced-motion. §1.2 |

### 1.2 Matriz de reproducción (build de producción, 1920×1080, 8 rutas × 4 configuraciones)

`invis` = elementos `[data-reveal]` con `opacity < 0.05`.

| Configuración | Rutas | reveals totales | invisibles | Errores de consola |
|---|---|---|---|---|
| JS **on** · motion **default** | 8 | 55 | **55 (100 %)** | 0 |
| JS **on** · motion **reduce** | 8 | 55 | **0** | 0 |
| JS **off** · motion **default** | 8 | 55 | **55 (100 %)** | 0 |
| JS **off** · motion **reduce** | 8 | 55 | **0** | 0 |

Detalle por ruta (caracteres de texto que quedan ocultos, motion default):

| Ruta | reveals | invisibles | Caracteres ocultos |
|---|---|---|---|
| `/` | 14 | 14 | 1 432 |
| `/acerca/` | 2 | 2 | 1 003 |
| `/acerca/equipo/` | 3 | 3 | 400 |
| `/participaciones/` | 7 | 7 | 1 330 |
| `/participaciones/southwest-2027/` | 5 | 5 | 1 362 |
| `/patrocinios/` | 15 | 15 | **2 630** |
| `/contacto/` | 7 | 7 | 172 |
| `/404` | 2 | 2 | 390 |

**Lectura:** activar o desactivar JavaScript **no cambia absolutamente nada**. La única
variable que mueve el resultado es `prefers-reduced-motion`. Esto descarta la
hipótesis 2 de forma concluyente.

**Evidencia visual.** `/patrocinios/` con motion por defecto renderiza nav + fondo azul
vacío: cero contenido en toda la primera pantalla. La misma ruta con `reduce` muestra
título, párrafo, los tres paquetes y el marco de medios.

### 1.3 Mecanismo, línea por línea

`src/components/ui/Reveal.astro:35-50`:

```css
@media (prefers-reduced-motion: no-preference) {
    .reveal-init { opacity: 0; transform: translateY(1rem); … }
    .reveal-init.is-revealed { opacity: 1; transform: translateY(0); }
}
```

- El estado por defecto es **oculto**, y sólo bajo `no-preference` (el caso normal).
- La clase `is-revealed` la debería añadir `src/scripts/reveal.ts:33`.
- **`src/scripts/reveal.ts` no está importado en ningún archivo de `src/`.** La única
  aparición de la cadena `scripts/reveal` en el repo es un **comentario** en
  `Reveal.astro:6`.
- Verificado en el artefacto: `dist/` contiene **un solo** `.js`
  (`dist/_astro/page.BDh2vuYI.js`, 2.4 KB) que es el *shim* de prefetch de Astro, más
  dos `<script type="module">` inline por página (`nav.ts`, y `countdown.ts` sólo en `/`).
  **La cadena `is-revealed` no aparece en ningún JavaScript de `dist/`.**

Esto viola directamente la **ADENDA §A2**: el estado por defecto debe ser *visible*, y
el script debe ser quien oculte. Aquí es al revés y encima el script no existe.

### 1.4 Por qué las capturas automáticas «salían bien»

`scripts/capture.mjs` fuerza **`reducedMotion: 'reduce'`** en sus cuatro contextos
(líneas 146, 194, 217, 254). Ese es precisamente el único modo en el que el bug no se
manifiesta. **La herramienta de verificación de S09/S10 estaba ciega al defecto por
construcción**, y por eso once sesiones lo dieron por bueno.

### 1.5 Origen histórico (git)

Ambos scripts se crearon en `31f8025` (S02) y **su único punto de importación fue
siempre `src/pages/kit.astro`**, la página temporal del kit de UI:

```
03c561f:src/pages/kit.astro:221:  import '../scripts/lazy-video.ts';
03c561f:src/pages/kit.astro:222:  import '../scripts/reveal.ts';
```

`Layout.astro` sólo ha importado nunca `nav.ts`. Como Astro empaqueta los `<script>`
por página, **`reveal.ts` jamás se ejecutó en ninguna ruta real**: el defecto existe en
producción desde S03, cuando se publicó la primera página que usa `<Reveal>`.

El commit `c69ecae` (S09, *"elimina /kit"*) borró `kit.astro` y con él el último
import, convirtiendo ambos módulos en **código muerto**. S09 no causó el bug de cara al
usuario; eliminó la última pista de que existía.

### 1.6 Segundo síntoma: el vídeo nunca carga

Mismo origen. `lazy-video.ts` es huérfano, así que las `<source>` guardadas en el
`<template>` de `LazyVideo.astro` **nunca se inyectan**. Medido en las 4 configuraciones
y en las 2 rutas con vídeo (`/`, `/acerca/`): `sources: 0`, `hasSrc: false` **siempre**.
El botón de play manual tampoco aparece, porque quien lo muestra es ese mismo script.
**El vídeo del sitio no se puede reproducir por ningún camino.**

---

## 2. Inventario de fidelidad contra `design/landing.pdf`

PDF rasterizado a **1920×1080** (14 páginas, lienzo original 1440×810 pt, 16:9).
Implementación capturada a 1920×1080 con `reducedMotion: 'reduce'` — **si no, no habría
nada que comparar**, lo que ya es el primer hallazgo de fidelidad.

### 2.0 Desviaciones sistémicas (afectan a todas las páginas)

| # | Desviación | Evidencia |
|---|---|---|
| **S-1** | **Inversión tonal.** El PDF es un documento **navy a sangre**; `global.css:50` fija `body { background: cream }` y `Section.astro` usa `tone="default"` (cream) salvo excepción. Páginas que en el PDF son navy de borde a borde (p.6, p.11, p.13, p.14) se renderizan sobre crema con una tarjeta navy dentro. | `global.css:50`, `Section.astro:33` |
| **S-2** | **Composiciones no llegan al borde.** `Section.astro:52` encierra todo en `max-w-[1440px]` centrado. Sobre un lienzo de 1920 quedan 240 px de margen muerto a cada lado; el PDF compone a sangre (fotos que tocan el borde). | `Section.astro:52` |
| **S-3** | **Barra de navegación con colores invertidos.** En el PDF la barra es navy con la pestaña «Inicio» en crema; implementada es crema con la pestaña «INICIO» en navy. | comparación p.1/p.13/p.14 |
| **S-4** | **Escala tipográfica menor que el PDF** en todos los títulos de sección. La escala (`global.css:207-226`) sólo depende de `vw`, no de la altura, y se ancla a un `max-w` de 1440. | `global.css:207-226` |
| **S-5** | **Marca gráfica distinta.** El PDF (p.4/p.5) define un hexágono de capas completo; el sitio dibuja un galón/chevrón simplificado, y mucho más pequeño en el hero. | p.4, p.5 vs `/`, `/404` |
| **S-6** | **Ninguna sección ocupa una pantalla.** Ver §3. El PDF es una secuencia de diapositivas; el sitio es un scroll continuo de bloques de altura fija. | §3 |

### 2.1 Tabla página por página

| PDF | Contenido | Ruta implementada | Desviaciones concretas |
|---|---|---|---|
| **p.1** | Hero: logo + «AIChE GDL / Capítulo estudiantil» + párrafo + contador | `/` (hero) | Nav con colores invertidos (S-3). Logo mucho más pequeño y de menor contraste. Título a menor escala. El párrafo va a **menor medida y centrado más estrecho**. Cajas del contador: el PDF usa caja **de contorno fino sobre navy**; implementadas con relleno `navy-900`. **La sección mide 1022 px y no cabe en 1080 con nav de 65 px** → aparece una franja crema de la sección siguiente. |
| **p.2** | Anotaciones del cliente (slide de referencia «Noche Retro 2026») | — | No es página de diseño: es una nota. Correctamente no implementada. |
| **p.3** | Spec: tipografías y paleta | — | Spec, no página. Tokens correctamente recogidos en `global.css:14-27`. |
| **p.4** | Identidad visual: logo | — (usado en Logo.astro) | El logo dibujado **no reproduce el hexágono de capas** del PDF (S-5). |
| **p.5** | Identidad visual: logo, variante | — | Ídem. |
| **p.6** | «Acerca de Nosotros»: columna izquierda navy 1/3 (icono estrella + pregunta en caja con contorno + cuerpo justificado) y foto a sangre 2/3 con badge «HIGH LIGHTS», rótulo «Así se vive la experiencia AIChE GDL» + subtítulo y sello de fecha | `/acerca/` | **Fondo crema en vez de navy a sangre (S-1).** Falta el **icono de estrella**. Falta la **caja con contorno** alrededor de la pregunta en itálica. Cuerpo **no justificado** (el PDF sí). La foto es un **placeholder pequeño a la derecha**, no una imagen a sangre de 2/3. **Faltan por completo** el badge «HIGH LIGHTS», el rótulo «Así se vive la experiencia AIChE GDL», su subtítulo y el sello de fecha. **Elemento inventado:** botón «CONOCE MÁS» en el teaser del home, que no está en el PDF. |
| **p.7** | Una sola pantalla navy: columna izq. con tarjeta «PRÓXIMO EVENTO» (FECHA/SEDE/UBICACIÓN) + «Rumbo a las competencias AIChE»; columna der. 2/3 con título «Participaciones» sobre foto del Chem-E-Car | `/participaciones/` | **Una diapositiva se convierte en tres secciones apiladas** (3 234 px de scroll). Banda de título navy, luego sección crema con la tarjeta, luego otra sección crema con la lista. Foto del Chem-E-Car sustituida por un **placeholder azul plano**. **Elementos inventados:** bloque «SOBRE EL EVENTO» y botón «CONOCE LA REGIONAL», ninguno en el PDF. |
| **p.8** | Dos bandas navy a ancho completo, títulos enormes centrados: «¿Qué es la Southwest Student Regional Conference?» y «¿Por qué queremos participar?», con recorte del Chem-E-Car | `/participaciones/southwest-2027/` | **Composición cambiada de dos bandas apiladas a dos columnas estrechas lado a lado.** Títulos a **fracción de la escala** del PDF (allí son de tamaño hero, centrados). Falta el **recorte del Chem-E-Car**. **Elemento inventado:** tres placeholders azules de galería que en el PDF pertenecen a la p.12. |
| **p.9** | «¡Súmate al capítulo!» centrado sobre navy con logo grande; footer crema con **logo institucional AIChE** a la izquierda y línea legal a la derecha | `/` (cierre) | Logo del bloque reducido a un galón pequeño (S-5). En el footer **falta el logo institucional AIChE**, sustituido por un lockup de texto «AIChE GDL». **Elementos añadidos** en el footer: correo e Instagram, que en el PDF no están ahí. Los botones de contacto conservan la forma correcta. |
| **p.10** | Hero de patrocinios: texto a la izquierda, foto grande alineada al borde derecho, tres cajas de paquete abajo; todo en una pantalla | `/patrocinios/` (hero) | La sección mide **981 px** y deja **grandes vacíos arriba y abajo**; el contenido no llena la pantalla. Foto sustituida por placeholder **notablemente más pequeño** y sin llegar al borde. Cajas de paquete a menor escala. |
| **p.11** | «Qué recibe tu empresa»: fondo **navy**, tres tarjetas con foto arriba y precio + viñetas sobre panel navy translúcido | `/patrocinios/` (tiers) | **Inversión tonal completa (S-1): fondo crema y tarjetas blancas.** **Elemento inventado:** botón «QUIERO ESTE PAQUETE» en cada tarjeta — no existe en el PDF. Las fotos son placeholders azules planos. |
| **p.12** | «LA COMPETENCIA»: fondo **crema** con retícula suave, dos columnas de texto, tres fotos abajo a sangre | `/patrocinios/` (competencia) | Tono correcto (es la única página clara del PDF). Títulos a menor escala. Las tres fotos son placeholders más pequeños y **no llegan al borde** (S-2). |
| **p.13** | Equipo: **navy a sangre**, título blanco, 6 retratos en rejilla 3×2 a la izquierda, foto de grupo grande a la derecha | `/acerca/equipo/` | **Fondo crema, título en negro (S-1).** Los retratos son tarjetas placeholder con hexágono «RETRATO» **más nombre y cargo debajo — el PDF no muestra ni nombres ni cargos**. La foto de grupo es un rectángulo azul plano. La rejilla queda encerrada en una tarjeta navy en vez de ser el fondo de la página. |
| **p.14** | Contacto: **navy a sangre**, «¡TRABAJEMOS JUNTOS!» enorme en dos líneas a la izquierda, filas CORREO/INSTAGRAM, foto de grupo grande a la derecha | `/contacto/` | **Fondo crema, título negro (S-1)** y a **una sola línea, a una fracción del tamaño** del PDF. Foto sustituida por placeholder pequeño. **Sección añadida:** debajo se apila «¡Súmate al capítulo!», que en el PDF es la p.9 y pertenece al home. |

### 2.2 Copy

El copy verbatim de `RULES §9` está respetado y las erratas del PDF documentadas en
`docs/TODO.md` (F-01…F-05) están aplicadas. **No se detectó copy inventado.** Lo que sí
hay son **elementos de interfaz inventados** (botones y bloques listados arriba): cinco
en total — «CONOCE MÁS», «CONOCE LA REGIONAL», «SOBRE EL EVENTO», «QUIERO ESTE PAQUETE»
(×3) y las galerías desplazadas de p.12 a `/southwest-2027`.

---

## 3. Ajuste a pantalla (ADENDA §A3)

**Nada de §A3 está implementado.** Hechos verificados:

- **No existe `Screen.astro`** ni en `src/layouts/` ni en `src/components/ui/`.
- **`grep` de `svh`, `dvh`, `100vh`, `min-h-screen`, `h-screen` sobre `src/`: cero
  coincidencias.** El sitio no tiene ningún concepto de «una sección = una pantalla».
- El espaciado es **fijo**: `Section.astro:47` aplica `py-20 md:py-28` (80 px / 112 px)
  con independencia de la altura del viewport.
- La escala tipográfica (`global.css:207-226`) usa `clamp(..., vw, ...)` — **sólo ancho**.
  A 1366×768 la tipografía es tan grande como a 1366×1080. No hay `min(vw, vh)` como pide
  §A3.

Consecuencia: las alturas de sección son **prácticamente constantes** entre viewports.
El hero mide 1022 px a 1920×1080 y **los mismos 1022 px** a 1280×720.

### 3.1 Desbordes medidos

Altura útil = altura de viewport − 65 px de nav. `⚠ N (+M)` = la sección mide N px y
**desborda M px**.

| Ruta · sección | 1920×1080 | 1600×900 | 1440×900 | 1366×768 | 1280×720 |
|---|---|---|---|---|---|
| `/` hero | ⚠ 1022 **(+7)** | ⚠ 1022 (+187) | ⚠ 1022 (+187) | ⚠ 1022 (+319) | ⚠ 1022 **(+367)** |
| `/` about-teaser | 706 | 706 | 706 | 680 | 650 |
| `/` next-event | 610 | 610 | 648 | 648 | 648 |
| `/` sponsor-teaser | 807 | 807 | 807 | ⚠ 807 (+104) | ⚠ 807 (+152) |
| `/` join-cta | 561 | 561 | 561 | 561 | 561 |
| `/acerca/` about | 705 | 705 | 705 | ⚠ 734 (+31) | ⚠ 734 (+79) |
| `/acerca/equipo/` team-grid | 977 | ⚠ 977 (+142) | ⚠ 941 (+106) | ⚠ 908 (+205) | ⚠ 870 (+215) |
| `/participaciones/` competitions | ⚠ 1522 **(+507)** | ⚠ 1522 (+687) | ⚠ 1477 (+642) | ⚠ 1436 **(+733)** | ⚠ 1387 (+732) |
| `/participaciones/southwest-2027/` competition | 989 | ⚠ 989 (+154) | ⚠ 971 (+136) | ⚠ 984 (+281) | ⚠ 994 (+339) |
| `/patrocinios/` sponsor-hero | 981 | ⚠ 981 (+146) | ⚠ 981 (+146) | ⚠ 981 (+278) | ⚠ 981 (+326) |
| `/patrocinios/` sponsor-tiers | ⚠ 1245 **(+230)** | ⚠ 1245 (+410) | ⚠ 1225 (+390) | ⚠ 1231 **(+528)** | ⚠ 1209 (+554) |
| `/patrocinios/` competition | 989 | ⚠ 989 (+154) | ⚠ 971 (+136) | ⚠ 984 (+281) | ⚠ 994 (+339) |
| `/contacto/` contact | 642 | 642 | 618 | 595 | 570 |
| `/404` hero | 756 | 756 | 756 | ⚠ 756 (+53) | ⚠ 756 (+101) |

**Resumen de desbordes por viewport:**

| Viewport | Secciones que desbordan | Peor caso |
|---|---|---|
| 1920×1080 | 3 / 20 | competitions +507 px |
| 1600×900 | 9 / 20 | competitions +687 px |
| 1440×900 | 9 / 20 | competitions +642 px |
| **1366×768** | **13 / 20** | **competitions +733 px** |
| 1280×720 | 13 / 20 | competitions +732 px |

**1366×768 es efectivamente el caso duro que anticipa §A3.** A esa resolución dos tercios
de las secciones no caben.

**Scroll horizontal:** ninguno. `scrollWidth == innerWidth` en las 8 rutas × 5 viewports.
Esto sí se sostiene.

**Altura total de página** (una diapositiva del PDF debería ser ~1 pantalla):
`/` 3 880 px · `/patrocinios/` 3 854 px · `/participaciones/` 3 234 px ·
`/participaciones/southwest-2027/` 1 770 px · `/404` 1 562 px · `/acerca/equipo/` 1 458 px ·
`/contacto/` 1 377 px · `/acerca/` 1 080 px.

---

## 4. Deuda de arquitectura (ADENDA §A4)

### 4.1 Componentes sin uso

**Ninguno.** Los 36 componentes de `src/components/` tienen al menos un importador real.
El commit `e0e91fd` ya limpió esto. **Este punto de §A4 se cumple.**

### 4.2 Scripts sin uso — el hallazgo grave

| Archivo | Importadores | Estado |
|---|---|---|
| `src/scripts/nav.ts` | `Layout.astro:127` | ✅ activo |
| `src/scripts/countdown.ts` | `pages/index.astro:51` | ✅ activo |
| **`src/scripts/reveal.ts`** | **ninguno** | ❌ **código muerto — causa del bug §1** |
| **`src/scripts/lazy-video.ts`** | **ninguno** | ❌ **código muerto — vídeo inoperante §1.6** |

### 4.3 Pares con nombre casi idéntico y responsabilidad solapada

Viola *«Un concepto, un componente, un nombre. Nada de pares casi idénticos.»*

| Par | Problema |
|---|---|
| **`ui/CompetitionList.astro` (74 líneas) vs `sections/CompetitionsList.astro` (82)** | **Difieren en una sola letra.** El primero es la lista `<ul>`; el segundo, la sección que la envuelve. Imposible de distinguir de un vistazo en un import. Renombrar el de sección a algo como `CompetitionsSection`. |
| `sections/NextEvent.astro` vs `sections/NextEventCard.astro` | `NextEvent` es sección; `NextEventCard` es la tarjeta. Además `NextEvent` **vuelve a componer** un resumen de competencias («más denso que `CompetitionsList`»), duplicando la responsabilidad de `CompetitionsList` con otro espaciado. Dos formas de pintar la misma lista. |
| `sections/About.astro` vs `sections/AboutTeaser.astro` | Teaser y sección completa con copy y estructura solapados. |
| `sections/SponsorHero` / `SponsorTeaser` / `SponsorTiers` | Tres componentes que comparten `PackageCard` con tres composiciones distintas del mismo bloque de paquetes. |

### 4.4 Datos duplicados en `src/data/`

Verificado con análisis de imports: **ningún símbolo se importa desde dos rutas
distintas**, y `content.ts` **re-exporta** (no copia) `competitions`, `competitionsIntro`,
`sponsorTiers` y `sponsorMailtoFor`. La bitácora que decía «cero duplicación de datos»
es, en ese punto concreto, **correcta**. Pero quedan tres problemas reales:

1. **Fecha y sede escritas a mano dentro del copy.** `content.ts:66` y `content.ts:137`
   incrustan literalmente `"27 de marzo de 2027"` y `"Lake Charles, Louisiana"` en la
   prosa, mientras que `content.ts:115` y `content.ts:229` **sí** interpolan
   `${venue.name}` y `${eventDateHuman}`. Es incoherente: si cambia la fecha del evento,
   dos textos quedan obsoletos en silencio. **Viola §A4** («una sola definición de la
   fecha del evento, del correo, del nombre de la sede»).
2. **Los datos del evento están repartidos entre dos archivos.** La fecha ISO y el nombre
   del evento viven en `site.ts:27,29`; la sede y la fecha legible, en `event.ts:16-27`.
   `event.ts` son 37 líneas de las cuales una parte es re-export de `site.ts`. Debería
   haber **un** `event.ts` que sea la fuente única.
3. **`content.ts` es una capa barrel de 240 líneas** que mezcla copy con re-exports de
   otros cuatro módulos de datos. Funciona, pero difumina qué archivo es la fuente de
   verdad de cada dato.

### 4.5 Aislamiento de los scripts de cliente

| Script | IIFE | Guardas de existencia | Nota |
|---|---|---|---|
| `countdown.ts` | ✅ | ✅ (`:47`, `:49`, `:58`) | correcto |
| `lazy-video.ts` | ✅ | ✅ (`:48`) | correcto — pero no se carga |
| `reveal.ts` | ✅ | ✅ | correcto — pero no se carga |
| `nav.ts` | ❌ **sin IIFE** | ✅ (`:23`, `:38`, `:116`, `:195`) | Es el único módulo con funciones en el ámbito superior. Hoy no rompe nada (Astro lo emite como módulo ES, con ámbito propio), pero es **incoherente** con el patrón que los otros tres documentan explícitamente. |

Ningún script tiene `try/catch`, pero todos salen limpiamente si su elemento no existe,
que es lo que pide §A2. **En este punto §A2 se cumple; lo que falla es el reveal.**

### 4.6 Tamaño de componentes

Ninguno supera las 150 líneas de §A4. El mayor es `ui/Countdown.astro` con 145.

---

## 5. Verificación de las métricas de S08

Medido sobre el build de producción servido por `astro preview`. Emulación móvil
Pixel 7 (412×915, DPR 2), red 1.6 Mbps / 150 ms RTT, CPU ×4.

### 5.1 Lighthouse

**No ejecutado, y no se puede ejecutar sin romper una regla.** Lighthouse no está
instalado ni disponible en el sistema, y añadirlo violaría la **regla 9** (whitelist de
dependencias). `docs/PERFORMANCE.md:7-8,15,300` ya declara esto honestamente
(«n/d (sin Chrome)»), así que **no hay discrepancia**: S08 nunca afirmó un número de
Lighthouse. En su lugar se midieron directamente las señales subyacentes.

**Corrección a la documentación:** `PERFORMANCE.md:7` justifica la ausencia con «no hay
Chrome con permisos para Lighthouse». Eso es inexacto — **sí hay Chromium** (vía
Playwright, usado en toda esta auditoría). La razón real es que el paquete `lighthouse`
no está instalado y la whitelist no lo permite.

### 5.2 Señales medidas vs. lo documentado

| Métrica | Presupuesto | Documentado en S08 | **Medido ahora** | Veredicto |
|---|---|---|---|---|
| CSS por ruta | < 30 KB gz | 6.8 KB gz inline | **6.75–6.90 KB gz** (32.9–33.5 KB raw) | ✅ **confirmado** |
| JS inline por ruta | — | 1.5–2.4 KB gz | **0.96 KB gz** (resto) / **1.57 KB gz** (`/`) | ✅ mejor de lo documentado |
| JS total por ruta | < 25 KB gz | ~3–5 KB gz | **~2.1–2.7 KB gz** (inline + prefetch 1.1) | ✅ **confirmado** |
| CSS externo | 0 | eliminado | **0 archivos `.css` en `dist/`** | ✅ **confirmado** |
| CLS | < 0.02 | 0 | **0.0000 en las 8 rutas** | ✅ **confirmado** |
| LCP | < 2.0 s | «< 2 s» | 0.27–0.84 s en 7 rutas; **`/` = 2.02 s** | ⚠️ **`/` incumple por poco** |
| Requests a terceros | 0 | 0 | **0** — único origen `localhost:4321` en las 8 rutas | ✅ **confirmado** |
| Peso de `/` sin vídeos | < 500 KB | ~37 KB | **71 KB** transferidos | ✅ dentro; **cifra documentada baja** |
| Peso de `dist/` | — | 796 KB (S7.5) | **869 KB** | ⚠️ documentación desfasada |

**Transferencia real por ruta:** `/` 71 KB · `/acerca/` 68 KB · `/acerca/equipo/` 154 KB ·
`/participaciones/` 56 KB · `/southwest-2027/` 54 KB · `/patrocinios/` 82 KB ·
`/contacto/` 36 KB · `/404` 13 KB. Todas muy por debajo del presupuesto de 500 KB.

**Composición de `dist/` (869 KB):** HTML 472.3 KB (8 archivos) · JPG 343.7 KB (19) ·
WOFF 25.8 KB · WOFF2 21.1 KB · JS 2.4 KB (1) · resto ~4 KB.

### 5.3 Diferencias que hay que corregir en `docs/PERFORMANCE.md`

1. **`PERFORMANCE.md:19,70`** afirma que el JS inline incluye *«nav + opcional
   countdown/lazy-video»*. **`lazy-video` nunca se ha enviado** (§1.5). El documento
   describe un bundle que no existe.
2. **`PERFORMANCE.md:151,293`** cifra el coste de `/` en **~37 KB**; lo medido son
   **71 KB** transferidos. Sigue holgadamente dentro del presupuesto, pero el número
   documentado no es el real.
3. **`PERFORMANCE.md:282`** da 796 KB de `dist/`; el build actual pesa **869 KB**.
4. **`PERFORMANCE.md:16,301`** da LCP «< 2 s» como cumplido en todas las rutas; en `/`
   se mide **2.02 s** en móvil emulado — justo por encima del presupuesto.
5. **`PERFORMANCE.md:7`** atribuye la ausencia de Lighthouse a «no hay Chrome»; la razón
   real es la whitelist de dependencias.

### 5.4 Advertencia importante sobre estas métricas

Las cifras de LCP/CLS de S08 se obtuvieron —y las de esta auditoría se obtendrían por
defecto— **sobre páginas que no pintan casi nada**, porque el bug de §1 mantiene el
contenido invisible. Repetí la medición **forzando `reduce`** (contenido visible) para
tener números honestos, y se sostienen: CLS sigue en 0 y el LCP sólo sube en las rutas
con imagen (`/acerca/equipo/` 0.27 → 0.84 s, `/contacto/` 0.24 → 0.52 s). **Aun así,
todas las métricas de rendimiento deberán re-medirse después de arreglar el reveal**,
porque hasta entonces se están midiendo páginas en blanco.

---

## 6. Plan de corrección priorizado

### P0 — El sitio no muestra su contenido

**C-1. Invertir el patrón del reveal según §A2 y cargar el script.**
Estado por defecto **visible**. El script añade `js-reveal` a `<html>` **antes del
primer paint** (script inline en `<head>`), y sólo entonces el CSS oculta y anima. Mover
las reglas de `Reveal.astro` a `global.css` bajo `html.js-reveal`, e importar
`reveal.ts` desde `Layout.astro` para que llegue a todas las rutas.
*Impacto: recupera 8 719 caracteres de contenido en 8 rutas. Riesgo: bajo.*

**C-2. Cargar `lazy-video.ts`.** Importarlo desde `LazyVideo.astro` (o desde
`Layout.astro`). Sin esto el vídeo no se reproduce por ningún camino.
*Impacto: el vídeo pasa de inoperante a funcional. Riesgo: bajo.*

**C-3. Quitar `reducedMotion: 'reduce'` fijo de `scripts/capture.mjs`.**
Debe capturar en el modo por defecto, y añadir `reduce` como caso *adicional*. Mientras
siga forzado, la herramienta de verificación seguirá ciega a esta clase de defecto.
*Impacto: cierra el agujero que dejó pasar el bug once sesiones. Riesgo: nulo.*

**C-4. Prueba de regresión.** Un script que falle el build si alguna ruta tiene
`[data-reveal]` con `opacity < 0.05` con JS deshabilitado y motion por defecto.
*Impacto: impide que el defecto vuelva. Riesgo: nulo.*

### P1 — El diseño no cabe en pantalla

**C-5. Crear `Screen.astro` según §A3.** `min-height: 100svh`, `font-size:
clamp(0.72rem, min(0.833vw, 1.481vh), 1.15rem)`, todo el interior en `em`, válvula de
escape a scroll cuando no quepa ni al mínimo. Prohibido `overflow: hidden`.

**C-6. Migrar las secciones a `Screen`,** empezando por las 13 que desbordan a
1366×768. Prioridad: `competitions` (+733 px), `sponsor-tiers` (+528 px), `hero`
(+319 px), `sponsor-hero` (+278 px).

**C-7. Reemplazar el padding fijo `py-20 md:py-28` de `Section.astro`** por espaciado en
`em` relativo al `font-size` de `Screen`.

**C-8. Añadir la componente de altura a la escala tipográfica** (`min(vw, vh)` en lugar
de sólo `vw`) en `global.css:207-226`.

### P2 — Fidelidad al PDF (§A1)

**C-9. Corregir la inversión tonal (S-1).** Las páginas que en el PDF son navy a sangre
—p.6 `/acerca/`, p.11 tiers de `/patrocinios/`, p.13 `/acerca/equipo/`, p.14
`/contacto/`— deben renderizarse navy de borde a borde.

**C-10. Componer a sangre (S-2).** Revisar el `max-w-[1440px]` de `Section.astro`: sobre
el lienzo de 1920 debe permitir composiciones que lleguen al borde.

**C-11. Invertir los colores del nav (S-3)** para que coincida con el PDF.

**C-12. Retirar los elementos inventados** o justificarlos por escrito como adaptación
deliberada, que es lo que exige §A1: «CONOCE MÁS», «CONOCE LA REGIONAL», «SOBRE EL
EVENTO», «QUIERO ESTE PAQUETE» (×3), nombres/cargos en los retratos de p.13, y las
galerías de p.12 desplazadas a `/southwest-2027`.

**C-13. Reponer los elementos que faltan:** badge «HIGH LIGHTS», rótulo «Así se vive la
experiencia AIChE GDL» + subtítulo y sello de fecha (p.6); icono de estrella y caja con
contorno de la pregunta (p.6); recorte del Chem-E-Car (p.8); logo institucional AIChE en
el footer (p.9).

**C-14. Recuperar la composición de una pantalla en p.7** (`/participaciones/`), hoy
partida en tres secciones apiladas.

**C-15. Subir la escala de los títulos (S-4)** hasta la proporción del PDF, sobre todo
en p.8 y p.14.

**C-16. Rehacer la marca gráfica (S-5)** como el hexágono de capas de p.4/p.5.

### P3 — Arquitectura y documentación

**C-17.** Renombrar `sections/CompetitionsList.astro` para que no difiera en una letra de
`ui/CompetitionList.astro`.
**C-18.** Unificar la lista de competencias: que `NextEvent` reutilice el componente de
lista en vez de recomponerla con otro espaciado.
**C-19.** Interpolar fecha y sede en `content.ts:66` y `content.ts:137` en lugar de
escribirlas a mano.
**C-20.** Consolidar los datos del evento en `event.ts` (hoy repartidos con `site.ts`).
**C-21.** Envolver `nav.ts` en IIFE por coherencia con los otros tres scripts.
**C-22.** Actualizar `docs/PERFORMANCE.md` con las cinco correcciones de §5.3.
**C-23.** Re-medir todas las métricas **después** de C-1, y sustituir las de S08.

---

## 7. Resumen de estado

| Área | Estado |
|---|---|
| Gates (`astro check`, `build`) | ✅ verde |
| Contenido visible en navegador normal | ❌ **roto en las 8 rutas** |
| Mejora progresiva (§A2) | ❌ el contenido depende de JS que no se envía |
| Vídeo | ❌ inoperante en todos los caminos |
| Ajuste a pantalla (§A3) | ❌ no implementado; 13/20 secciones desbordan a 1366×768 |
| Fidelidad al PDF (§A1) | ⚠️ 6 desviaciones sistémicas + desviaciones en las 9 páginas de diseño |
| Componentes sin uso (§A4) | ✅ ninguno |
| Scripts sin uso (§A4) | ❌ 2 de 4 son código muerto |
| Datos duplicados (§A4) | ⚠️ fecha y sede a mano en 2 cadenas de copy |
| Rendimiento: CSS/JS/terceros/CLS | ✅ confirmado, presupuestos cumplidos |
| Rendimiento: LCP en `/` | ⚠️ 2.02 s vs presupuesto de 2.0 s |
| Exactitud de `docs/PERFORMANCE.md` | ⚠️ 5 cifras/afirmaciones desfasadas |
| Scroll horizontal | ✅ ninguno en 8 rutas × 5 viewports |
