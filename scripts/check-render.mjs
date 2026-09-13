/**
 * scripts/check-render.mjs — guard anti-regresión de render (ADENDA §A2).
 *
 * Existe por un motivo concreto: entre S02 y F1 el sitio se publicó con
 * todo el contenido invisible en un navegador normal y ninguna sesión lo
 * detectó, porque `scripts/capture.mjs` fuerza `prefers-reduced-motion:
 * reduce` — justo el único modo donde el bug no se manifestaba
 * (docs/AUDIT-F2.md §1.4). Este script cierra ese agujero.
 *
 * Qué comprueba, en TODAS las rutas y en cuatro configuraciones
 * (JS on/off × motion default/reduce):
 *
 *   1. El `<h1>` de la página es visible y tiene texto.
 *   2. Ningún elemento del primer viewport tiene opacidad computada 0
 *      **nada más cargar**, sin scroll de por medio.
 *   3. Cada bloque de texto principal (h1..h3, p, li de `<main>`) con
 *      contenido real acaba siendo visible, contando la opacidad
 *      HEREDADA de sus ancestros — que es exactamente lo que fallaba.
 *   4. Cero errores de consola y cero excepciones de página.
 *
 * Sobre el orden: con JS activado el reveal es *por scroll*, así que lo
 * que está bajo la línea de flotación empieza oculto **a propósito**. Por
 * eso la comprobación 2 se hace ANTES de mover la página, y la 3 DESPUÉS
 * de recorrerla entera. Así el guard distingue "oculto porque todavía no
 * has llegado" de "oculto y no se muestra nunca" — que es el bug real.
 * Con JS desactivado no se hace scroll: todo tiene que verse ya.
 *
 * La configuración que más importa es **JS off · motion default**: es la
 * que reproduce a un usuario real con el JS caído, y la que estaba rota.
 *
 * Uso:
 *   bun run build && bun run check:render      # arranca el preview solo
 *   bun run check:render -- --base http://localhost:4321   # servidor propio
 *
 * Salida: código 0 si todo pasa, 1 si algo falla (apto para CI).
 */

import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';

const ROUTES = [
    '/',
    '/equipo/',
    '/participaciones/',
    '/participaciones/southwest-2027/',
    '/patrocinios/',
    '/contacto/',
    '/404',
];

const MATRIX = [
    { name: 'JS on  · motion default', js: true, rm: 'no-preference' },
    { name: 'JS on  · motion reduce ', js: true, rm: 'reduce' },
    { name: 'JS off · motion default', js: false, rm: 'no-preference' },
    { name: 'JS off · motion reduce ', js: false, rm: 'reduce' },
];

const VIEWPORT = { width: 1920, height: 1080 };
const PORT = 4321;

/** Longitud mínima para considerar un nodo "bloque de texto principal". */
const MIN_TEXT = 25;

const argBase = (() => {
    const i = process.argv.indexOf('--base');
    return i !== -1 ? process.argv[i + 1] : null;
})();

/* ---------- servidor de preview ---------------------------------- */

async function waitForServer(base, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(base + '/', { redirect: 'manual' });
            if (res.status < 500) return true;
        } catch {
            /* todavía arrancando */
        }
        await new Promise((r) => setTimeout(r, 300));
    }
    return false;
}

/**
 * Arranca `astro preview`, o reutiliza el que ya esté escuchando.
 *
 * `astro preview` corre como servidor gestionado en segundo plano y se
 * niega a levantar un segundo si ya hay uno: si otro script lo dejó
 * vivo, hay que reutilizarlo en vez de fallar. `started` distingue si
 * lo levantamos nosotros, para no matar el de otra sesión al terminar.
 */
async function startPreview() {
    const base = `http://localhost:${PORT}`;
    if (await waitForServer(base, 1200)) {
        return { base, started: false };
    }
    spawn('bunx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
    if (!(await waitForServer(base))) {
        throw new Error(
            'El servidor de preview no respondió. ¿Ejecutaste `bun run build` antes?',
        );
    }
    return { base, started: true };
}

function stopPreview(preview) {
    if (!preview?.started) return;
    try {
        spawnSync('bunx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
    } catch {
        /* si no se puede parar, no es motivo para fallar el chequeo */
    }
}

/* ---------- sonda dentro de la página ----------------------------- */

/**
 * Se evalúa en el navegador. Devuelve los fallos encontrados.
 *
 * La clave está en `effectiveOpacity`: `getComputedStyle(el).opacity`
 * de un hijo devuelve 1 aunque su padre esté a 0, porque la opacidad no
 * se hereda como valor computado — se compone al pintar. Mirar sólo el
 * elemento es precisamente por lo que el bug pasó desapercibido.
 */
const PROBE = ({ minText, phase, jsEnabled }) => {
    const fails = [];

    const effectiveOpacity = (el) => {
        let node = el;
        let acc = 1;
        while (node && node.nodeType === 1) {
            const cs = getComputedStyle(node);
            if (cs.display === 'none') return 0;
            if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return 0;
            acc *= parseFloat(cs.opacity);
            if (acc < 0.05) return acc;
            node = node.parentElement;
        }
        return acc;
    };

    const hasBox = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    };

    const label = (el) => {
        const txt = (el.textContent || '').trim().replace(/\s+/g, ' ');
        return `<${el.tagName.toLowerCase()}> "${txt.slice(0, 55)}${txt.length > 55 ? '…' : ''}"`;
    };

    const main = document.querySelector('main') || document.body;

    /* ── Fase "carga": sin haber tocado el scroll todavía ──────────── */
    if (phase === 'carga') {
        /* 0. Con JS, `reveal.ts` tiene que haber tomado el control.
         *
         * Sin esta comprobación el guard sería complaciente: si el módulo
         * dejara de cargarse, el hombre muerto del <head> retiraría la
         * clase a los 2 s y la página se vería igual de bien, así que
         * todo lo demás pasaría y nadie se enteraría de que el reveal
         * está muerto. Es justo la clase de fallo silencioso que dejó el
         * sitio roto durante once sesiones. */
        if (jsEnabled && document.documentElement.dataset.revealState !== 'ready') {
            fails.push({
                kind: 'reveal-no-inicializado',
                detail:
                    'falta data-reveal-state="ready" en <html>: reveal.ts no llegó a ejecutarse ' +
                    '(el contenido se ve gracias al fallback, pero la animación está rota)',
            });
        }

        /* 1. El h1 existe, tiene texto y se ve desde el primer momento. */
        const h1 = document.querySelector('main h1, h1');
        if (!h1) {
            fails.push({ kind: 'h1-ausente', detail: 'la página no tiene <h1>' });
        } else if ((h1.textContent || '').trim().length === 0) {
            fails.push({ kind: 'h1-vacio', detail: 'el <h1> no tiene texto' });
        } else if (effectiveOpacity(h1) < 0.05 || !hasBox(h1)) {
            fails.push({
                kind: 'h1-invisible',
                detail: `${label(h1)} · opacidad efectiva ${effectiveOpacity(h1).toFixed(2)}`,
            });
        }

        /* 2. Ningún elemento del primer viewport a opacidad computada 0. */
        const vh = window.innerHeight;
        for (const el of Array.from(main.querySelectorAll('*'))) {
            if (el.closest('[hidden], template')) continue;
            const r = el.getBoundingClientRect();
            if (r.top >= vh || r.bottom <= 0) continue; // fuera del primer viewport
            if (r.width === 0 || r.height === 0) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            // Sólo el valor propio: aquí buscamos al culpable, no al hijo.
            if (parseFloat(cs.opacity) === 0) {
                fails.push({
                    kind: 'opacidad-0-en-viewport',
                    detail: `${label(el)} · class="${String(el.className).slice(0, 60)}"`,
                });
            }
        }

        return fails;
    }

    /* ── Fase "recorrida": tras pasar por toda la página ───────────── */
    const blocks = Array.from(main.querySelectorAll('h1, h2, h3, p, li'));
    for (const el of blocks) {
        const txt = (el.textContent || '').trim();
        if (txt.length < minText) continue;
        // Ignorar los nodos deliberadamente ocultos para lectores de
        // pantalla o el estado post-evento del contador.
        if (el.closest('[hidden], .sr-only, template')) continue;
        const op = effectiveOpacity(el);
        if (op < 0.05) {
            fails.push({
                kind: 'texto-invisible',
                detail: `${label(el)} · opacidad efectiva ${op.toFixed(2)}`,
            });
        }
    }

    return fails;
};

/* ---------- ejecución --------------------------------------------- */

let preview = null;
let base = argBase;

if (!base) {
    preview = await startPreview();
    base = preview.base;
} else if (!(await waitForServer(base, 5000))) {
    console.error(`✗ No hay nada escuchando en ${base}`);
    process.exit(1);
}

const browser = await chromium.launch();
const failures = [];
let checks = 0;

console.log(`\ncheck-render — ${ROUTES.length} rutas × ${MATRIX.length} configuraciones`);
console.log(`base: ${base}\n`);

for (const cfg of MATRIX) {
    const ctx = await browser.newContext({
        viewport: VIEWPORT,
        javaScriptEnabled: cfg.js,
        reducedMotion: cfg.rm,
    });

    for (const route of ROUTES) {
        const page = await ctx.newPage();
        const consoleErrors = [];
        page.on('console', (m) => {
            if (m.type() === 'error') consoleErrors.push(m.text());
        });
        page.on('pageerror', (e) => consoleErrors.push(`excepción: ${e.message}`));

        // `load` y no `networkidle`: el video de `/participaciones/` está en
        // el primer viewport y descarga en streaming, así que la red nunca
        // queda ociosa y `goto` agotaba el timeout.
        await page.goto(base + route, { waitUntil: 'load' });
        // Margen para que el reveal (y su hombre muerto de 2 s) se resuelva.
        await page.waitForTimeout(2400);

        // Fase 1: lo que ve el usuario al llegar, sin haber hecho scroll.
        const fails = await page.evaluate(PROBE, {
            minText: MIN_TEXT,
            phase: 'carga',
            jsEnabled: cfg.js,
        });

        // Fase 2: recorrer la página entera para que el reveal por scroll
        // dispare, y exigir que ya no quede texto oculto en ningún sitio.
        if (cfg.js) {
            await page.evaluate(async () => {
                const step = Math.round(window.innerHeight * 0.75);
                const end = document.documentElement.scrollHeight;
                for (let y = 0; y < end; y += step) {
                    window.scrollTo(0, y);
                    await new Promise((r) => setTimeout(r, 120));
                }
                window.scrollTo(0, end);
                await new Promise((r) => setTimeout(r, 400));
                window.scrollTo(0, 0);
                await new Promise((r) => setTimeout(r, 200));
            });
            await page.waitForTimeout(900);
        }

        fails.push(
            ...(await page.evaluate(PROBE, {
                minText: MIN_TEXT,
                phase: 'recorrida',
            })),
        );

        for (const e of consoleErrors) {
            fails.push({ kind: 'consola', detail: e });
        }

        checks++;
        const tag = `${cfg.name}  ${route}`;
        if (fails.length === 0) {
            console.log(`  ✓ ${tag}`);
        } else {
            console.log(`  ✗ ${tag}  — ${fails.length} fallo(s)`);
            for (const f of fails.slice(0, 6)) {
                console.log(`      · [${f.kind}] ${f.detail}`);
            }
            if (fails.length > 6) {
                console.log(`      · … y ${fails.length - 6} más`);
            }
            failures.push({ cfg: cfg.name, route, fails });
        }

        await page.close();
    }
    await ctx.close();
}

await browser.close();
stopPreview(preview);

console.log('');
if (failures.length === 0) {
    console.log(`✓ check-render: ${checks} comprobaciones, todo visible.\n`);
    process.exit(0);
}

const total = failures.reduce((a, f) => a + f.fails.length, 0);
console.error(
    `✗ check-render: ${failures.length} de ${checks} comprobaciones con fallos (${total} en total).\n`,
);
process.exit(1);
