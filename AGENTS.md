# AGENTS.md — Sitio web AIChE GDL

> `CLAUDE.md` es un symlink a este archivo: editar aquí actualiza ambos.
> Este archivo se carga automáticamente al inicio de cada sesión y se mantiene **corto a propósito**.
> Las reglas completas están en **`RULES.md`**; el plan de trabajo, en **`PLAN-SESIONES.md`**. Ambos se leen al abrir cada sesión.

---

## El proyecto

Sitio **estático** del Capítulo Estudiantil **AIChE GDL — Tec de Monterrey, Campus Guadalajara**, en **Astro + Tailwind + Bun**. El diseño a replicar está en `design/landing.pdf` (solo lectura). Objetivo del sitio: presentar al capítulo y **conseguir patrocinadores** para la *2027 AIChE Southwest Student Regional Conference*.

Criterio rector: **calidad sobre velocidad**. Mejor menos alcance impecable que avanzar dejando deuda.

---

## Cómo se trabaja: sesiones

El trabajo está dividido en sesiones (S0–S10) descritas en `PLAN-SESIONES.md`.

**Al abrir una sesión:**
1. Lee `RULES.md`, `docs/STATE.md`, `docs/DECISIONS.md` y la última bitácora de `docs/sessions/`.
2. Lee la ficha de la sesión que toca en `PLAN-SESIONES.md`.
3. Verifica que arrancas en verde (`bunx astro check && bun run build`). Si no, arreglarlo es la primera tarea.
4. Escribe un plan corto y síguelo.

**Durante:** solo el alcance de la sesión. Lo demás va a `docs/BACKLOG.md`.
**Nunca te bloquees** esperando una decisión del usuario: aplica el valor por defecto documentado, márcalo `[PENDIENTE-USUARIO]` en `docs/DECISIONS.md`, aíslalo en un solo archivo y sigue.

**Al cerrar (obligatorio):** gates en verde → `docs/STATE.md` actualizado → bitácora en `docs/sessions/SXX-<slug>.md` → `DECISIONS`/`TODO`/`BACKLOG` al día → commit (Conventional Commits) → reporte corto en el chat separando **bloqueante** de **no bloqueante**.

**Si queda incompleta:** ciérrala como `PARCIAL`, lista exactamente qué falta, deja el repo compilable.

---

## Reglas no negociables

1. **Nav y footer en TODAS las páginas.** En el PDF hay diapositivas sin barra de navegación: es un artefacto del diseño, no una instrucción.
2. **Cero duplicación.** Lo que aparece dos veces vive en un componente o en un archivo de datos, nunca copiado.
3. **Cero JS innecesario.** Solo: contador, menú/dropdowns, lazy-play de video y reveal on scroll. **Sin componentes de framework** (React/Vue/Svelte/Preact), sin librerías de animación, sin jQuery, sin icon fonts.
4. **Nada carga fuera de foco.** Imágenes `loading="lazy"` salvo el LCP; videos con `preload="none"` y **sin `src` hasta entrar al viewport**.
5. **Video auto-alojado en `public/media/video/`. Decisión cerrada: nada de YouTube, Vimeo ni iframes de terceros.**
6. **Cero requests a terceros** en producción (sin Google Fonts, sin CDNs, sin analytics).
7. **No inventes copy.** Todo el texto visible sale de `RULES.md §9`. Sin lorem ipsum; sin nombres de personas o empresas inventados. Faltantes → placeholder + `docs/TODO.md`.
8. **Imágenes y videos son placeholders temporales** que el usuario sustituirá: reemplazar un archivo con el mismo nombre no debe requerir tocar código.
9. **Dependencias solo de la whitelist**: `astro`, `tailwindcss`, `@tailwindcss/vite`, `@astrojs/sitemap`, `@fontsource/libre-baskerville`, `sharp`, `playwright` (dev). Cualquier otra: preguntar.
10. **Sitio 100 % estático** (`output: 'static'`). Sin SSR, sin adaptadores, sin endpoints.
11. **`design/` es solo lectura.** Las páginas rasterizadas van a `.cache/design-pages/`.
12. **El build nunca se deja en rojo.**

Marca de identidad rápida: `#123f72` (navy), `#ffffff`, `#f4f1e9` (crema), `#000000`. Tipografías: Segoe UI (principal), Libre Baskerville Italic (secundaria), Arial (terciaria). Detalle completo en `RULES.md §5`.

---

## Comandos

Gestor de paquetes: **Bun**. No generes `package-lock.json` ni `yarn.lock`.

Servidor de desarrollo — **usar siempre modo background**:

```
bunx astro dev --background
```

Gestión del servidor: `bunx astro dev stop`, `bunx astro dev status`, `bunx astro dev logs`.

Gates antes de cerrar cualquier sesión:

```
bun install
bunx astro check      # 0 errores, 0 warnings
bun run build         # sin errores
bun run preview       # recorrer todas las rutas, 0 errores en consola
```

Más: revisar cada ruta en 360×800, 768×1024, 1440×900 y 1920×1080, sin scroll horizontal.

---

## Mapa de documentación del proyecto

| Archivo | Para qué |
|---|---|
| `RULES.md` | Reglas completas: diseño, tokens, copy verbatim, componentes, rendimiento, video, SEO |
| `PLAN-SESIONES.md` | Qué se hace en cada sesión y criterios de aceptación |
| `docs/STATE.md` | Estado real del proyecto — **fuente de verdad para reanudar** |
| `docs/sessions/` | Bitácora de cada sesión |
| `docs/DECISIONS.md` | Decisiones técnicas y pendientes del usuario |
| `docs/TODO.md` | Erratas del PDF, datos faltantes |
| `docs/BACKLOG.md` | Hallazgos fuera de alcance |
| `docs/DESIGN-SYSTEM.md` · `docs/ASSETS.md` · `docs/VIDEO.md` · `docs/PERFORMANCE.md` | Referencias temáticas |

---

## Documentación de Astro

Documentación completa: https://docs.astro.build

Consulta estas guías antes de trabajar en lo relacionado:

- [Páginas, rutas dinámicas y middleware](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
- [Contenido y content collections](https://docs.astro.build/en/guides/content-collections/)
- [Imágenes y `astro:assets`](https://docs.astro.build/en/guides/images/)

> La guía de [componentes de framework](https://docs.astro.build/en/guides/framework-components/) **no aplica**: este proyecto no usa React, Vue ni Svelte (regla 3).

**Verificación sin acceso web:** puede que no tengas navegación disponible. Nunca supongas de memoria cómo se configura una dependencia (especialmente Tailwind): verifica contra `node_modules/<paquete>/package.json`, su README y sus tipos. Si sigue habiendo duda, reporta la versión exacta y espera confirmación en vez de improvisar.
