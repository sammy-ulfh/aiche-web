# F2 — Sistema de pantalla

**Fecha:** 2026-08-20 · **Estado:** ✅ COMPLETA
**Objetivo:** que cada sección que en el PDF ocupa una diapositiva ocupe una
pantalla completa, sin cortar contenido (ADENDA §A3).

**Fuera de alcance:** fidelidad visual contra el PDF (F4/F5). Aquí sólo se ha
tocado encaje y escala.

---

## 1. Estado al arrancar

`bunx astro check` → 0/0/0 · `bun run build` → 8 páginas. Verde.

Punto de partida según `docs/AUDIT-F2.md` §3: **no existía nada de §A3**. Sin
`Screen.astro`, cero unidades de viewport en `src/`, espaciado fijo
(`py-20 md:py-28`), escala tipográfica que sólo miraba `vw`, y **13 de 20
secciones desbordando a 1366×768** (peor caso +733px).

---

## 2. Resultado

| | Antes (F0) | Después (F2) |
|---|---|---|
| Componente de pantalla | no existe | `ui/Screen.astro`, único |
| Unidades de viewport en `src/` | 0 | el lienzo entero deriva de `--screen-fs` |
| Secciones que desbordan a **1366×768** | **13 de 20** | **1 de 22** |
| Peor desborde a 1366×768 | **+733px** | **+60px** |
| Scroll horizontal | 0 | 0 |
| `overflow:hidden` sobre una pantalla | 1 (`Hero`) | 0 |

El único desborde que queda está medido y tiene causa conocida: §5.3.

---

## 3. La fórmula de escala: qué se implementó y qué se ajustó

§A3 propone:

```css
font-size: clamp(0.72rem, min(0.833vw, 1.481vh), 1.15rem);
```

Se implementó con **dos ajustes**, ambos medidos.

### 3.1 El término vertical descuenta el nav (D-092)

`100svh` incluye los 65px del nav sticky, que tapa la franja superior siempre.
Una diapositiva tiene que caber en lo que el nav deja, no en el viewport entero.
El coeficiente no cambia —16/1080 = 0.014815, que es exactamente `1.481vh`—;
sólo cambia la altura de referencia:

```css
--screen-h:  calc(100svh - var(--nav-h));
--screen-fs: clamp(0.62rem, min(0.833vw, calc(var(--screen-h) * 0.014815)), 1.15rem);
```

### 3.2 El suelo baja de 0.72rem a 0.62rem (D-093, D-094)

Con el suelo original, a **1366×768** la escala ideal es 10.41px pero el
`clamp()` la subía a 11.52px: **un 10 % de más, y la pantalla desbordaba**. El
suelo pensado para proteger la legibilidad estaba rompiendo justo la resolución
que más preocupaba.

Con 0.62rem (9.92px), 1366×768 sale **exacto**: escala 10.41px, sin tocar el
suelo, encaje perfecto.

La legibilidad no se sacrifica: se protege **donde está el riesgo**, con un
mínimo absoluto por token en lugar de frenar el lienzo entero.

```css
--text-xs: max(0.6875rem, calc(var(--screen-fs) * 0.75));  /* nunca < 11px */
--text-sm: max(0.75rem,   calc(var(--screen-fs) * 0.875));
```

Con el suelo global, cuatro etiquetas pequeñas frenaban la escala de toda la
página. Con el mínimo por token, el bloque escala y ninguna etiqueta baja de
~11px.

### 3.3 Por qué NO se usó `em` (D-091) — la desviación importante

§A3 dice *«todo lo de dentro se expresa en `em` para escalar en bloque»*. Se
implementó la **intención**, no la letra, porque `em` no consigue ese efecto:

> **Las custom properties se resuelven en el elemento que las USA, no donde se
> declaran.** Con `--spacing: 0.25em`, un `.py-20` aplicado sobre un elemento
> `text-4xl` calcula `calc(0.25em * 20)` contra **su propio** font-size, no
> contra el de la pantalla. El espaciado se dispararía en los títulos y se
> quedaría corto en los pies de foto: divergencia, que es lo contrario de
> escalar en bloque.

La solución que sí escala en bloque es derivar todo de una longitud **absoluta**
calculada una vez (`--screen-fs`). Al no depender del font-size de ningún
elemento, `calc()` sobre ella da el mismo resultado en toda la pantalla.

### 3.4 El hallazgo que hizo barato todo lo demás

Se verificó contra `node_modules/tailwindcss/theme.css` (v4.3.3) y contra el CSS
emitido que **todas** las utilidades de Tailwind pasan por variables:

```css
.py-20   { padding-block: calc(var(--spacing) * 20) }
.gap-6   { gap: calc(var(--spacing) * 6) }
.text-lg { font-size: var(--text-lg) }
.max-w-2xl { max-width: var(--container-2xl) }
```

Redefiniendo esas variables sobre `.screen`, **todo el sitio escala en bloque
sin reescribir ni una clase**. Las secciones siguen usando `py-20`, `gap-6`,
`text-lg` con normalidad.

### 3.5 Escala resultante

| Resolución | Alto útil | Escala | Término que manda |
|---|---|---|---|
| 1920×1080 | 1015px | **15.04px** | altura |
| 1600×900 | 835px | **12.37px** | altura |
| 1440×900 | 835px | **12.00px** | anchura |
| **1366×768** | **703px** | **10.41px** | altura |
| 1280×720 | 655px | **9.92px** | suelo del `clamp()` |
| 390×844 | — | 16px | sistema desactivado (§4.3) |

**Comprobación visual:** normalizando capturas de `/` a 1920, 1366 y 1280 al
mismo ancho, la composición sale prácticamente idéntica. Sólo cambia el nav, que
es chrome de tamaño fijo (D-100).

---

## 4. Migración

### 4.1 `Screen` sustituye a `Section` (D-090)

`ui/Section.astro` **se elimina**; los **17** consumidores pasan a
`ui/Screen.astro`. No quedaba ningún uso legítimo para `Section`: todas las
secciones del sitio son diapositivas del PDF. §A4 pide un concepto, un
componente, un nombre.

`Screen` mantiene la API anterior (`tone`, `container`, `bleed`, `as`, `id`,
`section`, `class`) y añade `fit` para el bloque que no sea una diapositiva.

**Dos bugs encontrados al migrar:**

- **`Hero.astro` no usaba `Section`** (D-096). Era un `<section>` a mano con
  padding fijo `pb-24 pt-20 md:pb-32 md:pt-28`, fuera del sistema. A 1366×768
  **el contador salía cortado por abajo**. Además llevaba `overflow-hidden`
  sobre la sección, que §A3 prohíbe expresamente. Ambas cosas corregidas.
- **`Screen` descartaba los atributos sobrantes** (D-097). El
  `aria-labelledby="competition-info-heading"` de `CompetitionInfo` nunca
  llegaba al DOM. Ahora se propagan con `...rest`.

### 4.2 Válvula de escape y `overflow: hidden`

`min-height`, nunca `height`. Si el contenido no cabe ni al mínimo de escala, la
pantalla **crece y el scroll fluye**. No se usa `overflow: hidden` en ninguna
pantalla.

Quedan cinco `overflow-hidden`, **todos sobre cajas de medios**
(`aspect-video`/`aspect-[3/4]`) cuya función es recortar la foto a su marco, no
tapar un desborde de sección. `check-overflow` distingue los dos casos: sólo
señala `overflow:hidden` cuando está sobre una `.screen`.

### 4.3 Móvil (D-099)

A `max-width: 767px` el sistema **se desactiva**: `font-size: 1rem`,
`min-height: 0`, escala de Tailwind de vuelta a rem y títulos con `clamp()` por
ancho. El lienzo 1920×1080 es apaisado; en 390×844 la composición es de una
columna y lo que manda es la legibilidad. `check-overflow` tampoco mide altura
en móvil, por el mismo motivo.

---

## 5. Tamaños fijos: qué se convirtió y qué se dejó

### 5.1 Convertidos

| Antes | Ahora | Dónde |
|---|---|---|
| `py-20 md:py-28` fijo | `py-12 md:py-16` en unidades de pantalla (D-098) | `Screen` |
| `clamp(…, vw, …)` en `.h-hero`/`.h-section`/`.h-card`/`.h-card-sm` | `calc(var(--screen-fs) * 5.25 / 3 / 2 / 1.5)` | `global.css` |
| `max-w-[1440px]` en 5 secciones | `.screen-canvas` (90 unidades de pantalla) | Hero, SponsorHero, 3 páginas |
| `text-[10px]`, `text-[11px]` ×2, `text-[9px]` | `text-xs` (escala, con mínimo de 11px) | CompetitionList, Badge, TeamGrid, VideoHighlight |
| `Logo size={88\|120\|44\|36}` en px | mismo prop, emitido en `em` | `Logo.astro` |

Tras la pasada **no queda ni un tamaño literal en px dentro de
`sections/`, `ui/`, `media/` ni `pages/`**.

### 5.2 Se dejan en px, a propósito

| Qué | Por qué |
|---|---|
| `--nav-h: 4.0625rem` (65px) y `max-w-[1440px]` del **nav** | Chrome, no diapositiva. Es la barra del sitio, no parte del lienzo. Se centraliza en un token para que Nav y Screen no se desincronicen. Escalarla cambia la identidad del chrome → decisión de F4, anotada en BACKLOG |
| `max-w-[1440px]` del **footer** | Mismo motivo |
| `min-w-[16rem]` del panel de `NavDropdown` | Chrome; además es un mínimo de usabilidad del menú, no una medida del lienzo |
| `text-[10px]` de la bajada del nav | Chrome |
| Mínimos absolutos de `--text-xs`/`--text-sm` | Son el suelo de legibilidad (D-094): tienen que ser absolutos o no protegen nada |

---

## 6. Reporte de `check:overflow`, resolución por resolución

`bun run check:overflow` — 8 rutas × 6 resoluciones. `✓` encaja · `~` usa la
válvula de escape.

### 1920×1080 — escala 15.04px · alto útil 1015px
```
✓ /                                  5 pantallas
✓ /acerca/                           1 pantalla
✓ /acerca/equipo/                    2 pantallas
✓ /participaciones/                  4 pantallas
✓ /participaciones/southwest-2027/   2 pantallas
~ /patrocinios/                      4 pantallas → sponsor-tiers +65px
✓ /contacto/                         2 pantallas
✓ /404                               2 pantallas
```

### 1600×900 — escala 12.37px · alto útil 835px
```
✓ todas menos: /patrocinios/ → sponsor-tiers +61px
```

### 1440×900 — escala 12.00px · alto útil 835px
```
✓ todas menos: /patrocinios/ → sponsor-tiers +35px
```

### 1366×768 — escala 10.41px · alto útil 703px  ← **el caso duro**
```
✓ /                                  5 pantallas
✓ /acerca/                           1 pantalla
✓ /acerca/equipo/                    2 pantallas
✓ /participaciones/                  4 pantallas
✓ /participaciones/southwest-2027/   2 pantallas
~ /patrocinios/                      4 pantallas → sponsor-tiers +60px
✓ /contacto/                         2 pantallas
✓ /404                               2 pantallas
```
**De 13 secciones desbordando a 1 sola.** El resto encaja exacto, sin recortes y
sin scroll horizontal. La escala sale a 10.41px sin llegar al suelo del
`clamp()`, que es justo lo que buscaba el ajuste de §3.2.

### 1280×720 — escala 9.92px · alto útil 655px
```
✓ todas menos: /patrocinios/ → sponsor-tiers +74px
```
Aquí sí manda el suelo del `clamp()` (9.92px es el mínimo). Aun así encajan 21
de 22 pantallas.

### 390×844 — móvil
```
✓ 8/8 · sin scroll horizontal · sistema de pantalla desactivado (§4.3)
```

### Resumen

| Resolución | Escala | Pantallas | Desbordan | Peor | Scroll-x |
|---|---|---|---|---|---|
| 1920×1080 | 15.04px | 22 | 1 | +65px | ✓ 0 |
| 1600×900 | 12.37px | 22 | 1 | +61px | ✓ 0 |
| 1440×900 | 12.00px | 22 | 1 | +35px | ✓ 0 |
| **1366×768** | **10.41px** | **22** | **1** | **+60px** | **✓ 0** |
| 1280×720 | 9.92px | 22 | 1 | +74px | ✓ 0 |
| 390×844 | — | 22 | — | — | ✓ 0 |

---

## 7. El desborde que queda, medido

### 7.1 `sponsor-tiers` (+35 a +74px) — la causa es un elemento inventado

Medido a 1920×1080: la sección mide 1080px contra 1015 útiles, **+65px**.
Desglose de la tarjeta más alta (806px): foto 327px + contenido 479px.

Dentro de ese contenido, el botón **«Quiero este paquete» mide 43px**, más su
`gap-5` de 19px = **62px**. El desborde es de 65px.

**Ese botón no existe en la p.11 del PDF.** Está catalogado como elemento
inventado en `docs/AUDIT-F2.md` §2.1, con corrección **C-12** asignada a F5.
Al retirarlo, la sección encaja sin tocar nada del sistema de pantalla.

No se ha hecho aquí porque **quitar contenido es fidelidad, no encaje**, y el
encargo de F2 excluye F4/F5 explícitamente. Queda en `docs/BACKLOG.md` con la
medición, para que F5 lo cierre con el dato ya hecho.

### 7.2 `competitions` — resuelto, pero con deuda de composición

Desbordaba +235 a +356px. La causa medida: la foto del Chem-E-Car, con
`aspect-video w-full`, ocupaba **761px de los 1015 disponibles** (el 75 % de la
diapositiva).

Es el mismo defecto de fondo que tenía la escala tipográfica: **una caja
dimensionada por una sola dimensión, ignorando el presupuesto de la otra**. Se
corrigió con `.screen-media` (D-095), un techo de altura en unidades de pantalla.
La imagen ya lleva `object-fit: cover`, así que recorta; no deforma ni deja
franjas. No es `overflow:hidden` encubierto: es el medio declarando cuánto sitio
puede ocupar.

Dicho esto, **la composición correcta es la del PDF p.7**: la foto **al lado**
del texto, en dos columnas, no debajo. Eso es F5, y está en BACKLOG.

---

## 8. Gates de cierre

| Gate | Resultado |
|---|---|
| `bun install` | ✅ sin cambios de dependencias |
| `bunx astro check` | ✅ 0 errores, 0 warnings, 0 hints |
| `bun run build` | ✅ 8 páginas |
| `bun run check:render` (F1) | ✅ 32/32 — la mejora progresiva no se ha roto |
| `bun run check:overflow` (F2) | ✅ sin scroll horizontal, sin `overflow:hidden` |
| Scroll horizontal en 8 rutas × 6 resoluciones | ✅ 0 |

---

## 9. Archivos tocados

**Nuevo**
- `src/components/ui/Screen.astro`
- `scripts/check-overflow.mjs` · `package.json` (script `check:overflow`)

**Eliminado**
- `src/components/ui/Section.astro`

**Modificado**
- `src/styles/global.css` — sistema de pantalla, escala, `.screen-canvas`, `.screen-media`, títulos, móvil
- `src/components/sections/Hero.astro` — pasa por `Screen`, fuera `overflow-hidden`
- 16 componentes y páginas — `Section` → `Screen`
- `src/components/sections/CompetitionsList.astro` — `.screen-media`
- `src/components/layout/Nav.astro` — altura desde `--nav-h`
- `src/components/layout/Logo.astro` — tamaño en `em`
- `src/components/ui/CompetitionList.astro`, `ui/Badge.astro`, `sections/TeamGrid.astro`, `media/VideoHighlight.astro` — px → `text-xs`
- `scripts/check-render.mjs` — reutiliza el preview si ya está levantado

**Documentación**
- `docs/sessions/F2-screen-system.md`, `docs/STATE.md`, `docs/DECISIONS.md`
  (D-090…D-101), `docs/BACKLOG.md`, `docs/TODO.md` (L-001), `README.md`

---

## 10. Reporte de cierre

### Bloqueante
**Nada.** El objetivo está cumplido: 21 de 22 pantallas encajan en las cinco
resoluciones de §A3, sin cortar contenido y sin scroll horizontal. A 1366×768 se
pasó de 13 secciones desbordando a 1.

### No bloqueante

1. **`sponsor-tiers` desborda 35–74px.** Causa medida: un botón que el PDF no
   tiene (43px + 19px de gap ≈ el desborde exacto). Lo cierra F5 con C-12.
2. **La composición de `competitions` sigue siendo la equivocada.** Encaja por el
   techo de medios, pero el PDF p.7 la resuelve en dos columnas. F5.
3. **El nav no escala** (65px fijos): a 1280×720 se come el 9 % de la altura
   frente al ~4,3 % del PDF. Escalarlo devolvería ~20px de alto útil en las
   resoluciones bajas, pero toca identidad del chrome. F4.
4. **El logo definitivo ya está en el repo** (`design/aiche_logo.svg`, entregado
   por el usuario durante esta sesión). No se ha integrado: es fidelidad (F4).
   **Atención a la proporción:** el real es 149×172 (≈0.87:1), el placeholder es
   1:1. Anotado como **L-001** en `docs/TODO.md`.
5. **Las capturas de `docs/media/` están obsoletas**: se generaron antes de F1 y
   F2. Regenerarlas es F8.

### Lo siguiente
**F3 — arquitectura, datos y limpieza** (§A4). F2 ya adelantó parte:
`Section.astro` eliminado y su solapamiento con `Screen` resuelto.
