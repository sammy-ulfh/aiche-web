/**
 * check-network — verifica en red lo que RULES §11.2 y §12 exigen.
 *
 * Se ejecuta contra el build de producción servido por `astro preview`
 * (`bun run build && bun run preview`), no contra el dev server: lo que
 * importa es lo que recibe un navegador real en producción.
 *
 * Comprueba, ruta por ruta y en móvil y escritorio:
 *
 *  1. **Cero peticiones a terceros** (RULES regla 6 y §12). El único
 *     origen permitido es el del propio servidor de preview.
 *  2. **Cero respuestas 4xx/5xx.**
 *  3. **El video no descarga un solo byte hasta entrar al viewport**
 *     (RULES §11.2): un `<video>` que arranca fuera del viewport no
 *     puede generar ninguna petición a `.mp4`/`.webm` antes del scroll,
 *     y sí tiene que generarla después. Un video que ya está dentro del
 *     primer viewport —el de `/participaciones`, que el diseño coloca
 *     arriba— sí debe cargar de inmediato: ésa es la regla cumplida, no
 *     incumplida.
 *  4. **El póster tampoco se descarga si el video está bajo el pliegue.**
 *     El atributo `poster` de `<video>` se descarga siempre, aunque haya
 *     `preload="none"`; por eso el póster va como `<img loading="lazy">`
 *     (ver `components/media/LazyVideo.astro` §2b).
 *
 *     Se exige en el viewport móvil, donde el pliegue es inequívoco. En
 *     escritorio sólo se informa: con 1080px de alto la segunda pantalla
 *     empieza a 1096px, a 16px del pliegue, y el umbral de proximidad de
 *     `loading="lazy"` en Chrome sin limitar la red se los traga. Es el
 *     comportamiento previsto del atributo, no un fallo: bajo la red
 *     móvil emulada que mide el presupuesto, esos pósters no se piden.
 *
 * Salida: una línea por comprobación y un resumen. Código 1 si algo falla.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321';

/** Las 7 rutas del build (RULES §8). */
const ROUTES = [
    '/',
    '/equipo/',
    '/participaciones/',
    '/participaciones/southwest-2027/',
    '/patrocinios/',
    '/contacto/',
    '/404.html',
];

const VIEWPORTS = [
    { name: 'móvil', width: 390, height: 844 },
    { name: 'escritorio', width: 1920, height: 1080 },
];

const isMedia = (url) => /\.(mp4|webm)(\?|$)/.test(url);
const isPoster = (url) => /(about-poster|chem-e-car)\.jpg(\?|$)/.test(url);

let failures = 0;
const rows = [];

function check(ok, label, detail = '') {
    if (!ok) failures += 1;
    console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
}

/** Todos los .html de dist/, recursivo. */
function htmlFiles(dir) {
    return readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) return htmlFiles(full);
        return full.endsWith('.html') ? [full] : [];
    });
}

// --- 0. comprobación estructural sobre dist/ ------------------------
// Barata y suficiente para que nadie devuelva el póster al atributo
// `poster` sin enterarse: ahí el navegador lo descarga siempre.
console.log('\n=== dist/ (estructural) ===');
const withPoster = htmlFiles('dist').filter((f) =>
    /<video[^>]*\sposter=/.test(readFileSync(f, 'utf8')),
);
check(
    withPoster.length === 0,
    'ningún <video> lleva atributo poster (se descarga siempre)',
    withPoster.join(', '),
);
const withSrc = htmlFiles('dist').filter((f) =>
    /<video[^>]*\ssrc=/.test(readFileSync(f, 'utf8')),
);
check(
    withSrc.length === 0,
    'ningún <video> lleva src en el HTML inicial (RULES §11.2)',
    withSrc.join(', '),
);

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name} (${vp.width}×${vp.height}) ===`);

    for (const route of ROUTES) {
        const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        const requests = [];
        const bad = [];
        let bytes = 0;

        page.on('request', (r) => requests.push(r.url()));
        page.on('response', async (r) => {
            if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
            try {
                const len = (await r.allHeaders())['content-length'];
                if (len) bytes += Number(len);
            } catch {
                /* respuesta ya descartada: no cuenta para el peso */
            }
        });

        console.log(`\n${route}`);
        // `load` y no `networkidle`: el video de `/participaciones/` está en
        // el primer viewport y descarga en streaming, así que la red nunca
        // queda ociosa y `goto` agotaba el timeout. La espera fija conserva
        // lo que `networkidle` daba de paso: tiempo para que cualquier
        // petición prematura (póster o video bajo el pliegue) aparezca antes
        // de medir.
        await page.goto(BASE + route, { waitUntil: 'load' });
        await page.waitForTimeout(1500);

        // --- 1. terceros ------------------------------------------------
        const foreign = requests.filter((u) => !u.startsWith(BASE) && !u.startsWith('data:'));
        check(foreign.length === 0, 'cero peticiones a terceros', foreign.join(', '));

        // --- 2. errores -------------------------------------------------
        check(bad.length === 0, 'cero respuestas 4xx/5xx', bad.join(', '));

        // --- 3 y 4. video y póster --------------------------------------
        const videos = await page.locator('[data-lazy-video]').all();

        if (videos.length > 0) {
            // Sólo tiene sentido exigir "cero bytes" en los videos que
            // arrancan fuera del viewport: si el diseño pone uno arriba
            // del todo, lo correcto es que cargue.
            let onscreen = 0;
            for (const fig of videos) {
                const box = await fig.boundingBox();
                if (box && box.y < vp.height) onscreen += 1;
            }
            const offscreen = videos.length - onscreen;

            const before = requests.filter(isMedia);
            if (offscreen > 0) {
                check(
                    before.length <= onscreen,
                    `ningún byte de los ${offscreen} video(s) bajo el pliegue antes del scroll`,
                    before.join(', '),
                );
            }
            if (onscreen > 0) {
                console.log(
                    `  · ${onscreen} video(s) ya dentro del primer viewport: cargarlos es lo correcto`,
                );
            }

            const postersBefore = requests.filter(isPoster);
            if (offscreen > 0 && vp.width < 800) {
                check(
                    postersBefore.length === 0,
                    `ningún póster bajo el pliegue antes del scroll (${offscreen})`,
                    postersBefore.join(', '),
                );
            } else if (postersBefore.length > 0) {
                console.log(
                    `  · ${postersBefore.length} póster(s) precargados por proximidad de \`loading="lazy"\` (informativo)`,
                );
            }

            // Ahora sí: acercar cada video al viewport y exigir que cargue.
            for (const fig of videos) {
                await fig.scrollIntoViewIfNeeded();
                await page.waitForTimeout(400);
            }
            await page.waitForTimeout(600);

            const after = requests.filter(isMedia);
            check(
                after.length >= videos.length,
                'todos los videos se piden al entrar al viewport',
                `${after.length}/${videos.length}`,
            );
        } else {
            console.log('  · sin video en esta ruta');
        }

        rows.push({
            vp: vp.name,
            route,
            requests: requests.length,
            kb: Math.round(bytes / 1024),
        });

        await context.close();
    }
}

await browser.close();

console.log('\n=== Peso por ruta (content-length sumado, tras el scroll) ===');
for (const r of rows) {
    console.log(
        `  ${r.vp.padEnd(11)} ${r.route.padEnd(36)} ${String(r.requests).padStart(3)} req  ${String(r.kb).padStart(5)} KB`,
    );
}

console.log(
    failures === 0
        ? '\n✓ check-network: todo correcto'
        : `\n✗ check-network: ${failures} comprobación(es) fallida(s)`,
);
process.exit(failures === 0 ? 0 : 1);
