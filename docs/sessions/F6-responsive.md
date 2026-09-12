# Sesión F6 — Responsive real y estados de interfaz

**Fecha:** 2026-08-20 · **Estado:** COMPLETA
**Encargo:** `PROMPTS-FASE-2.md` §F6 · **Contrato:** `RULES.md` + ADENDA §A1–§A5
**Gates al arrancar:** verdes (`bunx astro check` 0/0/0, `bun run build` sin errores).

---

## 1. Alcance planeado

1. Recorrer las 8 rutas en 360×800, 390×844, 768×1024, 1024×768, 1366×768,
   1440×900 y 1920×1080; corregir desbordes, texto cortado, imágenes deformadas
   y scroll horizontal.
2. Atender las pantallas de poca altura: portátiles de 768px y móviles apaisados.
3. Revisar estados: hover, focus-visible, enlace activo, submenú abierto, menú
   móvil abierto, video antes de cargar, video pausado, contador después de la
   fecha, textos más largos de lo previsto y la 404.
4. Comprobar la navegación completa por teclado y que el foco no se pierde ni
   queda atrapado fuera del menú móvil.
5. Documentar en `docs/DESIGN-SYSTEM.md` cómo colapsa cada bloque complejo.

Todo el alcance está cubierto. Nada quedó fuera.

---

## 2. Diagnóstico: la banda rota entre 768 y 1190px

El barrido inicial (7 viewports × 8 rutas, build de producción, Playwright)
devolvió **43 de 56 filas con hallazgos**. Casi todos tenían la misma raíz.

### 2.1 El lienzo pedía 1190px aunque el viewport midiera 768

El lienzo son **120 unidades** de `--screen-fs`: 108 de contenido y 6 de margen
a cada lado. Mientras la escala vale `0.833vw`, esas 120 unidades son
120 × 0.00833 × ancho ≈ el ancho entero y encajan por construcción. Pero el
`clamp()` tiene un suelo de `0.62rem` (9.92px) que entra en juego por debajo de
**1191px** (= 9.92 / 0.00833). A partir de ahí la escala deja de seguir al
viewport y el lienzo pide **1190px fijos haya el ancho que haya**.

Consecuencias medidas:

| Viewport | Escala | Qué pasaba |
|---|---:|---|
| 768×1024 | 9.92px | `document.scrollWidth` **1161** > 768 en las 8 rutas |
| 1024×768 | 9.92px | ídem, más la galería de p.12 a 1068px sobre 1024 |

El culpable directo del scroll horizontal era la **barra de navegación**: entra
en su composición de escritorio en `md:` (768px) y necesita 1161px para el
bloque INICIO + lockup + 4 items + Únete.

### 2.2 Texto del diseño por debajo del umbral de lectura

`.t-tag`, `.t-label` y `.t-eyebrow` no se derivan de `--text-*` sino de
`calc(var(--screen-fs) * k)`, y el bloque móvil de `global.css` sólo redefinía
`font-size` sobre `.screen`, no `--screen-fs`. Resultado: en móvil y en tablet
seguían atados al suelo del `clamp()`.

| Etiqueta | Nominal a 1920 | Medido a 360/390/768/1024 |
|---|---:|---:|
| «PAQUETE 1» (`.t-tag`) | 12.8px | **7.9px** |
| «FECHA» / «CORREO» (`.t-label`) | 14.4px | **8.9px** |
| «PATROCINIOS» (`.t-eyebrow`) | 15.6px | **9.7px** |

El nav y el footer sufrían lo mismo por estar **fuera** de toda `.screen`: el
`var(--screen-fs, 1rem)` de sus utilidades resolvía al valor de `:root`.

Y en el régimen de lienzo, a **1366×768** —donde manda el término vertical de la
escala, 11.01px— `.t-label` caía a 9.9px y `.t-tag` a 8.8px.

### 2.3 Scroll horizontal en móvil: la chapa de fecha del video

A 360 y 390px, en `/` y `/acerca`, la chapa «19 SEP · 19:00 H» del overlay del
video mide 185px con su tracking y llevaba `shrink-0`. En una fila con el
titular sobre 220–264px útiles, empujaba fuera de la pantalla: elemento medido
de x=261 a x=446 sobre un viewport de 360.

### 2.4 Tres fronteras distintas para la misma decisión

`global.css` cambiaba de composición en `max-width: 767px` (escala) y en
`max-width: 1023px` (varias secciones); el nav lo hacía en `md:` (768px); las
secciones usaban `md:` y `lg:` (1024px) indistintamente para decir lo mismo.
Cuatro valores para una sola pregunta —«¿cabe la diapositiva?»— y ninguno era
el valor en el que la diapositiva deja de caber.

---

## 3. Qué se hizo

### 3.1 Una sola frontera, con nombre y medida: `canvas` = 80rem (D-142, D-143)

`@theme { --breakpoint-canvas: 80rem; }` genera la variante `canvas:` de
Tailwind. Las 67 apariciones de `md:` y `lg:` en 15 archivos pasan a `canvas:`;
`sm:` (640px) se conserva para los ajustes **dentro** de la pila. En
`global.css`, `(max-width: 767px)` y `(max-width: 1023px)` pasan a
`not all and (min-width: 80rem)` —el complemento exacto, sin el hueco de
subpíxel que deja un `max-width: 79.99rem`— y `(min-width: 768px)` a
`(min-width: 80rem)`. `scripts/nav.ts` **lee el token** en vez de repetir el
número.

1280px es el primer valor redondo por encima del límite de 1191, y es la
resolución mínima que §A3 obliga a verificar con lienzo: **ninguna resolución ya
verificada cambia de régimen**.

### 3.2 `--screen-fs` como única palanca (D-144)

El bloque apilado deja de repetir a mano `--spacing`, `--text-*` y
`--container-*` (26 líneas) y redefine `--screen-fs: 1rem` en `:root`. Todo lo
que se deriva de él —incluidas las utilidades del diseño, el nav y el footer—
recupera la escala del navegador de una vez.

**Detalle que costó una iteración:** el primer intento puso ese `:root` dentro
de `@layer components` y no surtió efecto. El `:root` que declara el token está
**sin capa**, y el CSS sin capa gana siempre al CSS en capa. Está anotado en el
propio archivo para que no vuelva a pasar.

### 3.3 Suelo de legibilidad (D-145)

`.t-eyebrow`, `.t-label` y `.t-tag` pasan a `max(0.6875rem, calc(...))`, el
mismo criterio que ya aplicaban `--text-xs` y `--text-sm`. **A 1920 no
interviene**: los tres nominales (15.6 / 14.4 / 12.8px) están por encima de 11px.

### 3.4 Robustez frente a texto largo (D-146)

`body { overflow-wrap: anywhere }`. Y `min-w-0` en vez de `shrink-0` en la
etiqueta «TRES PAQUETES» de `SponsorHero`, que era el único punto que seguía
desbordando con el texto ×3.

### 3.5 La media de `/acerca` ya no se cae encima del footer (D-147, D-148)

Con `fill` y un padre de altura automática, `h-full` colapsaba: la caja quedaba
en 219px y el titular, la bajada y la chapa de fecha caían **sobre el footer**,
en blanco sobre crema. Fuera del lienzo el overlay pasa a flujo normal y da la
altura; el video se estira por detrás.

Al arreglarlo salió un segundo defecto: `LazyVideo` fija `relative` en su propia
lista de clases, así que el `absolute` que le llegaba por `class` nunca ganaba.
Ahora el video va en su propia capa `absolute inset-0`.

Y un tercero: el overlay de titulares tapaba el **botón de play**, que no se
podía ni pulsar ni sobrevolar. Con reduced-motion, donde ese botón es el único
camino para ver el video, quedaba inservible con ratón. Resuelto con `z-10`.

### 3.6 Estados (D-149, D-150)

- **Contador post-evento**: se para el intervalo (repintaba el mismo mensaje
  cada segundo para siempre), se oculta el eyebrow «FALTAN» (se leía
  «FALTAN / ¡Ya estamos compitiendo!») y el texto accesible alterno pasa al
  mensaje en vez de quedarse en «Faltan 0 días…».
- **Hover**: el lockup del nav, el lockup institucional del footer y el item del
  menú de la página actual no daban ninguna señal al ratón. En el item activo
  `hover:text-navy` era un no-op: el elemento ya era navy.

### 3.7 Un cuarto control automático: `check:states` (D-151)

`scripts/check-states.mjs` recorre el build de producción en dos viewports
(1440×900 y 390×844) y verifica ocho cosas: indicador de foco en cada elemento
enfocable, `aria-current`, hover, recorrido completo por teclado, submenú,
menú móvil (focus trap, Escape, scroll del body), video antes de cargar y en
pausa, contador tras la fecha y textos triplicados. **90 comprobaciones.**

`scripts/check-overflow.mjs` pasa de 6 a **10 viewports**, con los siete del
encargo más 1600×900, 1280×720 y el móvil apaisado 844×390, y distingue régimen
de lienzo de régimen apilado en vez de «escritorio» y «móvil».

---

## 4. Archivos creados / modificados

**Creados**
- `scripts/check-states.mjs` — control de estados y teclado (nuevo gate).
- `docs/sessions/F6-responsive.md` — esta bitácora.

**Modificados**
- `src/styles/global.css` — token `--breakpoint-canvas`, régimen apilado
  reescrito, suelos de legibilidad, `overflow-wrap`, 8 media queries retargeteadas.
- `src/components/layout/Nav.astro` — `canvas:`, hover del lockup, hover del item activo.
- `src/components/layout/NavDropdown.astro` — hover del item de sección activa.
- `src/components/layout/MobileMenu.astro`, `src/components/layout/Footer.astro` — `canvas:`; hover del lockup del footer.
- `src/components/media/VideoHighlight.astro` — caja y overlay por régimen, chapa apilada, bajada legible.
- `src/components/media/LazyVideo.astro` — capa propia del video, `z-10` y hover del botón de play.
- `src/components/sections/{About,NextEvent,TeamGrid,SponsorTeaser,SponsorHero,SponsorTiers,CompetitionInfo,ContactBlock,ParticipationsOverview}.astro` — `canvas:`; `min-w-0` en SponsorHero.
- `src/components/ui/{Card,EventCard,Countdown}.astro`, `src/pages/404.astro` — `canvas:`; `data-cd-eyebrow`.
- `src/scripts/nav.ts` — lee `--breakpoint-canvas`.
- `src/scripts/countdown.ts` — estado post-evento terminal.
- `scripts/check-overflow.mjs` — 10 viewports, régimen apilado.
- `package.json` — `check:states`.
- `docs/DESIGN-SYSTEM.md` — §4.2 nueva; `docs/DECISIONS.md` — D-142…D-152; `docs/STATE.md`.

---

## 5. Desviaciones respecto al plan

**Una, y es de alcance hacia arriba.** El encargo pedía recorrer siete
resoluciones y corregir lo que apareciera. Lo que apareció no eran siete
problemas independientes sino **una frontera mal puesta**, así que la corrección
es estructural: un breakpoint con nombre en lugar de cuatro valores sueltos, y
una palanca de escala en lugar de una lista de excepciones. Es más cambio del
que sugiere el enunciado, pero arreglar caso por caso habría dejado la banda
768–1279px dependiendo de que nadie olvidara una excepción — que es exactamente
cómo se llegó a «PAQUETE 1» a 7.9px.

**Efecto secundario que conviene decir en voz alta:** 1024×768 y 768×1024 ya no
muestran la composición de diapositiva, sino la pila de una columna. Es
deliberado: en esos anchos la diapositiva no cabe sin desbordar o sin bajar el
texto a 8px. Está documentado en `DESIGN-SYSTEM.md` §4.2 y justificado en D-142.

---

## 6. Verificación

Todo medido sobre el build de producción servido por `astro preview`.

| Gate | Resultado |
|---|---|
| `bunx astro check` | **0 errores, 0 warnings, 0 hints** (65 archivos) |
| `bun run build` | 8 páginas, sin errores |
| `bun run check:render` | **32/32** — contenido visible con y sin JS, con y sin reduced-motion |
| `bun run check:overflow` | **10 resoluciones × 8 rutas**: 16 pantallas, **0 desbordes, 0 scroll-x, 0 `overflow:hidden`** |
| `bun run check:states` | **90 comprobaciones, 0 fallos** |
| `bun run check:layers` | 164 imports, arquitectura respetada |

### 6.1 Barrido de F6 (las siete resoluciones del encargo)

56 filas (7 viewports × 8 rutas). **Antes: 43 con hallazgos. Después: 0.**
Se comprobó en cada una: scroll horizontal, elementos fuera del viewport, texto
recortado por `overflow`, imágenes con proporción alterada, texto por debajo de
10.5px y desbordes de pantalla en el régimen de lienzo.

| Resolución | Escala | Régimen | Antes | Después |
|---|---:|---|---|---|
| 360×800 | 16px | apilado | scroll-x 447>360 · `.t-tag` 7.9px | ✓ |
| 390×844 | 16px | apilado | scroll-x 446>390 · `.t-tag` 7.9px | ✓ |
| 768×1024 | 16px | apilado | scroll-x 1161>768 en 8/8 rutas · 4 etiquetas <10px | ✓ |
| 1024×768 | 16px | apilado | scroll-x 1161>1024 en 8/8 · galería 1068px | ✓ |
| 1366×768 | 11.01px | lienzo | `.t-label` 9.9px · `.t-tag` 8.8px | ✓ |
| 1440×900 | 12px | lienzo | `.t-tag` 9.6px | ✓ |
| 1920×1080 | 15.99px | lienzo | — | ✓ |

### 6.2 Pantallas de poca altura

- **1366×768 y 1280×720** (portátiles): 16/16 pantallas encajan, escala 11.01 y
  10.24px. El término vertical de la escala es el que manda en ambas.
- **844×390** (móvil apaisado): régimen apilado, 310px de alto útil tras el nav.
  Sin scroll horizontal; el contenido fluye en vertical, que es la válvula de
  escape de §A3.

### 6.3 Estados

| Estado | Comprobación | Resultado |
|---|---|---|
| `:focus-visible` | cada enfocable de cada ruta recibe foco y se mide su outline | 16 rutas·régimen, **todos con indicador** |
| hover | color/fondo/borde/opacidad/subrayado del elemento **y sus hijos**, antes y después | 15 comprobaciones, **0 elementos sin reacción** (eran 3 por página) |
| enlace activo | `aria-current="page"` apunta a la ruta actual y sólo a ella; `/404` no marca ninguno | 16/16 |
| submenú | `display:none` → abre con `:focus-within` → cierra al salir | ✓ |
| menú móvil | `aria-expanded`, foco entra, **25 Tab sin escapar**, Shift+Tab tampoco, Escape cierra y devuelve el foco, scroll del body liberado | ✓ |
| video antes de cargar | sin `src`, sin `<source>`, con `poster`, `preload="none"` | ✓ |
| video pausado | inyecta fuentes al entrar al viewport, pausa al salir | 6/6 |
| contador post-evento | `data-target` reescrito al pasado antes de que corra el script | cajas ocultas, eyebrow oculto, **cero negativos**, mensaje y texto accesible correctos |
| textos largos | cada título y párrafo ×3 + palabra inseparable de 40 caracteres | 16/16 sin scroll horizontal |
| 404 | incluida en las 8 rutas de todos los controles | ✓ |

### 6.4 Teclado

En las 8 rutas y en los dos regímenes: la **primera parada es el skip link**, la
tabulación **llega al footer**, y el foco **nunca cae en un elemento sin caja
renderizada**. El panel móvil atrapa el foco en los dos sentidos y lo devuelve a
la hamburguesa al cerrar con Escape.

### 6.5 La fidelidad del lienzo no se ha movido (§A5)

Remedido a 1920×1080 después de todos los cambios, contra las cifras que fijó F5b:

| Medida | F5b | F6 |
|---|---|---|
| p.6 título «Acerca de Nosotros» | 2 líneas | **2 líneas**, caja 361px |
| p.6 cuerpo justificado | 20 líneas | **20 líneas**, 23.89px/27.88 |
| p.6 columna de texto | x=40, 502px | **x=40, 502px** |
| p.6 media a sangre | x=576 al borde, alto 1000 | **x=576, 1344×1000** |
| p.10 título | 2 líneas, 600px | **2 líneas, 602px** |
| p.10 cuerpo | 5 líneas | **5 líneas** |
| p.14 correo | 1 línea, 407px | **1 línea, 410px** |
| Escalas | 15.99 / 12 / 11.01px | **idénticas** |

Las diferencias de 2–3px están dentro del método de medida (rango de texto
frente a caja) y por debajo del 0,8 %.

---

## 7. Pendiente

Nada de F6. Los pendientes vivos siguen siendo los del usuario
(`docs/DECISIONS.md`): dominio, moneda de paquetes, destino de «Únete», nombres
de la mesa directiva, logos de patrocinadores y los **dos videos reales**, que
hoy son stubs de 20 bytes (M-001 / M-005).

---

## 8. Necesito que el usuario decida

Nada bloqueante. Una decisión de producto que conviene conocer aunque ya esté
tomada por defecto y documentada:

- **1024×768 y 768×1024 muestran la pila de una columna, no la diapositiva.**
  Es la única forma de que quepa sin desbordar ni bajar el texto a 8px. Si se
  quisiera diapositiva también ahí, habría que rediseñar esas composiciones para
  4:3, que es trabajo de fidelidad nuevo, no de responsive.

---

## 9. Siguiente sesión

**F7 — Rendimiento, accesibilidad y SEO.** Ojo a dos cosas que salen de aquí:

1. Las métricas de F1 se tomaron **antes** de los cambios de F6. Hay que
   remedirlas (§A5): el CSS cambia de tamaño y el HTML también.
2. El LCP de `/` estaba en ~2,0 s, justo en el límite del presupuesto de RULES
   §12. Sigue siendo el punto a vigilar.
