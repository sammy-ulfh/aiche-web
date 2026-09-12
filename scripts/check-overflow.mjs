/**
 * scripts/check-overflow.mjs — control del sistema de pantalla (ADENDA §A3).
 *
 * Recorre las 7 rutas en las 5 resoluciones de escritorio que exige §A3
 * más un móvil, y reporta:
 *
 *   1. Toda `.screen` que desborde el alto útil del viewport
 *      (`100svh - --nav-h`), y por cuántos px. **Sólo en el régimen de
 *      lienzo** (≥1280px de ancho): por debajo de esa frontera la
 *      composición es una pila de una columna y que una sección sea más
 *      alta que la pantalla es justo lo esperado, no un defecto.
 *   2. Todo elemento más ancho que el viewport (scroll horizontal), que
 *      §A3 prohíbe sin excepciones.
 *   3. Cualquier `overflow: hidden` sobre una `.screen`, que §A3 prohíbe
 *      explícitamente porque tapa el defecto en vez de resolverlo.
 *   4. El factor de escala efectivo, para comprobar que el `clamp()`
 *      hace lo que se espera a cada resolución.
 *
 * Los desbordes de altura **no hacen fallar el script por sí solos**:
 * §A3 admite que una sección crezca y deje fluir el scroll cuando el
 * contenido no cabe ni al mínimo de escala (la válvula de escape). Lo
 * que sí es fallo duro es el scroll horizontal y el `overflow: hidden`.
 * Los desbordes verticales se reportan siempre, con su cifra, para que
 * queden en la bitácora y se pueda decidir sobre ellos.
 *
 * Uso:
 *   bun run build && bun run check:overflow
 *   bun run check:overflow -- --base http://localhost:4321
 *   bun run check:overflow -- --strict     # los desbordes también fallan
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

/**
 * Las cinco de §A3 más las de F6. 1366×768 es el caso duro del lienzo y
 * 1280×720 es su límite inferior: por debajo de 1280 de ancho el sitio
 * pasa al régimen apilado (ver `--breakpoint-canvas` en `global.css`).
 *
 * `stacked` marca los viewports que NO llevan lienzo. Ahí una sección
 * más alta que la pantalla es lo esperado —la composición es una pila de
 * una columna y el scroll es su forma normal de leerse—, así que el
 * control de altura no aplica. El de scroll horizontal sí, en todos.
 */
const CANVAS_MIN_W = 1280;
const VIEWPORTS = [
    { w: 1920, h: 1080, label: '1920×1080' },
    { w: 1600, h: 900, label: '1600×900 ' },
    { w: 1440, h: 900, label: '1440×900 ' },
    { w: 1366, h: 768, label: '1366×768 ', hard: true },
    { w: 1280, h: 720, label: '1280×720 ' },
    { w: 1024, h: 768, label: '1024×768 ' },
    { w: 768, h: 1024, label: '768×1024 ' },
    { w: 844, h: 390, label: '844×390  ', mobile: true }, // móvil apaisado
    { w: 390, h: 844, label: '390×844  ', mobile: true },
    { w: 360, h: 800, label: '360×800  ', mobile: true },
].map((vp) => ({ ...vp, stacked: vp.w < CANVAS_MIN_W }));

/** Margen de tolerancia en px: redondeos de subpíxel no son desbordes. */
const SLACK = 2;

const PORT = 4321;
const argBase = (() => {
    const i = process.argv.indexOf('--base');
    return i !== -1 ? process.argv[i + 1] : null;
})();
const STRICT = process.argv.includes('--strict');

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

/* ---------- sonda ------------------------------------------------- */

const PROBE = ({ slack, checkHeight }) => {
    const cs = getComputedStyle(document.documentElement);
    const navH = parseFloat(cs.getPropertyValue('--nav-h')) || 0;
    // `--nav-h` viene en rem: convertir a px con la base real del documento.
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const navPx = cs.getPropertyValue('--nav-h').includes('rem') ? navH * rootPx : navH;
    const avail = window.innerHeight - navPx;

    const screens = [...document.querySelectorAll('.screen')];
    const scale = screens.length
        ? parseFloat(getComputedStyle(screens[0]).fontSize)
        : null;

    const over = [];
    const hidden = [];
    for (const el of screens) {
        const r = el.getBoundingClientRect();
        const h = Math.round(r.height);
        const name =
            el.dataset.section || el.id || (el.className || '').split(' ')[1] || 'screen';
        if (checkHeight && el.dataset.screen === 'fit' && h - avail > slack) {
            over.push({ name, h, over: Math.round(h - avail) });
        }
        const ov = getComputedStyle(el);
        if (ov.overflowY === 'hidden' || ov.overflow === 'hidden') {
            hidden.push(name);
        }
    }

    // Scroll horizontal: elementos más anchos que el viewport.
    const vw = document.documentElement.clientWidth;
    const wide = [];
    for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width - vw > slack) {
            const tag = el.tagName.toLowerCase();
            const id = el.dataset.section || el.id || '';
            wide.push(`${tag}${id ? '#' + id : ''} (${Math.round(r.width)}px)`);
            if (wide.length >= 5) break;
        }
    }

    return {
        avail: Math.round(avail),
        navPx: Math.round(navPx),
        scale: scale ? Number(scale.toFixed(2)) : null,
        screens: screens.length,
        over,
        hidden,
        wide,
        docW: document.documentElement.scrollWidth,
        vw,
        docH: document.documentElement.scrollHeight,
    };
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
const rows = [];

console.log(
    `\ncheck-overflow — ${ROUTES.length} rutas × ${VIEWPORTS.length} resoluciones`,
);
console.log(`base: ${base}\n`);

for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
        viewport: { width: vp.w, height: vp.h },
        isMobile: !!vp.mobile,
        hasTouch: !!vp.mobile,
        reducedMotion: 'reduce', // el reveal no debe influir en la medida
    });
    const page = await ctx.newPage();

    console.log(
        `┌─ ${vp.label}${vp.hard ? '  ← caso duro' : ''}${vp.stacked ? '  (apilado: sin lienzo 16:9)' : ''}`,
    );

    for (const route of ROUTES) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(320);
        const d = await page.evaluate(PROBE, { slack: SLACK, checkHeight: !vp.stacked });
        rows.push({ vp: vp.label.trim(), route, ...d });

        const bits = [];
        if (d.over.length) {
            bits.push(
                'desborda: ' +
                    d.over.map((o) => `${o.name} +${o.over}px`).join(', '),
            );
        }
        if (d.wide.length) bits.push('ANCHO: ' + d.wide.join(', '));
        if (d.hidden.length) bits.push('overflow:hidden en ' + d.hidden.join(', '));

        const mark = d.wide.length || d.hidden.length ? '✗' : d.over.length ? '~' : '✓';
        console.log(
            `│  ${mark} ${route.padEnd(34)} ${String(d.screens).padStart(2)} pantallas · escala ${String(d.scale).padStart(5)}px · útil ${String(d.avail).padStart(4)}px` +
                (bits.length ? `\n│      ${bits.join(' · ')}` : ''),
        );
    }
    console.log('└─');
    await ctx.close();
}

await browser.close();
stopPreview(preview);

/* ---------- resumen ------------------------------------------------ */

console.log('\n═══ RESUMEN POR RESOLUCIÓN ═══\n');
console.log(
    'resolución   escala   pantallas   desbordan   peor desborde        scroll-x',
);
for (const vp of VIEWPORTS) {
    const rs = rows.filter((r) => r.vp === vp.label.trim());
    const total = rs.reduce((a, r) => a + r.screens, 0);
    const overs = rs.flatMap((r) => r.over.map((o) => ({ ...o, route: r.route })));
    const worst = overs.sort((a, b) => b.over - a.over)[0];
    const wide = rs.reduce((a, r) => a + r.wide.length, 0);
    console.log(
        vp.label.trim().padEnd(12),
        String(rs[0]?.scale ?? '-').padStart(5) + 'px',
        String(total).padStart(9),
        String(overs.length).padStart(10),
        (worst ? `${worst.name} +${worst.over}px` : '—').padStart(20),
        (wide ? `✗ ${wide}` : '✓ 0').padStart(9),
    );
}

const wideTotal = rows.reduce((a, r) => a + r.wide.length, 0);
const hiddenTotal = rows.reduce((a, r) => a + r.hidden.length, 0);
const overTotal = rows.reduce((a, r) => a + r.over.length, 0);

console.log('');
if (wideTotal) console.error(`✗ ${wideTotal} elemento(s) más anchos que el viewport.`);
if (hiddenTotal) console.error(`✗ ${hiddenTotal} .screen con overflow:hidden (§A3 lo prohíbe).`);
if (overTotal) {
    console.log(
        `~ ${overTotal} pantalla(s) usan la válvula de escape: crecen y dejan fluir el scroll.\n` +
            `  §A3 lo permite cuando el contenido no cabe ni al mínimo de escala.`,
    );
}

const hardFail = wideTotal > 0 || hiddenTotal > 0 || (STRICT && overTotal > 0);
if (!hardFail) {
    console.log('\n✓ check-overflow: sin scroll horizontal y sin overflow:hidden.\n');
    process.exit(0);
}
console.error('\n✗ check-overflow: hay fallos.\n');
process.exit(1);
