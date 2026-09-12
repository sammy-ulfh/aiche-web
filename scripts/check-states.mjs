/**
 * scripts/check-states.mjs — control de estados de interfaz y teclado (F6).
 *
 * `check-render` comprueba que el contenido EXISTE y `check-overflow` que
 * CABE. Faltaba lo tercero: que el sitio se comporte cuando el usuario lo
 * toca. Este script recorre el build de producción y verifica:
 *
 *   1. **Foco visible.** Cada elemento enfocable de cada ruta recibe el
 *      foco y se comprueba que el navegador pinta un indicador real
 *      (outline con grosor, o un `box-shadow` que aparece con el foco).
 *      RULES §13 prohíbe quitar el outline; esto lo verifica en vez de
 *      confiar en que nadie lo haya hecho.
 *   2. **Enlace activo.** `aria-current="page"` en el item del nav que
 *      corresponde a la ruta, y en ningún otro (RULES §7.4).
 *   3. **Submenú de escritorio.** Cerrado de partida (`display:none`), se
 *      abre al enfocar el padre con teclado (`:focus-within`) y sus hijos
 *      entran en el orden de tabulación (RULES §7.2, D-138).
 *   4. **Menú móvil.** `aria-expanded`, foco que entra al panel, focus
 *      trap que da la vuelta sin escaparse, `Escape` que cierra y
 *      devuelve el foco a la hamburguesa, y scroll del body bloqueado
 *      (RULES §7.3).
 *   5. **Recorrido completo por teclado.** Se tabula por toda la página y
 *      se comprueba que el foco nunca se pierde (nunca vuelve a `body`
 *      antes de tiempo), que el primer parada es el skip link y que se
 *      llega hasta el footer.
 *   6. **Video antes de cargar y en pausa.** Sin `src` ni `<source>` hasta
 *      entrar al viewport, con su capa de póster `<img loading="lazy">`
 *      puesta (desde F7 el póster ya no va en el atributo `poster`, que
 *      el navegador descarga siempre); al entrar, fuentes inyectadas; al
 *      salir, en pausa (RULES §11.2).
 *   7. **Contador después de la fecha.** Se reescribe `data-target` al
 *      pasado antes de que corra el script: cajas ocultas, mensaje
 *      post-evento visible, eyebrow «FALTAN» oculto y **cero números
 *      negativos** en la pantalla (RULES §15).
 *   8. **Textos más largos de lo previsto.** Se sustituyen títulos y
 *      cuerpos por versiones el triple de largas, con una palabra
 *      inseparable de 40 caracteres, y se comprueba que no aparece
 *      scroll horizontal ni texto recortado.
 *
 * Uso:
 *   bun run build && bun run check:states
 *   bun run check:states -- --base http://localhost:4321
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

/** Un viewport de lienzo y uno apilado: los estados difieren en los dos. */
const CANVAS_VP = { width: 1440, height: 900 };
const STACKED_VP = { width: 390, height: 844 };

const PORT = 4321;
const argBase = (() => {
    const i = process.argv.indexOf('--base');
    return i !== -1 ? process.argv[i + 1] : null;
})();

const FOCUSABLE =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const fails = [];
const notes = [];
const fail = (msg) => fails.push(msg);
const ok = (msg) => notes.push(msg);

/* ---------- servidor ---------------------------------------------- */

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

async function startPreview() {
    const base = `http://localhost:${PORT}`;
    if (await waitForServer(base, 1200)) return { base, started: false };
    spawn('bunx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
    if (!(await waitForServer(base))) {
        throw new Error('El preview no respondió. ¿Ejecutaste `bun run build`?');
    }
    return { base, started: true };
}

function stopPreview(preview) {
    if (!preview?.started) return;
    try {
        spawnSync('bunx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
    } catch {
        /* no es motivo para fallar el chequeo */
    }
}

/* ---------- 1. foco visible --------------------------------------- */

async function checkFocusRings(page, route, label) {
    const bad = await page.evaluate((sel) => {
        const out = [];
        const els = [...document.querySelectorAll(sel)].filter((el) => {
            const r = el.getBoundingClientRect();
            const st = getComputedStyle(el);
            return st.display !== 'none' && st.visibility !== 'hidden' && (r.width || r.height);
        });
        for (const el of els) {
            const before = getComputedStyle(el);
            const beforeShadow = before.boxShadow;
            el.focus({ preventScroll: true });
            const after = getComputedStyle(el);
            const width = parseFloat(after.outlineWidth) || 0;
            const solid = after.outlineStyle !== 'none' && width > 0;
            const shadowChanged = after.boxShadow !== beforeShadow && after.boxShadow !== 'none';
            if (!solid && !shadowChanged) {
                const name =
                    el.tagName.toLowerCase() +
                    (el.id ? '#' + el.id : '') +
                    ' «' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) + '»';
                out.push(name);
            }
            el.blur();
        }
        return { bad: out, total: els.length };
    }, FOCUSABLE);

    if (bad.bad.length) {
        fail(`[foco] ${label} ${route}: ${bad.bad.length}/${bad.total} enfocables sin indicador → ${bad.bad.slice(0, 4).join(' · ')}`);
    } else {
        ok(`[foco] ${label} ${route}: ${bad.total}/${bad.total} con indicador`);
    }
}

/* ---------- 2. enlace activo -------------------------------------- */

async function checkActiveLink(page, route) {
    const r = await page.evaluate(() => {
        const norm = (p) => p.replace(/\/+$/, '') || '/';
        const here = norm(location.pathname);
        const marked = [...document.querySelectorAll('header [aria-current]')].map((a) => ({
            href: norm(new URL(a.getAttribute('href'), location.href).pathname),
            value: a.getAttribute('aria-current'),
        }));
        return { here, marked };
    });
    // `/404` no está en el menú: lo correcto es que NADIE quede marcado como página.
    const pages = r.marked.filter((m) => m.value === 'page');
    const is404 = route === '/404';
    if (is404) {
        if (pages.length) fail(`[activo] /404 marca ${pages.length} enlace(s) como página actual`);
        else ok('[activo] /404 no marca ningún enlace: correcto');
        return;
    }
    // El nav duplica enlaces (escritorio + panel móvil): lo que importa es que
    // TODOS los marcados apunten a la ruta actual y que haya al menos uno.
    const wrong = pages.filter((m) => m.href !== r.here);
    if (!pages.length) fail(`[activo] ${route}: ningún enlace con aria-current="page"`);
    else if (wrong.length) fail(`[activo] ${route}: ${wrong.length} marcado(s) apuntan a otra ruta`);
    else ok(`[activo] ${route}: ${pages.length} enlace(s) correctos`);
}

/* ---------- 3. submenú de escritorio ------------------------------ */

async function checkSubmenu(page) {
    const r = await page.evaluate(() => {
        const dd = document.querySelector('[data-dropdown]');
        if (!dd) return { error: 'no hay [data-dropdown]' };
        const panel = dd.querySelector('[data-dropdown-panel]');
        const parent = dd.querySelector('a');
        const closed = getComputedStyle(panel).display;
        parent.focus({ preventScroll: true });
        const openOnFocus = getComputedStyle(panel).display;
        const childrenReachable = [...panel.querySelectorAll('a[href]')].every(
            (a) => a.offsetParent !== null || getComputedStyle(a).display !== 'none',
        );
        parent.blur();
        const closedAgain = getComputedStyle(panel).display;
        return { closed, openOnFocus, closedAgain, childrenReachable, kids: panel.querySelectorAll('a').length };
    });
    if (r.error) return fail(`[submenú] ${r.error}`);
    if (r.closed !== 'none') fail(`[submenú] arranca abierto (display:${r.closed})`);
    else if (r.openOnFocus === 'none') fail('[submenú] no se abre al enfocar el padre con teclado');
    else if (!r.childrenReachable) fail('[submenú] los hijos no son alcanzables con el panel abierto');
    else if (r.closedAgain !== 'none') fail('[submenú] no se cierra al salir el foco');
    else ok(`[submenú] cerrado → abre con :focus-within (${r.kids} hijos) → cierra`);
}

/* ---------- 4. menú móvil ----------------------------------------- */

async function checkMobileMenu(page) {
    const toggle = page.locator('[data-mobile-toggle]').first();

    const initial = await page.evaluate(() => ({
        expanded: document.querySelector('[data-mobile-toggle]').getAttribute('aria-expanded'),
        display: getComputedStyle(document.querySelector('[data-mobile-panel]')).display,
        bodyOverflow: document.body.style.overflow,
    }));
    if (initial.expanded !== 'false') fail(`[móvil] aria-expanded inicial = ${initial.expanded}`);
    if (initial.display !== 'none') fail(`[móvil] el panel arranca visible (${initial.display})`);

    await toggle.click();
    await page.waitForTimeout(120);

    const opened = await page.evaluate(() => {
        const panel = document.querySelector('[data-mobile-panel]');
        return {
            expanded: document.querySelector('[data-mobile-toggle]').getAttribute('aria-expanded'),
            display: getComputedStyle(panel).display,
            focusInside: panel.contains(document.activeElement),
            bodyOverflow: document.body.style.overflow,
            focusables: panel.querySelectorAll('a[href], button:not([disabled])').length,
        };
    });
    if (opened.expanded !== 'true') fail(`[móvil] aria-expanded tras abrir = ${opened.expanded}`);
    if (opened.display === 'none') fail('[móvil] el panel no se muestra al abrir');
    if (!opened.focusInside) fail('[móvil] el foco no entra al panel al abrirlo');
    if (opened.bodyOverflow !== 'hidden') fail(`[móvil] el scroll del body no se bloquea (${opened.bodyOverflow || 'vacío'})`);

    // Focus trap: dar dos vueltas completas y comprobar que nunca se sale.
    let escaped = 0;
    for (let i = 0; i < opened.focusables * 2 + 3; i++) {
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(() =>
            document.querySelector('[data-mobile-panel]').contains(document.activeElement),
        );
        if (!inside) escaped++;
    }
    if (escaped) fail(`[móvil] el foco se escapó del panel ${escaped} vez/veces con Tab`);
    else ok(`[móvil] focus trap: ${opened.focusables * 2 + 3} pulsaciones de Tab sin salir del panel`);

    // Shift+Tab también da la vuelta hacia atrás.
    let escapedBack = 0;
    for (let i = 0; i < opened.focusables + 2; i++) {
        await page.keyboard.press('Shift+Tab');
        const inside = await page.evaluate(() =>
            document.querySelector('[data-mobile-panel]').contains(document.activeElement),
        );
        if (!inside) escapedBack++;
    }
    if (escapedBack) fail(`[móvil] el foco se escapó hacia atrás ${escapedBack} vez/veces`);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    const closed = await page.evaluate(() => ({
        expanded: document.querySelector('[data-mobile-toggle]').getAttribute('aria-expanded'),
        display: getComputedStyle(document.querySelector('[data-mobile-panel]')).display,
        focusOnOpener: document.activeElement === document.querySelector('[data-mobile-toggle]'),
        bodyOverflow: document.body.style.overflow,
    }));
    if (closed.expanded !== 'false') fail(`[móvil] Escape no restaura aria-expanded (${closed.expanded})`);
    if (closed.display !== 'none') fail('[móvil] Escape no cierra el panel');
    if (!closed.focusOnOpener) fail('[móvil] Escape no devuelve el foco a la hamburguesa');
    if (closed.bodyOverflow === 'hidden') fail('[móvil] el scroll del body sigue bloqueado tras cerrar');
    if (closed.expanded === 'false' && closed.display === 'none' && closed.focusOnOpener)
        ok('[móvil] Escape cierra, devuelve el foco y libera el scroll');
}

/* ---------- 5. recorrido completo por teclado --------------------- */

async function checkTabOrder(page, route, label) {
    /**
     * Qué se exige aquí, exactamente:
     *  - la primera parada es el skip link (RULES §7.5);
     *  - la tabulación llega hasta el footer sin salirse antes;
     *  - **el foco nunca cae en algo que no se ve.** Ese es el «foco
     *    perdido» de verdad: un elemento enfocable pero sin caja
     *    renderizada (un panel cerrado que se dejó en el orden de
     *    tabulación) deja al usuario de teclado sin saber dónde está.
     *    Se exceptúa el skip link, que es `sr-only` **por diseño** y
     *    aparece justo al recibir el foco.
     */
    const visible = await page.evaluate(
        (sel) => [...document.querySelectorAll(sel)].filter((el) => el.getClientRects().length).length,
        FOCUSABLE,
    );
    const seen = [];
    const invisibleStops = [];
    const steps = Math.min(visible + 6, 90);
    for (let i = 0; i < steps; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
            const a = document.activeElement;
            if (!a || a === document.body) return null;
            return {
                tag: a.tagName.toLowerCase(),
                text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 28),
                inFooter: !!a.closest('footer'),
                rendered: a.getClientRects().length > 0,
                isSkip: /saltar al contenido/i.test(a.textContent || ''),
            };
        });
        // Volver a `body` = el foco salió del documento hacia el navegador.
        // Es el final legítimo del recorrido.
        if (!info) break;
        if (!info.rendered && !info.isSkip) invisibleStops.push(info.text || info.tag);
        seen.push(info);
    }

    const first = seen[0];
    if (!first || !first.isSkip) {
        fail(`[teclado] ${label} ${route}: la primera parada no es el skip link (fue «${first?.text ?? 'nada'}»)`);
    }
    if (invisibleStops.length) {
        fail(`[teclado] ${label} ${route}: el foco cayó en ${invisibleStops.length} elemento(s) no renderizados → ${invisibleStops.slice(0, 3).join(' · ')}`);
    }
    const reachedFooter = seen.some((s) => s.inFooter);
    if (!reachedFooter) fail(`[teclado] ${label} ${route}: la tabulación no llega al footer`);
    if (first?.isSkip && !invisibleStops.length && reachedFooter)
        ok(`[teclado] ${label} ${route}: ${seen.length} paradas visibles, skip link primero, llega al footer`);
}

/* ---------- 6. video antes de cargar / en pausa ------------------- */

async function checkVideo(page, route) {
    const start = await page.evaluate(() => {
        const fig = document.querySelector('[data-lazy-video]');
        if (!fig) return null;
        const v = fig.querySelector('[data-lazy-video-el]');
        const r = fig.getBoundingClientRect();
        return {
            // Un video que ya está en el primer viewport DEBE cargarse: ahí
            // "sin fuentes" sería el defecto, no el requisito. El estado
            // «antes de cargar» sólo se puede exigir al que arranca fuera.
            offscreen: r.top > window.innerHeight,
            sources: v.querySelectorAll('source').length,
            hasSrc: !!v.getAttribute('src'),
            // El póster ya no va en el atributo `poster` del <video>: ahí el
            // navegador lo descarga aunque el video esté bajo el pliegue y
            // aunque haya preload="none". Desde F7 es una capa
            // `<img loading="lazy">` dentro del mismo <figure>
            // (LazyVideo.astro §2b). Lo que hay que garantizar sigue siendo
            // lo mismo: que haya póster visible antes de cargar el video.
            poster: fig.querySelector('img[loading="lazy"]')?.getAttribute('src') || '',
            posterEager: !!fig.querySelector('img:not([loading="lazy"])'),
            preload: v.getAttribute('preload'),
        };
    });
    if (!start) return;

    if (!start.poster) fail(`[video] ${route}: sin capa de póster`);
    if (start.posterEager)
        fail(`[video] ${route}: la capa de póster no lleva loading="lazy"`);
    if (start.preload !== 'none') fail(`[video] ${route}: preload=${start.preload}, debe ser "none"`);
    if (start.hasSrc) fail(`[video] ${route}: el <video> lleva src en el HTML servido`);
    if (start.offscreen && start.sources)
        fail(`[video] ${route}: trae ${start.sources} fuente(s) sin haber entrado al viewport`);

    // Entrar al viewport: las fuentes deben aparecer.
    await page.evaluate(() =>
        document.querySelector('[data-lazy-video]').scrollIntoView({ block: 'center' }),
    );
    let injected = 0;
    for (let i = 0; i < 20 && !injected; i++) {
        await page.waitForTimeout(150);
        injected = await page.evaluate(
            () => document.querySelector('[data-lazy-video-el]').querySelectorAll('source').length,
        );
    }
    if (!injected) fail(`[video] ${route}: no inyecta fuentes al entrar al viewport`);

    // Salir del viewport: debe quedar en pausa.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    let paused = false;
    for (let i = 0; i < 12 && !paused; i++) {
        await page.waitForTimeout(150);
        paused = await page.evaluate(() => document.querySelector('[data-lazy-video-el]').paused);
    }
    if (!paused) fail(`[video] ${route}: sigue reproduciéndose fuera del viewport`);
    if (injected && paused)
        ok(`[video] ${route}: ${start.offscreen ? 'sin fuentes fuera del viewport → ' : ''}inyecta al entrar (${injected}) → pausa al salir`);
    await page.evaluate(() => window.scrollTo(0, 0));
}

/* ---------- 7. contador después de la fecha ----------------------- */

async function checkCountdownPostEvent(page, base) {
    // Reescribir `data-target` al pasado ANTES de que corra el script del
    // contador: así se prueba el camino real, no un estado pintado a mano.
    await page.addInitScript(() => {
        document.addEventListener(
            'readystatechange',
            () => {
                document.querySelectorAll('[data-countdown]').forEach((el) => {
                    el.setAttribute('data-target', '2020-01-01T00:00:00-06:00');
                });
            },
            true,
        );
    });
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1400);

    const r = await page.evaluate(() => {
        const root = document.querySelector('[data-countdown]');
        if (!root) return null;
        const vis = (el) => !!el && !el.hidden && getComputedStyle(el).display !== 'none';
        return {
            boxes: vis(root.querySelector('[data-cd-boxes]')),
            post: vis(root.querySelector('[data-cd-post]')),
            postText: (root.querySelector('[data-cd-post]')?.textContent || '').trim(),
            eyebrow: vis(root.querySelector('[data-cd-eyebrow]')),
            srText: (root.querySelector('[data-cd-sr]')?.textContent || '').trim(),
            negative: /-\d/.test(root.textContent || ''),
        };
    });
    if (!r) return fail('[contador] no se encontró [data-countdown] en /');
    if (r.boxes) fail('[contador] post-evento: las cajas DÍAS/HORAS/MIN/SEG siguen visibles');
    if (!r.post || !r.postText) fail('[contador] post-evento: no aparece el mensaje');
    if (r.eyebrow) fail('[contador] post-evento: el eyebrow «FALTAN» sigue visible');
    if (r.negative) fail('[contador] post-evento: hay números negativos en pantalla');
    if (/^faltan/i.test(r.srText)) fail('[contador] post-evento: el texto accesible sigue diciendo «Faltan…»');
    if (!r.boxes && r.post && !r.eyebrow && !r.negative)
        ok(`[contador] post-evento: cajas ocultas, sin negativos, mensaje «${r.postText}»`);
}

/* ---------- 8. hover -------------------------------------------- */

/**
 * Cada elemento interactivo debe reaccionar al ratón, no sólo al foco.
 * Se comparan color, fondo, borde y opacidad antes y después de pasar el
 * puntero por encima; si no cambia nada, el elemento no tiene estado de
 * hover y el usuario no sabe que es pulsable.
 */
async function checkHover(page, route, label) {
    const targets = await page.evaluate(() => {
        const out = [];
        const els = [...document.querySelectorAll('a[href], button:not([disabled])')];
        els.forEach((el, i) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return;
            if (r.top < 0 || r.bottom > window.innerHeight) return;
            el.setAttribute('data-hover-probe', String(i));
            out.push(String(i));
        });
        return out;
    });

    /**
     * Firma visual del elemento **y de sus descendientes**: muchos
     * componentes cambian un hijo con `group-hover`, y mirar sólo al
     * ancestro daría un falso negativo.
     */
    const SIGNATURE = (s) => {
        const root = document.querySelector(s);
        const props = (el) => {
            const st = getComputedStyle(el);
            return [st.color, st.backgroundColor, st.borderColor, st.opacity, st.textDecorationLine].join(',');
        };
        return [root, ...root.querySelectorAll('*')].map(props).join('|');
    };

    const dead = [];
    for (const id of targets.slice(0, 12)) {
        const sel = `[data-hover-probe="${id}"]`;
        // El ratón de Playwright arranca en (0,0) y se queda donde lo dejó
        // la iteración anterior: si eso cae encima del elemento que vamos a
        // medir, el estado «antes» ya viene con el hover puesto y el
        // elemento parece muerto. Se aparca fuera antes de cada medida.
        await page.mouse.move(page.viewportSize().width - 1, page.viewportSize().height - 1);
        await page.waitForTimeout(40);
        const before = await page.evaluate(SIGNATURE, sel);
        await page.hover(sel, { force: true }).catch(() => {});
        await page.waitForTimeout(60);
        const after = await page.evaluate(SIGNATURE, sel);
        if (before === after) {
            const name = await page.evaluate((s) => {
                const el = document.querySelector(s);
                const txt = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 26);
                return txt || `${el.tagName.toLowerCase()}.${String(el.className || '').split(/\s+/).slice(0, 4).join('.')}`;
            }, sel);
            dead.push(name);
        }
    }
    if (dead.length) fail(`[hover] ${label} ${route}: ${dead.length} elemento(s) sin reacción al ratón → ${dead.slice(0, 4).join(' · ')}`);
    else ok(`[hover] ${label} ${route}: ${Math.min(targets.length, 12)} elementos reaccionan al ratón`);
}

/* ---------- 8. textos más largos de lo previsto ------------------- */

async function checkLongText(page, route, label) {
    const grew = await page.evaluate(() => {
        // Triplicar cada título y cada párrafo, y meter una palabra
        // inseparable de 40 caracteres — el peor caso para un `min-width`
        // implícito de flex/grid.
        const LONGWORD = 'Supercalifragilisticoespialidosisimo1234';
        const sels = 'h1, h2, h3, p, dd, li > a, .t-body, .t-lead';
        for (const el of document.querySelectorAll(sels)) {
            if (el.children.length) continue;
            const t = (el.textContent || '').trim();
            if (!t) continue;
            el.textContent = `${t} ${t} ${LONGWORD} ${t}`;
        }
        return true;
    });
    if (!grew) return;
    await page.waitForTimeout(250);
    const r = await page.evaluate((slack) => {
        const de = document.documentElement;
        const vw = de.clientWidth;
        const wide = [];
        for (const el of document.querySelectorAll('body *')) {
            const rect = el.getBoundingClientRect();
            if (rect.width - vw > slack) {
                wide.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ` ${Math.round(rect.width)}px`);
                if (wide.length >= 4) break;
            }
        }
        return { docW: de.scrollWidth, vw, wide };
    }, 2);
    if (r.docW - r.vw > 2)
        fail(`[texto largo] ${label} ${route}: scroll horizontal (doc ${r.docW} > ${r.vw})${r.wide.length ? ' → ' + r.wide.join(' | ') : ''}`);
    else ok(`[texto largo] ${label} ${route}: sin scroll horizontal con el texto ×3 y palabra de 40 caracteres`);
}

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

console.log(`\ncheck-states — estados de interfaz y navegación por teclado`);
console.log(`base: ${base}\n`);

for (const [label, viewport] of [
    ['lienzo ', CANVAS_VP],
    ['apilado', STACKED_VP],
]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    console.log(`┌─ ${label} ${viewport.width}×${viewport.height}`);

    for (const route of ROUTES) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        // El orden NO es indiferente: `checkFocusRings` enfoca y desenfoca
        // cada elemento, y eso deja el punto de partida de la navegación
        // secuencial del navegador en el último de ellos — el Tab siguiente
        // saldría del documento. La tabulación se mide primero, sobre una
        // página recién cargada.
        await checkTabOrder(page, route, label);
        await checkFocusRings(page, route, label);
        await checkActiveLink(page, route);
        await checkHover(page, route, label);
        await checkVideo(page, route);
        console.log(`│  · ${route}`);
    }

    // Estados propios de cada régimen.
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    if (viewport.width >= 1280) await checkSubmenu(page);
    else await checkMobileMenu(page);

    // Texto largo: en las ocho rutas, no en una muestra. Es barato y es
    // justo el tipo de defecto que aparece sólo en la página que no miras.
    for (const route of ROUTES) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await checkLongText(page, route, label);
    }

    console.log('└─');
    await ctx.close();
}

// El contador post-evento se prueba una sola vez, en un contexto limpio.
{
    const ctx = await browser.newContext({ viewport: CANVAS_VP });
    const page = await ctx.newPage();
    await checkCountdownPostEvent(page, base);
    await ctx.close();
}

await browser.close();
stopPreview(preview);

/* ---------- informe ------------------------------------------------ */

console.log('\n═══ COMPROBACIONES SUPERADAS ═══\n');
const grouped = {};
for (const n of notes) {
    const k = n.slice(0, n.indexOf(']') + 1);
    (grouped[k] ||= []).push(n);
}
for (const [k, v] of Object.entries(grouped)) {
    console.log(`${k} ${v.length} comprobación(es)`);
    for (const line of v.slice(0, 2)) console.log(`   ${line.slice(k.length + 1)}`);
    if (v.length > 2) console.log(`   … y ${v.length - 2} más`);
}

if (fails.length) {
    console.error(`\n✗ check-states: ${fails.length} fallo(s)\n`);
    for (const f of fails) console.error('  ' + f);
    console.error('');
    process.exit(1);
}
console.log(`\n✓ check-states: ${notes.length} comprobaciones, 0 fallos.\n`);
process.exit(0);
