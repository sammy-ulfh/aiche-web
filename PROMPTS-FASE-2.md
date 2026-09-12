# PROMPTS-FASE-2.md — Corrección, fidelidad y refactor

> Fase 2 del proyecto AIChE GDL. El sitio ya existe (sesiones S0–S10) pero **no se ve correctamente al ejecutarlo**, no encaja en pantalla y se desvía del diseño.
> Esta fase corrige, no reconstruye. `RULES.md` sigue vigente; este archivo añade reglas nuevas y sustituye el plan de sesiones mientras dure la fase.
> Sesiones **F0–F8**, un chat nuevo por sesión, mismo protocolo de cierre de siempre.

---

## 1. EL SÍNTOMA Y LA HIPÓTESIS

**Dato clave:** las capturas automáticas salen perfectas, pero el sitio real "no se ve". Esa diferencia no es casualidad y acota mucho el problema.

El script de capturas se escribió para forzar `prefers-reduced-motion`, esperar a las fuentes y **forzar el estado final de los reveals**. Es decir: las capturas se toman precisamente en el único estado donde el bug no se manifiesta. Tres hipótesis, todas compatibles con ese síntoma:

- **H1 — Reveal invertido.** Los elementos con `Reveal` arrancan en `opacity: 0` y solo se muestran cuando el `IntersectionObserver` los marca. Si el observer no llega a registrarse, la página queda en blanco aunque el HTML y el CSS estén perfectos.
- **H2 — Bundle único de JS.** En `dist/_astro/` hay **un solo** `page.*.js`: todos los scripts de cliente (contador, nav, video, reveal) viajan juntos. Una excepción temprana en cualquiera de ellos —un `querySelector` que devuelve `null` en una página donde ese componente no existe— aborta la ejecución y el reveal nunca se inicializa. Mismo síntoma, causa distinta.
- **H3 — Fallback de reduced-motion ausente.** El CSS de reveal puede estar ocultando por defecto y revelando solo dentro de `@media (prefers-reduced-motion: reduce)`, que es justo lo que el script de capturas fuerza.

**No des ninguna por buena sin comprobarla.** F0 existe para eso.

**Regla que sale de aquí, y que es la lección de fondo:** el contenido debe verse **con JavaScript deshabilitado**. La animación es una mejora opcional encima de una página que ya funciona, nunca un requisito para que el texto exista.

---

## 2. ANTES DE EMPEZAR (2 minutos, lo haces tú)

1. **Cambia de modelo.** Usa `claude` normal (Opus 5) en lugar de tu función `claude-minimax`. Confírmalo con `/status` y `/model`.
2. **Comprueba el síntoma tú mismo**, para poder contrastar lo que reporte el agente:
   - `bun run preview`, abre el sitio y mira si se ve.
   - Abre DevTools → Consola. Anota cualquier error en rojo.
   - DevTools → ⋮ → More tools → Rendering → marca **Emulate prefers-reduced-motion: reduce**. Recarga. **Si con eso el sitio se ve bien, el problema es el reveal** y se lo confirmas al agente en F0.
   - DevTools → Settings → Debugger → **Disable JavaScript**. Recarga. Anota qué se ve.
3. **Mueve los comandos a su sitio.** Ahora mismo `sesion.md`, `cerrar.md` y `estado.md` están sueltos en la raíz, así que los slash commands no existen:
   ```bash
   mkdir -p .claude/commands && mv sesion.md cerrar.md estado.md .claude/commands/
   rm -f estructura.txt
   ```
4. **Verifica que `dist/` no está versionado**: `git check-ignore dist && echo OK`. Si no responde OK, añádelo a `.gitignore` y `git rm -r --cached dist`.
5. Copia este archivo a la raíz del repo y haz commit.

---

## 3. ADENDA DE REGLAS — pega esto al final de `RULES.md`

```markdown
---

# ADENDA FASE 2 (vigente sobre cualquier regla anterior que la contradiga)

## A1. El PDF es el criterio de aceptación, no una referencia

`design/landing.pdf` define el resultado. Cada diferencia entre el sitio y el PDF es un
defecto hasta que se justifique por escrito como adaptación deliberada (responsive,
accesibilidad o limitación técnica real). "Se parece bastante" no es un criterio.

El lienzo de diseño es **1920×1080 (16:9)**: es la referencia de fidelidad en escritorio.

## A2. Mejora progresiva obligatoria

Con JavaScript deshabilitado, **todo el contenido debe verse y leerse**. Ninguna
animación, reveal o transición puede ser la condición para que un texto exista.

Patrón obligatorio para el reveal: el estado por defecto es **visible**. El script añade
una clase al `<html>` (p. ej. `js-reveal`) y solo entonces el CSS oculta y anima. Si el
script falla o no llega a ejecutarse, la página se ve completa.

Cada script de cliente se protege de forma independiente: si el elemento que busca no
existe, sale sin lanzar. Una excepción en un módulo no puede tumbar a los demás.

## A3. Sistema de pantalla (fit-to-viewport)

Las secciones que en el PDF ocupan una diapositiva completa deben ocupar **una pantalla
completa**, sin que el contenido se corte ni obligue a hacer scroll dentro de la sección.

Reglas:
- Componente único `layouts/Screen.astro` (o `ui/Screen.astro`). Ninguna página define
  altura de pantalla por su cuenta.
- Altura: `min-height: 100svh` (estable en móvil), nunca `height: 100vh` fija. `dvh` solo
  si se justifica el reflow al ocultarse las barras del navegador.
- **Escalado proporcional al lienzo 1920×1080.** El contenedor de pantalla define su
  propio `font-size` en función de la dimensión limitante, y todo lo de dentro
  (tipografía, espaciado, tamaños de caja) se expresa en `em` para escalar en bloque:

  ```css
  .screen {
    /* 16px a 1920 de ancho = 0.833vw · 16px a 1080 de alto = 1.481vh */
    font-size: clamp(0.72rem, min(0.833vw, 1.481vh), 1.15rem);
  }
  ```

  `min()` hace que mande la dimensión que se queda corta; `clamp()` evita texto
  ilegible en pantallas muy pequeñas o gigantes.
- **Válvula de escape**: si a un breakpoint el contenido no cabe ni al mínimo de escala,
  la sección **crece y deja fluir el scroll**. Cortar contenido está prohibido; hacer
  scroll es preferible a un texto ilegible o recortado.
- Prohibido `overflow: hidden` para "arreglar" un desbordamiento: eso oculta el defecto
  en lugar de resolverlo.
- Verificación obligatoria en 1920×1080, 1600×900, 1440×900, 1366×768 y 1280×720, más
  móvil. 1366×768 es el caso duro: es donde revienta el escalado mal hecho.

## A4. Arquitectura por capas (no MVC)

MVC no encaja en un generador estático: no hay controladores ni ciclo de petición, el
"controlador" es el build. La separación correcta aquí es por capas, con dependencias en
**una sola dirección**:

```
data/     Fuente de verdad. Datos y copy tipados. No importa nada de UI.
ui/       Primitivas sin dominio (Button, Card, Section, Screen). NO importan data/.
sections/ Bloques con dominio. Consumen data/ y componen ui/. NO se importan entre sí.
layouts/  Chrome de página: head, nav, footer, slot.
pages/    Composición y SEO. Sin estilos propios más allá del orden de secciones.
scripts/  Comportamiento de cliente, un módulo por responsabilidad, aislado.
```

Reglas de higiene:
- Un concepto, un componente, un nombre. Nada de pares casi idénticos.
- Ningún dato duplicado entre archivos de `data/`: una sola definición de la fecha del
  evento, del correo, del nombre de la sede.
- Ningún componente en `sections/` que no se use.
- Si un componente supera ~150 líneas o mezcla dos responsabilidades, se parte.

## A5. Verificar, no heredar

Los reportes y bitácoras de las sesiones S0–S10 son **afirmaciones sin verificar**. Las
métricas de rendimiento, los presupuestos y los criterios que se dieron por cumplidos se
vuelven a medir en esta fase. Si un número no coincide con lo documentado, se corrige la
documentación y se dice.
```

---

## 4. MAPA DE SESIONES

| # | Sesión | Entrega |
|---|---|---|
| **F0** | Diagnóstico y triage | `docs/AUDIT-F2.md`: causa real del bug, inventario de desviaciones vs PDF, deuda de arquitectura, plan priorizado. **Sin tocar código.** |
| **F1** | Render y mejora progresiva | El sitio se ve. Contenido visible sin JS. Guard automático anti-regresión. |
| **F2** | Sistema de pantalla | `Screen.astro`, escala proporcional, cero contenido cortado en 5 resoluciones. |
| **F3** | Arquitectura, datos y limpieza | Capas ordenadas, duplicados eliminados, una sola fuente de verdad. |
| **F4** | Fidelidad: Inicio, Acerca, Equipo | Comparación 1:1 contra las páginas del PDF, corregida. |
| **F5** | Fidelidad: Participaciones, Southwest, Patrocinios, Contacto | Ídem. |
| **F6** | Responsive y estados | Móvil, tablet, pantallas bajas, hover/foco/vacíos. |
| **F7** | Rendimiento, accesibilidad y SEO | Medición honesta y corrección. |
| **F8** | Re-captura, documentación y cierre | Capturas nuevas, docs al día, paquete de video regenerado. |

**No reordenes F0→F1→F2→F3.** F4 y F5 son intercambiables entre sí.

---

## 5. PROMPTS DE SESIÓN

Chat nuevo cada vez. Todos asumen que `AGENTS.md`/`CLAUDE.md` se cargan solos.

### F0 — Diagnóstico y triage

```
Este proyecto ya fue construido por otro agente en 11 sesiones (S0–S10). El sitio compila
y las capturas automáticas salen bien, pero al ejecutarlo en un navegador prácticamente
no se ve contenido, las secciones no encajan en pantalla y el diseño se ha alejado del
PDF de referencia.

Esta sesión es DIAGNÓSTICO. No corrijas nada todavía: quiero entender antes de tocar.

Lee: RULES.md completo (incluida la ADENDA FASE 2), PROMPTS-FASE-2.md, docs/STATE.md,
docs/DECISIONS.md, docs/TODO.md y las bitácoras de docs/sessions/.

Trata las bitácoras como afirmaciones sin verificar, no como hechos.

1. REPRODUCE EL BUG. Haz build, sirve el sitio y compruébalo con Playwright:
   - con JS habilitado y con JS deshabilitado,
   - con y sin prefers-reduced-motion forzado,
   - capturando errores de consola en cada caso.
   Las tres hipótesis que manejo están en PROMPTS-FASE-2.md §1: reveal invertido,
   excepción temprana en el bundle único de JS, o fallback de reduced-motion ausente.
   Determina cuál es la causa REAL con evidencia, y dime si son varias a la vez.

2. INVENTARIO DE FIDELIDAD. Rasteriza design/landing.pdf a 1920x1080 y compara cada
   página de diseño con su ruta implementada (captura el viewport a 1920x1080). Entrega
   una tabla página por página con las desviaciones concretas: tipografía, escala,
   espaciado, color, composición, elementos ausentes o inventados.

3. AJUSTE A PANTALLA. Mide, para cada ruta, la altura real de cada sección en 1920x1080,
   1600x900, 1440x900, 1366x768 y 1280x720. Reporta cuáles desbordan y por cuánto.

4. DEUDA DE ARQUITECTURA. Revisa src/ contra la regla A4 de la adenda. Busca en concreto:
   componentes con nombres casi idénticos y responsabilidad solapada, datos duplicados
   entre archivos de src/data/, componentes sin uso, y scripts de cliente sin aislamiento.

5. VERIFICA LAS MÉTRICAS que la sesión S08 dio por cumplidas: Lighthouse móvil sobre el
   build de producción, peso de dist/, JS y CSS por ruta, requests a terceros. Compáralas
   con lo documentado en docs/PERFORMANCE.md y señala las diferencias.

Entrega docs/AUDIT-F2.md con todo lo anterior y un plan de corrección priorizado por
impacto. Haz commit solo de ese documento. Después dame un resumen de máximo 25 líneas
con la causa raíz del bug y los 5 problemas más graves.
```

### F1 — Render y mejora progresiva

```
Lee RULES.md (con la ADENDA FASE 2), docs/AUDIT-F2.md y docs/STATE.md.

Ejecuta la sesión F1: que el sitio se vea.

1. Corrige la causa raíz identificada en la auditoría, no el síntoma.
2. Aplica la regla A2 en todo el proyecto:
   - El estado por defecto de cualquier elemento es VISIBLE. El script añade una clase al
     <html> y solo entonces el CSS oculta y anima.
   - Cada script de src/scripts/ se inicializa de forma independiente y sale sin lanzar si
     su elemento no existe en la página actual. Una excepción en uno no puede tumbar a los
     demás.
   - Revisa uno por uno: countdown, nav, lazy-video, reveal.
3. Crea scripts/check-render.mjs con Playwright como guard anti-regresión: recorre todas
   las rutas con JS habilitado y deshabilitado y falla si algún bloque de texto principal
   no es visible, o si algún elemento del primer viewport tiene opacidad computada 0.
   Añádelo como script de package.json y documenta cómo se corre.
4. Comprueba que el contador, el video y el menú siguen funcionando después del cambio.

No toques todavía el sistema de pantalla ni la fidelidad visual: eso es F2 y F4/F5.

Cierra según el protocolo de AGENTS.md, con bitácora en docs/sessions/F1-render.md.
```

### F2 — Sistema de pantalla

```
Lee RULES.md (ADENDA FASE 2, regla A3), docs/AUDIT-F2.md y docs/STATE.md.

Ejecuta la sesión F2: que cada sección que en el PDF ocupa una diapositiva ocupe una
pantalla completa, sin cortar contenido.

1. Crea el componente Screen único y migra todas las secciones a él. Ninguna página define
   altura de pantalla por su cuenta.
2. Implementa la escala proporcional al lienzo 1920x1080 descrita en A3: el contenedor
   define su font-size con clamp(0.72rem, min(0.833vw, 1.481vh), 1.15rem) y todo lo de
   dentro se expresa en em. Verifica esa fórmula en la práctica y ajústala si hace falta,
   explicando el porqué.
3. Convierte los tamaños fijos en px que hayan quedado dentro de las secciones a em o a
   tokens que escalen. Reporta los que decidas dejar en px y por qué.
4. Aplica la válvula de escape: si al mínimo de escala el contenido no cabe, la sección
   crece y deja fluir el scroll. Prohibido overflow:hidden para tapar desbordes.
5. Escribe scripts/check-overflow.mjs con Playwright: recorre todas las rutas en 1920x1080,
   1600x900, 1440x900, 1366x768, 1280x720 y 390x844, y reporta toda sección que desborde
   la altura del viewport o cualquier elemento más ancho que el viewport.
6. Deja el reporte de ese script en la bitácora, resolución por resolución.

1366x768 es el caso que más me preocupa: préstale atención especial.

Cierra según el protocolo, bitácora en docs/sessions/F2-screen-system.md.
```

### F3 — Arquitectura, datos y limpieza

```
Lee RULES.md (ADENDA FASE 2, regla A4), docs/AUDIT-F2.md y docs/STATE.md.

Ejecuta la sesión F3: ordenar el código sin cambiar el resultado visual.

1. Aplica la separación por capas de A4 y su regla de dependencias en una sola dirección.
   Documenta el árbol final en docs/DESIGN-SYSTEM.md.
2. Resuelve los duplicados y solapamientos detectados en la auditoría. Presta atención a
   los pares con nombres casi iguales y a los componentes de sección que hacen lo mismo
   con distinto envoltorio: quédate con uno, parametrízalo y borra el otro.
3. Una sola fuente de verdad en src/data/: la fecha del evento, la sede, el correo, el
   Instagram y los datos de la conferencia se definen UNA vez. Si hay archivos de datos
   que se solapan, fusiónalos o delimita claramente la responsabilidad de cada uno.
4. Borra componentes sin uso y archivos sueltos que no pertenezcan al proyecto.
5. Verifica que ui/ no importa nada de data/ y que ningún componente de sections/ importa
   otro de sections/. Corrige lo que incumpla.
6. Comprueba con capturas antes/después que el resultado visual no cambió. Si algo cambió,
   dilo explícitamente.

Este es un refactor: el sitio debe verse exactamente igual al terminar, pero el código
debe quedar defendible.

Cierra según el protocolo, bitácora en docs/sessions/F3-arquitectura.md.
```

### F4 — Fidelidad: Inicio, Acerca, Equipo

```
Lee RULES.md (ADENDA FASE 2, regla A1), docs/AUDIT-F2.md y docs/STATE.md.

Ejecuta la sesión F4: fidelidad al PDF de / , /acerca y /acerca/equipo.

Método obligatorio, página por página:
1. Rasteriza la página correspondiente de design/landing.pdf a 1920x1080 y captura la ruta
   implementada al mismo tamaño.
2. Compáralas visualmente y enumera TODAS las diferencias: familia y peso tipográfico,
   tamaño relativo de cada texto, tracking e interlineado, márgenes y separaciones,
   proporciones de las cajas, colores exactos, posición de badges y chips, grosor de
   bordes, densidad de la rejilla de fondo, intensidad del degradado.
3. Corrige cada una. Recuerda RULES §4: el lenguaje visual definitivo son las páginas 9-13
   del PDF, que ya llevan la barra de navegación; las páginas 1 y 5-8 aportan contenido y
   composición pero se adaptan a ese lenguaje.
4. Vuelve a comparar y repite hasta que la única diferencia sea el contenido placeholder
   de imágenes y video.
5. Deja en la bitácora la tabla final: diferencia detectada / corregida o justificada.

Correspondencias: página 1 del PDF con el hero de / ; página 5 con /acerca ; página 12 con
/acerca/equipo ; página 8 con el CTA de cierre.

No rompas lo conseguido en F1 y F2: el contenido sigue visible sin JS y las secciones
siguen encajando en pantalla. Verifícalo con check-render y check-overflow antes de cerrar.

Cierra según el protocolo, bitácora en docs/sessions/F4-fidelidad-1.md.
```

### F5 — Fidelidad: Participaciones, Southwest, Patrocinios, Contacto

```
Lee RULES.md (ADENDA FASE 2, regla A1), docs/AUDIT-F2.md y docs/STATE.md.

Ejecuta la sesión F5 con el mismo método de F4 (rasterizar, comparar a 1920x1080,
enumerar diferencias, corregir, volver a comparar) para:
- /participaciones con la página 6 del PDF
- /participaciones/southwest-2027 con la página 7
- /patrocinios con las páginas 9, 10 y 11
- /contacto con la página 13

/patrocinios es la página más importante del sitio: es la que se le enseña a una empresa.
Es la que quiero más cerca del diseño, incluidas las tarjetas de paquete, el borde superior
destacado y la jerarquía de precios.

Deja en la bitácora la tabla de diferencias por página, y verifica con check-render y
check-overflow antes de cerrar.

Cierra según el protocolo, bitácora en docs/sessions/F5-fidelidad-2.md.
```

### F6 — Responsive y estados

```
Lee RULES.md, docs/AUDIT-F2.md y docs/STATE.md.

Ejecuta la sesión F6: responsive real y estados de interfaz.

1. Recorre todas las rutas en 360x800, 390x844, 768x1024, 1024x768 (horizontal),
   1366x768, 1440x900 y 1920x1080. Corrige todo desbordamiento, texto cortado, imagen
   deformada y scroll horizontal.
2. Presta atención a las pantallas de poca altura: portátiles de 768px de alto y móviles
   en horizontal. Es donde el sistema de pantalla se rompe.
3. Revisa los estados: hover, focus-visible, enlace activo, submenú abierto, menú móvil
   abierto, video antes de cargar, video pausado, contador después de la fecha del evento,
   textos más largos de lo previsto, y la página 404.
4. Comprueba la navegación completa por teclado y que el foco nunca se pierde ni queda
   atrapado fuera del menú móvil.
5. Documenta en docs/DESIGN-SYSTEM.md cómo colapsa cada bloque complejo en móvil.

Cierra según el protocolo, bitácora en docs/sessions/F6-responsive.md.
```

### F7 — Rendimiento, accesibilidad y SEO

```
Lee RULES.md (§12, §13, §14 y la regla A5 de la adenda), docs/AUDIT-F2.md y
docs/PERFORMANCE.md.

Ejecuta la sesión F7: medición honesta y corrección.

1. Mide de nuevo, sobre el build de producción, todas las rutas: Lighthouse móvil y
   escritorio, peso de dist/, JS y CSS por ruta, requests a terceros. No heredes ningún
   número de docs/PERFORMANCE.md: reemplázalos por mediciones nuevas.
2. Verifica en la pestaña Network que el video sigue sin descargar un solo byte hasta
   entrar al viewport, y que sigue habiendo 0 requests a terceros.
3. Corrige lo que no cumpla los presupuestos de RULES §12. Si algo no se alcanza, dilo con
   el número real y explica por qué, en vez de darlo por bueno.
4. Auditoría de accesibilidad completa: contraste sobre los colores finales, jerarquía de
   encabezados, landmarks, aria, reduced-motion, lectores de pantalla.
5. Revisa SEO: metadatos por ruta, canonical, OG, JSON-LD del evento, sitemap y robots.
6. Reescribe docs/PERFORMANCE.md con los datos nuevos y una nota de cuándo se midieron.

Cierra según el protocolo, bitácora en docs/sessions/F7-perf-a11y-seo.md.
```

### F8 — Re-captura, documentación y cierre

```
Lee RULES.md, docs/STATE.md y las bitácoras de la fase 2 en docs/sessions/.

Ejecuta la sesión F8: cierre de la fase.

1. Ejecuta bun run capture y regenera todas las capturas y screencasts con el sitio ya
   corregido. Verifica que el material nuevo refleja el estado real: el script fuerza el
   estado final de los reveals, así que comprueba aparte que lo capturado coincide con lo
   que se ve en un navegador normal.
2. Actualiza docs/SITE-CONTEXT.md, docs/VIDEO-BRIEF.md y docs/SHOTLIST.md con los cambios
   de esta fase.
3. Actualiza README.md, docs/DESIGN-SYSTEM.md, docs/ASSETS.md, docs/DEPLOY.md y
   docs/STATE.md.
4. Deja docs/TODO.md solo con lo que sigue pendiente de mí, y docs/BACKLOG.md con lo que
   queda fuera de alcance.
5. Ejecuta los tres guards (check-render, check-overflow, gates de build) y deja el
   resultado en la bitácora.

Después dame el cierre de la fase 2: qué estaba mal, qué se corrigió, qué quedó
deliberadamente distinto al PDF y por qué, y qué necesito decidir yo antes de publicar.

Cierra según el protocolo, bitácora en docs/sessions/F8-cierre-fase-2.md.
```

---

## 6. PROMPTS DE UTILIDAD

### Retomar una sesión parcial

```
La sesión F<N> quedó PARCIAL. Lee RULES.md, docs/STATE.md y la bitácora de esa sesión.
Retoma exactamente la lista de pendientes que dejaste y ciérrala. No avances a la
siguiente ni amplíes el alcance.
```

### Comparación puntual contra el PDF

```
Compara únicamente <ruta> con la página <N> de design/landing.pdf. Rasteriza a 1920x1080,
captura la ruta al mismo tamaño, ponlas lado a lado y dame la lista de diferencias
ordenada por lo que más se nota a simple vista. No corrijas nada todavía.
```

### Sustituir medios reales

```
Lee RULES.md §10 y §11, docs/ASSETS.md y docs/VIDEO.md. Coloqué los archivos definitivos
en public/media/. Verifica proporción, peso y límites; reencoda lo que haga falta;
regenera posters; actualiza los alt con la descripción real; vuelve a medir rendimiento
en las rutas afectadas; y ejecuta bun run capture.

Avísame si algún archivo supera los límites en vez de publicarlo tal cual.
```

---

## 7. PENDIENTE QUE NO ES DEL AGENTE

- **Solo hay un video** en `public/media/video/` (`about-highlight.mp4`), y el plan preveía al menos dos. Decide dónde va el segundo (lo natural es el hero de `/patrocinios`) y díselo al agente en F5.
- Siguen abiertos los `[PENDIENTE-USUARIO]` de `RULES.md §19`: moneda de los paquetes, correo oficial, nombres de la mesa directiva, destino del botón Únete y dominio final. Revisa `docs/TODO.md` y resuélvelos antes de F8.
