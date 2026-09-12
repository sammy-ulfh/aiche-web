#!/usr/bin/env bun
/**
 * gen-placeholders.mjs — genera los placeholders de media.
 *
 * Produce imágenes JPG en `src/assets/media/...` con el lenguaje visual
 * del sitio (navy + rejilla + etiqueta) en las proporciones definidas
 * en `src/data/media.ts`. Los retratos de la mesa directiva son
 * SILUETAS GEOMÉTRICAS, nunca caras generadas (RULES §10.2).
 *
 * Uso:
 *   bun scripts/gen-placeholders.mjs
 *
 * Requisitos: `sharp` (ya en devDependencies).
 *
 * Los archivos se sobrescriben siempre: el script es idempotente.
 * Para reemplazarlos con imágenes reales, basta con sobrescribir
 * el archivo con el mismo nombre (RULES §3.8).
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
// Desde F8 los rasterizados viven en `src/assets/media/`, que es donde
// Astro puede procesarlos (AVIF/WebP + srcset, RULES §12.3). `og.jpg`
// sigue en `public/` porque su URL tiene que ser estable y absoluta.
const OUT_BASE = resolve(ROOT, 'src/assets/media');

// ----- paleta (idéntica a src/styles/global.css @theme) ----------
const NAVY = '#123f72';
const NAVY_900 = '#0d2f57';
const NAVY_700 = '#1a4f8a';
const NAVY_400 = '#4a8fd4';
const CREAM = '#f4f1e9';

// ----- helpers --------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function svgPlaceholder({ width, height, label, tone = 'navy', pattern = 'video' }) {
    // tonality: "navy" (default, fondo azul con rejilla) o "cream" (fondo crema con rejilla sutil).
    const bgStart = tone === 'cream' ? '#ffffff' : NAVY_700;
    const bgEnd = tone === 'cream' ? CREAM : NAVY_900;
    const text = tone === 'cream' ? NAVY : '#ffffff';
    const accent = tone === 'cream' ? NAVY_400 : NAVY_400;
    const gridOpacity = tone === 'cream' ? 0.10 : 0.08;

    // rejilla 96px aprox
    const cell = 96;

    // banda inferior con etiqueta
    const bandH = Math.max(80, Math.round(height * 0.12));
    const tagSize = Math.max(14, Math.round(width * 0.012));

    // pattern variants:
    //  - "video": big badge "VIDEO 16:9" centrado + chip inferior con etiqueta
    //  - "image": banda inferior con etiqueta
    //  - "board": silueta hexagonal (cabeza+hombros muy esquemáticos)
    let center = '';
    if (pattern === 'video') {
        const badgeW = Math.min(width * 0.5, 640);
        const badgeH = 80;
        const bx = (width - badgeW) / 2;
        const by = (height - badgeH) / 2;
        center = `
            <rect x="${bx}" y="${by}" width="${badgeW}" height="${badgeH}"
                fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>
            <text x="${width / 2}" y="${by + badgeH / 2 + 9}"
                text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${Math.round(badgeH * 0.4)}"
                font-weight="700" letter-spacing="0.18em"
                fill="${text}">PLACEHOLDER</text>`;
    } else if (pattern === 'board') {
        // silueta hexagonal — hexágono grande centrado
        const cx = width / 2;
        const cy = height / 2 - 20;
        const r = Math.min(width, height) * 0.28;
        const points = Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 2;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(' ');
        center = `
            <polygon points="${points}"
                fill="none" stroke="${accent}" stroke-width="3" opacity="0.85"/>
            <polygon points="${points}"
                fill="${accent}" opacity="0.18"/>
            <text x="${cx}" y="${cy + 6}"
                text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${Math.round(r * 0.55)}"
                font-weight="700" letter-spacing="0.1em"
                fill="${text}">RETRATO</text>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
    <pattern id="grid" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">
      <path d="M ${cell} 0 L 0 0 0 ${cell}" fill="none" stroke="${text}" stroke-width="1" opacity="${gridOpacity}"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  ${center}
  <!-- banda inferior -->
  <rect x="0" y="${height - bandH}" width="${width}" height="${bandH}" fill="${NAVY_900}" opacity="0.85"/>
  <text x="${width / 2}" y="${height - bandH / 2 + 6}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${tagSize}" font-weight="700" letter-spacing="0.2em"
        fill="${CREAM}">${esc(label)}</text>
</svg>`;
}

async function writeJpg({ svg, out, quality = 82 }) {
    await mkdir(dirname(out), { recursive: true });
    await sharp(Buffer.from(svg))
        .jpeg({ quality, mozjpeg: true })
        .toFile(out);
    const stat = await import('node:fs/promises').then((m) => m.stat(out));
    console.log(`  ${out.replace(ROOT + '/', '')}  ${(stat.size / 1024).toFixed(1)} KB`);
}

// ----- assets a generar ----------------------------------------
// Mismas claves que src/data/media.ts (RULES §10.1).
const jobs = [
    { out: 'images/hero-poster.jpg',          w: 1920, h: 1080, label: 'HERO POSTER · 16:9',          pattern: 'video', tone: 'navy' },
    { out: 'images/about-poster.jpg',         w: 1920, h: 1080, label: 'ABOUT POSTER · 16:9',         pattern: 'video', tone: 'navy' },
    { out: 'images/chem-e-car.jpg',           w: 1600, h: 900,  label: 'CHEM-E-CAR · 16:9',           pattern: 'image', tone: 'navy' },
    { out: 'images/competition-01.jpg',       w: 1200, h: 800,  label: 'GALERÍA 3:2 · 01',            pattern: 'image', tone: 'navy' },
    { out: 'images/competition-02.jpg',       w: 1200, h: 800,  label: 'GALERÍA 3:2 · 02',            pattern: 'image', tone: 'navy' },
    { out: 'images/competition-03.jpg',       w: 1200, h: 800,  label: 'GALERÍA 3:2 · 03',            pattern: 'image', tone: 'navy' },
    { out: 'images/sponsors-hero.jpg',        w: 1600, h: 900,  label: 'SPONSORS HERO · 16:9',        pattern: 'image', tone: 'navy' },
    { out: 'images/contact-group.jpg',        w: 1600, h: 1200, label: 'EQUIPO · 4:3',                pattern: 'image', tone: 'navy' },
    { out: 'team/team-group.jpg',             w: 1800, h: 1200, label: 'EQUIPO · FOTO GRUPAL',        pattern: 'image', tone: 'navy' },
    { out: 'sponsors/tier-01.jpg',            w: 800,  h: 600,  label: 'PAQUETE 1 · 4:3',             pattern: 'image', tone: 'navy' },
    { out: 'sponsors/tier-02.jpg',            w: 800,  h: 600,  label: 'PAQUETE 2 · 4:3',             pattern: 'image', tone: 'navy' },
    { out: 'sponsors/tier-03.jpg',            w: 800,  h: 600,  label: 'PAQUETE 3 · 4:3',             pattern: 'image', tone: 'navy' },
    // Retratos de mesa directiva: 6 siluetas geométricas (RULES §10.2).
    { out: 'team/board-01.jpg', w: 600, h: 800, label: 'RETRATO 01 · MESA DIRECTIVA', pattern: 'board', tone: 'navy' },
    { out: 'team/board-02.jpg', w: 600, h: 800, label: 'RETRATO 02 · MESA DIRECTIVA', pattern: 'board', tone: 'navy' },
    { out: 'team/board-03.jpg', w: 600, h: 800, label: 'RETRATO 03 · MESA DIRECTIVA', pattern: 'board', tone: 'navy' },
    { out: 'team/board-04.jpg', w: 600, h: 800, label: 'RETRATO 04 · MESA DIRECTIVA', pattern: 'board', tone: 'navy' },
    { out: 'team/board-05.jpg', w: 600, h: 800, label: 'RETRATO 05 · MESA DIRECTIVA', pattern: 'board', tone: 'navy' },
    { out: 'team/board-06.jpg', w: 600, h: 800, label: 'RETRATO 06 · MESA DIRECTIVA', pattern: 'board', tone: 'navy' },
    // OG image para SEO (RULES §14).
    { out: '../og.jpg',                     w: 1200, h: 630,  label: 'AIChE GDL · OG · 1200×630',    pattern: 'image', tone: 'navy' },
];

// Reescritura de out para og.jpg (fuera de src/assets/media)
const realJobs = jobs.map((j) => ({
    ...j,
    out: j.out.startsWith('../')
        ? resolve(ROOT, 'public', j.out.replace(/^\.\.\//, ''))
        : resolve(OUT_BASE, j.out),
}));

console.log(`Generando ${realJobs.length} placeholders en ${OUT_BASE}`);

let okCount = 0;
let errCount = 0;
for (const job of realJobs) {
    try {
        const svg = svgPlaceholder({
            width: job.w,
            height: job.h,
            label: job.label,
            pattern: job.pattern,
            tone: job.tone,
        });
        await writeJpg({ svg, out: job.out });
        okCount++;
    } catch (e) {
        errCount++;
        console.error(`  ERROR generando ${job.out}:`, e.message);
    }
}

console.log(`\nListo: ${okCount} generados, ${errCount} errores.`);
console.log('Sustituye cualquier archivo con el mismo nombre y la misma proporción para reemplazarlo.');
