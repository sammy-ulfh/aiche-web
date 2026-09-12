# ASSETS — inventario de medios y cómo reemplazarlos

> ⚠️ **IMPORTANTE:** tras sustituir cualquier imagen o video real
> (paso 3 más abajo), **volver a ejecutar** `bun run capture` para
> regenerar las capturas y screencasts del sitio en `docs/media/`. Las
> capturas y screencasts sirven como material para el video
> (`docs/VIDEO-BRIEF.md`, `docs/SHOTLIST.md`) y para QA visual. Si
> no se re-generan, el material seguirá mostrando los placeholders
> aunque el sitio ya tenga las fotos reales.
>
> Ver [`README.md`](../README.md) § "⚠️ Importante — Re-sustituir
> imágenes y videos".

> Manifiesto único: `src/data/media.ts`. Para añadir un nuevo slot, se
> declara ahí con su ruta, ancho, alto y alt. El usuario sustituye el
> archivo en `public/media/...` con el mismo nombre y la misma
> proporción; no hay que tocar código (RULES §3.8, §10.1).

## 1. Generación de placeholders

`bun scripts/gen-placeholders.mjs` produce todos los JPG listados abajo
con el lenguaje visual del sitio (navy + rejilla + etiqueta visible).
Es **idempotente**: vuelve a generarlos y sobrescribe.

Restricciones de los placeholders (RULES §10.2):
- Nada de fotos de stock con derechos ni logotipos de empresas reales.
- Los 6 retratos de la mesa directiva son **siluetas geométricas**
  (hexágono + "RETRATO"), nunca caras generadas.
- Cada placeholder lleva su etiqueta visible (`VIDEO 16:9`,
  `RETRATO 01 · MESA DIRECTIVA`, etc.) para que sea obvio qué se sustituye.

## 2. Tabla de slots

| Clave | Dónde se usa | Ruta esperada | Proporción | Resolución | Peso máx. sugerido | Alt (placeholder) |
|---|---|---|---|---|---|---|
| `heroPoster` | Home (S3) | `/media/images/hero-poster.jpg` | 16:9 | 1920×1080 | 200 KB | "Fondo azul con rejilla técnica…" |
| `aboutPoster` | Póster de `aboutVideo` (home, p.6) | `/media/images/about-poster.jpg` | 3:2 | **730×487** (foto real del PDF) | 200 KB | "Imagen representativa del equipo…" |
| `aboutVideo` | Acerca | `/media/video/about-highlight.mp4` (y `.webm`) | 16:9 | 1920×1080 | 8 MB | (label) "Así se vive la experiencia AIChE GDL" |
| `participationsVideo` | Participaciones | `/media/video/participations-highlight.mp4` | marco 4039:2286 | 1920×1080 | 8 MB | (label) "Vehículo Chem-E-Car…" |
| `chemECar` | Póster de `participationsVideo` | `/media/images/chem-e-car.jpg` | 3:2, recortado al marco | **574×383** (foto real del PDF) | 150 KB | "Vehículo Chem-E-Car del equipo…" |
| `competitionGallery[0..2]` | La competencia, variante crema | `/media/images/competition-0{1,2,3}.jpg` | marco 544:300 | 1200×800 | 120 KB c/u | "Equipo en laboratorio…" |
| `competitionCarCutout` | La competencia, variante navy | `/media/images/competition-car-cutout.png` | 489:334 | 489×334 | **80 KB** (hoy 57 KB) | "Vehículo Chem-E-Car construido…" |
| `board[0..5]` | Mesa directiva (S4) | `/media/team/board-0{1..6}.jpg` | 3:4 | 600×800 | 80 KB c/u | "Retrato NN de la mesa directiva — placeholder" |
| `teamGroup` | Mesa directiva + contacto | `/media/team/team-group.jpg` | 3:2 | 1800×1200 | 200 KB | "Foto grupal del equipo AIChE GDL…" |
| `sponsorsHero` | Patrocinios, p.10 real | `/media/images/sponsors-hero.jpg` | marco 826:683 | 1600×900 | 150 KB | "Vehículo Chem-E-Car en pista…" |
| `sponsorsTierImages[0..2]` | Qué recibe tu empresa, p.11 real | `/media/sponsors/tier-0{1,2,3}.jpg` | marco 544:177 | 800×600 | 80 KB c/u | "Imagen del Paquete N — placeholder" |
| `contactGroup` | Contacto, p.14 real | `/media/images/contact-group.jpg` | marco 826:655 | 1600×1200 | 180 KB | "Foto grupal del equipo AIChE GDL" |
| `ogImage` | Open Graph (RULES §14) | `/og.jpg` | 1200×630 | 1200×630 | 100 KB | "AIChE GDL — Tec de Monterrey Campus Guadalajara" |

> Las imágenes y videos definitivos los entrega el usuario. Los
> placeholders se eliminan en S9 (RULES §2.4) o se conservan si el
> usuario todavía no ha entregado los definitivos.

## 3. Sustitución en caliente

Para reemplazar cualquier placeholder:

1. Conserva el **mismo nombre de archivo** (p. ej. `board-03.jpg`).
2. Mantén la **proporción** declarada arriba.
3. Sobrescribe el archivo en **`src/assets/media/...`**.
4. Vuelve a ejecutar `bun run build` (o espera al siguiente deploy).
5. **Vuelve a ejecutar `bun run capture`** para regenerar las
   capturas y screencasts del sitio (el material visual derivado).

El componente no se entera del cambio porque la clave es la misma. Si
la nueva imagen tiene dimensiones distintas, ajusta `w`/`h` en
`src/data/media.ts` para mantener CLS = 0.

> **⚠️ La carpeta cambió en F8: `public/media/` → `src/assets/media/`.**
> Los rasterizados se movieron porque Astro sólo puede optimizar lo que
> vive dentro de `src/`. Ahora cada imagen se sirve como AVIF, WebP y su
> formato original, en cinco o seis anchos, y el navegador escoge
> (RULES §12.3). El peso de las páginas cayó entre un 45 % y un 75 %
> (D-180, cifras en `docs/PERFORMANCE.md` §3.4).
>
> **Siguen en `public/`**, y ahí hay que sustituirlos: los dos MP4
> (`public/media/video/`), el isotipo SVG
> (`public/media/logo/aiche-gdl-isotipo.svg`), `og.jpg` y los favicons.
> Los videos no pasan por el optimizador y el SVG no lo necesita; `og.jpg`
> tiene que conservar una URL absoluta y estable para las redes sociales.
>
> El manifiesto `src/data/media.ts` **no cambia**: sigue declarando
> `/media/team/board-01.jpg`, sólo que esa cadena es ahora la clave del
> archivo en `src/assets/media/`, no una URL pública. Si te equivocas de
> nombre, el build falla con un mensaje que dice cuál falta — antes se
> habría publicado un `<img>` roto.

> **Ajusta `w`/`h` de verdad, no de memoria.** En F7 se comprobaron las
> 15 entradas del manifiesto contra el archivo real y **dos mentían**:
> `about-poster.jpg` se declaraba 1920×1080 midiendo 730×487, y
> `chem-e-car.jpg` 1600×900 midiendo 574×383. F6b sustituyó los
> placeholders por las fotos del PDF y no tocó las medidas. Corregido
> (D-172).

### 3.1 Los pósters de video

Los dos pósters (`aboutPoster` y `chemECar`) son **la misma entrada** que
consume el `VideoAsset` correspondiente: desde F7 `VideoAsset.poster` es
un `ImageAsset`, no una ruta suelta, así que el archivo se declara una
sola vez (D-172).

En el HTML el póster **no** viaja en el atributo `poster` del `<video>`
—ahí el navegador lo descarga siempre, aunque el video esté fuera de
pantalla— sino como una capa `<img loading="lazy">` (D-163). Sustituirlos
sigue sin tocar código.

## 4. Optimización automática

Los placeholders NO pasan por el optimizador de Astro (`astro:assets`).
En S8 (Rendimiento) se decide si moverlos a `src/assets/` para que
Astro genere AVIF/WebP con `srcset`. Mientras tanto, el sitio sirve
JPG directamente — la pérdida de LCP está acotada por la compresión
mozjpeg de sharp y por `loading="lazy"` fuera del primer viewport.

## 5. Identidad (añadido en F4)

Dos archivos nuevos en `public/media/logo/`. **No son placeholders**: son los
activos reales del diseño.

| Slot | Archivo | Medidas | Origen | Dónde se usa |
|---|---|---|---|---|
| Isotipo | `aiche-gdl-isotipo.svg` | 149×172 (vectorial, 2.6 KB) | Copia de `design/aiche_logo.svg`, que el usuario entregó | Nav, hero de `/`, CTA "¡Súmate al capítulo!" |
| Lockup institucional AIChE | `aiche-institucional.png` | 319×120 (22 KB) | Extraído de `design/landing.pdf` con `mutool extract` (es la imagen que la p.9 pone en el footer) | Footer |

Ambos se declaran en `src/data/media.ts` (`media.isotipo`,
`media.aicheInstitucional`) y se sirven con `<img>`, así que **sustituirlos es
dejar otro archivo con el mismo nombre**, sin tocar código (regla 8).

El fondo del lockup institucional es exactamente `#f4f1e9`, el crema del footer,
por lo que encaja sin recorte ni canal alfa.

### Proporciones de los marcos, remedidas en F4

Los marcos de `/equipo` ya no son 3:4 y 3:2 genéricos, sino los del PDF.
(F4 los midió cuando la ruta era `/acerca/equipo`; F6b la movió a `/equipo`
sin tocar las proporciones.)
Las imágenes van con `object-fit: cover`, así que la sustitución sigue sin tocar
código; simplemente el recorte se hace sobre la proporción correcta.

| Slot | Proporción del marco | Medida en el PDF |
|---|---|---|
| Retratos de mesa directiva | `263/334` (≈0.787) | p.13, 6 retratos de 263×334 |
| Foto de grupo | `825/692` (≈1.19) | p.13, x 1002..1826 · y 297..988 |
| Panel de video de la p.6 (2ª pantalla de `/`) | `16/9` | p.6, rótulo «ESPACIO PARA EL VIDEO · 16:9» |

## 6. Medios añadidos y marcos remedidos en F5

### Segundo video

`public/media/video/participations-highlight.mp4` es el segundo slot de video
confirmado en D-127. Hoy es un **stub MP4 de 20 B**, igual que
`about-highlight.mp4`; su única finalidad es mantener la ruta estable hasta que
el usuario entregue el clip real. Se declara como `media.participationsVideo` y
se carga mediante `LazyVideo`: no existe `src` en el HTML inicial.

Para sustituirlo, dejar el MP4 real con el mismo nombre. El poster sigue siendo
`chem-e-car.jpg`; si se entrega otro poster, se reemplaza ese archivo o se cambia
la única referencia en `src/data/media.ts`.

### Recorte del Chem-E-Car

`competition-car-cutout.png` (489×334, 283455 B) se extrajo del objeto gráfico
de `design/landing.pdf` y conserva alfa. `design/` no se modificó. Es el activo
que la variante navy de `CompetitionInfo` coloca en la esquina inferior
derecha; no es una foto externa ni genera requests a terceros.

### Proporciones visibles F5

Los JPG conservan sus dimensiones intrínsecas y `MediaFrame` aplica la
proporción visible mediante `aspect-ratio`; `object-fit: cover` absorbe la
diferencia. Por tanto, el usuario puede sustituir los archivos sin pre-recortar
exactamente a estas cajas:

| Marco | Proporción visible | Medida a 1920×1080 |
|---|---|---|
| Video de Participaciones | `4039/2286` | 1197×677px |
| Hero de Patrocinios | `826/683` | 826×683px |
| Imagen superior de paquete | `544/177` | 544×177px |
| Galería de competencia crema | `544/300` | 544×300px |
| Foto de Contacto | `826/655` | 826×655px |
