# TODO — erratas del PDF y datos faltantes

## FIX aplicados (registro de correcciones del PDF)

Aplicados ya en `src/data/content.ts`. Cada uno queda aquí como
trazabilidad.

| # | Origen (RULES) | Pág PDF | Error en PDF | Aplicado en `content.ts` |
|---|---|---|---|---|
| F-01 | §9.3 | p.6 | "compentencias" / "de el" | `participations.subtitle` corregido a "competencias internacionales" y "de el American Institute" |
| F-02 | §9.4 | p.7 (azul) y p.12 (crema) | "McNeese State University, en la primavera del 2027" vs "en Texas el 27 de marzo" — contradictorio | `competition.whatBody` y `competition.whatTitle` unificados a "McNeese State University, en Lake Charles, Louisiana, el 27 de marzo de 2027" |
| F-03 | §9.5 | p.10 | "en Texas" (mismo problema que F-02) | `sponsors.paragraph` sigue el texto canónico de RULES §9.5 y elimina por completo ese inciso |
| F-04 | §9.5 | p.10 | "Campus GDA" | `sponsorTiers[0].benefits[4]` corregido a "Campus GDL" |
| F-05 | §9.5 | p.10 | "agradeciemgto" | `sponsorTiers[*].benefits` usa "agradecimiento" |

## Datos pendientes del usuario

- **P-001** Moneda de paquetes de patrocinio (RULES §19.1). Asumido MXN; `sponsors.ts` (S6) leerá de una constante.
- **P-002** Nombres y cargos de mesa directiva (RULES §19.5). En `team.ts` (S4) se generan 6 entradas placeholder con marca visual "placeholder". **Estado:** pendiente de confirmación del usuario. Cuando llegue, editar un único archivo (`src/data/team.ts`).
- **P-003** Destino del botón "Únete" (RULES §19.4). Provisionalmente `mailto:aiche.gdl@gmail.com` con asunto prellenado.
- **P-004** Logos de patrocinadores actuales (RULES §19.6). Por defecto: NO mostrar logos hasta confirmar.
- **P-005** Dominio definitivo (RULES §19.7). Provisional:
  `aichegdl.example.com`. **El usuario aún no lo ha comprado** (confirmado
  2026-08-21); avisará cuando lo tenga.

  **Al lanzar hay que tocar DOS líneas de `src/data/site.ts`**, no una:
  `siteUrl` con el dominio real **y** `previewNoIndex = false` (D-185),
  que hoy deja el `robots.txt` en `Disallow: /` porque el sitio está
  publicado como preview en un bucket de S3. Publicar con `siteUrl`
  correcto y `previewNoIndex` en `true` deja el sitio invisible para
  los buscadores.

  El dominio en sí sigue siendo **una sola línea**: `siteUrl`.
  Propaga a canonical, Open Graph, Twitter, el JSON-LD de `Organization` y
  `Event`, `sitemap-index.xml`, `sitemap-0.xml` y `robots.txt`. Verificado
  en F8 sustituyéndola y comprobando que no queda ni una aparición del
  dominio anterior en `dist/` (D-183). Hasta F8 **no era cierto**: el
  dominio estaba también escrito a mano en `astro.config.mjs` y en
  `public/robots.txt`.

## Medios pendientes de sustituir (detectado en F1)

Hasta F1 la carga diferida de video no llegaba a ejecutarse, así que el
estado real de estos archivos no se había podido observar nunca.

- **M-001** `public/media/video/about-highlight.mp4` es un **stub de 20 bytes**.
  Ahora que la carga diferida funciona, el `<source>` se inyecta correctamente
  pero el archivo no se puede decodificar (`readyState` se queda en 0). El
  `poster` sí se ve. **Se resuelve sustituyendo el archivo por el video real,
  con el mismo nombre y sin tocar código** (RULES regla 8).
- **M-002** No existe `about-highlight.webm`. La línea está comentada en
  `src/data/media.ts` con instrucciones: si se deja el `.webm` en
  `public/media/video/`, basta con descomentarla.

## Logo definitivo entregado por el usuario (2026-08-20)

- **L-001 — resuelto en F4.** El logo real está en el repo:
  `design/aiche_logo.svg` (vectorial, 2.6 KB) y `design/aiche_logo.png`
  (149×172). `public/media/logo/aiche-gdl-isotipo.svg` ya sustituye al
  placeholder geométrico y `ui/Logo.astro` lo renderiza como imagen.
  **Ojo con la proporción:** el logo real es **149×172 (≈0.87:1, más alto que
  ancho)**; el placeholder anterior era **1:1**. F4 ajustó también la caja, no
  sólo el trazado, para evitar deformación.
  **Cómo se resolvió:** `design/` se mantuvo de sólo lectura y el SVG se copió a
  `public/`; sustituir el archivo público conserva el contrato de la regla 8.

## Erratas detectadas en F4 (2026-08-20)

| # | Origen | Pág PDF | Discrepancia | Resolución |
|---|---|---|---|---|
| F-06 | RULES §9.2 | p.6 | El PDF rotula la chapa del video **`HIGH LIGHTS`** (dos palabras: el texto extraído del PDF lleva un espacio real entre `HIGH` y `LIGHTS`). RULES §9.2 la transcribe como `HIGHLIGHTS`. | Se mantiene `HIGHLIGHTS` (RULES §9 es la autoridad de copy, regla 7). **Pendiente de confirmación del usuario**: si prefiere el rótulo del PDF, se cambia una constante en `src/data/content.ts` (`about.videoBadge`). |

## Medios pendientes (actualizado en F5)

- **M-003** `src/assets/media/team/team-group.jpg` es un placeholder plano de
  proporción 3:2, pero la p.13 del PDF encuadra la foto de grupo a **825×692
  (≈1.19:1)**. El marco ya tiene la proporción correcta y la imagen va con
  `object-fit: cover`, así que **basta con sustituir el archivo** por la foto
  real; no hay que tocar código (regla 8).
- **M-004** Los seis retratos de `src/assets/media/team/board-0N.jpg` son 3:4
  (600×800) y el marco del PDF es **263×334 (≈0.787)**. Mismo caso que M-003:
  `object-fit: cover` recorta y la sustitución no toca código.
- **M-005 — slot resuelto en F5; medio real pendiente.** El video de `/acerca`
  y el de `/participaciones` son los **dos videos** del sitio (indicación del
  usuario, 2026-08-20). F5 añadió `media.participationsVideo`, lo montó con
  `LazyVideo` en `ParticipationsOverview` y creó
  `public/media/video/participations-highlight.mp4`. El archivo actual es un
  **stub de 20 B**, igual que M-001: debe sustituirse por el clip real con el
  mismo nombre, sin tocar código.

## Estado de los medios tras F5b (2026-08-20)

Los marcos, proporciones y recortes de **todas** las rutas ya son los del PDF,
así que la regla 8 se cumple sin excepciones: sustituir el archivo con el mismo
nombre en `public/media/` basta y **no hay que tocar código**.

| Slot | Archivo | Proporción del marco | Estado |
|---|---|---|---|
| Home, media a sangre (p.6) | `video/about-highlight.mp4` + `images/about-poster.jpg` | recorte `cover` sobre el 70 % derecho de la pantalla | **M-001** stub de 20 B; póster = foto real del PDF |
| Home y `/participaciones` (p.7) | `video/participations-highlight.mp4` + `images/chem-e-car.jpg` | 1288×732 con recorte `cover` | **M-005** stub de 20 B; póster = foto real del PDF |
| `/patrocinios` hero | `images/sponsors-hero.jpg` | 826/683 | placeholder |
| `/patrocinios` tarjetas | `sponsors/tier-0N.jpg` | 544/177 | placeholder |
| `/patrocinios` galería crema | `images/competition-0N.jpg` | 544/300 | placeholder |
| `/contacto` foto | `images/contact-group.jpg` | 826/655 | placeholder |
| `/equipo` | `team/board-0N.jpg`, `team/team-group.jpg` | 263/334 y 825/692 | **M-003**, **M-004** |

Mientras los dos MP4 sean stubs, los paneles de video se ven como el póster
placeholder **bajo el velo `bg-black/30` y el botón de play manual**, no como
un video reproduciéndose. Verificado en F8 leyendo el DOM: el archivo de 20 B
no es reproducible, `video.play()` se rechaza y `lazy-video.ts` cae —
correctamente — al botón manual (RULES §11.2, regla 8 de `lazy-video.ts`).

No es un defecto de composición y **no hay nada que arreglar en el código**:
al dejar los MP4 reales el `play()` prospera y el velo y el botón desaparecen
para quien no pida `prefers-reduced-motion`.

**Consecuencia para el material:** los paneles de video de
`docs/media/` muestran hoy ese estado de reserva. Al sustituir los dos MP4
hay que **volver a ejecutar `bun run capture`**, o el brief de video partirá
de un fotograma que ya no existe.


## Pendientes abiertos en F6b (2026-08-21)

- **M-006 — Los dos pósters son las fotos del PDF, y son pequeñas.**
  `about-poster.jpg` mide 730×487 y `chem-e-car.jpg` 574×383: es la resolución
  a la que el propio diseño las incrusta. Se ven correctas en composición pero
  algo blandas al ocupar 1344×1000 y 1288×732. Es un placeholder mejor que el
  azul plano que había, no material final: al sustituirlas por las fotos reales
  del capítulo, con el mismo nombre de archivo, el problema desaparece solo
  (regla 8). Ver D-159.
- **F-07 — RESUELTO (2026-08-21): el rótulo de `/equipo` dice «NUESTRO EQUIPO».**
  El PDF rotula esa diapositiva «ACERCA DE NOSOTROS» (p.13) y su propia barra
  marca «Acerca de…» como activa, así que el copy verbatim era el del diseño.
  Con el menú renombrado en D-153, las dos etiquetas convivían en la misma
  pantalla diciendo cosas distintas; el usuario decidió alinear el rótulo con el
  menú. **Es la única desviación de copy respecto a RULES §9 en todo el sitio.**
  Ver D-161.
