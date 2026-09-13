# Guía de mantenimiento — Sitio AIChE GDL

Guía técnica para quien mantenga el sitio. La presentación del capítulo está en
el [`README`](../README.md).

---

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build) 7 (`output: 'static'`) |
| Estilos | [Tailwind CSS](https://tailwindcss.com) 4 vía `@tailwindcss/vite` |
| Lenguaje | TypeScript (modo estricto) |
| Gestor de paquetes | [Bun](https://bun.sh) 1.3 |
| Imágenes | `astro:assets` + `sharp` |
| Tipografía | Segoe UI (sistema) · Libre Baskerville Italic (`@fontsource`, auto-alojada) |
| QA | Playwright (scripts de verificación en `scripts/`) |

### Características técnicas

- **100 % estático**: HTML pre-renderizado, sin servidor, sin base de datos y
  **sin variables de entorno**.
- **Rápido**: imágenes en AVIF/WebP con `srcset`, carga diferida de todo lo que
  queda fuera de pantalla, y videos que no descargan nada hasta entrar al
  viewport.
- **Privado**: cero peticiones a terceros. Sin analytics, CDNs, Google Fonts ni
  embeds de YouTube; videos y tipografías auto-alojados.
- **JavaScript mínimo**: sólo el contador, el menú móvil, la carga diferida de
  video y las animaciones al hacer scroll. Sin frameworks de UI.
- **Accesible**: navegación completa con teclado, *skip link*, foco visible,
  página actual anunciada con `aria-current`, menú móvil con *focus trap* y
  respeto a `prefers-reduced-motion`.
- **SEO**: Open Graph/Twitter por ruta, JSON-LD de `Organization` y `Event`,
  `sitemap-index.xml` y `robots.txt` generados en el build.
- **Responsive**: de 360 px a 1920 px (lo que mide `check:overflow`), sin
  scroll horizontal.

---

## Desarrollo local

Requisitos: **Bun ≥ 1.3** y **Node ≥ 22.12**.

```bash
bun install          # instala dependencias
bun run dev          # servidor de desarrollo → http://localhost:4321
bun run build        # build de producción → dist/
bun run preview      # sirve dist/ → http://localhost:4321
bunx astro check     # type-check de TypeScript y archivos .astro
```

### El preview de Astro: tres cosas que conviene saber

1. **Abre `http://localhost:4321`, no `http://127.0.0.1:4321`.** El servidor sólo
   escucha en `localhost`; por IPv4 la conexión se rechaza.
2. **Sólo puede haber un preview por proyecto.** Astro registra un bloqueo y, si
   ya hay uno vivo —aunque sea en otro puerto—, el siguiente aborta con
   *«Another astro preview server is already running»*:

   ```bash
   bunx astro preview status   # ¿hay alguno corriendo?
   bunx astro preview stop     # lo detiene
   bunx astro preview --force  # lo reemplaza por uno nuevo
   ```
3. **Lanzado por un agente de IA o un script, se queda en segundo plano.** Astro
   detecta el entorno y lo despega del proceso que lo lanzó, así que cerrar la
   terminal o matar el proceso **no lo detiene**: siempre `bunx astro preview
   stop` al terminar. Para forzarlo en primer plano:
   `ASTRO_PREVIEW_BACKGROUND=1 bunx astro preview`.

---

## Verificaciones automáticas

Scripts con Playwright que recorren el **build de producción** (ejecuta
`bun run build` antes). Todos terminan con código 1 si encuentran un fallo.

| Comando | Qué comprueba |
|---|---|
| `bun run check:render` | Que el contenido se vea en todas las rutas, con y sin JavaScript |
| `bun run check:overflow` | Que no haya scroll horizontal en 10 resoluciones, y qué pantallas desbordan en alto |
| `bun run check:states` | Foco, hover, teclado, enlace activo del menú, menú móvil, video y contador |
| `bun run check:network` | Cero terceros, cero respuestas 4xx/5xx y carga diferida de videos |
| `bun run check:layers` | Dirección de dependencias entre capas de `src/` (no necesita servidor) |
| `bun run capture` | Capturas y screencasts del sitio en `docs/media/` |

### Cómo se conectan al servidor

- `check:render`, `check:overflow` y `check:states`: si no se les pasa `--base`,
  levantan (o reutilizan) un preview en el **4321**.
- `check:network`: **no** levanta nada; necesita un servidor ya corriendo, por
  defecto en `http://localhost:4321` (se cambia con `PREVIEW_URL`).
- `capture`: levanta un preview en el 4321 y al terminar hace `astro preview
  stop`, **que cierra cualquier preview del proyecto, también el tuyo**.
- Todos esperan al evento `load`, no a `networkidle`: el video de
  `/participaciones` está en la primera pantalla y descarga en streaming, así
  que la red nunca queda ociosa.

Para correrlos sin ocupar el 4321 (y seguir usando tu preview):

```bash
bun run build
bunx astro preview --port 4399        # en otra terminal
bun run check:render   -- --base http://localhost:4399
bun run check:overflow -- --base http://localhost:4399
bun run check:states   -- --base http://localhost:4399
PREVIEW_URL=http://localhost:4399 bun run check:network
bunx astro preview stop
```

Mientras ese preview del 4399 esté vivo, `bun run preview` fallará por el
bloqueo del punto 2 de arriba.

---

## Estructura

```
.
├── astro.config.mjs        # Astro + Tailwind + sitemap + generación de robots.txt
├── public/                 # Se sirve tal cual: favicon, og.jpg, manifest, videos
│   └── media/video/
├── scripts/                # Verificaciones con Playwright y utilidades
├── docs/                   # Esta guía
├── .github/screenshots/    # Capturas del README
└── src/
    ├── assets/media/       # Imágenes optimizadas en el build
    ├── components/
    │   ├── layout/         # Nav, Footer, menú móvil, skip link
    │   ├── media/          # Img, LazyVideo, VideoHighlight
    │   ├── sections/       # Hero, About, ParticipationsOverview, SponsorTiers, TeamGrid, …
    │   └── ui/             # Primitivas: Button, Card, Countdown, EventCard, Reveal, …
    ├── data/               # Fuente única de textos y datos
    ├── layouts/            # Layout base (nav + main + footer + SEO)
    ├── pages/              # Una ruta por archivo
    ├── scripts/            # JS de cliente: nav, contador, video, reveal
    └── styles/global.css   # Tokens de diseño y estilos globales
```

**Rutas:** `/`, `/equipo`, `/participaciones`,
`/participaciones/southwest-2027`, `/patrocinios`, `/contacto` y `/404`.

---

## Cómo editar contenido

Todo el texto y los datos viven en `src/data/`: ningún `.astro` tiene texto
escrito a mano, así que cada cambio se hace en un solo lugar.

| Quiero cambiar… | Archivo |
|---|---|
| Textos de las secciones y SEO por ruta | `src/data/content.ts` |
| Fecha, nombre o sede del evento (el contador se actualiza solo) | `src/data/event.ts` |
| Paquetes de patrocinio, beneficios y moneda | `src/data/sponsors.ts` |
| Mesa directiva | `src/data/team.ts` |
| Competencias | `src/data/competitions.ts` |
| Menú de navegación y destino del botón «Únete» | `src/data/nav.ts` |
| Dominio, correo, Instagram, indexación | `src/data/site.ts` |
| Colores y tipografía | `src/styles/global.css` (`@theme`) |

**Menú.** Cada entrada de `mainNav` es `{ label, href }`, con `href` absoluto y
sin barra final (`/equipo`, no `/equipo/` ni `/equipo/index.html`). Con esa forma
el menú marca solo la página actual, y en una subpágina marca su sección (en
`/participaciones/southwest-2027`, «Participaciones»). No hay submenús, ni en
escritorio ni en móvil. La página 404 reutiliza la misma lista como enlaces
útiles. El botón «Únete» toma su destino de `joinHref` (`/contacto#unete`).

**Botón «Ver más» de la tarjeta del próximo evento.** Es el único enlace a
`/participaciones/southwest-2027` y sólo aparece en `/participaciones` (la
tarjeta del home no lo lleva). Su texto y destino están en
`participations.eventLink` (`content.ts`). Tiene que caber junto al chip
«PRÓXIMO EVENTO», así que conviene un texto corto; el nombre accesible se
completa con `srSuffix`.

**Imágenes y videos.** Se sustituyen sobrescribiendo el archivo con el mismo
nombre: imágenes en `src/assets/media/`, videos en `public/media/video/`,
imagen para redes en `public/og.jpg` (1200×630). No hace falta tocar código; si
cambian las proporciones de una imagen, actualiza su `w`/`h` en
`src/data/media.ts`.

Para que el repositorio no crezca sin necesidad:

- Las imágenes no necesitan más de **1600 px de ancho**: el build genera
  AVIF/WebP y ningún hueco del sitio pide más.
- Los videos se reproducen siempre silenciados: pueden ir **sin pista de
  audio**, en H.264 (perfil High, level 4.0) con `+faststart`.

---

## Diseño a escala de pantalla

A partir de 1280 px de ancho, cada sección que en el diseño es una diapositiva
ocupa exactamente una pantalla: todo se mide en unidades de `--screen-fs`, que
se calcula a partir del alto disponible (`100svh` menos el nav) y tiene un
mínimo de `0.62rem`. Por debajo de 1280 px el sitio se apila en una columna y la
altura deja de ser una restricción.

- En **Participaciones** y **Acerca de**, el aire de arriba y abajo se encoge
  sólo cuando la escala toca su mínimo (pantallas de poca altura, como
  1280×720), así que a 1920×1080 la composición es la del diseño.
- Si un texto crece y ya no cabe, la sección **crece** en vez de recortar
  (válvula de escape): `check:overflow` lo reporta con `~`, sin fallar.
- Hoy ninguna pantalla desborda en ninguna resolución de las que mide
  `check:overflow`.

---

## Capturas del README

Están en `.github/screenshots/`, en JPG a 1920×1080. La de Participaciones se
tomó con el video en reproducción. `bun run capture` genera PNG en
`docs/media/screenshots/`; para el README conviene convertirlas a JPG (por
ejemplo, `magick in.png -strip -quality 86 out.jpg`), que pesan ~5 veces menos.
Recuerda que `capture` cierra cualquier preview abierto al terminar.

---

## Despliegue en Vercel

El sitio es estático y **no necesita variables de entorno**.

1. En Vercel: **Add New → Project** e importa este repositorio de GitHub.
2. Vercel detecta Astro y Bun (por `bun.lock`) automáticamente:

   | Ajuste | Valor |
   |---|---|
   | Framework Preset | Astro |
   | Install Command | `bun install` |
   | Build Command | `bun run build` |
   | Output Directory | `dist` |

3. **Deploy.** Cada `git push` a `main` genera un nuevo despliegue.

> Despliega desde Git, no con el CLI `vercel`: el repositorio pesa más de 100 MB
> (fotos y videos) y ese es el límite de subida por CLI del plan Hobby.

### Dominio

El sitio está configurado para **`https://aiche-web.vercel.app`**: al crear el
proyecto en Vercel, nómbralo `aiche-web` para que ese sea su dominio. Si Vercel
asigna otro, o se conecta un dominio propio, cámbialo en **`siteUrl`** de
`src/data/site.ts`. Es la única línea: se propaga a canonical, Open Graph,
JSON-LD, sitemap y `robots.txt`.

`previewNoIndex` (mismo archivo) está en `false`: el sitio es indexable. Ponerlo
en `true` hace que `robots.txt` bloquee a los buscadores (útil para una versión
de prueba).

### Límites a vigilar

- El plan **Hobby** incluye **100 GB de transferencia al mes**. Los videos pesan
  72 MB (`participations-highlight.mp4`) y 20.5 MB (`about-highlight.mp4`); una
  visita que ve ambos completos consume hasta ~93 MB.
- El plan Hobby es para **uso no comercial**. Si el capítulo lo considera
  comercial (por buscar patrocinios), corresponde el plan Pro.
- Si se migra a **Cloudflare Pages**: su límite es de **25 MiB por archivo**, así
  que el video de participaciones no cabría sin comprimirlo más o alojarlo
  aparte.

---

## Datos por confirmar

- **Moneda de los paquetes**: el sitio muestra `$` y se asume MXN
  (`sponsorCurrencySymbol` en `src/data/sponsors.ts`).
- **Mesa directiva**: la cabecera de `src/data/team.ts` aún describe los
  nombres como provisionales, aunque el sitio ya publica los definitivos.
  Actualiza ese comentario cuando se confirmen.
