# SITE-CONTEXT — AIChE GDL

> **Para quién es este documento:** cualquier persona o agente que
> necesite entender el sitio web del **Capítulo Estudiantil AIChE GDL**
> **sin haber visto el sitio** y sin acceso al repositorio.
>
> Este archivo es **autocontenido**: contiene toda la información
> necesaria para hablar del sitio con propiedad y producir materiales
> derivados (vídeo, folleto, correo a empresas, etc.).

---

## 1. ¿Qué es AIChE GDL?

**AIChE GDL** es el **Capítulo Estudiantil** del American Institute of
Chemical Engineers en el **Tecnológico de Monterrey, Campus
Guadalajara** (México).

Es una comunidad de estudiantes —mayoritariamente de Ingeniería
Química pero abierta a cualquier carrera STEM— que:

- **Desarrolla talento** mediante proyectos reales.
- **Transforma conocimiento** en competencias internacionales.
- **Genera impacto** con divulgación científica, innovación y
  colaboración.
- **Representa a la institución** en las competencias del AIChE.

El número de "**más de 200 estudiantes**" ha pasado por el proyecto
desde su creación.

**AIChE** (American Institute of Chemical Engineers) es la organización
profesional mundial de ingenieros eningen. Sus competencias anuales
reúnen a universidades de todo el mundo en retos de diseño, conocimiento
y divulgación.

---

## 2. Propósito del sitio web

El sitio tiene **dos públicos** y **un objetivo central**:

### 2.1 Públicos

1. **Empresas patrocinadoras** (público prioritario para conversión).
   La página `/patrocinios` les explica qué obtienen a cambio de cada
   nivel de apoyo.
2. **Estudiantes del Tec de Monterrey y de otras universidades**
   que quieran sumarse al capítulo o conocer las competencias.

### 2.2 Objetivo central

**Conseguir patrocinadores** para la próxima participación en:

> **The 2027 AIChE Southwest Student Regional Conference**
> **27 de marzo de 2027 · McNeese State University · Lake Charles, Louisiana**

La regional es clasificatoria para el nacional. Competencia principal:
**Chem-E-Car** (vehículo a pequeña escala impulsado y detenido por
reacciones químicas).

### 2.3 Lo que el sitio NO es

- No es una red social: el contenido es estático, sin blog, sin login.
- No tiene formulario de contacto: los enlaces son `mailto:` e
  Instagram directo. Cero requests a terceros en producción.
- No usa analytics de terceros.

---

## 3. Identidad verbal y visual

### 3.1 Tono y registro

- **Español de México** (`lang="es-MX"`), formal pero cercano.
- **Voz activa**, segunda persona (`"representamos"`, `"competimos"`,
  `"Únete"`).
- **Mensajes clave** que el sitio repite:
  - *"Ingeniería que se construye fuera del aula"*.
  - *"Más de 200 estudiantes"* como cifra de credibilidad.
  - *"El siguiente reto empieza contigo"* en el CTA de cierre.

### 3.2 Paleta de color (tokens exactos)

| Token | Hex | Uso principal |
|---|---|---|
| `navy` | `#123f72` | Fondos insignia, texto de CTA primario |
| `navy-700` | `#1a4f8a` | Botón Únete, hover en Inicio |
| `navy-900` | `#0d2f57` | Fondo del degradado, cards oscuros |
| `navy-400` | `#4a8fd4` | **No usar en texto** sobre navy (falla AA); bordes sí |
| `cream` | `#f4f1e9` | Footer, secciones claras, texto sobre navy |
| `ink` | `#000000` | Texto sobre cream |

El fondo insignia del sitio es un **degradado diagonal** de navy-700 →
navy → navy-900 con una **rejilla técnica** de líneas blancas finas al
8 % de opacidad, hecha íntegramente en CSS (sin imágenes).

### 3.3 Tipografía

| Rol | Familia | Peso | Uso |
|---|---|---|---|
| **Principal** | Segoe UI (sistema) | regular / bold | Textos largos, párrafos, h1 |
| **Secundaria** | Libre Baskerville Italic (webfont, latin 400-italic) | italic | Subtítulos decorativos, citas, números del contador |
| **Terciaria** | Arial (sistema) | bold | Etiquetas tipo "FECHA", "SEDE", "PAQUETE 1" (eyebrows) |

- **Cero descargas de fuentes del sistema** (Segoe UI y Arial).
- **Una sola webfont**: Libre Baskerville italic, ~22 KB woff2.
- `font-display: swap` para no bloquear el primer paint.

### 3.4 Sistema visual

- Bordes: 1 px (`rgba(255,255,255,.25)` sobre navy; `rgba(18,63,114,.2)`
  sobre cream). Radios 0–4 px — el diseño es **rectilíneo**.
- Bordes superiores destacados en las tarjetas de los paquetes
  de patrocinio.
- Rejilla CSS pura (sin SVG ni imagen).
- Iconografía mínima: casa y hamburguesa en el nav, flecha → en
  tarjetas del 404. Sin icon fonts.

---

## 4. Inventario del sitio (ruta por ruta)

El sitio tiene **8 rutas** (1 home + 6 páginas internas + 404). Todas
llevan el mismo nav (con submenús y botón "Únete") y el mismo footer.

### 4.1 `/` — Inicio

**Mensaje principal:** "AIChE GDL — Capítulo estudiantil".
**Audiencia:** primera visita; debe captar en 5 segundos.

**Secciones (en orden).** Desde F6b el home encadena las diapositivas del
PDF en el orden del propio diseño — p.1 → p.6 → p.7 → p.10 → p.9 — y cada
una ocupa una pantalla completa:

1. **Hero** (p.1) — fondo insignia, isotipo hexagonal, título a dos líneas
   ("AIChE GDL" / "Capítulo estudiantil"), párrafo de presentación y
   **contador regresivo** al 27 de marzo de 2027 (DÍAS / HORAS / MIN / SEG).
2. **About** (p.6, entera) — columna de texto navy a la izquierda con el
   titular "Acerca de Nosotros", la pregunta en cursiva
   *"¿Qué puede lograr una comunidad con el deseo de crear algo
   significativo?"* y el párrafo largo; a la derecha el **video a sangre**
   con badge "HIGHLIGHTS", titular "Así se vive la experiencia AIChE GDL",
   bajada en cursiva y chip "19 SEP · 19:00 H".
3. **ParticipationsOverview** (p.7, entera) — tarjeta "PRÓXIMO EVENTO"
   (evento, fecha, sede, ubicación) y el panel "Rumbo a las competencias
   AIChE" con las 4 competiciones a la izquierda; a la derecha el título
   "Participaciones", la bajada en cursiva y el segundo video.
4. **SponsorTeaser** (p.10 en resumen) — 3 paquetes mini (PAQUETE N +
   precio) + CTA "Ver paquetes".
5. **JoinCta** (p.9) — "¡Súmate al capítulo!" + "El siguiente reto empieza
   contigo" + 2 botones (mailto: e Instagram).

**CTAs clave:** "Ver paquetes" (→ `/patrocinios`) y "¡Súmate al capítulo!"
(→ `/contacto#unete`). El botón "Conoce más" que había en el hero
**desapareció en F6b**: era un elemento inventado que no está en el PDF, y
la diapositiva a la que llevaba es ahora la pantalla siguiente.

### 4.2 `/equipo` — Nuestro equipo

**Mensaje principal:** las personas que hacen posible el capítulo. Es el
**primer item del menú**.

**Contenido:** una sola pantalla (p.13).
- Eyebrow "NUESTRO EQUIPO" y título h1 "Conoce a nuestra mesa directiva y
  equipo".
- Columna izquierda: **6 retratos** en grid 3×2 sobre fondo navy, con marco
  263:334. Nombre y cargo no se muestran porque el PDF no los incluye; siguen
  en el `alt` y como placeholders en `data/team.ts`.
- Columna derecha: foto grupal grande con marco 825:692.

> **`/acerca` y `/acerca/equipo` ya no existen** (F6b, D-153/D-154). La
> diapositiva que vivía en `/acerca` es la segunda pantalla del home y la
> del equipo es `/equipo`. No se dejó redirección: el sitio no está
> publicado.

### 4.3 `/participaciones` — Participaciones

**Mensaje principal:** los equipos y proyectos que estamos preparando.

**Contenido:** la misma pantalla que la tercera del home (p.7), aquí con
su propio `h1`.

### 4.4 Detalle de la p.7

Una sola pantalla navy, a escala 1:1 con la p.7 desde F6b.

- Columna izquierda: tarjeta "**PRÓXIMO EVENTO**" con FECHA/SEDE/UBICACIÓN y
  bloque "**Rumbo a las competencias AIChE**" con las 4 competiciones:

| Etiqueta | Competencia | Bajada |
|---|---|---|
| SPRING 2027 | Chem-E-Car Competition | Química que impulsa |
| SPRING 2027 | ChemE Jeopardy | Conocimiento bajo presión |
| OPEN CALL 2027 | Chem-E-Cube Competition | Ingeniería en acción |
| OPEN CALL 2027 | K12 STEM Outreach | Inspirando vocaciones científicas |

- Columna derecha: título "Participaciones", subtítulo en cursiva
  *"¡Conoce los equipos, proyectos y capacidades que estamos desarrollando…"*
  y segundo video lazy del sitio sobre el poster del Chem-E-Car.
- No hay hero, bloque «Sobre el evento» ni CTA final: no existen en el PDF.

### 4.5 `/participaciones/southwest-2027` — Subruta del evento

**Mensaje principal:** detalle de la próxima competencia a la que vamos.

**Contenido:** una sola pantalla navy, refidelizada en F5 contra la p.8 real.

- Bloque superior centrado: "¿Qué es la Southwest Student Regional
  Conference?" + definición y sede canónica.
- Banda central: "¿Por qué queremos participar?".
- Bloque inferior: motivación + recorte con alfa del Chem-E-Car.
- La galería de tres imágenes pertenece únicamente a la variante crema de
  Patrocinios.

### 4.6 `/patrocinios` — Página de negocio (la que verá una empresa)

**Mensaje principal:** "Tu patrocinio nos lleva a competir" — la
página que convierte.

**Secciones:**

1. **SponsorHero** — eyebrow "PATROCINIOS" + título + párrafo explicativo
   + etiqueta "TRES PAQUETES" + 3 cajas (`PAQUETE N` + precio) + imagen del
   Chem-E-Car en pista. Sólo Paquete 1 lleva el borde superior destacado.
2. **SponsorTiers** — "**Qué recibe tu empresa**" — 3 tarjetas con imagen,
    nombre del paquete, contador `N BENEFICIOS`, precio, lista de
   beneficios y sin CTA inventado.
3. **CompetitionInfo (variante cream)** — "**LA COMPETENCIA**" en
    variante fondo crema (mismo copy que en la subruta pero sobre fondo
   claro), dos columnas y galería de tres imágenes.

**Datos de los paquetes:**

#### Paquete 1 — $10,000 — 6 beneficios

1. Mención especial en redes sociales de la Federación de Estudiantes
   (FETEC).
2. Logo/banner en coche y uniforme del equipo.
3. Certificado de reconocimiento.
4. Post de agradecimiento en redes sociales oficiales del equipo.
5. Espacio para hablar sobre su empresa a alumnos de ingeniería química
   del Tecnológico de Monterrey Campus GDL.
6. Posibilidad de facturación.

#### Paquete 2 — $5,000 — 4 beneficios

1. Logo/banner en uniformes del equipo.
2. Certificado de reconocimiento.
3. Post de agradecimiento en redes sociales oficiales del equipo.
4. Posibilidad de facturación.

#### Paquete 3 — $2,500 — 3 beneficios

1. Post de agradecimiento en redes sociales oficiales del equipo.
2. Certificado de reconocimiento.
3. Posibilidad de facturación.

**Nota común:** "Los tres paquetes incluyen posibilidad de facturación".

El contacto comercial se realiza desde `/contacto` o el bloque Únete del nav;
las tarjetas no generan asuntos `mailto:` específicos.

### 4.7 `/contacto` — Contacto

**Mensaje principal:** "¡TRABAJEMOS JUNTOS!" — invitación directa.

**Contenido:**
- Eyebrow "CONTACTO" + título h1 "¡TRABAJEMOS JUNTOS!" + subtítulo
  "CONTÁCTANOS".
- Bloque a la izquierda:
  - **CORREO**: `aiche.gdl@gmail.com` (mailto: con asunto prellenado
    `Contacto AIChE GDL`).
  - **INSTAGRAM**: `aiche.gdl` → `https://instagram.com/aiche.gdl`.
- Foto grupal grande a la derecha.
- Bloque `JoinCta` (id="unete") al final: "**¡Súmate al capítulo!**" +
  2 botones (correo + Instagram). Aquí aterriza el botón "Únete" del nav.

### 4.8 `/404` — Página no encontrada

- Eyebrow "404" + título "**No encontramos esa página**" + body + CTA
  "Volver al inicio".
- Grid de "ENLACES ÚTILES" con todas las entradas del nav.

---

## 5. Navegación

### 5.1 Estructura del menú

```
INICIO · Acerca de nosotros ⁺ · Participaciones ⁺ · Patrocinios ⁺ · Contacto · [Únete]
```

- **INICIO** (bloque navy a la izquierda): casa + etiqueta "Inicio",
  enlace a `/`.
- **Nuestro equipo** → `/equipo`.
- **Participaciones** ⁺ → submenú con el nombre del evento (→
  `/participaciones/southwest-2027`).
- **Patrocinios** ⁺ → submenú con anclas:
  - "Tres paquetes" → `/patrocinios#paquetes`
  - "Qué recibe tu empresa" → `/patrocinios#beneficios`
  - "La competencia" → `/patrocinios#competencia`
- **Contacto** → `/contacto`.
- **[Únete]** (botón navy-700 a la derecha): → `/contacto#unete`.

### 5.2 Identidad en el nav

- Isotipo hexagonal + wordmark "AIChE GDL" + bajada
  "TEC DE MONTERREY · CAMPUS GUADALAJARA".

---

## 6. Datos del evento (la fecha clave)

| Dato | Valor |
|---|---|
| **Nombre del evento** | The 2027 AIChE Southwest Student Regional Conference |
| **Fecha** | 27 de marzo de 2027 |
| **Hora local** | 09:00 (Zona horaria: −06:00, Central) |
| **Sede** | McNeese State University |
| **Dirección** | Lake Charles, Louisiana, US |
| **Competencia principal** | Chem-E-Car |
| **Categoría del capítulo** | Estudiante universitario |
| **Sitio oficial AIChE** | https://www.aiche.org/ |

> **Nota crítica:** el PDF tenía dos versiones contradictorias del
> lugar ("McNeese/primavera" vs "Texas/27 de marzo"). La versión
> definitiva es **McNeese State University, Lake Charles, Louisiana**.
> Cualquier referencia a "Texas" en materiales derivados del sitio es un
> error — corregir a "Lake Charles, Louisiana".

---

## 7. Datos de contacto

| Canal | Valor |
|---|---|
| **Correo** | `aiche.gdl@gmail.com` |
| **Instagram** | `@aiche.gdl` → `https://instagram.com/aiche.gdl` |
| **Sitio AIChE** | `https://www.aiche.org/` |
| **Universidad** | Tecnológico de Monterrey · Campus Guadalajara |

> El PDF original tenía un segundo correo (`hola@aichegdl.org`) en la
> diapositiva del CTA "¡Súmate!". Se unificó a `aiche.gdl@gmail.com`
> porque aparece en la página de contacto, que es la canónica.

---

## 8. SEO y metadatos

- `<html lang="es-MX">`.
- **Títulos únicos** por ruta:
  - Inicio: "AIChE GDL — Capítulo Estudiantil"
  - Acerca: "Acerca de nosotros"
  - Equipo: "Mesa directiva y equipo"
  - Participaciones: "Participaciones"
  - Southwest 2027: "The 2027 AIChE Southwest Student Regional Conference"
  - Patrocinios: "Patrocinios"
  - Contacto: "Contacto"
- `<link rel="canonical">` por ruta.
- Open Graph + Twitter Card completos (con `og:image:alt`).
- `<link rel="manifest">` con `theme_color: #123f72`.
- **JSON-LD Organization** global en todas las páginas.
- **JSON-LD Event** en páginas que mencionan la conferencia
  (`/`, `/participaciones`, `/participaciones/southwest-2027`).
- **sitemap-index.xml** + **robots.txt** generados en build
  (`@astrojs/sitemap` + whitelist).

---

## 9. Restricciones técnicas que importan

- **Cero requests a terceros** en producción (sin Google Fonts, sin
  CDNs, sin analytics).
- **Cero JS de framework** (sin React, Vue, Svelte, Preact, jQuery,
  librerías de animación). Solo vanilla TS.
- **Videos auto-alojados** en `public/media/video/` — sin YouTube ni
  Vimeo ni iframes. Los `<video>` no tienen `src` hasta que entran al
  viewport (IntersectionObserver).
- **Webfont única**: Libre Baskerville 400-italic latin.
- **Sitio 100% estático** (`output: 'static'`). Sin SSR, sin endpoints.
- **Astro 7 + Tailwind 4 vía `@tailwindcss/vite`** (no `@astrojs/tailwind`).
- Build: 8 páginas en ~500 ms; HTML gz 11.7–14.8 KB; CSS inline 6.8 KB gz;
  JS enviado 3–4 KB gz.

---

## 10. Material gráfico disponible

- **Capturas** en `docs/media/screenshots/` (PNG). **Son anteriores a F4/F5 y
  se regenerarán en F8**:
  - `desktop/<ruta>-hero.png` — viewport 1920×1080
  - `desktop/<ruta>-full.png` — página completa 1920×N
  - `mobile/<ruta>-full.png` — página completa 390×N, DPR 3
  - `sections/<ruta>-<sección>.png` — secciones individuales
- **Screencasts** en `docs/media/screencasts/` (WebM): un scroll-through
  por ruta, ~8 s cada uno.
- **Placeholders:** 18 JPG en `src/assets/media/` + `public/og.jpg` y 2 MP4 stub de
  20 B. Además hay un PNG con alfa del Chem-E-Car extraído del PDF en F5.
  Diseñados para ser sustituidos por imágenes y videos reales con el
  mismo nombre de archivo. Detalle en `docs/ASSETS.md`.

---

## 11. Lo que NO se ha hecho (pendiente del usuario)

Decisiones que solo el usuario puede tomar:

- **Dominio definitivo** del sitio (placeholder:
  `https://aichegdl.example.com`). Cambiar `siteUrl` en
  `src/data/site.ts` propaga a canonical, OG, Twitter, sitemap y
  robots.
- **Moneda de los paquetes** (asumido MXN, mostrado como `$`).
- **Nombres y cargos** reales de los 6 integrantes de la mesa
  directiva (hoy son placeholders `Nombre Apellido` / `Cargo`).
- **Logos de patrocinadores actuales** (no se muestran hasta confirmar).
- **Destino del botón "Únete"** (hoy va a `/contacto#unete`; podría
  ser un formulario externo en el futuro).
- **Imágenes y videos definitivos** (los placeholders están
  identificados; basta sobrescribir el archivo con el mismo nombre).

---

## 12. Glosario

- **AIChE** — American Institute of Chemical Engineers.
- **Capítulo Estudiantil** — agrupación oficial de estudiantes
  afiliados a AIChE en una universidad.
- **Chem-E-Car** — competencia AIChE: diseñar y construir un
  vehículo a pequeña escala impulsado y detenido por reacciones
  químicas.
- **ChemE Jeopardy** — competencia de conocimiento tipo
  Jeopardy! sobre ingeniería química.
- **Chem-E-Cube** — competencia de divulgación y demostración.
- **K12 STEM Outreach** — competencia de divulgación científica a
  estudiantes de K-12 (pre-universitarios).
- **Regional** — clasificatoria regional; la Southwest cubre el
  suroeste de EE. UU. y México.
- **SWSRC** — abreviatura de Southwest Student Regional Conference.
- **FETEC** — Federación de Estudiantes de Estudiantes del
  Tecnológico de Monterrey.
