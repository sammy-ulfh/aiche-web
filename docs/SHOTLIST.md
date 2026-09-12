# SHOTLIST — Material accionable para el agente de video

> **Para quién:** el agente (humano o IA) que va a producir el video
> con Higgsfield o cualquier otra herramienta. Esta tabla es la
> **lista operativa**: cada fila es un clip concreto con su ruta al
> material, el prompt en inglés para Higgsfield, la narración en
> español, y la duración exacta.
>
> Para el contexto (paleta, tono, storyboard) ver `docs/VIDEO-BRIEF.md`.
> Para el contexto del sitio (qué es AIChE GDL, contacto, evento) ver
> `docs/SITE-CONTEXT.md`.

---

## 1. Inventario de material disponible

**Capturas PNG (`docs/media/screenshots/`):**

| Ruta al archivo | Ruta del sitio | Sección capturada | Tamaño |
|---|---|---|---|
| `desktop/home-hero.png` | `/` | Primera pantalla (hero + contador) | 1920×1080 |
| `desktop/home-full.png` | `/` | Página completa (5 pantallas) | 1920×5081 |
| `desktop/equipo-hero.png` | `/equipo` | Primera pantalla | 1920×1080 |
| `desktop/equipo-full.png` | `/equipo` | Página completa | 1920×1272 |
| `desktop/participaciones-hero.png` | `/participaciones` | Primera pantalla | 1920×1080 |
| `desktop/participaciones-full.png` | `/participaciones` | Página completa | 1920×1272 |
| `desktop/southwest-2027-hero.png` | `/participaciones/southwest-2027` | Primera pantalla | 1920×1080 |
| `desktop/southwest-2027-full.png` | `/participaciones/southwest-2027` | Página completa | 1920×1272 |
| `desktop/patrocinios-hero.png` | `/patrocinios` | Primera pantalla | 1920×1080 |
| `desktop/patrocinios-full.png` | `/patrocinios` | Página completa (3 pantallas) | 1920×3272 |
| `desktop/contacto-hero.png` | `/contacto` | Primera pantalla | 1920×1080 |
| `desktop/contacto-full.png` | `/contacto` | Página completa | 1920×2080 |

**Mobile (`docs/media/screenshots/mobile/`)** — 390×844 lógicos, DPR 3:

| Ruta al archivo | Ruta del sitio | Tamaño |
|---|---|---|
| `mobile/home-full.png` | `/` | 1170×16551 |
| `mobile/equipo-full.png` | `/equipo` | 1170×4629 |
| `mobile/participaciones-full.png` | `/participaciones` | 1170×5598 |
| `mobile/southwest-2027-full.png` | `/participaciones/southwest-2027` | 1170×5205 |
| `mobile/patrocinios-full.png` | `/patrocinios` | 1170×16617 |
| `mobile/contacto-full.png` | `/contacto` | 1170×5022 |

**Secciones (`docs/media/screenshots/sections/`)** — una diapositiva del
PDF por archivo:

| Ruta al archivo | Sección | Dónde se renderiza | Tamaño |
|---|---|---|---|
| `sections/home-hero.png` | Hero + contador (p.1) | `/` | 1920×1000 |
| `sections/home-about.png` | About con VideoHighlight (p.6) | `/` | 1920×1001 |
| `sections/home-participations.png` | ParticipationsOverview (p.7) | `/` | 1920×1001 |
| `sections/home-sponsor-teaser.png` | SponsorTeaser (p.10 en resumen) | `/` | 1920×1001 |
| `sections/home-join-cta.png` | JoinCta (p.9) | `/` | 1920×809 |
| `sections/home-next-event-card.png` | Tarjeta «PRÓXIMO EVENTO» | `/` | 485×402 |
| `sections/equipo-team-grid.png` | TeamGrid: 6 retratos + foto grupal (p.13) | `/equipo` | 1920×1000 |
| `sections/participaciones-participations.png` | ParticipationsOverview (p.7) | `/participaciones` | 1920×1000 |
| `sections/participaciones-next-event-card.png` | Tarjeta «PRÓXIMO EVENTO» | `/participaciones` | 485×402 |
| `sections/southwest-2027-competition-navy.png` | CompetitionInfo navy (p.8) | `/participaciones/southwest-2027` | 1920×1000 |
| `sections/patrocinios-sponsor-hero.png` | SponsorHero (p.10) | `/patrocinios` | 1920×1000 |
| `sections/patrocinios-sponsor-tiers.png` | SponsorTiers, 3 tarjetas (p.11) | `/patrocinios` | 1920×1000 |
| `sections/patrocinios-competition-cream.png` | CompetitionInfo cream (p.12) | `/patrocinios` | 1920×1000 |
| `sections/contacto-contact.png` | ContactBlock (p.14) | `/contacto` | 1920×1000 |
| `sections/contacto-join-cta.png` | JoinCta (p.9) | `/contacto` | 1920×808 |

**Screencasts (`docs/media/screencasts/`)** — recorrido con scroll, ~8 s:

| Ruta al archivo | Ruta del sitio | Peso |
|---|---|---|
| `screencasts/home.webm` | `/` | 1,8 MB |
| `screencasts/equipo.webm` | `/equipo` | 1,1 MB |
| `screencasts/participaciones.webm` | `/participaciones` | 1,1 MB |
| `screencasts/southwest-2027.webm` | `/participaciones/southwest-2027` | 1,1 MB |
| `screencasts/patrocinios.webm` | `/patrocinios` | 1,7 MB |
| `screencasts/contacto.webm` | `/contacto` | 1,3 MB |

**39 archivos, 48 MB.** Regenerados en F8 (2026-08-21) contra el sitio ya
corregido: 12 capturas de escritorio, 6 de móvil, 15 de sección y 6
screencasts.

> **Nota:** las imágenes de retratos y fotos grupales son
> **placeholders geométricos** (silueta hexagonal + etiqueta
> "Placeholder" o isotipo generado). Cuando el usuario sustituya los
> archivos reales, **volver a ejecutar** `bun run capture` para
> regenerar este material. Las nuevas capturas aparecerán en las
> mismas rutas.

---

## 2. Tabla SHOTLIST — versión LARGA (60–90 s, 16:9)

| # | t (s) | Still / Screencast | Ruta del sitio | Plano (Higgsfield prompt) | Narración (es-MX) | Texto en pantalla | Duración |
|---|---|---|---|---|---|---|---|
| 1 | 0 | `<still:sections/home-hero>` | `/` | "Cinematic corporate, slow zoom-out from center, hexagonal blue logo centered, navy background, soft studio rim light. Style: clean motion graphics, anticipatory." | "En el Tec de Monterrey, Campus Guadalajara, hay una comunidad que cree en algo más que el aula." | "AIChE GDL" | 8 s |
| 2 | 8 | `<still:sections/home-about>` | `/` (2ª pantalla) | "Editorial documentary, soft daylight from left, slow dolly across. Subject: laboratory interior with glassware and people in lab coats. Warm lighting, shallow DOF." | "Más de doscientos estudiantes de distintas carreras y niveles educativos." | "MESA DIRECTIVA" | 6 s |
| 3 | 14 | `<still:sections/equipo-team-grid>` | `/equipo` | "Cinematic portrait, slow push-in on group photo. Soft warm light. Style: candid documentary, aspirational." | "Participamos en las competencias internacionales que organiza el American Institute of Chemical Engineers." | "PARTICIPACIONES" | 5 s |
| 4 | 19 | `<still:sections/home-next-event-card>` | `/` (sección NextEvent) | "Clean infographic motion, zoom-in from logo, pan down to list, settle on tiles. Navy bg, cream type. Style: structured, energetic." | "Nuestro próximo reto es la Southwest Student Regional Conference, el veintisiete de marzo del dos mil veintisiete, en McNeese State University, Louisiana." | "27 DE MARZO · 2027" | 7 s |
| 5 | 26 | `<still:sections/patrocinios-sponsor-hero>` | `/patrocinios` | "Documentary photography, warm light. Camera: slow push-in on laboratory setting, shallow DOF. Lab coats, glassware, mid-shot detail." | "Necesitamos patrocinios para llevar el Chem-E-Car a competir." | "$10,000 · $5,000 · $2,500" | 7 s |
| 6 | 33 | `<still:sections/patrocinios-sponsor-tiers>` | `/patrocinios` | "Clean motion graphics, isometric cards. Camera: push-in on three tier cards with colored top borders. Navy bg, cream card body, navy-400 accent borders." | "Los paquetes incluyen mención en redes, logo en el coche y uniforme, certificados y posibilidad de facturación." | "PAQUETE 1 · 6 BENEFICIOS" | 8 s |
| 7 | 41 | `<still:sections/contacto-contact>` | `/contacto` | "Cinematic portrait, medium shot of group photo, slow zoom-out. Warm, even, slightly backlit. Style: inviting, human." | "Si tu empresa quiere sumarse, o si tú quieres ser parte del equipo, escríbenos." | "¡TRABAJEMOS JUNTOS!" | 9 s |
| 8 | 50 | `<still:sections/home-join-cta>` | `/` (sección JoinCta) | "Minimal motion graphics, centered layout. Camera: static with slight breathing motion. Hexagonal logo + title + email + Instagram. Navy bg, cream type." | "El siguiente reto empieza contigo." | "¡Súmate al capítulo!" + `aiche.gdl@gmail.com` + `@aiche.gdl` | 8 s |

**Total:** ~58 s. Sumar ~2–5 s de breathers/transiciones = **65–80 s**.

---

## 3. Tabla SHOTLIST — versión CORTA (30 s, 9:16)

| # | t (s) | Still / Screencast | Ruta del sitio | Plano (Higgsfield prompt) | Narración (es-MX) | Texto en pantalla | Duración |
|---|---|---|---|---|---|---|---|
| 1 | 0 | `<still:sections/home-hero>` | `/` | "Cinematic corporate, vertical 9:16 framing. Subject centered vertically. Slow zoom-out from hexagonal blue logo. Navy background." | "Un capítulo estudiantil. Más de doscientos estudiantes." | "AIChE GDL" | 5 s |
| 2 | 5 | `<still:sections/home-next-event-card>` | `/` | "Clean infographic motion, 9:16 vertical. Camera: slow pan down competition list. Navy bg, cream type, navy-400 tags." | "Cuatro competencias. Una meta." | "SPRING 2027 · OPEN CALL 2027" | 5 s |
| 3 | 10 | `<still:sections/patrocinios-sponsor-hero>` | `/patrocinios` | "Clean motion graphics, 9:16 vertical. Camera: push-in on three tier cards stacked. Navy bg, cream cards, navy-400 borders." | "Patrocinios para Chem-E-Car." | "$10,000 · $5,000 · $2,500" | 5 s |
| 4 | 15 | `<still:sections/home-join-cta>` | `/` | "Minimal motion graphics, 9:16 vertical centered. Logo + title + email + Instagram. Style: clear, hopeful, closing." | "El siguiente reto empieza contigo." | "¡Súmate al capítulo!" + correo + Instagram | 5 s |
| 5 | 20 | `<still:sections/home-join-cta>` (sin locución, con música crescendo) | `/` | "Static logo + centered text. Slow fade to navy background. Hold 5 s." | — | (solo isotipo + correo + Instagram) | 5 s |

**Total:** 25–30 s.

---

## 4. Cierre (idéntico en ambas versiones)

| t | Plano | Texto en pantalla |
|---|---|---|
| últimos 5 s | Centrado en navy | `¡Súmate al capítulo!` |
| | | `aiche.gdl@gmail.com` |
| | | `@aiche.gdl` |
| | | (isotipo AIChE GDL debajo) |

**No usar texto "www.aichegdl.org"** — el dominio no es definitivo
(aichegdl.example.com es placeholder).

---

## 5. Reglas duras (no negociables)

1. **Ningún rostro humano identificable** sin release firmado. Si el
   material viene del sitio web y aún son placeholders, no hay problema.
   Cuando lleguen las fotos reales del equipo, **regenerar** las
   capturas con `bun run capture` antes de producir el video.
2. **No usar "Texas"** en ninguna pieza. La sede es
   **McNeese State University, Lake Charles, Louisiana**.
3. **Correo:** `aiche.gdl@gmail.com`. **Instagram:** `@aiche.gdl`.
4. **No** usar `hola@aichegdl.org` (PDF p.8 original; se unificó).
5. **Logo AIChE GDL** = isotipo hexagonal + wordmark "AIChE GDL".
   NO usar el logo AIChE global (American Institute of Chemical
   Engineers wordmark); pertenece a la organización matriz.
6. **Tipografía display** solo en cursiva decorativa (Libre Baskerville
   italic) — NO en titulares ni cuerpo.
7. **Sin marcas de terceros** (Nike, Adidas, etc.) salvo autorización.
8. **Acentos del español:** "Tecnológico", "Campus Guadalajara",
   "Capítulo", "Patrocinios", "Regional", "AIChE".
9. **Sin "Aiche"** (con acento en la e) — la grafía correcta es
   **AIChE** (mayúsculas, sin tilde, en siglas).
10. **Color de marca:** el acento decorativo es `navy-400 #4a8fd4`
    (azul claro). El color principal es `navy #123f72`. **No usar
    ningún otro azul** ni gradientes estridentes.

---

## 6. Entregables esperados

Después de producir el video, el agente debe entregar:

- `video/largo-16x9.mp4` (1920×1080, H.264, ≤ 50 MB).
- `video/corto-9x16.mp4` (1080×1920, H.264, ≤ 30 MB).
- `video/corto-1x1.mp4` (opcional; 1080×1080 para Instagram feed).
- `video/poster-16x9.jpg` (1920×1080, primer frame).
- `video/captions.srt` (subtítulos en español, formato SubRip).
- `video/licencias-musica.pdf` (comprobante de licencia de la música).

---

## 7. Regeneración del material

> **Tras sustituir imágenes y videos reales del sitio, volver a
> ejecutar `bun run capture`** para regenerar este material con las
> fotos y videos definitivos.

**Aviso sobre los paneles de video.** En las capturas de hoy los dos
paneles de video (p.6 en `/` y p.7 en `/` y `/participaciones`) salen con
el póster **bajo un velo `bg-black/30` y con el botón de play** encima.
Eso **no es el diseño**: es el estado de reserva de `lazy-video.ts`,
porque los dos MP4 son stubs de 20 B y `video.play()` se rechaza
(verificado en F8 leyendo el DOM). Con los videos reales el panel se ve
sin velo ni botón. **No calques ese overlay en la pieza de video.**

El script:
- Construye el sitio (`bun run build`).
- Arranca `astro preview` en background.
- Captura **14 desktop** (7 rutas × 2 cada una), **7 mobile**, **15
  secciones**, **7 screencasts**.
- Salida: `docs/media/{screenshots,screencasts}/`.
- Tiempo total: ~3–4 min.

Ver `scripts/capture.mjs` para detalles. Las capturas son
deterministas: espera `document.fonts.ready`, fuerza
`prefers-reduced-motion: reduce` y revela todos los `[data-reveal]`
antes de capturar.