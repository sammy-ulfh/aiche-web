# VIDEO-BRIEF — Material para Higgsfield

> **Objetivo:** producir un video de presentación de AIChE GDL con la
> skill de Higgsfield a partir de las capturas y screencasts del sitio.
> Este brief está pensado para que **otro agente sin acceso al
> repositorio** pueda ejecutarlo: cada escena tiene prompt, ruta,
> still de referencia, narración y duración ya cerrados.
>
> Las capturas live-action se referencian como **`<still:path>`**;
> los screencasts como **`<scroll:path>`**. Las rutas al directorio
> `docs/media/` están en `docs/SHOTLIST.md` (la tabla accionable).

---

## 1. Resumen del proyecto

| Campo | Valor |
|---|---|
| **Marca** | AIChE GDL — Capítulo Estudiantil del Tecnológico de Monterrey, Campus Guadalajara |
| **Objetivo del video** | Presentar el capítulo + invitación a sumarse + invitación a patrocinar |
| **Público primario** | Estudiantes del Tec de Monterrey y de otras universidades |
| **Público secundario** | Empresas patrocinadoras |
| **Tono** | Cercano, confiado, profesional pero no corporativo. Español de México. |
| **Duración objetivo** | **Larga:** 60–90 s · **Corta:** 30 s |
| **Formato** | **16:9** (1920×1080) para web y LinkedIn · **9:16** (1080×1920) para Instagram Reels/Stories |
| **Música** | Electrónica corporativa optimista, sin voz · tempo ~110 BPM · acordes mayores · sin letra |
| **Locución** | Español (TTS) — guion en §5 |

---

## 2. Identidad visual (resumen para el agente de video)

| | |
|---|---|
| Paleta principal | Navy `#123f72` + cream `#f4f1e9` |
| Acentos | Navy-700 `#1a4f8a`, navy-400 `#4a8fd4` (decorativo) |
| Tipografía display | Libre Baskerville Italic (decorativa, subtítulos) |
| Tipografía texto | Sans-serif geométrica limpia (Segoe UI / Inter / similar) |
| Estilo | Limpio, corporativo-técnico, azul institucional, transiciones suaves |
| Evitar | Rostros de personas reales sin permiso, marcas de terceros, gradientes estridentes, tipografía manuscrita |

---

## 3. Storyboard — versión LARGA (60–90 s, 16:9)

**Estructura narrativa:** problema → quiénes somos → qué hacemos →
próximo reto → por qué importa → CTA.

> **Los stills de los paneles de video llevan un overlay que no es del
> diseño.** Los planos 1 y los que citan `home-participations` /
> `participaciones-participations` muestran el póster bajo un velo
> `bg-black/30` con un botón de play encima: es el estado de reserva de
> `lazy-video.ts` mientras los dos MP4 sean stubs de 20 B (F8; detalle en
> `docs/TODO.md` M-001/M-005). Toma de esos stills la **composición y el
> encuadre**, no el velo ni el botón.

| # | Ruta / Sección | Plano (Higgsfield) | Texto en pantalla | Narración (es-MX) | Duración | Still |
|---|---|---|---|---|---|---|
| 1 | `/` 2ª pantalla — p.6 del PDF | Zoom out lento desde el isotipo hexagonal centrado | "AIChE GDL" | "En el Tec de Monterrey Campus Guadalajara, hay una comunidad que cree en algo más que el aula." | 8 s | `<still:sections/home-about>` (plano cerrado del video highlight) |
| 2 | `/equipo` — p.13 | Travelling lateral sobre la cuadrícula de retratos (placeholders → reales) | "MESA DIRECTIVA" / "EQUIPO" | "Más de 200 estudiantes de distintas carreras y niveles educativos." | 6 s | `<still:sections/equipo-team-grid>` |
| 3 | `/participaciones` — p.6 | Zoom in sobre el logo "AIChE" del nav y travelling down al título "Participaciones" | "PARTICIPACIONES" | "Participamos en las competencias internacionales de AIChE." | 5 s | `<still:sections/home-next-event-card>` (la tarjeta "PRÓXIMO EVENTO" con las 4 competiciones debajo) |
| 4 | `/participaciones/southwest-2027` — p.7 | Plano detalle de la galería de laboratorio | "27 DE MARZO · 2027" | "Vamos a la Southwest Student Regional Conference en McNeese State University, Louisiana." | 7 s | `<still:sections/southwest-2027-competition-navy>` |
| 5 | `/patrocinios` — p.9 | Push-in sobre las 3 cajas de precio; travelling horizontal | "$10,000 · $5,000 · $2,500" | "Pero necesitamos patrocinadores para llevar el Chem-E-Car a competir." | 7 s | `<still:sections/patrocinios-sponsor-hero>` (con el overlay de los 3 paquetes) |
| 6 | `/patrocinios` — p.10 | Zoom out del logo de FETEC + certificado | "PAQUETE 1 · 6 BENEFICIOS" | "Los paquetes incluyen mención en redes, logo en el coche, certificados y más." | 8 s | `<still:sections/patrocinios-sponsor-tiers>` |
| 7 | `/contacto` — p.13 | Plano cerrado de la foto grupal; fade a navy con isotipo | "¡TRABAJEMOS JUNTOS!" | "Si quieres sumarte o patrocinarnos, escríbenos." | 9 s | `<still:sections/contacto-contact>` |
| 8 | `/` JoinCta | Centrado en el isotipo + el título grande | "¡Súmate al capítulo!" + `aiche.gdl@gmail.com` + `@aiche.gdl` | "El siguiente reto empieza contigo." | 8 s | `<still:sections/home-join-cta>` |

**Total:** ~58 s. Sumar 2–5 s por escena de transición + breathers = **65–80 s** (dentro del rango).

---

## 4. Storyboard — versión CORTA (30 s, 9:16)

Para Instagram Reels / Stories — recorta la versión larga.

| # | Plano | Texto en pantalla | Narración | Duración | Still |
|---|---|---|---|---|---|
| 1 | Zoom out del isotipo centrado | "AIChE GDL" | "Un capítulo estudiantil. Más de 200 estudiantes." | 5 s | `<still:sections/home-hero>` |
| 2 | Travelling por la lista de competiciones | "SPRING 2027 / OPEN CALL 2027" | "Cuatro competencias. Una meta." | 5 s | `<still:sections/home-next-event-card>` |
| 3 | Push-in sobre las 3 cajas de precio | "$10,000 · $5,000 · $2,500" | "Patrocinios para Chem-E-Car." | 5 s | `<still:sections/patrocinios-sponsor-hero>` |
| 4 | Centrado en el isotipo final | "¡Súmate al capítulo!" + correo + Instagram | "El siguiente reto empieza contigo." | 5 s | `<still:sections/home-join-cta>` |
| 5 | Fade a logo + correo + Instagram | — | (silencio + música sube) | 5 s | (cierre con isotipo) |

**Total:** 25–30 s.

---

## 5. Guion de locución (versión larga, continuo)

```
[00:00] "En el Tec de Monterrey, Campus Guadalajara,
        hay una comunidad que cree en algo más que el aula."

[00:08] "Más de doscientos estudiantes
        de distintas carreras y niveles educativos."

[00:14] "Participamos en las competencias internacionales
        que organiza el American Institute of Chemical Engineers."

[00:21] "Nuestro próximo reto es la Southwest Student Regional Conference,
        el veintisiete de marzo del dos mil veintisiete,
        en McNeese State University, Louisiana."

[00:28] "Necesitamos patrocinios para llevar el Chem-E-Car a competir."

[00:35] "Los paquetes incluyen mención en redes,
        logo en el coche y uniforme, certificados
        y posibilidad de facturación."

[00:43] "Si tu empresa quiere sumarse,
        o si tú quieres ser parte del equipo,
        escríbenos."

[00:52] "El siguiente reto empieza contigo."
```

Tiempo total: ~58 s. Mantener **pausa de 200–400 ms** entre
oraciones para que la música respire.

---

## 6. Prompts sugeridos para Higgsfield (uno por escena)

> Plantillas listas para copiar. Ajustar **referencias al still**
> según el material capturado (`docs/SHOTLIST.md §1`).

### Escena 1 — Apertura

```
Style: cinematic corporate, clean motion graphics, dark navy background.
Camera: slow zoom-out from center, slight parallax.
Subject: hexagonal blue logo with light blue accents, centered.
Lighting: soft studio rim light, slight glow on edges.
Color palette: navy #123f72, cream #f4f1e9, navy-400 #4a8fd4.
References: see <still:sections/home-hero> and <still:sections/home-about>.
Duration: 8 seconds. Mood: anticipatory, calm, professional.
Avoid: human faces, third-party logos, complex 3D models.
```

### Escena 2 — Equipo

```
Style: editorial documentary, medium shots, natural lighting.
Camera: slow lateral dolly across a 3×2 grid of portraits.
Subject: team portraits (placeholder silhouettes acceptable).
Lighting: soft daylight from left, soft shadows.
Color palette: muted blue tones, cream highlights.
References: <still:sections/equipo-team-grid>.
Duration: 6 seconds. Mood: warm, inclusive, candid.
Avoid: stock-photo smiles, posed hands.
```

### Escena 3 — Competencias

```
Style: clean infographic motion, tabular layout.
Camera: zoom-in from logo, pan down to list, settle on tiles.
Subject: list of 4 competitions with spring-2027 / open-call-2027 tags.
Lighting: flat, broadcast graphic.
Color palette: navy bg, cream type, navy-400 tags.
References: <still:sections/home-next-event-card>.
Duration: 5 seconds. Mood: structured, energetic.
Avoid: decorative icons, stock visuals of chemical plants.
```

### Escena 4 — La competencia (regional)

```
Style: documentary photography, warm light.
Camera: slow push-in on laboratory setting, shallow DOF.
Subject: working laboratory, lab coats, glassware, mid-shot detail.
Lighting: warm tungsten, slight flare.
Color palette: navy accents, warm cream highlights.
References: <still:sections/southwest-2027-competition-navy> and <still:sections/patrocinios-competition-cream>.
Duration: 7 seconds. Mood: focused, real, aspirational.
Avoid: generic stock people, identifiable faces without release.
```

### Escena 5 — Paquetes

```
Style: clean motion graphics, isometric cards.
Camera: push-in on three tier cards with colored top borders.
Subject: 3 stacked cards (Paquete 1 / 2 / 3) with prices.
Lighting: flat, even.
Color palette: navy bg, cream card body, navy-400 accent borders.
References: <still:sections/patrocinios-sponsor-hero> (with overlay) and <still:sections/patrocinios-sponsor-tiers>.
Duration: 7 seconds. Mood: confident, business-clear.
Avoid: hard shadows, gradients, decorative elements.
```

### Escena 6 — Beneficios

```
Style: infographic motion, list with check icons.
Camera: zoom-out from logo, then settle on benefits list.
Subject: 6-benefit list for Paquete 1.
Lighting: flat broadcast.
Color palette: navy bg, cream type, navy-400 accents.
References: <still:sections/patrocinios-sponsor-tiers>.
Duration: 8 seconds. Mood: practical, factual.
Avoid: animated characters, exclamation marks.
```

### Escena 7 — Contacto

```
Style: cinematic portrait, warm light.
Camera: medium shot of group photo, slow zoom-out.
Subject: team group photo (placeholder acceptable).
Lighting: warm, even, slightly backlit.
Color palette: navy bg, cream type.
References: <still:sections/contacto-contact> and <still:sections/contacto-join-cta>.
Duration: 9 seconds. Mood: inviting, human.
Avoid: posed smiles, fake celebration.
```

### Escena 8 — CTA final

```
Style: minimal motion graphics, centered layout.
Camera: static, slight breathing motion.
Subject: hexagonal logo + title + email + Instagram.
Lighting: studio, soft.
Color palette: navy bg, cream type, navy-400 accents.
References: <still:sections/home-join-cta>.
Duration: 8 seconds. Mood: clear, hopeful, closing.
Avoid: flashy animations, confetti.
```

---

## 7. Música

**Mood:** electrónica corporativa optimista, sin voz, tempo ~110 BPM,
acordes mayores.

**Tono de referencia:** algo entre "Odesza — A Moment Apart" (sin
drops) y "Tycho — Awake" (suave, melódico).

**Puntos de acento (con timestamp aproximado sobre la versión larga):**

| t | Acento | Notas |
|---|---|---|
| 00:00 | Fade in | Bajo suave, pad |
| 00:08 | Subida 1 | Entrada del beat tras "el aula" |
| 00:14 | Plena 1 | Tempo claro |
| 00:21 | Acento rítmico | Sobre "veintisiete de marzo" |
| 00:28 | Drop ligero | "llevar el Chem-E-Car a competir" |
| 00:43 | Plena 2 | Subida emocional sobre "escríbenos" |
| 00:52 | Resolución | "El siguiente reto empieza contigo" — acorde mayor limpio |
| 00:58 | Fade out | Cola larga sobre navy |

**Opciones libres de derechos:**
- Artlist.io — busca "corporate optimism", "tech clean".
- Epidemic Sound — "Bright Future", "Modern Tech", "Forward Momentum".
- Uppbeat — "Corporate Uplift", "Bright Tech".

---

## 8. Cierre con datos de contacto

**Bloque final (siempre presente):**

```
¡Súmate al capítulo!
El siguiente reto empieza contigo

aiche.gdl@gmail.com
@aiche.gdl

AIChE GDL · Tec de Monterrey Campus Guadalajara
The 2027 AIChE Southwest Student Regional Conference
27 de marzo de 2027 · McNeese State University, Lake Charles, Louisiana
```

---

## 9. Adaptación 9:16 (Instagram Reels/Stories)

La versión larga (16:9) **no** se recorta directamente. Reescalar y
recomponer en 1080×1920 implica:

- **Sujeto centrado verticalmente**: el isotipo + texto siempre en el
  centro del frame, no arriba (en 16:9 hay aire arriba/abajo; en 9:16
  el aire está arriba/abajo del sujeto pero el sujeto se queda al
  centro vertical).
- **Tipografía más grande** (10–15 % más) — los móviles se ven a
  distancia del brazo.
- **Subtítulos visibles** siempre (muchos usuarios ven sin sonido).
  Usar tipografía sans bold sobre fondo semi-transparente navy al 80 %.
- **CTA al final como tarjeta vertical** con el logo arriba, los
  datos de contacto centrados y un botón "Ver sitio" o "Enviar correo".

**Reutilización:** los mismos `<still:...>` funcionan. Solo hay que
**recomponer** el frame, no rehacerlo.

---

## 10. QA antes de publicar

Antes de subir el video, el agente debe verificar:

- [ ] Ningún rostro identificable sin release firmado.
- [ ] Ninguna marca de terceros visible (logos, paquetes comerciales).
- [ ] Correo e Instagram **correctos** y clicables en pantalla.
- [ ] Sin typos en los textos en pantalla (acentos: **T**ecnológico,
  Campus **G**uadalajara, **P**articipaciones, **R**egional).
- [ ] Sin "Texas" — debe ser **Lake Charles, Louisiana**.
- [ ] Música con licencia válida para el destino (LinkedIn, Instagram,
  YouTube tienen políticas distintas).
- [ ] Subtítulos verificados contra la locución (especialmente
  anglicismos: "AIChE" se pronuncia "a-i-ch-e" o "eye-chee" según el
  país — el equipo prefiere "a-i-ch-e" en español).