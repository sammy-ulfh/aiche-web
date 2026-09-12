# Sesión F6b — Reestructuración del sitio y fidelidad de la p.7

**Fecha:** 2026-08-21 · **Estado:** COMPLETA
**Origen:** petición del usuario tras revisar F6, no una sesión del plan.
**Gates al arrancar:** verdes (F6 los dejó así).

---

## 1. Qué pidió el usuario

1. El item «Acerca de nosotros» del menú debe llevar a **la página del equipo**
   (retratos de la mesa directiva y foto de grupo), no a la diapositiva de
   presentación del capítulo.
2. Esa diapositiva de presentación —la que lleva la explicación y el video—
   debe ser **la continuación del home, debajo del contador**, sustituyendo a
   lo que hubiera ahí.
3. Cambiar el nombre de la página y del botón del nav por algo que corresponda
   a la presentación del equipo, «para que sea menos confuso».
4. **Lo mismo que muestra `/participaciones` debe salir también en el home**,
   debajo del bloque anterior.
5. `/participaciones` «se ve más pequeño y centrado y de poca calidad, no
   coincide totalmente con la página 7 del pdf»: ajustarla para que se vea tal
   cual el diseño.

El mensaje se cortó en «Además, arregla que se…». Al preguntar, el usuario
indicó que no lo recordaba.

**Decisiones que eligió al preguntarle:** «Nuestro equipo» · `/equipo`; el home
queda Hero → Acerca → Participaciones → Patrocinios → Súmate; y las URLs
`/acerca` y `/acerca/equipo` se eliminan sin redirección.

---

## 2. Qué se hizo

### 2.1 Reestructuración (D-153, D-154, D-155)

| Antes | Ahora |
|---|---|
| Nav: «Acerca de nosotros» → `/acerca` (+ submenú «Mesa directiva y equipo» → `/acerca/equipo`) | Nav: **«Nuestro equipo» → `/equipo`**, sin submenú |
| `/acerca` = diapositiva p.6 | **eliminada**; la p.6 vive en el home |
| `/acerca/equipo` = p.13 | **`/equipo`** = p.13 |
| Home: Hero · About(teaser) · NextEvent · SponsorTeaser · JoinCta | Home: Hero · **About (p.6 entera, con video)** · **ParticipationsOverview (p.7 entera)** · SponsorTeaser · JoinCta |

El home pasa de 5 a 5 pantallas, pero son otras: ahora encadena el PDF en su
propio orden (p.1 → p.6 → p.7 → p.10 → p.9). El `h1` sigue siendo el del hero;
`About` y `ParticipationsOverview` reciben `headingLevel="h2"` y sus bloques
internos bajan a `h3`, así que la jerarquía queda **1 h1 · 3 h2 · 3 h3** y no se
salta ningún nivel.

`NextEvent` desaparece porque duplicaba, en la pantalla inmediatamente anterior,
la tarjeta de evento y las cuatro competencias que ya pinta el bloque de
Participaciones.

### 2.2 La p.7, a escala 1:1 (D-156)

Aquí estaba el problema de fondo que el usuario detectó a ojo.

La p.7 **no usa la caja de 1728px** con la que compone el resto del sitio: su
contenido va de x=35 a x=1878, casi a sangre. F5 la había metido dentro de esa
caja aplicando un factor de 1728/1843 = **0.938 a toda la composición**. De ahí
el «se ve más pequeño y centrado»: *todo* —tipografías, cajas, huecos— estaba un
7 % por debajo del diseño.

La corrección: la pantalla sangra hasta el borde y la composición va a 1:1.
Verticalmente el contenido del PDF mide 1003px y el nav obligatorio deja 1000,
así que sólo hay que recortar 3px de aire, no reescalar nada.

**Medido después, a 1920×1080 (origen del PDF desplazado +31px por el nav):**

| Elemento | PDF | Sitio | Δ |
|---|---|---|---|
| Tarjeta de evento | x 35..550, y 80..507, 515×427 | x 35..550, y 80..507, 515×427 | **0** |
| Panel de competencias | x 35..550, 515×552 | x 35..550, 515×552 | **0** (y −2) |
| Caja del título | x 589..1878, y 80..241, 1289×161 | x 589..1877, y 80..241, 1288×161 | −1 |
| Bajada | y 265..325 | y 265..327 | +2 |
| Media | 1292×732 | 1288×732 | −4 |
| Banda blanca FECHA | 60 de alto | 60 | **0** |
| Fila de competencia | 88.7, separador en y 712 | 89, y 713 | +1 |
| Caja de etiqueta | 83×71, x 68..151 | 83×71, x 67..150 | −1 |

**Cuerpos tipográficos** (los diez de la diapositiva, sacados de la capa de
texto con `mutool draw -F stext` — la p.7 es vectorial):

| | PDF | Sitio |
|---|---:|---:|
| «Participaciones» | 112.19px | 112.15 |
| Bajada (Libre Baskerville Italic) | 26.66 | 26.65 |
| Título de la tarjeta | 32.92 | 32.91 |
| Valores FECHA/SEDE/UBICACIÓN | 21.33 | 21.32 |
| Chip «PRÓXIMO EVENTO» | 17.33 | 17.32 |
| «Rumbo a las competencias AIChE» | 43.58 | 43.57 |
| Cuerpo del panel | 17.33 | 17.32 |
| Etiquetas SPRING / 2027 | 18.66 | 18.65 |
| Nombre de competencia | 22.66 | 22.65 |
| Bajada de competencia | 20.00 | 19.99 |

Diferencia máxima: **0.05px**. La pantalla mide 1000px exactos.

### 2.3 La trampa de `em` (D-157)

Al medir la primera versión la pantalla daba **1018px**, no 1000. Causa: los
huecos estaban escritos en `em` sobre elementos cuyo cuerpo no es la unidad del
lienzo. `mt-[1.5em]` sobre la bajada, que mide 26.6px, daba **40px** donde el
diseño pide 24; `min-h-[4.4375em]` sobre la etiqueta, que mide 18.65px, daba
**83px** de alto donde el diseño pide 71.

Donde el número es una medida *del lienzo*, ahora se escribe
`calc(var(--screen-fs) * k)`, que no depende del cuerpo de nadie. Es el mismo
razonamiento que ya justificaba la arquitectura de `--screen-fs` en F2.

### 2.4 «SPRING» partido por la mitad (D-158)

La regla global `overflow-wrap: anywhere` que introduje en F6 (D-146) partía
«SPRING» como «SPRIN / G» dentro de su caja. Dos cosas estaban mal:

- la caja y el cuerpo venían del reencaje al 0.938, así que la palabra no cabía;
- y `anywhere` convertía un desajuste de 2px en algo que se ve roto.

Con la caja a su medida real (83px para los 71.5 que ocupa «SPRING» a 18.66px de
Arial Bold) y `overflow-wrap: normal` en `.competition-tag`, se lee bien. Si
algún día una etiqueta no cupiera, desbordaría a lo ancho y `check:overflow` lo
cazaría, que es la red que corresponde.

### 2.5 Los pósters, del propio PDF (D-159)

La otra mitad de «se ve de poca calidad» eran los pósters: cajas azules planas
generadas en S2. Extraídos con `mutool extract`, el PDF trae las dos fotos
reales:

- p.6, laboratorio, 730×487 → `public/media/images/about-poster.jpg`
- p.7, Chem-E-Car en pista, 574×383 → `public/media/images/chem-e-car.jpg`

Mismo nombre de archivo, así que sustituirlos por material real no toca código
(regla 8). **Siguen siendo placeholders**: su resolución es la del PDF y se ven
algo blandos al ocupar 1344×1000 y 1288×732 — registrado como M-006.

### 2.6 Limpieza que arrastró el cambio (D-160)

Sin consumidor tras la reestructuración, y por tanto eliminados (§A4):
`sections/NextEvent`, la variante `teaser` de `About`, la variante `compact` de
`CompetitionList`, la variante `navy` y las props de CTA de `EventCard` y
`DataRow`, `hero.aboutCta`/`aboutCtaHref` —el botón «Conoce más», que además era
un elemento inventado (C-12 de la auditoría)— y
`participations.nextEvent.homeCtaHref`.

`check:layers` baja de 164 a **151 imports** sin ninguna violación.

---

## 3. Archivos creados / modificados / eliminados

**Creados:** `src/pages/equipo.astro` · `docs/sessions/F6b-estructura-y-p7.md`

**Eliminados:** `src/pages/acerca.astro` · `src/pages/acerca/equipo.astro` ·
`src/components/sections/NextEvent.astro`

**Modificados:** `src/data/nav.ts` · `src/data/content.ts` ·
`src/pages/index.astro` · `src/components/sections/About.astro` ·
`src/components/sections/ParticipationsOverview.astro` ·
`src/components/ui/{EventCard,DataRow,CompetitionList}.astro` ·
`src/styles/global.css` · `public/media/images/{about-poster,chem-e-car}.jpg` ·
`scripts/{check-render,check-overflow,check-states,capture}.mjs` · `README.md` ·
`docs/{STATE,DECISIONS,TODO,DESIGN-SYSTEM}.md`

---

## 4. Desviaciones respecto a lo pedido

**Ninguna en el alcance.** Dos apuntes:

1. **El rótulo de `/equipo` pasa a «NUESTRO EQUIPO».** El PDF pone «ACERCA DE
   NOSOTROS» en la p.13 y su propia barra marca «Acerca de…» como activa, así
   que la propuesta inicial fue conservar el copy verbatim (regla 7) y
   consultarlo. El usuario decidió cambiarlo: con el menú renombrado, las dos
   etiquetas convivían en la misma pantalla diciendo cosas distintas. **Es la
   única desviación de copy respecto a RULES §9 en todo el sitio** (D-161).
2. **La frase cortada del encargo no se pudo atender por lo que decía**, pero el
   defecto más probable —«SPRING» partido— estaba dentro del alcance y se
   arregló igualmente (§2.4).

---

## 5. Verificación

| Gate | Resultado |
|---|---|
| `bunx astro check` | **0 errores, 0 warnings, 0 hints** (63 archivos) |
| `bun run build` | 7 páginas, sin errores |
| `bun run check:render` | **28/28** — contenido visible con y sin JS |
| `bun run check:overflow` | 10 resoluciones × 7 rutas: 15 pantallas, **0 desbordes, 0 scroll-x** |
| `bun run check:states` | **78 comprobaciones, 0 fallos** |
| `bun run check:layers` | 151 imports, arquitectura respetada |

Comprobado además a mano sobre el build de producción:

- **Home:** 5 pantallas de 1000px exactos (`hero`, `about`, `participations`,
  `sponsor-teaser`) más `join-cta` de 808, que comparte diapositiva con el
  footer. Jerarquía de encabezados 1 h1 · 3 h2 · 3 h3.
- **Los dos videos del home** inyectan su fuente al entrar al viewport y cada
  uno lleva su póster: `about-poster.jpg` y `chem-e-car.jpg`.
- **Sitemap** regenerado con `/equipo`; sin rastro de `/acerca` en el build.
- **Móvil (390×844):** la p.7 apilada lee de arriba abajo —título, bajada,
  video, tarjeta de evento, panel de competencias— con el aire corregido entre
  el título de la tarjeta y la primera banda blanca, y entre filas de la lista.

---

## 6. Siguiente sesión

**F7 — Rendimiento, accesibilidad y SEO.** Lo que cambia respecto a lo que dejó
F6 apuntado:

1. Las métricas hay que remedirlas **otra vez**: el home tiene ahora dos videos
   y dos fotos reales en vez de una y placeholders planos, así que su peso y su
   LCP no se parecen a los de F1.
2. `/` era la ruta con el LCP en el límite (~2,0 s) **antes** de este cambio.
   Ahora carga más imagen por encima del pliegue: es el punto a vigilar.
3. `docs/SITE-CONTEXT.md`, `docs/SHOTLIST.md` y `docs/DEPLOY.md` siguen
   describiendo el mapa de rutas viejo. F8 los reescribe al recapturar.
