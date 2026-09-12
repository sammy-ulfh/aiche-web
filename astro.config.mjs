// @ts-check
import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { siteUrl, previewNoIndex } from './src/data/site.ts';

// https://astro.build/config
//
// `site` se rellena con el dominio definitivo en DECISIONS.md D-003.
// Mientras tanto, los sitemap y canonical usan este placeholder para que el
// build pase y la sustitución futura toque un solo archivo.
//
// `tailwindcss()` es un plugin de Vite en Astro 5+ (Tailwind 4): va dentro
// de `vite.plugins`, NO como integración (RULES §16.4).
//
// Decisiones S8 (RULES §12, §14):
//  - `inlineStylesheets: 'always'` elimina el request CSS externo
//    render-blocking por página (32.7 KB raw / 6.8 KB gz). Cada HTML
//    crece ~6.8 KB gz y queda autocontenido, mejor para LCP. Trade-off
//    documentado en docs/PERFORMANCE.md.
//  - `@astrojs/sitemap` con `filter` excluye `/kit` (vista temporal,
//    `noindex`) y la página `/404` la descarta Astro/Sitemap por
//    convención de status code.
/**
 * Genera `robots.txt` en el build a partir de `siteUrl`.
 *
 * Antes era un archivo estático en `public/` con el dominio escrito a
 * mano, así que el dominio vivía en **tres** sitios: aquí, en
 * `src/data/site.ts` y en ese `robots.txt`. La documentación prometía que
 * cambiar `siteUrl` lo propagaba todo, y no era verdad: el sitemap y el
 * robots se habrían quedado apuntando al dominio de prueba el día del
 * lanzamiento. Ahora `src/data/site.ts` es la única fuente de verdad
 * (D-183).
 *
 * No es un endpoint ni SSR —es un hook de build que escribe un archivo—,
 * así que la regla 10 (sitio 100 % estático) se mantiene.
 */
function robotsTxt() {
    return {
        name: 'aiche:robots-txt',
        hooks: {
            /** @type {(opts: { dir: URL, logger: { info: (m: string) => void } }) => Promise<void>} */
            'astro:build:done': async ({ dir, logger }) => {
                // Preview pública en S3: cerrado a cal y canto (D-185).
                // Sin dominio definitivo, dejar que un buscador rastree
                // significaría indexar contenido cuyo canonical apunta al
                // placeholder. Tampoco se anuncia el sitemap: sería
                // contradictorio ofrecer el mapa de un sitio que se pide no
                // rastrear.
                const preview = [
                    '# AIChE GDL — robots.txt',
                    '# PREVIEW: el sitio está en un bucket de S3 y `siteUrl` sigue',
                    '# siendo el placeholder, así que se bloquea el rastreo entero.',
                    '# Se levanta poniendo `previewNoIndex = false` en',
                    '# `src/data/site.ts` el día del lanzamiento (docs/TODO.md P-005).',
                    '',
                    'User-agent: *',
                    'Disallow: /',
                    '',
                ];

                const publico = [
                    '# AIChE GDL — robots.txt',
                    '# Generado en el build desde `siteUrl` (src/data/site.ts).',
                    '# Cero terceros, cero analítica (RULES §3.9): esto sólo indica',
                    '# dónde está el sitemap.',
                    '',
                    'User-agent: *',
                    'Allow: /',
                    '',
                    '# `/404` no se lista en el sitemap y lleva `noindex`; no hace falta',
                    '# un `Disallow` para ella.',
                    '',
                    `Sitemap: ${new URL('sitemap-index.xml', siteUrl + '/').href}`,
                    '',
                ];

                const body = (previewNoIndex ? preview : publico).join('\n');
                await writeFile(new URL('robots.txt', dir), body, 'utf8');
                logger.info(
                    previewNoIndex
                        ? '`robots.txt` generado en modo PREVIEW (Disallow: /)'
                        : '`robots.txt` generado desde siteUrl',
                );
            },
        },
    };
}

export default defineConfig({
    // Único sitio donde vive el dominio: `src/data/site.ts` (D-183).
    site: siteUrl,
    output: 'static',
    compressHTML: true,
    build: {
        inlineStylesheets: 'always',
    },
    prefetch: {
        prefetchAll: false,
        defaultStrategy: 'hover',
    },
    integrations: [
        sitemap(),
        robotsTxt(),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
