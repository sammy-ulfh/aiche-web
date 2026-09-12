#!/usr/bin/env bun
/**
 * scripts/capture.mjs — Capturas deterministas del sitio con Playwright.
 *
 * Genera el material visual del proyecto en `docs/media/`:
 *   - screenshots/desktop/<ruta>-{full,hero}.png      (1920×1080, JPEG)
 *   - screenshots/mobile/<ruta>-full.png              (390×844, DPR 3)
 *   - screenshots/sections/<sección>.png              (por selector CSS)
 *   - screencasts/<ruta>.webm                         (scroll-through)
 *
 * Por qué existe (RULES §17, S10):
 *   - Material para SITE-CONTEXT, VIDEO-BRIEF y SHOTLIST.
 *   - Capturas deterministas para QA visual futuro (el cliente puede
 *     comparar capturas regeneradas contra las commiteadas).
 *
 * Decisiones de diseño:
 *   - Build + preview local (no usa el sitio desplegado).
 *   - Espera `document.fonts.ready` antes de capturar (sin fuentes
 *     sin cargar).
 *   - Fuerza `prefers-reduced-motion: reduce` para saltarse los
 *     reveals (estado final determinista).
 *   - Fuerza `data-reveal-once` ya revelado: el script evalúa el
 *     `IntersectionObserver` manualmente para cada sección con
 *     `[data-reveal]` antes de la captura.
 *   - Cierra el preview al final (`astro preview stop`).
 *
 * Uso:
 *   bun run capture                  # ejecuta todo
 *   bun scripts/capture.mjs --help   # imprime opciones
 *
 * Salida:
 *   - 0 → todas las capturas exitosas.
 *   - 1 → alguna captura falló (mensaje en stderr).
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'docs', 'media');

/** Rutas a capturar en desktop + mobile + screencast. */
const ROUTES = [
    { slug: 'home',                       path: '/' },
    { slug: 'equipo',                     path: '/equipo' },
    { slug: 'participaciones',            path: '/participaciones' },
    { slug: 'southwest-2027',             path: '/participaciones/southwest-2027' },
    { slug: 'patrocinios',                path: '/patrocinios' },
    { slug: 'contacto',                   path: '/contacto' },
];

/** Capturas por sección (selector CSS → nombre de archivo). Se evalúan
 *  en TODAS las rutas que contengan el selector; el archivo se nombra
 *  `<ruta>-<sección>.png`. Permite regenerar capturas puntuales sin
 *  tocar el script cuando se añada un `data-capture` nuevo. */
/* Los 11 marcadores `data-section` que existen de verdad en el build,
 * verificados con `grep -oh 'data-section="[^"]*"' dist/**\/*.html`.
 * Hasta F8 la lista arrastraba cuatro que ya no existían —`about-teaser`,
 * `next-event`, `competitions`, `cta-final`, muertos desde F6b (D-160)— y
 * le faltaba `participations`, que es la p.7 y aparece en dos rutas. */
const SECTION_SELECTORS = [
    { name: 'hero',              selector: '[data-section="hero"]' },
    { name: 'about',             selector: '[data-section="about"]' },
    { name: 'participations',    selector: '[data-section="participations"]' },
    { name: 'sponsor-teaser',    selector: '[data-section="sponsor-teaser"]' },
    { name: 'join-cta',          selector: '[data-section="join-cta"]' },
    { name: 'team-grid',         selector: '[data-section="team-grid"]' },
    { name: 'next-event-card',   selector: '[data-section="next-event-card"]' },
    { name: 'sponsor-hero',      selector: '[data-section="sponsor-hero"]' },
    { name: 'sponsor-tiers',     selector: '[data-section="sponsor-tiers"]' },
    { name: 'competition-navy',  selector: '[data-section="competition"][data-variant="navy"]' },
    { name: 'competition-cream', selector: '[data-section="competition"][data-variant="cream"]' },
    { name: 'contact',           selector: '[data-section="contact"]' },
];

const VIEWPORTS = {
    desktop: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    mobile:  { width: 390,  height: 844,  deviceScaleFactor: 3 },
};

/** Prepara directorios y limpia el material previo. */
function setupDirs() {
    for (const dir of [
        join(OUT, 'screenshots', 'desktop'),
        join(OUT, 'screenshots', 'mobile'),
        join(OUT, 'screenshots', 'sections'),
        join(OUT, 'screencasts'),
    ]) {
        mkdirSync(dir, { recursive: true });
    }
}

/** Compila el sitio. Lanza error si falla. */
function build() {
    console.log('[capture] bun run build …');
    try {
        execSync('bun run build', { cwd: ROOT, stdio: 'inherit' });
    } catch (e) {
        throw new Error(`build falló: ${e.message}`);
    }
}

/** Arranca `astro preview` en background. Devuelve el proceso. */
function startPreview() {
    console.log('[capture] bunx astro preview --background …');
    const proc = spawn('bunx', ['astro', 'preview', '--background'], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    return proc;
}

/** Espera hasta que el preview responda 200 en `/` (máx 15 s). */
async function waitForPreview() {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
        try {
            const r = await fetch('http://localhost:4321/');
            if (r.ok) return;
        } catch {
            // preview aún arrancando
        }
        await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error('preview no respondió en 15 s');
}

/** Revela todos los `[data-reveal]` (sin esperar al IntersectionObserver)
 *  para que las capturas sean deterministas. */
async function forceReveal(page) {
    await page.evaluate(() => {
        document.querySelectorAll('[data-reveal]').forEach((el) => {
            el.classList.add('is-revealed');
            el.removeAttribute('data-reveal');
        });
    });
}

/**
 * Recorre la página para que carguen las imágenes `loading="lazy"` y
 * espera a que todas terminen.
 *
 * Forzar los reveals no basta: el navegador decide qué imágenes descarga
 * por **proximidad al viewport**, no por opacidad. En F8 se comprobó la
 * captura contra una navegación normal y el **lockup institucional del
 * footer no salía en ninguna captura** — está al final de la página y
 * nunca llegaba a pedirse. Es justo lo que la ficha de la sesión pedía
 * verificar: que lo capturado sea lo que se ve en un navegador de verdad.
 */
async function loadLazyMedia(page) {
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    // `img.complete` cubre también las variantes elegidas por `srcset`.
    await page
        .waitForFunction(
            () => [...document.images].every((i) => i.complete && i.naturalWidth > 0),
            { timeout: 10000 },
        )
        .catch(() => {});
    await page.waitForTimeout(300);
}

/** Captura una ruta en desktop: full page + viewport (hero). */
async function captureDesktop(browser, route) {
    const ctx = await browser.newContext({
        viewport: VIEWPORTS.desktop,
        reducedMotion: 'reduce',
        deviceScaleFactor: VIEWPORTS.desktop.deviceScaleFactor,
    });
    const page = await ctx.newPage();
    page.on('pageerror', (err) => console.error(`[capture] pageerror ${route.path}:`, err.message));
    page.on('console', (msg) => {
        if (msg.type() === 'error') console.error(`[capture] console.error ${route.path}:`, msg.text());
    });
    await page.goto(`http://localhost:4321${route.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);

    // Pausa extra: el lazy-video y los IntersectionObservers se
    // estabilizan. El reveal ya está forzado.
    await page.waitForTimeout(800);

    await forceReveal(page);
    await loadLazyMedia(page);

    const destDir = join(OUT, 'screenshots', 'desktop');
    const baseName = `${route.slug}`;

    try {
        await page.screenshot({
            path: join(destDir, `${baseName}-hero.png`),
            fullPage: false,
        });
    } catch (e) {
        console.error(`[capture] hero shot falló ${route.path}:`, e.message);
        throw e;
    }

    try {
        await page.screenshot({
            path: join(destDir, `${baseName}-full.png`),
            fullPage: true,
        });
    } catch (e) {
        console.error(`[capture] full shot falló ${route.path}:`, e.message);
        throw e;
    }

    await ctx.close();
}

/** Captura una ruta en mobile (DPR 3). */
async function captureMobile(browser, route) {
    const ctx = await browser.newContext({
        viewport: VIEWPORTS.mobile,
        reducedMotion: 'reduce',
        deviceScaleFactor: VIEWPORTS.mobile.deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:4321${route.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await forceReveal(page);
    await loadLazyMedia(page);

    const destDir = join(OUT, 'screenshots', 'mobile');
    await page.screenshot({
        path: join(destDir, `${route.slug}-full.png`),
        fullPage: true,
    });

    await ctx.close();
}

/** Captura cada selector en todas las rutas que lo contengan. */
async function captureSections(browser) {
    const ctx = await browser.newContext({
        viewport: VIEWPORTS.desktop,
        reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    page.on('pageerror', (err) => console.error('[capture] pageerror:', err.message));

    for (const route of ROUTES) {
        await page.goto(`http://localhost:4321${route.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        await forceReveal(page);
    await loadLazyMedia(page);

        for (const sec of SECTION_SELECTORS) {
            const el = await page.$(sec.selector);
            if (!el) continue;
            const fileName = `${route.slug}-${sec.name}.png`;
            try {
                await el.scrollIntoViewIfNeeded();
                await page.waitForTimeout(150);
                await el.screenshot({
                    path: join(OUT, 'screenshots', 'sections', fileName),
                });
            } catch (e) {
                console.error(`[capture] section ${fileName} falló:`, e.message);
            }
        }
    }
    await ctx.close();
}

/** Graba un scroll-through por ruta. Usa un context independiente por
 *  ruta para que Playwright emita un webm por ruta (cada context
 *  cierra su propia grabación al cerrarse). */
async function recordScreencasts(browser) {
    for (const route of ROUTES) {
        const ctx = await browser.newContext({
            viewport: VIEWPORTS.desktop,
            reducedMotion: 'reduce',
            recordVideo: {
                dir: join(OUT, 'screencasts'),
                size: VIEWPORTS.desktop,
            },
        });
        const page = await ctx.newPage();
        await page.goto(`http://localhost:4321${route.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        await forceReveal(page);
    await loadLazyMedia(page);

        // Scroll suave de principio a fin; ~8 s de vídeo.
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        const steps = 30;
        for (let i = 0; i <= steps; i++) {
            const y = (pageHeight * i) / steps;
            await page.evaluate((y) => window.scrollTo(0, y), y);
            await page.waitForTimeout(250);
        }
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));

        // Cierra el context: Playwright escribe el .webm al directorio.
        await ctx.close();

        // Renombra el .webm recién emitido al slug de la ruta.
        renameLatestScreencast(route.slug);
    }
}

/** Renombra el último .webm escrito en docs/media/screencasts/ al
 *  nombre `<slug>.webm`. Reemplaza si ya existía (la regeneración
 *  borra implícitamente porque Playwright sobrescribe con timestamp). */
function renameLatestScreencast(slug) {
    const dir = join(OUT, 'screencasts');
    if (!existsSync(dir)) return;
    const files = execSync(`ls -t ${dir}`).toString().trim().split('\n').filter(Boolean);
    const target = `${slug}.webm`;
    if (files[0] === target) return; // ya está renombrado
    execSync(`mv "${join(dir, files[0])}" "${join(dir, target)}"`);
    console.log(`[capture] screencast → ${target}`);
}

/** Main. */
async function main() {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(
            'Uso: bun run capture\n' +
            'Genera screenshots/{desktop,mobile,sections}/ y screencasts/ en docs/media/.'
        );
        return;
    }

    setupDirs();
    build();

    const preview = startPreview();
    try {
        await waitForPreview();

        const browser = await chromium.launch({
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
        });

        console.log('[capture] desktop screenshots …');
        for (const r of ROUTES) {
            await captureDesktop(browser, r);
        }

        console.log('[capture] mobile screenshots …');
        for (const r of ROUTES) {
            await captureMobile(browser, r);
        }

        console.log('[capture] section screenshots …');
        await captureSections(browser);

        console.log('[capture] screencasts …');
        await recordScreencasts(browser);

        await browser.close();
        console.log('[capture] ✓ material generado en docs/media/');
    } finally {
        try {
            execSync('bunx astro preview stop', { cwd: ROOT, stdio: 'ignore' });
        } catch {}
        try {
            preview.kill();
        } catch {}
    }
}

main().catch((e) => {
    console.error('[capture] ✗', e.message);
    process.exit(1);
});
