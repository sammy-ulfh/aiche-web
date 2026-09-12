# F1 — Render y mejora progresiva

**Fecha:** 2026-08-20 · **Estado:** ✅ COMPLETA
**Objetivo:** que el sitio se vea. Corregir la causa raíz de `docs/AUDIT-F2.md`
§1, aplicar la ADENDA §A2 en todo el proyecto y dejar un guard anti-regresión.

**Fuera de alcance por indicación explícita:** sistema de pantalla (§A3, es F2)
y fidelidad visual contra el PDF (§A1, es F4/F5). No se ha tocado ni una cosa
ni la otra.

---

## 1. Estado al arrancar

`bunx astro check` → 0 errores / 0 warnings / 0 hints.
`bun run build` → 8 páginas, sin errores. Verde.

---

## 2. La causa raíz, y por qué no bastaba con reponer un import

`docs/AUDIT-F2.md` §1 dejó establecido que `src/scripts/reveal.ts` no se
importaba desde ningún sitio, así que no se emitía en `dist/`, y que
`Reveal.astro` dejaba su contenido en `opacity: 0` esperando una clase
`is-revealed` que nadie añadía nunca.

La tentación era reponer el import y dar el asunto por cerrado. **No se ha
hecho eso**, porque no arregla la causa: el estado por defecto del contenido
seguiría siendo *oculto*, y el sitio seguiría a merced de que un módulo de JS
cargue. La ADENDA §A2 pide exactamente lo contrario.

Lo que se ha hecho es **invertir el contrato** (D-079):

| Antes | Ahora |
|---|---|
| `Reveal.astro` ocultaba desde un `<style>` propio | El componente sólo marca `data-reveal`; **no oculta nada** |
| Estado por defecto: **oculto** | Estado por defecto: **visible** |
| Se mostraba si un módulo diferido llegaba a ejecutarse | Se oculta **sólo** si `<html>` lleva `js-reveal` |
| Un fallo de JS ⇒ página en blanco | Un fallo de JS ⇒ página completa |

### Cómo queda el mecanismo

1. **`Layout.astro`, `<script is:inline>` en el `<head>`** (D-080): añade
   `js-reveal` al `<html>`. Es bloqueante y minúsculo a propósito — tiene que
   correr antes del primer paint, o habría destello de contenido visible que
   se oculta. Un `<script type="module">` es diferido y no sirve aquí.
2. **`global.css`**: las reglas que ocultan exigen **dos** condiciones a la vez,
   `html.js-reveal` **y** `prefers-reduced-motion: no-preference`.
3. **`reveal.ts`**, importado desde `Layout.astro` (D-083): observa, revela y
   marca `data-reveal-state="ready"`.
4. **Temporizador de hombre muerto de 2 s** (D-081): si `reveal.ts` no toma el
   control, el script del head retira `js-reveal` por su cuenta. `reveal.ts` lo
   desarma con `window.__revealReady()`.

Caminos de fallo, todos terminan en contenido visible:

| Situación | Qué pasa |
|---|---|
| JS deshabilitado | La clase nunca se pone → visible |
| `prefers-reduced-motion: reduce` | El CSS no oculta en ningún momento → visible |
| `reveal.ts` no carga (red, parseo) | Hombre muerto a los 2 s → visible |
| `reveal.ts` lanza una excepción | Su `catch` retira la clase → visible |
| Navegador sin `IntersectionObserver` | `showEverything()` → visible |
| Página sin ningún `[data-reveal]` | `showEverything()` → visible |

Detalle adicional (D-084): lo que ya está dentro del viewport al cargar se
revela **sin transición**. Animar contenido que el usuario ya está mirando es
un parpadeo, no una entrada.

---

## 3. Los cuatro scripts, uno por uno (ADENDA §A2)

Se revisaron los cuatro como pedía el encargo. Aparecieron **tres defectos más**
que la auditoría no había podido ver, porque los módulos afectados nunca
llegaban a ejecutarse.

### `reveal.ts` — reescrito
IIFE + `try/catch` envolviendo todo. Guardas para `IntersectionObserver`
ausente, `reduce` y páginas sin reveals. Apretón de manos con el head.

### `lazy-video.ts` — **segundo defecto, independiente del import**
Aunque el módulo se hubiera cargado, **el video no habría funcionado**:

```js
// antes: clonaba el <source> del <template> tal cual…
const liveSources = Array.from(sources).map((s) => s.cloneNode(true));
```

El `<source>` del template guarda la URL en `data-src` justo para que el
navegador no descargue nada. Clonarlo copiaba el `data-src` y dejaba el
`<source>` **sin `src`**. Ahora se crean `<source>` nuevos promoviendo
`data-src` → `src` (D-087). Añadidos `try/catch` por video y fallback a botón
de play manual si no hay `IntersectionObserver`.

Se importa desde `LazyVideo.astro`, no desde el layout (D-083): sólo 2 de las
8 rutas tienen video, y así las otras 6 no cargan ese ~0,46 KB gz.

### `nav.ts` — **el menú móvil no se abría nunca**
Tres fallos, los tres verificados con Playwright antes de tocar nada:

1. **El panel no abría.** El marcado tenía la clase `hidden` de Tailwind fija
   (`display:none`) y `setOpen()` sólo conmutaba `data-open`… para el que **no
   existía ninguna regla CSS en todo el proyecto**. Medido: `display:"none"`
   antes y después de pulsar la hamburguesa. Ahora la visibilidad la declara
   `global.css` a partir de `data-open` y el JS sólo cambia el atributo (D-085).
2. **La ✕ de cerrar no hacía nada.** Hay dos `[data-mobile-toggle]` (hamburguesa
   y ✕) y el código usaba `querySelector`, que devuelve sólo el primero. Ahora
   `querySelectorAll`.
3. **Se robaba el foco en cada carga de página.** El `setOpen(false)` de
   inicialización llamaba a `trigger.focus()`. Medido: al cargar cualquier
   página el foco estaba en `BUTTON "Patrocinios +"` (escritorio) o en
   `BUTTON "Abrir menú"` (móvil), con su anillo de foco. Ahora la
   inicialización pasa `moveFocus = false` y el foco sólo se mueve en
   interacciones reales (D-086).

Además: IIFE + `try/catch` por bloque, de modo que un fallo en el menú móvil no
deja los dropdowns sin inicializar ni al revés; y se retiró el `keydown` de
Enter/Espacio del toggle, que duplicaba el `click` nativo del `<button>`.

### `countdown.ts` — el que estaba mejor
Ya tenía IIFE y guardas. Se añadió `try/catch` por instancia y en el arranque, y
se hizo opcional el `IntersectionObserver` (sin él el contador ya no se pausa
fuera de pantalla, pero sigue contando). Sin JS muestra los valores pintados en
build, que es el comportamiento correcto y ya funcionaba.

### `media.ts` — 404 destapado por el arreglo
`media.aboutVideo.webm` apuntaba a `about-highlight.webm`, **que no existe en
`public/media/video/`**. Mientras la carga diferida estuvo rota nadie lo pidió;
en cuanto empezó a funcionar, el navegador lo pedía y recibía un 404. Retirado y
comentado con instrucciones para reactivarlo (D-088).

---

## 4. El guard: `scripts/check-render.mjs`

`bun run check:render`. Documentado en el README.

Recorre las **8 rutas** en **4 configuraciones** (JS on/off × motion
default/`reduce`) = 32 comprobaciones. Levanta `astro preview` solo, o acepta
`-- --base <url>`. Sale con 0 o 1, así que sirve en CI tal cual.

Qué comprueba:

1. El `<h1>` existe, tiene texto y se ve.
2. Ningún elemento del primer viewport a opacidad computada 0 **nada más
   cargar**, sin scroll de por medio.
3. Ningún bloque de texto principal invisible **después de recorrer la página
   entera**, contando la **opacidad heredada** de los ancestros.
4. Con JS activado, `reveal.ts` tomó el control de verdad.
5. Cero errores de consola, excepciones y recursos 4xx/5xx.

**Dos decisiones de diseño que le dan valor real:**

- **Dos fases** (D-089). Con JS el reveal es *por scroll*: lo que está bajo la
  línea de flotación empieza oculto **a propósito**. Una sola pasada sin scroll
  producía falsos positivos en `/participaciones/` y `/patrocinios/` — se vio en
  la primera ejecución. Un guard que da falsos positivos acaba desactivado.
- **`effectiveOpacity`** en vez de `getComputedStyle(el).opacity`. La opacidad
  no se hereda como valor computado: un hijo de un contenedor a `opacity: 0`
  informa de `1`. Mirar sólo el elemento es, literalmente, por lo que este bug
  sobrevivió once sesiones. El guard sube por la cadena de ancestros.
- **Marcador `data-reveal-state="ready"`** (D-082). Sin él, si `reveal.ts`
  dejara de cargarse el hombre muerto salvaría la página y **el guard pasaría**:
  el reveal quedaría muerto en silencio. Comprobado a mano (ver §5).

---

## 5. Verificación

### 5.1 El guard detecta las regresiones (no es un test vacío)

Se reintrodujeron los dos modos de fallo a propósito y se comprobó que fallan:

| Regresión simulada | Resultado |
|---|---|
| Quitar el import de `reveal.ts` de `Layout.astro` (la regresión literal de S09) | ✗ **detectada** — `reveal-no-inicializado` en las 8 rutas con JS |
| Ocultar por defecto sin exigir `html.js-reveal` (el patrón invertido original) | ✗ **detectada** — 7 a 35 fallos por ruta en `JS off · motion default` |
| Código correcto | ✓ 32/32 |

Sin el marcador de D-082, la primera regresión **pasaba el guard**: el hombre
muerto dejaba la página visible y no había nada que la delatara. Por eso está.

### 5.2 Resultado final

```
check-render — 8 rutas × 4 configuraciones
  ✓ JS on  · motion default   (8/8)
  ✓ JS on  · motion reduce    (8/8)
  ✓ JS off · motion default   (8/8)
  ✓ JS off · motion reduce    (8/8)
✓ check-render: 32 comprobaciones, todo visible.
```

Antes de F1, la configuración `JS off · motion default` fallaba en las 8 rutas,
con 8 719 caracteres de texto invisible en total.

### 5.3 Contador, video y menú

| Qué | Antes de F1 | Después |
|---|---|---|
| Contador | ✅ funcionaba | ✅ 12 → 10 en 1,3 s |
| Menú móvil (hamburguesa) | ❌ `display:none` siempre | ✅ abre a 844 px de alto |
| Menú móvil (✕) | ❌ sin listener | ✅ cierra |
| Menú móvil (Escape) | ❌ | ✅ cierra |
| Scroll del body al abrir | — | ✅ bloqueado |
| Foco atrapado en el panel | — | ✅ |
| Dropdowns de escritorio | ✅ | ✅ abren y cierran con Escape |
| Foco al cargar | ❌ saltaba al último trigger | ✅ en `body` |
| Video: `<source>` con `src` | ❌ nunca | ✅ `/media/video/about-highlight.mp4` |
| Recursos 4xx | ❌ 404 del `.webm` | ✅ ninguno |
| Excepciones de página | — | ✅ ninguna |

**Salvedad honesta sobre el video:** el `<source>` se inyecta correctamente,
pero `public/media/video/about-highlight.mp4` es un **stub de 20 bytes** que no
se puede decodificar (`readyState` 0). El `poster` sí se ve. Es un placeholder
de los que el usuario va a sustituir; anotado como **M-001** en `docs/TODO.md`.
Con el archivo real y el mismo nombre, funcionará sin tocar código (regla 8).

---

## 6. Impacto en peso

`dist/`: 869 KB → **881 KB** (+12 KB: ahora se emiten dos módulos que antes no
llegaban al build).

| Ruta | JS módulo inline gz | Contenido |
|---|---|---|
| `/` | 1,57 → **2,38 KB** | nav + countdown + **reveal** |
| `/acerca/` | 0,96 → **1,84 KB** | nav + **reveal** + **lazy-video** |
| resto (6 rutas) | 0,96 → **1,38 KB** | nav + **reveal** |

JS total por ruta: **2,5–3,5 KB gz** contra un presupuesto de 25 KB gz
(RULES §12) — holgura de ~7×. CSS sin cambios (6,75–6,91 KB gz). Detalle en
`docs/PERFORMANCE.md § Revisión F1`.

---

## 7. Gates de cierre

| Gate | Resultado |
|---|---|
| `bun install` | ✅ sin cambios en dependencias |
| `bunx astro check` | ✅ 0 errores, 0 warnings, 0 hints (62 archivos) |
| `bun run build` | ✅ 8 páginas, sin errores |
| `bun run check:render` | ✅ 32/32 |
| Requests a terceros | ✅ 0 |
| Recursos 4xx/5xx | ✅ 0 |

Sin dependencias nuevas: `playwright` ya estaba en la whitelist (regla 9) y en
`devDependencies`.

---

## 8. Archivos tocados

**Código**
- `src/scripts/reveal.ts` — reescrito (contrato invertido, guardas, apretón de manos)
- `src/scripts/nav.ts` — reescrito (IIFE + try/catch por bloque, 3 fallos corregidos)
- `src/scripts/lazy-video.ts` — `data-src` → `src`, aislamiento, fallback sin observer
- `src/scripts/countdown.ts` — aislamiento e `IntersectionObserver` opcional
- `src/layouts/Layout.astro` — script del head + import de `reveal.ts` en bloque propio
- `src/components/ui/Reveal.astro` — se le quita el `<style>` que ocultaba
- `src/components/media/LazyVideo.astro` — importa su propio script
- `src/components/layout/MobileMenu.astro` — fuera la clase `hidden` fija
- `src/styles/global.css` — reglas del reveal y del panel móvil
- `src/data/media.ts` — `webm` inexistente retirado

**Nuevo**
- `scripts/check-render.mjs`
- `package.json` — script `check:render`

**Documentación**
- `docs/sessions/F1-render.md` (este archivo)
- `docs/STATE.md`, `docs/DECISIONS.md` (D-079…D-089), `docs/PERFORMANCE.md`,
  `docs/TODO.md` (M-001, M-002), `docs/BACKLOG.md`, `README.md`

---

## 9. Reporte de cierre

### Bloqueante
**Nada.** El objetivo de F1 está cumplido: el sitio se ve en las 8 rutas, con y
sin JavaScript, con y sin `reduce`, y hay un guard automático que lo defiende.

### No bloqueante

1. **El video es un stub de 20 bytes** (M-001). El mecanismo funciona; el
   archivo no se puede decodificar. Se resuelve sustituyéndolo.
2. **Navegación móvil sin JS.** El contenido de cada página se lee entera —A2
   cumplida—, pero un usuario en móvil y sin JS sólo puede navegar a `/`: los
   enlaces de escritorio están tras `hidden md:flex` y el footer sólo enlaza a
   `/`. Arreglarlo bien exige rehacer `MobileMenu` como divulgación de CSS puro,
   que es alcance de **F6**. Anotado en `docs/BACKLOG.md`.
3. **`data-stuck` no tiene ninguna regla CSS.** El sentinel del nav mantiene el
   atributo pero nada reacciona a él: el observer no produce efecto visible. O se
   le da estilo o se retira el mecanismo. Candidato a F6. En BACKLOG.
4. **LCP de `/` en ~2,0 s** (móvil emulado), justo en el límite del presupuesto.
   Ahora que el contenido se ve, las métricas hay que rehacerlas enteras en F7.
5. **`scripts/capture.mjs` sigue forzando `reducedMotion: 'reduce'`.** No se
   tocó: reejecutar las capturas es alcance de **F8**, y el guard ya cubre el
   agujero que dejaba. Conviene quitarle ese forzado cuando llegue F8.

### Lo siguiente
**F2 — sistema de pantalla** (ADENDA §A3): no existe `Screen.astro`, no hay ni
una unidad de viewport en `src/`, y 13 de 20 secciones desbordan a 1366×768.
