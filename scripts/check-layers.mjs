/**
 * scripts/check-layers.mjs — guard de arquitectura por capas (ADENDA §A4).
 *
 * §A4 fija una separación por capas con dependencias en **una sola
 * dirección**. Es una regla fácil de romper sin darse cuenta: basta con
 * un `import` cómodo. Este script la hace verificable.
 *
 *   data/     Fuente de verdad. No importa nada de UI.
 *   ui/       Primitivas sin dominio. NO importan valores de data/.
 *   media/    Primitivas de imagen y video.
 *   layout/   Chrome del sitio (nav, footer).
 *   sections/ Bloques con dominio. Consumen data/ y componen ui/.
 *             NO se importan entre sí.
 *   layouts/  Chrome de página.
 *   pages/    Composición y SEO.
 *   scripts/  Comportamiento de cliente, aislado.
 *
 * Matiz sobre `ui/` y los tipos: se permite `import type` desde `data/`.
 * Un tipo desaparece en el build, no crea dependencia en tiempo de
 * ejecución, y la alternativa —redeclarar la forma del dato dentro del
 * componente— sería duplicación, justo lo que §A4 quiere evitar.
 * Importar **valores** desde `ui/` sí es violación.
 *
 * Uso:
 *   bun run check:layers
 *
 * Salida: 0 si la arquitectura se respeta, 1 si hay violaciones.
 */

import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import path from 'node:path';

const SRC = 'src';

/** Capa a la que pertenece un archivo. */
function layerOf(file) {
    const p = file.replaceAll('\\', '/');
    if (p.includes('/components/ui/')) return 'ui';
    if (p.includes('/components/media/')) return 'media';
    if (p.includes('/components/layout/')) return 'layout';
    if (p.includes('/components/sections/')) return 'sections';
    if (p.includes('/data/')) return 'data';
    if (p.includes('/layouts/')) return 'layouts';
    if (p.includes('/pages/')) return 'pages';
    if (p.includes('/scripts/')) return 'scripts';
    if (p.includes('/styles/')) return 'styles';
    return 'otro';
}

/**
 * Reglas prohibidas. Cada una devuelve un motivo si la arista la
 * incumple, o `null` si es legítima.
 */
const RULES = [
    {
        id: 'ui-no-data',
        check: (from, to, typeOnly) =>
            from === 'ui' && to === 'data' && !typeOnly
                ? 'ui/ no puede importar VALORES de data/: las primitivas reciben sus datos por props'
                : null,
    },
    {
        id: 'sections-no-sections',
        check: (from, to) =>
            from === 'sections' && to === 'sections'
                ? 'sections/ no puede importar sections/: lo compartido se sube a ui/ y se parametriza'
                : null,
    },
    {
        id: 'data-no-ui',
        check: (from, to) =>
            from === 'data' && ['ui', 'sections', 'media', 'layout', 'layouts', 'pages'].includes(to)
                ? 'data/ es la fuente de verdad y no puede depender de la UI'
                : null,
    },
    {
        id: 'ui-no-sections',
        check: (from, to) =>
            from === 'ui' && to === 'sections'
                ? 'ui/ no puede depender de sections/: la dirección es sections → ui'
                : null,
    },
    {
        id: 'sections-no-layout',
        check: (from, to) =>
            from === 'sections' && to === 'layout'
                ? 'sections/ no puede importar layout/: el chrome es de layouts/, y lo compartido va a ui/'
                : null,
    },
    {
        id: 'layouts-no-sections',
        check: (from, to) =>
            from === 'layouts' && to === 'sections'
                ? 'layouts/ es el chrome de página; las secciones las compone pages/'
                : null,
    },
];

/* ---------- recolección de aristas ------------------------------- */

const files = globSync(`${SRC}/**/*.{astro,ts}`);
const IMPORT_RE = /import\s+(type\s+)?(?:[\w{},\s*]+?\s+from\s+)?['"](\.[^'"]+)['"]/g;

const edges = [];
for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(IMPORT_RE)) {
        const typeOnly =
            Boolean(m[1]) || /import\s+type\s/.test(m[0]) || /\{\s*type\s/.test(m[0]);
        const target = path
            .normalize(path.join(path.dirname(file), m[2]))
            .replaceAll('\\', '/');
        edges.push({
            file: file.replaceAll('\\', '/'),
            target,
            from: layerOf(file),
            to: layerOf(target),
            typeOnly,
        });
    }
}

/* ---------- verificación ------------------------------------------ */

const violations = [];
for (const e of edges) {
    for (const rule of RULES) {
        const why = rule.check(e.from, e.to, e.typeOnly);
        if (why) violations.push({ ...e, rule: rule.id, why });
    }
}

/* ---------- informe ------------------------------------------------ */

const matrix = new Map();
for (const e of edges) {
    if (e.from === e.to || e.to === 'otro') continue;
    const k = `${e.from} → ${e.to}`;
    matrix.set(k, (matrix.get(k) ?? 0) + 1);
}

console.log('\ncheck-layers — dependencias entre capas (ADENDA §A4)\n');
for (const [k, n] of [...matrix.entries()].sort()) {
    console.log(`  ${k.padEnd(26)} ${String(n).padStart(3)}`);
}

const typeOnlyUiData = edges.filter(
    (e) => e.from === 'ui' && e.to === 'data' && e.typeOnly,
);
if (typeOnlyUiData.length) {
    console.log('\n  ui/ → data/ sólo de tipos (permitido):');
    for (const e of typeOnlyUiData) {
        console.log(`    ${e.file}  →  ${e.target}`);
    }
}

console.log('');
if (violations.length === 0) {
    console.log(`✓ check-layers: ${edges.length} imports, arquitectura respetada.\n`);
    process.exit(0);
}

console.error(`✗ check-layers: ${violations.length} violación(es):\n`);
for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}`);
    console.error(`      → ${v.target}`);
    console.error(`      ${v.why}\n`);
}
process.exit(1);
