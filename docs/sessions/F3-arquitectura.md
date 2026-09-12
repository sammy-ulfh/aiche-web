# F3 — Arquitectura, datos y limpieza

**Fecha:** 2026-08-20 · **Estado:** ✅ COMPLETA
**Objetivo:** ordenar el código sin cambiar el resultado visual (ADENDA §A4).

---

## 1. Estado al arrancar

`bunx astro check` → 0/0/0 · `bun run build` → 8 páginas. Verde.

Deuda de partida según `docs/AUDIT-F2.md` §4: 4 aristas `sections → sections`,
3 primitivas de `ui/` importando `data/`, un par de nombres que se diferenciaba
en una letra, y la fecha y la sede del evento escritas a mano dentro del copy.

---

## 2. Resultado

| | Antes | Después |
|---|---|---|
| `sections/` importa `sections/` | **4** | **0** |
| `ui/` importa **valores** de `data/` | **3** | **0** |
| `sections/` importa `layout/` | **2** | **0** |
| Pares con nombre casi idéntico | 2 | 0 |
| Datos con dos caminos de import | 4 | 0 |
| Fecha/sede escritas a mano en el copy | 2 cadenas | 0 |
| Componentes sin uso | 0 | 0 |
| Guard de arquitectura | no existía | `bun run check:layers` |

---

## 3. Capas: qué se movió y por qué

`scripts/check-layers.mjs` recorre los 182 imports reales de `src/` y aplica
seis reglas de dirección única. El árbol completo queda documentado en
`docs/DESIGN-SYSTEM.md` §6.

### 3.1 `ui/` ya no importa valores de `data/` (D-103, D-104)

| Componente | Antes | Ahora |
|---|---|---|
| `ui/Countdown` | leía `countdownTargetIso`, `countdownEventName`, `countdownBoxLabels`, `countdownPostEvent` de `data/site` | recibe `targetIso`, `eventName`, `boxLabels`, `postEvent` por props |
| `ui/ContactActions` | leía 4 constantes de `data/site` + 2 de `data/content` | recibe un único objeto `contact` |

`Countdown` estaba atado a **un evento concreto**: una primitiva que sólo sirve
para contar hacia un evento no es una primitiva. Los seis valores de
`ContactActions` se agrupan en `data/content.contactActions` para no repetir
seis props en los tres puntos de uso (D-104); los valores se siguen definiendo
una sola vez en `site.ts`.

### 3.2 `sections/` ya no se importa a sí misma (D-105)

Las 4 aristas venían de dos tarjetas compartidas que vivían en `sections/`:

- `sections/PackageCard` → **`ui/PackageCard`**, con `currencySymbol`,
  `ctaLabel` y `ctaHref` por props. La usan `SponsorHero`, `SponsorTeaser` y
  `SponsorTiers`.
- `sections/NextEventCard` → **`ui/EventCard`**, con `event`, `ctaLabel` y
  `ctaHref` por props. La usan `sections/NextEvent` y `pages/participaciones`.

Son tarjetas de presentación, no diapositivas: su sitio es `ui/`. El cambio
resuelve la violación y de paso deshace el par `NextEvent` / `NextEventCard`.

### 3.3 `Logo` sube a `ui/` (D-106)

Estaba en `layout/`, pero lo usan `Nav`, `Footer`, `Hero` y `JoinCta`. Desde
`sections/` generaba una dependencia lateral `sections → layout`. No es chrome:
es una primitiva de marca.

---

## 4. Duplicados y solapamientos

### 4.1 Nombres casi idénticos (D-107)

`sections/CompetitionsList` → **`sections/Competitions`**. Se diferenciaba en
UNA letra de `ui/CompetitionList`, que es la lista que renderiza dentro.
Ahora: la sección es la pantalla, la primitiva es la lista.

### 4.2 `About` + `AboutTeaser` → uno solo (D-108)

Eran el mismo bloque con distinto envoltorio: mismo fondo navy a sangre, misma
pregunta en Libre Baskerville italic, mismo `VideoHighlight` al lado. Se
fusionan en `sections/About` con `variant: 'full' | 'teaser'`:

| | `full` (`/acerca`) | `teaser` (home) |
|---|---|---|
| Título | `h1` `h-section` | `h2` `h-card` |
| Cuerpo | párrafo largo | — |
| CTA | — | "Conoce más" → `/acerca` |
| Rejilla | `md:grid-cols-2`, `items-start` | `md:grid-cols-[1fr_1.6fr]`, `items-center` |

**Verificado:** el `<section data-section="about">` renderizado mide 3802 bytes
antes y después, y la única diferencia es el **orden de las clases** dentro del
atributo (`flex max-w-prose flex-col gap-5` vs `flex flex-col gap-5
max-w-prose`), que no afecta al CSS. El CSS del build es **byte-idéntico**
(mismo md5, 35 980 bytes).

### 4.3 Los tres bloques de patrocinio NO se fusionan (D-109)

`SponsorHero`, `SponsorTeaser` y `SponsorTiers` parecen candidatos, pero no son
el mismo bloque: distinto rol de página (el `h1` de `/patrocinios` vs un teaser
del home vs la rejilla de beneficios), distinta composición (dos columnas con
imagen vs una columna con CTA) y distintos estilos de impresión. Lo que de
verdad se repetía —la tarjeta de paquete— ya está compartido y parametrizado en
`ui/PackageCard`. **Eso es reutilización, no duplicación**; unificarlos habría
producido un componente con tres ramas de layout, más difícil de leer que tres
secciones enfocadas.

---

## 5. Una sola fuente de verdad en `data/`

### 5.1 `event.ts` concentra el evento (D-110)

Antes: la fecha ISO y el nombre vivían en `site.ts`; la sede, en `event.ts`; y
**dos cadenas de copy repetían "27 de marzo de 2027" y "Lake Charles,
Louisiana" escritas a mano** (`content.ts:66` y `:137`), mientras otras dos sí
interpolaban. Cambiar la fecha dejaba esas dos frases obsoletas en silencio.

Ahora `data/event.ts` define **una vez**: `eventStartIso`, `eventName`, `venue`,
`venueLocation`, `eventDateHuman`, `eventDateShort` y `eventDateLabels`. Las dos
cadenas pasan a plantilla e interpolan. `site.ts` se queda con identidad,
contacto y SEO, y lo dice en su cabecera.

### 5.2 Fuera el barrel (D-111)

`content.ts` re-exportaba `competitions`, `competitionsIntro`, `sponsorTiers` y
`sponsorMailtoFor`. Resultado: el mismo dato tenía **dos caminos de import
válidos** y cada consumidor elegía uno distinto — `NextEvent` tomaba las
competencias por `content`, `Competitions` por `competitions`. Los re-exports se
eliminan y cada dato tiene un único módulo. `content.ts` queda con una
responsabilidad clara: **el texto visible, y sólo eso**, y lo documenta en su
cabecera.

### 5.3 Limpieza

- `src/assets/` estaba **vacío** → eliminado.
- `--container-prose` de `global.css` era **código muerto de F2** (D-113):
  Tailwind emite `.max-w-prose{max-width:65ch}` y no pasa por un token de
  contenedor. `65ch` ya es relativo al font-size, así que escala igual.
- Componentes sin uso: **0**, antes y después.

---

## 6. Verificación visual: cómo se hizo y qué salió

### 6.1 El método ingenuo no servía

Comparar capturas antes/después daba 6 rutas distintas… **y repetir la captura
sobre el MISMO build daba diferencias en las mismas zonas**. El capturador tiene
dos fuentes de ruido:

1. **el contador**, que se pinta en build (dos builds hechos en momentos
   distintos dan valores distintos) y además se repinta cada segundo;
2. **los medios**, en particular el `<video>` cuyo `.mp4` es un stub de 20 bytes
   (M-001): unas veces se pinta el `poster` y otras un fotograma vacío.

### 6.2 Método usado

- El estado previo a F3 se construyó en un **worktree de git sobre `538429b`**,
  para no tocar el árbol de trabajo.
- Ambos `dist/` se sirvieron con un servidor estático **multihilo** (el
  `http.server` monohilo de Python se atasca con las peticiones paralelas de
  Playwright y bloqueaba la captura).
- Captura determinista: recorrer la página para disparar las imágenes lazy,
  esperar a que toda `img` esté `complete`, **parar el `setInterval` del
  contador** y fijar sus dígitos.
- **Se midió el suelo de ruido**: dos capturas del mismo build, para saber qué
  diferencias no significan nada.

### 6.3 Resultado, 24 capturas (8 rutas × 1920/1366/390)

| Veredicto | Nº | Detalle |
|---|---|---|
| Idénticas píxel a píxel | 17 | |
| Diferencia explicada por el ruido del capturador | 5 | `acerca-d`, `acerca-m`, `home-d`, `home-m`, `home-p` — el mismo build consigo mismo difiere lo mismo en esas zonas |
| Sospechosas, resueltas con diff de HTML | 2 | `contacto-d` y `parti-m`: el `<main>` renderizado es **byte-idéntico** (mismo md5) en ambos builds → ruido de medios |

**Conclusión: el resultado visual no cambió.** Donde la imagen difería, el HTML
y el CSS generados son idénticos; la diferencia estaba en el capturador, no en
el sitio.

### 6.4 Lo que SÍ cambió, y hay que decirlo (D-112)

Hay **un cambio funcional**, detectado precisamente por este diff:

> El CTA **"Ver participaciones" del home** enlazaba a
> `/participaciones/southwest-2027`. Ahora enlaza a **`/participaciones`**.

Causa: el antiguo `NextEventCard` llevaba `href="/participaciones/southwest-2027"`
**escrito a mano**, igual para sus dos usos, mientras
`data/content.participations.nextEvent.homeCtaHref` ya valía `/participaciones`
y **el componente lo ignoraba**. Al parametrizar el destino, el dato muerto pasa
a usarse y la etiqueta concuerda con el destino.

Es el único cambio de comportamiento de F3. No es visual (un `href` no se ve),
pero es un cambio real y queda anotado. **Si se prefiere el destino anterior,
basta con cambiar `homeCtaHref` en `data/content.ts`** — ya no hay ninguna URL
escrita a mano en el componente.

---

## 7. Gates de cierre

| Gate | Resultado |
|---|---|
| `bun install` | ✅ sin cambios de dependencias |
| `bunx astro check` | ✅ 0 errores, 0 warnings, 0 hints |
| `bun run build` | ✅ 8 páginas |
| `bun run check:layers` (F3) | ✅ 182 imports, arquitectura respetada |
| `bun run check:render` (F1) | ✅ 32/32 |
| `bun run check:overflow` (F2) | ✅ sin scroll horizontal ni `overflow:hidden` |
| Diff visual antes/después | ✅ sin cambios (§6) |

---

## 8. Archivos tocados

**Nuevo:** `scripts/check-layers.mjs` · `package.json` (`check:layers`)

**Movido:** `sections/PackageCard` → `ui/PackageCard` · `sections/NextEventCard`
→ `ui/EventCard` · `layout/Logo` → `ui/Logo` · `sections/CompetitionsList` →
`sections/Competitions`

**Eliminado:** `sections/AboutTeaser.astro` (fusionado en `About`) ·
`src/assets/` (vacío)

**Modificado:** `ui/Countdown`, `ui/ContactActions`, `ui/PackageCard`,
`ui/EventCard`, `sections/About`, `sections/Hero`, `sections/NextEvent`,
`sections/Competitions`, `sections/SponsorTiers`, `sections/SponsorTeaser`,
`sections/SponsorHero`, `sections/JoinCta`, `sections/ContactBlock`,
`layout/Nav`, `layout/Footer`, `data/event.ts`, `data/site.ts`,
`data/content.ts`, `data/seo.ts`, `data/nav.ts`, `styles/global.css`,
`pages/index.astro`, `pages/participaciones.astro`,
`pages/participaciones/southwest-2027.astro`

**Documentación:** `docs/sessions/F3-arquitectura.md`, `docs/DESIGN-SYSTEM.md`
(§6–7), `docs/STATE.md`, `docs/DECISIONS.md` (D-102…D-114), `README.md`

---

## 9. Reporte de cierre

### Bloqueante
**Nada.** Cero violaciones de §A4, cero duplicados de datos, cero componentes sin
uso, y el resultado visual verificado como idéntico.

### No bloqueante

1. **El CTA del home cambió de destino** (§6.4, D-112). Único cambio funcional.
   Revertirlo es cambiar un dato, no código.
2. **El stub de video de 20 bytes (M-001) ensucia cualquier comparación
   visual automática**: es la principal fuente de ruido del capturador. Al
   sustituirlo por el video real, las capturas se vuelven estables.
3. **`content.ts` sigue teniendo 240 líneas.** Ya tiene una sola
   responsabilidad (el texto visible), pero si crece conviene partirlo por
   página. No es deuda hoy.
4. **`ui/` contiene tres componentes con nombre de dominio** (`PackageCard`,
   `EventCard`, `CompetitionList`). Son primitivas de presentación
   parametrizadas y no importan valores, pero el nombre delata el dominio. Se
   deja así a propósito: renombrarlos a algo genérico haría el código menos
   legible, no más.

### Lo siguiente
**F4 — fidelidad de Inicio, Acerca y Equipo.** Recordatorio: el logo definitivo
ya está en `design/aiche_logo.svg` y es **149×172 (≈0,87:1)**, no 1:1 como el
placeholder (L-001 en `docs/TODO.md`).
