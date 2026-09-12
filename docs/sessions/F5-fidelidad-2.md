# F5 — Fidelidad al PDF: Participaciones, Southwest, Patrocinios y Contacto

**Fecha:** 2026-08-20 · **Estado:** COMPLETA

**Alcance:** `/participaciones`, `/participaciones/southwest-2027`,
`/patrocinios` y la primera pantalla de `/contacto`, contra
`design/landing.pdf` (ADENDA §A1).

**Gates al arrancar:** verde (`bunx astro check` 0/0/0 y `bun run build`, 8
páginas).

**Gates al cerrar:** verde; detalle en §8.

---

## 0. Método

Se repitió el método medido de F4, sin modificar `design/`:

1. Se usaron los rasterizados a **1920×1080** de
   `.cache/design-1920/` como referencia.
2. Se capturó el estado inicial de las cuatro rutas en `.cache/f5-before/`.
3. Se compararon composición, geometría, tipografía, color, fondos y número de
   pantallas. Las páginas 10–14 reales son mapas de bits, por lo que sus medidas
   se tomaron por píxel; para el resto también se consultó el texto vectorial.
4. Se iteró con capturas de Playwright a 1920×1080 y métricas DOM de
   `getBoundingClientRect()`.
5. El resultado quedó en `.cache/f5-final/`; `metrics.json` contiene los altos y
   posiciones finales de cada pantalla.

### 0.1 Correspondencia real de páginas

La numeración solicitada sigue la de RULES; el PDF físico tiene una página de
anotación adicional. F5 confirmó el desfase documentado en D-009 y F4:

| RULES / usuario | PDF real | Referencia local | Ruta / pantalla |
|---|---:|---|---|
| p.6 | **p.7** | `.cache/design-1920/p-07.png` | `/participaciones` |
| p.7 | **p.8** | `.cache/design-1920/p-08.png` | `/participaciones/southwest-2027` |
| p.9 | **p.10** | `.cache/design-1920/p-10.png` | `/patrocinios`: hero |
| p.10 | **p.11** | `.cache/design-1920/p-11.png` | `/patrocinios`: beneficios |
| p.11 | **p.12** | `.cache/design-1920/p-12.png` | `/patrocinios`: competencia crema |
| p.13 | **p.14** | `.cache/design-1920/p-14.png` | `/contacto`: contacto |

En esta bitácora se usa en adelante la **página real** para evitar ambigüedad.

### 0.2 Regla geométrica común

El nav obligatorio ocupa 80px. Cada diapositiva dispone de los **1000px**
restantes del viewport de 1080px. Las seis referencias de F5 se implementaron
como seis `Screen` de 1000px exactos; no se redujo la escala para esconder
desbordes.

| Ruta | Alto antes | Alto después | Pantallas de referencia |
|---|---:|---:|---:|
| `/participaciones` | 4272px | **1272px** | 4 → **1** |
| `/participaciones/southwest-2027` | 2272px | **1272px** | 2 → **1** |
| `/patrocinios` | 4433px | **3272px** | 4 → **3** |
| `/contacto` | 2080px | **2080px** | 2 → **2** |

Los totales incluyen nav y footer. Contacto conserva una segunda pantalla de
808px para `JoinCta`, justificada en §5.

---

## 1. `/participaciones` ← p.7 real

La referencia es una sola composición navy: tarjeta de evento y competencias a
la izquierda; título, subtítulo y panel audiovisual a la derecha.

| # | Diferencia inicial | Corregida / justificada |
|---|---|---|
| P-01 | La ruta ocupaba **cuatro pantallas**: hero, tarjeta con un bloque «Sobre el evento», lista con foto y CTA final. | **Corregida.** Todo el contenido de RULES §9.3 vive ahora en un único `ParticipationsOverview`; se retiraron los tres bloques inventados. |
| P-02 | La composición estaba apilada y no guardaba relación con las dos columnas del PDF. | **Corregida.** Columna izquierda de **477px**, hueco de 33px y columna derecha de **1197px**, dentro del lienzo de 1728px. |
| P-03 | `PRÓXIMO EVENTO` era una tarjeta oscura genérica con CTA. | **Corregida.** Marco medido de **477×395px**, borde azul, título y tres bandas blancas FECHA/SEDE/UBICACIÓN; sin CTA, como la referencia. |
| P-04 | El bloque de competencias era una sección independiente con imagen grande y filas genéricas. | **Corregida.** Panel enmarcado dentro de la columna izquierda, título en dos líneas y cuatro filas con etiquetas en caja, nombre y bajada. |
| P-05 | El título era un hero pequeño alineado a la izquierda. | **Corregida.** `Participaciones` ocupa el encabezado enmarcado de la columna derecha; el subtítulo va centrado en Libre Baskerville Italic. |
| P-06 | Faltaba el segundo video indicado por el usuario y D-127. | **Corregida en estructura.** `media.participationsVideo` se renderiza con `LazyVideo`, `preload="none"` y sin `src` hasta entrar al viewport. El MP4 sigue siendo un stub de 20 B; es deuda de medio, no de layout. |
| P-07 | `sections/Competitions.astro` existía sólo para la antigua pantalla separada. | **Corregida.** Se elimina; la lista reusable sigue en `ui/CompetitionList` y la composición completa pasa a `sections/ParticipationsOverview`. |
| P-08 | El fondo tenía la rejilla sin la fase de la imagen. | **Corregida.** Celda 104px con fase x=76px, y=15px dentro de la pantalla; radial centrado para esta familia de diapositivas. |

**Verificación DOM final:** `participations` mide 1920×1000 en y=80; la
tarjeta interna mide 477×395 en y=126. No hay error de captura ni scroll
horizontal.

---

## 2. Southwest 2027 ← p.8 real

La p.8 no es un hero seguido de una sección: es una única lámina con dos zonas
de texto separadas por una banda navy y un recorte del vehículo.

| # | Diferencia inicial | Corregida / justificada |
|---|---|---|
| SW-01 | Hero introductorio inventado + segunda pantalla `CompetitionInfo`. | **Corregida.** Se elimina el hero; `CompetitionInfo variant="navy"` es el único `Screen` y su pregunta principal es el h1. |
| SW-02 | La variante navy repetía la composición crema: dos columnas y galería de tres imágenes. | **Corregida.** La variante navy tiene composición propia: bloque superior, banda central «¿Por qué queremos participar?» y cuerpo inferior. |
| SW-03 | La galería 3:2 bajo el texto no existe en esta versión del PDF. | **Corregida.** Se sustituye por el recorte con alfa del Chem-E-Car que forma parte de la referencia. |
| SW-04 | No existía un activo local para ese recorte. | **Corregida.** Se extrajo el objeto gráfico del PDF, se recortó a **489×334px** y se guardó como `public/media/images/competition-car-cutout.png`. `design/` siguió intacto. |
| SW-05 | La estructura de headings dependía del hero eliminado. | **Corregida.** Pregunta principal = h1; pregunta de la banda = h2; `main` sigue etiquetado por `page-title`. |
| SW-06 | El copy del PDF contiene las versiones contradictorias de sede. | **Justificada.** Se mantiene el texto canónico de RULES §9.4: McNeese State University, Lake Charles, Louisiana, 27 de marzo de 2027. |

**Verificación DOM final:** una pantalla `competition` de 1920×1000 en y=80;
documento total de 1272px.

---

## 3. `/patrocinios` ← p.10, p.11 y p.12 reales

Es la página prioritaria de F5. Las tres diapositivas quedaron en el mismo orden
y con la misma jerarquía visual que la referencia.

### 3.1 Hero de patrocinio ← p.10 real

| # | Diferencia inicial | Corregida / justificada |
|---|---|---|
| PH-01 | El contenido usaba proporciones genéricas 3/5 + 2/5 y aire vertical sin medir. | **Corregida.** Columnas de **838px** y **826px**, hueco de 64px; imagen visible de **826×683px**. |
| PH-02 | Título, párrafo y paquetes se distribuían con gaps genéricos. | **Corregida.** Posiciones y anchos se calibraron contra p.10; el párrafo usa el copy exacto de RULES §9.5. |
| PH-03 | Las tres mini tarjetas tenían el mismo borde superior azul intenso. | **Corregida.** Sólo Paquete 1 está destacado; Paquetes 2 y 3 usan el borde azul claro de la referencia. |
| PH-04 | Las tarjetas mostraban también `N BENEFICIOS`, ausente en el hero. | **Corregida.** La variante compacta muestra únicamente `PAQUETE N` y precio. |
| PH-05 | La moneda vivía duplicada dentro de `content.sponsors`. | **Corregida.** `sponsorCurrencySymbol` vive sólo en `data/sponsors.ts`, aislando P-001. |

### 3.2 Qué recibe tu empresa ← p.11 real

| # | Diferencia inicial | Corregida / justificada |
|---|---|---|
| PT-01 | La sección era crema; la referencia es navy con rejilla. | **Corregida.** Fondo navy a sangre con el mismo radial y rejilla de la familia F5. |
| PT-02 | `sponsor-tiers` medía **1161px**, 161px más que la pantalla a 1920×1080. | **Corregida.** Mide **1000px exactos** en las seis resoluciones de QA. |
| PT-03 | Cada tarjeta añadía «Quiero este paquete», un CTA inventado de 62px de alto efectivo. | **Corregida.** CTA y helper `sponsorMailtoFor` eliminados; D-049 queda reemplazada. |
| PT-04 | Tarjetas blancas genéricas, imágenes 4:3 y jerarquía de precio pequeña. | **Corregida.** Tres tarjetas navy de **544×731px**, imágenes visibles de **544×177px**, borde superior jerárquico y precio de ~53px. |
| PT-05 | La nota de facturación estaba junto al título y en cursiva. | **Corregida.** Se alinea a la derecha, como la p.11. El contador `N BENEFICIOS` sigue derivándose de `benefits.length`. |
| PT-06 | Todos los paquetes parecían igualmente destacados. | **Corregida.** `SponsorTier.featured` marca exclusivamente Paquete 1 y alimenta las dos variantes de `PackageCard`. |

### 3.3 La competencia crema ← p.12 real

| # | Diferencia inicial | Corregida / justificada |
|---|---|---|
| PC-01 | La variante crema usaba una composición genérica con galerías 3:2 y márgenes del sistema anterior. | **Corregida.** Dos columnas de **824px**, hueco de 75px y galería final de tres marcos **544×300px** con huecos de 48px. |
| PC-02 | El fondo era crema plano. | **Corregida.** `GridBackdrop tone="cream"` reproduce la rejilla azul al 12 % sobre crema. |
| PC-03 | Había una cuarta pantalla CTA al final de `/patrocinios`. | **Corregida.** Eliminada: no existe en p.10–12 y duplicaba el contacto disponible en nav y `/contacto`. |
| PC-04 | `CompetitionInfo` suponía que sus dos variantes sólo cambiaban de color. | **Corregida.** Un componente conserva el copy único, pero cada variante tiene la estructura que realmente muestra su diapositiva. |

**Verificación DOM final:** tres pantallas consecutivas de 1920×1000 en y=80,
1080 y 2080; documento total de 3272px. Las tarjetas ya no activan la válvula
de escape.

---

## 4. `/contacto` ← p.14 real

| # | Diferencia inicial | Corregida / justificada |
|---|---|---|
| CO-01 | La pantalla era crema, con texto oscuro y una fotografía pequeña. | **Corregida.** Fondo navy con rejilla y radial centrado; texto blanco y acentos `navy-200`. |
| CO-02 | El layout usaba 3/5 + 2/5 y no coincidía con la referencia. | **Corregida.** Columnas de **838px** y **826px**, hueco de 67px; marco de fotografía **826×655px**. |
| CO-03 | El h1 no reproducía el corte de línea de «¡TRABAJEMOS / JUNTOS!». | **Corregida.** Dos líneas explícitas con `.h-display`, sin alterar el copy canónico. |
| CO-04 | CORREO e INSTAGRAM eran filas finas sobre crema. | **Corregida.** Etiqueta corta azul y valor blanco de 40px, en bloque vertical como p.14. |
| CO-05 | Instagram se mostraba con `@`; la referencia muestra `aiche.gdl`. | **Corregida sólo en la variante `dl`.** Los botones y enlaces compactos conservan `@` cuando corresponde a su contexto. |
| CO-06 | El nav no marcaba Contacto como activo con la URL `/contacto/`. | **Corregida.** Nav normaliza slash final antes de comparar rutas. |

### 4.1 Segunda pantalla de Contacto

`/contacto` conserva `JoinCta id="unete"` después de la diapositiva de contacto.
No forma parte de p.14, pero **no es contenido inventado de F5**: es la
implementación de D-054 y el destino estable de `/contacto#unete` usado por el
bloque Únete del nav. Retirarlo rompería navegación ya documentada. Su alto es
808px porque comparte la pantalla final con el footer de 192px, igual que p.9.

---

## 5. Cambios compartidos

| Cambio | Resultado |
|---|---|
| `Eyebrow` | Unificado a `.t-eyebrow` (**15.6px** a 1920), tracking 0.30em; `navy-200` sobre oscuro y `navy-700` sobre crema. Cierra la deuda de F4. |
| `GridBackdrop` | Añade variante crema, centro radial seleccionable y fase medida de rejilla. Las pantallas F5 usan centro x=50 %; F4 conserva el preset de marca x=55 %. |
| `Screen` | Añade `tone="cream"` como alias semántico y `align="start"`; sigue siendo el único dueño del alto y la escala. |
| `MediaFrame` | Añade override de proporción visible sin modificar las dimensiones intrínsecas ni el contrato de CLS. |
| `PackageCard` | Variantes compacta/completa recompuestas; el destacado procede de `SponsorTier.featured`; desaparecen CTA y dependencia de `mailto`. |
| `CompetitionInfo` | Un copy canónico, dos composiciones reales; heading principal correcto en la subruta. |
| `Nav` | Comparación de ruta normalizada para que `/contacto` y `/contacto/` sean equivalentes. |

La arquitectura sigue la dirección `data → ui/media → sections → pages`; no se
introdujeron componentes de framework ni JavaScript adicional.

---

## 6. Medios

| Archivo | Estado | Uso |
|---|---|---|
| `public/media/video/participations-highlight.mp4` | Stub MP4 de **20 B**, mismo placeholder técnico que el video de Acerca | Segundo `LazyVideo` del sitio; sustituible con el mismo nombre |
| `public/media/images/competition-car-cutout.png` | PNG con alfa, **489×334**, 283455 B; extraído de la referencia | Recorte de la variante navy de `CompetitionInfo` |
| Fotos existentes | Placeholders | Sus marcos ya tienen la proporción visible de la referencia y usan `object-fit: cover` |

La carga del nuevo video cumple RULES §11: `preload="none"`, ninguna fuente en
`src` inicial, inyección al intersectar y poster disponible sin JavaScript.

---

## 7. Diferencias restantes, justificadas

### 7.1 Medios placeholder

Las fotos de evento, paquetes y contacto no son las fotografías del PDF. RULES
regla 8 las define como placeholders sustituibles; no se incrustaron imágenes
fotográficas del PDF. Los marcos, recortes y posiciones sí coinciden. Los dos
MP4 son stubs de 20 B y requieren los clips finales del usuario.

### 7.2 Sustitución de fuente

El PDF usa Segoe UI y el entorno Linux de captura no la incluye. Se mantiene la
pila obligatoria de RULES §5.2, sin descargar una segunda webfont. Cuerpo,
interlínea, ancho de caja y tracking están medidos; la forma de glifos y algunos
saltos de línea dependen del sistema. En el título del panel de competencias se
usa la pila Segoe/Arial para mantener las dos líneas sin recortar texto.

### 7.3 Copy canónico frente al píxel

Se respetan las correcciones de RULES aunque la captura del PDF diga otra cosa:
correo `aiche.gdl@gmail.com`, sede Lake Charles, Louisiana, y el párrafo de
Patrocinios sin el inciso erróneo «en Texas».

---

## 8. Gates y verificación

| Gate | Resultado final |
|---|---|
| `bun install` | 313 instalaciones / 422 paquetes comprobados; sin cambios |
| `bunx astro check` | **0 errores, 0 warnings, 0 hints** (64 archivos) |
| `bun run build` | **8 páginas**, build estático sin errores |
| `bun run check:render -- --base http://localhost:4321` | **32/32**: 8 rutas, JS on/off, motion default/reduce |
| `bun run check:overflow -- --base http://localhost:4321` | Al cierre de F5: **16 pantallas**, cero scroll horizontal y cero `overflow:hidden`; `about` aún usaba la válvula. **Superado después por D-136: 16/16 sin desborde** |
| `bun run check:layers` | **164 imports**, cero violaciones y cero componentes huérfanos |
| `git diff --check` | sin errores |

### 8.1 Métricas finales a 1920×1080

| Ruta | Pantalla | Top | Alto | Resultado |
|---|---|---:|---:|---|
| `/participaciones` | `participations` | 80 | 1000 | encaja |
| `/participaciones/southwest-2027` | `competition` | 80 | 1000 | encaja |
| `/patrocinios` | `sponsor-hero` | 80 | 1000 | encaja |
| `/patrocinios` | `sponsor-tiers` | 1080 | 1000 | encaja |
| `/patrocinios` | `competition` | 2080 | 1000 | encaja |
| `/contacto` | `contact` | 80 | 1000 | encaja |
| `/contacto` | `join-cta` | 1080 | 808 | reserva footer esperada |

La evidencia visual final está en:

- `.cache/f5-final/participaciones-viewport-01.png`
- `.cache/f5-final/southwest-2027-viewport-01.png`
- `.cache/f5-final/patrocinios-viewport-01.png`
- `.cache/f5-final/patrocinios-viewport-02-sponsor-tiers.png`
- `.cache/f5-final/patrocinios-viewport-03-competition.png`
- `.cache/f5-final/contacto-viewport-01.png`

---

## 9. Archivos principales

**Nuevo**

- `src/components/sections/ParticipationsOverview.astro`
- `public/media/images/competition-car-cutout.png`
- `public/media/video/participations-highlight.mp4`

**Eliminado**

- `src/components/sections/Competitions.astro`

**Recompuestos**

- `src/components/sections/CompetitionInfo.astro`
- `src/components/sections/SponsorHero.astro`
- `src/components/sections/SponsorTiers.astro`
- `src/components/sections/ContactBlock.astro`
- `src/components/ui/PackageCard.astro`
- `src/components/ui/EventCard.astro`
- `src/components/ui/CompetitionList.astro`
- `src/components/ui/DataRow.astro`

**Sistema compartido y datos**

- `src/components/ui/GridBackdrop.astro`, `Eyebrow.astro`, `Screen.astro`
- `src/components/media/MediaFrame.astro`
- `src/components/layout/Nav.astro`
- `src/data/content.ts`, `competitions.ts`, `media.ts`, `sponsors.ts`
- `src/styles/global.css`

---

## 10. Qué queda abierto

**No bloqueante, siguientes sesiones:**

- F6: recorrido responsive y estados interactivos en las siete resoluciones del
  plan; F5 sólo hizo el guard multirresolución y comparación 1:1 de desktop.
- F7: auditoría final de accesibilidad del video y rendimiento con medios reales.
- F8: regenerar `docs/media/` cuando el usuario entregue las fotografías y clips.

**Pendiente del usuario:** P-001…P-005 y F-06 siguen sin cambio. Los clips reales
para `about-highlight.mp4` y `participations-highlight.mp4` también están
pendientes.

---
---

# F5 · segunda pasada (F5b) — 2026-08-20

**Estado:** COMPLETA · **Motivo:** el usuario reportó que `/acerca` y
`/participaciones` «no se parecen en nada» al PDF, y pidió además rehacer el
comportamiento de los items del menú que tienen página propia.

**Gates al arrancar:** verde (`bunx astro check` 0/0/0 · `bun run build`, 8
páginas, 520 ms).

---

## F5b.0 Método

El mismo de F4/F5 —rasterizar, comparar a 1920×1080, enumerar, corregir,
volver a comparar— con dos herramientas nuevas que son las que hicieron
visible lo que las tablas de F5 no veían:

1. **Superposición por canales** (`.cache/overlay.py`). El PDF va al canal
   rojo y la captura del sitio a los canales verde y azul: lo que coincide
   sale gris y lo que no, rojo o cian. Un vistazo sustituye a veinte medidas.
2. **Superposición reencajada** (`.cache/overlay2.py`) para las páginas 6, 7 y
   8, que **no llevan barra de navegación** y ocupan los 1080px completos. El
   sitio tiene que meter esa composición en los 1000px que deja el nav
   obligatorio (regla 1), así que compararlas fichero contra fichero desplaza
   todo 80px y no dice nada. El script reencaja antes el rectángulo de
   contenido del PDF en el que le corresponde en el sitio.
3. **Perfilado de luminancia** (`measure.py`) y **bbox de texto** (`span.py`)
   para las medidas numéricas: ancho de una línea, alto de una caja, posición
   de un borde.
4. Métricas DOM (`getBoundingClientRect()` + `getComputedStyle`) para
   comprobar que la corrección hace lo que se pretendía.

**Correspondencia de páginas.** Se volvió a verificar leyendo las páginas, no
heredando (§A5). El encargo del usuario numeraba `/participaciones` como p.6 y
Patrocinios como p.9-11, pero su propia aclaración («slide 6 y 7» para Acerca y
Participaciones) coincide con el fichero. Vale la tabla de §0.1: `/acerca`→p.6,
`/participaciones`→p.7, Southwest→p.8, Patrocinios→p.10/11/12, Contacto→p.14.

**Capturas:** `.cache/f5b-before/` (estado de partida) y `.cache/f5b-final2/`
(estado final). Superposiciones en `.cache/ov*-p*.png`.

---

## F5b.1 Hallazgo transversal: la pila tipográfica

Antes de mirar una sola página: **el sitio no estaba componiendo en la
tipografía que creía**. `--font-sans` era

```
"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif
```

y donde no existe Segoe UI —o sea, en Linux y en el propio entorno del
usuario— `system-ui` resuelve a **DejaVu Sans**, que es mucho más ancha.
Medido contra las páginas 6-8, que sí traen capa de texto y dan el cuerpo
exacto (`mutool draw -F stext`):

| Cadena | Cuerpo | PDF (Segoe UI) | Sitio (DejaVu) | Error |
|---|---:|---:|---:|---:|
| «Tu patrocinio nos» | 74 bold | 595px | 703px | **+18.2 %** |
| «Acerca de» | 74 bold | 327px | 411px | **+25.7 %** |
| «Participaciones» | 112 bold | 797px | 968px | **+21.5 %** |
| «27 de marzo de 2027» | 21.3 | 199px | 228px | **+15 %** |

Ése es el motivo real de que los títulos rompieran donde no debían y de que
`/acerca` necesitase en F5 un parche local (`.about-copy`, D-136): el problema
no era de `/acerca`, era de todo el sitio.

Se midieron las alternativas instaladas contra ocho cadenas del PDF:

| Familia | Error medio | Dispersión |
|---|---:|---:|
| DejaVu Sans (`system-ui` en Linux) | +18.6 % | 0.120 |
| **Arial / Liberation Sans** | **+2.7 %** | 0.104 |
| FreeSans | +0.9 % | 0.113 |
| Cantarell | −1.7 % | 0.079 |

La pila queda en `"Segoe UI", Arial, Helvetica, sans-serif` (D-137): Arial es
la terciaria que ya autoriza RULES §5.2, en Windows sigue mandando Segoe UI —
que es la del diseño— y en los cuerpos de texto el error cae a ±1.5 %.
Cantarell mide mejor de media pero es una tipografía de escritorio GNOME que
no está en la whitelist ni en RULES §5.2.

**Criterio adoptado para toda la sesión:** los **cuerpos vienen del PDF** (son
el diseño); la diferencia de ancho que introduce la sustitución se documenta
como limitación técnica y **no** se compensa encogiendo la tipografía, porque
en Windows —donde está el público de `/patrocinios`— la fuente correcta sí
existe y encogerla la dejaría un 4 % pequeña.

---

## F5b.2 `/acerca` · p.6

Es la página que motivó el reporte. F4 la había resuelto como dos columnas
dentro del margen de 96px, con la foto en una caja 16:9 y el titular en un
bloque debajo. **En el PDF la foto sangra por tres bordes, ocupa el 70 % de la
diapositiva y los rótulos van superpuestos encima.**

| # | Diferencia medida | Corrección | Estado |
|---|---|---|---|
| A-1 | La media era una caja 16:9 de 1162×653 dentro del margen; el PDF la lleva de **x=576 a 1920 y de arriba abajo** | `Screen` a sangre + rejilla `36em / 1fr`; `VideoHighlight fill` llena el contenedor y recorta con `object-fit: cover` | corregida |
| A-2 | El titular y la bajada iban en un bloque **debajo** de la foto | Van superpuestos abajo a la izquierda, como en el PDF | corregida |
| A-3 | La chapa de fecha se solapaba con la bajada | Abajo a la derecha, a 35px del borde; el titular queda 60px por encima (diferencia medida en el diseño) | corregida |
| A-4 | La columna de texto arrancaba en x=96 (margen genérico); el PDF la pone en **x=40** y mide 502 | `.about-copy`: `margin-left: 2.5u`, `width: 31.375u` | corregida |
| A-5 | El título arrancaba en x=237; el PDF en **x=180** | Hueco asterisco→título de 16 a 8px; el asterisco queda en x=62 | corregida |
| A-6 | El título salía a 3 líneas por la tipografía sustituida | Pila corregida (§F5b.1) + medida de 22.6u (362px): corta en dos líneas con Segoe UI y con Arial | corregida |
| A-7 | La pila tipográfica local `.about-copy` duplicaba lo que debía ser global | Retirada; vive en `--font-sans` | corregida |
| A-8 | La diapositiva mide 1080px y aquí dispone de 1000 | Se conservan cuerpo, interlínea y medida del PDF y se recorta el aire de los extremos (el bloque de texto ocupa 994 de los 1000) | **justificada** (regla 1) |

## F5b.3 `/participaciones` · p.7

La composición de F5 era correcta en estructura y tamaños tipográficos (todos
dentro del 1.5 % respecto al PDF), pero estaba **descolocada**: la diapositiva
va de x=35 a x=1878 y de y=49 a y=1051, y el sitio la encajaba con paddings
heredados.

Factor de reencaje: **1728/1843 = 0.938** aplicado a toda la composición.

| # | Diferencia medida | Objetivo | Antes | Después |
|---|---|---|---|---|
| P-1 | Tarjeta de evento | x96 y110 484×400 | x104 y126 477×395 | **x96 y110 484×400** |
| P-2 | Panel de competencias | y509 484×518 | y542 477×511 | **y531 484×518** |
| P-3 | Caja del título | x615 1209×151 | x614 1196×149 | **x615 1209×149** |
| P-4 | Bajada en cursiva | y284 | y297 | **y281** |
| P-5 | Media | y365 1209×684 | y378 1196×677 | **y362 1209×684** |
| P-6 | Filas FECHA/SEDE/UBICACIÓN | y301/369/436 | y311/378/444 | **y300/366/433** |
| P-7 | El título del evento rompía una palabra antes que en el diseño | medida 405px | 370px | **405px** |
| P-8 | Hueco entre columnas | 35px | 33px | **35px** |
| P-9 | El panel derecho aparece vacío | — | — | **justificada**: el póster del video es un placeholder de 20 B (M-005); la caja, el borde y el recorte son los del PDF |

## F5b.4 `/participaciones/southwest-2027` · p.8

Las bandas (53.6 % / 16.1 % / 30.3 %) y los titulares ya coincidían. Dos
medidas mal:

| # | Diferencia medida | Corrección | Estado |
|---|---|---|---|
| S-1 | Medida del cuerpo superior de 1440px; el PDF usa 1477 reescalados = **1368** | `.competition-navy-what-body` 90u → **85.5u** | corregida |
| S-2 | Los dos cuerpos usaban 24.7px; en el PDF el inferior es **28** (25.9 reescalado) | `.competition-navy-why-body` con cuerpo propio de 1.62u | corregida |
| S-3 | El cuerpo superior sale a 6 líneas y el PDF a 5 | **justificada**: el copy de RULES §9 dice «McNeese State University, en Lake Charles, Louisiana, el 27 de marzo de 2027» donde el PDF dice «en la primavera del 2027» | justificada |

## F5b.5 `/patrocinios` · p.10, p.11 y p.12

La página más importante del sitio. Se midió elemento a elemento.

### Hero (p.10)

| # | Diferencia medida | Objetivo | Antes | Después |
|---|---|---|---|---|
| H-1 | El título rompía «Tu patrocinio nos **lleva** / a competir» | dos líneas como el PDF | medida 838px | **medida 704px** → corte correcto |
| H-2 | Interlínea del título | 77px | 79.9px | **77.0px** |
| H-3 | Cuerpo del párrafo a 21.3px (`.t-lead`, que es el tamaño del hero de la p.1) y salían **4 líneas** | 23.9px / interlínea 34 → 5 líneas | 4 líneas | **5 líneas** |
| H-4 | Título 11px por debajo de su sitio | cap en y=309 | y=320 | **y=309** |
| H-5 | Etiqueta TRES PAQUETES 5px alta | y=752 | y=747 | **y=752** |
| H-6 | Tarjetas de paquete 6px altas | borde superior y=801, inferior y=923 | 795 / 917 | **801 / 923** |
| H-7 | Hueco etiqueta→precio de 6px; en el PDF son 18 | 18px | 6px | **18px** |
| H-8 | Etiqueta «PAQUETE 1» un 20 % ancha | 94px | 113px | **101px** (+7 %) |
| H-9 | Ancho del título / del cuerpo | 595 / 757px | 703 / 792 | **600 / 785** |
| H-10 | Precio `$10,000` | 142px | 142px | **142px** ✔ ya coincidía |
| H-11 | Imagen 826×683 en x=1001 | ✔ | ✔ | sin cambio |

### Beneficios (p.11)

| # | Diferencia medida | Corrección | Estado |
|---|---|---|---|
| B-1 | Nota «Los tres paquetes…» un 6.8 % ancha (502 vs 470px) | cuerpo 1.33u → **1.245u** → 469px | corregida |
| B-2 | Precio de tarjeta completa 2px alto | 3.31u → **3.18u** | corregida |
| B-3 | «PAQUETE N» y «N BENEFICIOS» un 7 % anchos | clase nueva `.t-tag` (0.8u) | corregida |
| B-4 | Título «Qué recibe tu empresa» 584 vs 590px (+1 %) | — | dentro de tolerancia |
| B-5 | Las viñetas rompen una palabra más tarde que el PDF | — | **justificada**: métrica de la tipografía sustituida (§F5b.1); la medida y el cuerpo son los del diseño |
| B-6 | Tarjetas 544×731 con hueco de 48 y borde superior de 5px destacado sólo en Paquete 1 | ✔ | ya coincidía |

### La competencia, variante crema (p.12)

| # | Diferencia medida | Corrección | Estado |
|---|---|---|---|
| C-1 | El cuerpo de la columna derecha arrancaba 55px por encima del de la izquierda porque su titular ocupa una línea y no dos | alto mínimo de dos líneas en los dos titulares | corregida |
| C-2 | Galería 56px por encima de su sitio | `margin-top` 3.625u → **5.5625u** → y=661, exacto | corregida |
| C-3 | El cuerpo izquierdo sale a 8 líneas y el PDF a 6 | — | **justificada**: mismo cambio de copy que S-3 |

## F5b.6 `/contacto` · p.14

La pantalla ya estaba bien encajada. Comprobaciones finales:

| Elemento | PDF | Sitio | Δ |
|---|---:|---:|---:|
| `aiche.gdl@gmail.com` (ancho / y) | 395px · 683 | 407px · 683 | +3 % · **0** |
| Foto del equipo | x1002 826×655 | x1002 823×652 | −3px |
| Interlínea del título | 90px | 90px | **0** |
| Etiquetas CONTACTO / CORREO / INSTAGRAM | ✔ | ✔ | 0 |

No se cambió nada en esta pantalla salvo lo que hereda de la pila tipográfica.

---

## F5b.7 Menú: los items con página propia dejan de llevar «+»

Petición explícita del usuario (D-138). «Acerca de nosotros»,
«Participaciones» y «Patrocinios» tienen página propia:

- El padre pasa de `<button>` a **`<a href>`**: pulsarlo lleva a la página.
- Desaparece el «+» en escritorio y en el panel móvil.
- El submenú se despliega **sin JavaScript**, con `:hover` y `:focus-within`
  (`global.css`). Con teclado, al llegar al enlace padre el panel se abre y sus
  hijos entran en el orden natural de tabulación.
- El panel móvil pierde el acordeón: los hijos van siempre a la vista (son
  tres items con uno a tres hijos cada uno).
- `scripts/nav.ts` baja de 259 a **153 líneas**: fuera el estado del dropdown,
  el ARIA manual, los listeners de documento y el acordeón. Queda el sticky y
  el panel móvil.

Es la única desviación deliberada del nav respecto al PDF, que sí dibuja el «+».

Comprobado en navegador (`.cache/navtest.mjs`):

```
items con "+" en el nav: 0
href del padre: /acerca
submenú visible en reposo: false        tras hover: true
submenú visible con foco en el padre:   true
URL tras pulsar el padre: /acerca
panel móvil: abre, 10 enlaces, 0 botones "+", cierra con Escape
errores de consola: ninguno
```

---

## F5b.8 Gates al cerrar

| Gate | Resultado |
|---|---|
| `bunx astro check` | **0 errores · 0 warnings · 0 hints** (64 archivos) |
| `bun run build` | 8 páginas, sin errores |
| `bun run check:render` | **32/32** — todo visible con y sin JS, con motion normal y `reduce` |
| `bun run check:overflow` | **16 pantallas · 0 desbordes · 0 scroll-x** en 1920×1080, 1600×900, 1440×900, 1366×768, 1280×720 y 390×844 |
| `bun run check:layers` | 164 imports, arquitectura respetada |
| Nav interactivo | verificado (§F5b.7) |

## F5b.9 Archivos tocados

- `src/styles/global.css` — pila tipográfica, `.nav-submenu`, `.t-tag`,
  bloques de `/acerca`, hero de patrocinios, p.11, p.12 y p.8
- `src/components/sections/About.astro` — composición de la p.6 rehecha
- `src/components/sections/ParticipationsOverview.astro` — reencaje de la p.7
- `src/components/media/VideoHighlight.astro` — prop `fill`
- `src/components/layout/NavDropdown.astro` — padre enlace, panel en CSS
- `src/components/layout/MobileMenu.astro` — sin acordeones
- `src/components/layout/Nav.astro`, `src/data/nav.ts` — documentación
- `src/scripts/nav.ts` — −106 líneas
- `src/components/ui/PackageCard.astro` — `.t-tag` y relleno de tarjeta

## F5b.9-bis Limpieza de cierre

Repaso final antes de cerrar, con lo que había quedado a medias:

| Hallazgo | Corrección |
|---|---|
| `.about-layout` estaba en el marcado y no existía en CSS (clase muerta) | retirada de `About.astro` |
| El enlace padre del submenú llevaba `aria-describedby` apuntando al `<ul>`: el lector de pantalla habría leído toda la lista como descripción del enlace | retirado. El padre es un enlace normal y el panel una lista anidada; sin `role="menu"` ni `aria-expanded`, que prometerían una interacción que no existe |
| `.nav-submenu` declaraba `visibility` además de `display: none` | `display` basta: ya saca el panel del árbol de accesibilidad y del orden de tabulación |
| `docs/PERFORMANCE.md` seguía describiendo `nav.ts` como «sticky + dropdowns + menú móvil» | actualizado, con aviso de que las cifras de bytes son anteriores al cambio y hay que remedirlas en F7 |
| **`RULES.md` §7 puntos 2 y 3 (y el «+» de la anatomía) contradicen ahora al sitio** | se añade un aviso en `RULES.md` que los marca como derogados desde F5b y remite a D-138. Sin él, una sesión futura leería la regla y revertiría el cambio |
| `docs/TODO.md` y `docs/BACKLOG.md` no se habían tocado | al día: TODO recoge el estado de los siete slots de medios con su proporción de marco; BACKLOG, los seis hallazgos fuera de alcance |

## F5b.10 Qué queda abierto

**No bloqueante:**

- Las imágenes y los dos `.mp4` siguen siendo placeholders (M-001/M-005). Las
  cajas, proporciones y recortes ya son los del PDF, así que sustituir el
  archivo con el mismo nombre basta.
- Diferencias de ancho de ±3 % en cuerpos y de hasta +7 % en etiquetas por la
  sustitución de Segoe UI. Desaparecen en Windows.
- Los saltos de línea de los cuerpos largos de p.8, p.11 y p.12 no coinciden
  palabra por palabra: parte por el copy de RULES §9 (que difiere del PDF) y
  parte por la métrica de la tipografía sustituida.
