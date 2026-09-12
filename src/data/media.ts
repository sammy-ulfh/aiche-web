/**
 * Manifiesto único de medios (RULES §10.1).
 *
 * Cualquier ruta a un asset (imagen, video, logo) que se use en un
 * componente sale de aquí. Para sustituir un placeholder, el usuario
 * sobrescribe el archivo con el mismo nombre en `public/media/...`;
 * no hay que tocar este archivo a menos que cambien las proporciones
 * o el nombre de la clave.
 *
 * Las rutas apuntan a `/media/...`, que Astro copia a `dist/` tal cual
 * (carpeta `public/`). Los anchos y altos declarados permiten reservar
 * espacio y mantener CLS = 0.
 */

export interface ImageAsset {
    src: string;
    alt: string;
    w: number;
    h: number;
}

export interface VideoAsset {
    mp4: string;
    /** Fuente WebM opcional (más ligera). */
    webm?: string;
    /** Póster del video. Es un `ImageAsset` y no una ruta suelta para que
     *  el archivo se declare una sola vez, con sus dimensiones reales
     *  (RULES §6). Hasta F7 la ruta estaba escrita aquí Y en una entrada
     *  `ImageAsset` gemela que no usaba nadie, y las dos declaraban unas
     *  dimensiones que no eran las del archivo. */
    poster: ImageAsset;
    /** Proporción del video, p. ej. "16/9". */
    ratio: string;
    w: number;
    h: number;
    /** Etiqueta accesible del video. */
    label: string;
}

/* Pósters de los dos videos. Van fuera del literal porque los consume el
 * `VideoAsset` correspondiente además de exponerse como slot sustituible
 * en `docs/ASSETS.md`. Dimensiones **medidas sobre el archivo real** en
 * F7: los dos son las fotos extraídas del PDF en F6b y el manifiesto
 * seguía declarando el tamaño de los placeholders que sustituyeron. */
const aboutPoster = {
    src: '/media/images/about-poster.jpg',
    alt: 'Imagen representativa del equipo AIChE GDL en el laboratorio.',
    w: 730,
    h: 487,
} satisfies ImageAsset;

const chemECar = {
    src: '/media/images/chem-poster.jpg',
    alt: 'Vehículo Chem-E-Car del equipo AIChE GDL en pista.',
    w: 574,
    h: 383,
} satisfies ImageAsset;

export const media = {
    /* ---- Identidad (p.4 y p.5 del PDF) ------------------------ */
    /** Isotipo hexagonal oficial. Copiado de `design/aiche_logo.svg` en F4:
     *  el que dibujaba `Logo.astro` era un galón inventado (desviación S-5
     *  de docs/AUDIT-F2.md). SVG → escala sin pérdida y pesa 2.6 KB. */
    isotipo: {
        src: '/media/logo/aiche-gdl-isotipo.svg',
        alt: 'Isotipo de AIChE GDL.',
        w: 149,
        h: 172,
    } satisfies ImageAsset,

    /** Lockup institucional del American Institute of Chemical Engineers
     *  que la p.9 del PDF pone a la izquierda del footer. Extraído del
     *  propio PDF (`mutool extract`). Su fondo ya es crema #f4f1e9, el
     *  mismo del footer, así que encaja sin recorte. */
    aicheInstitucional: {
        src: '/media/logo/aiche-institucional.png',
        alt: 'American Institute of Chemical Engineering — Tecnológico de Monterrey, Campus Guadalajara.',
        w: 319,
        h: 120,
    } satisfies ImageAsset,

    /* ---- Hero (p.1) ------------------------------------------- */
    heroPoster: {
        src: '/media/images/hero-poster.jpg',
        alt: 'Fondo azul con rejilla técnica del sitio AIChE GDL.',
        w: 1920,
        h: 1080,
    } satisfies ImageAsset,

    /* ---- Acerca de nosotros (p.5) ----------------------------- */
    aboutVideo: {
        mp4: '/media/video/about-highlight.mp4',
        // `webm` es opcional a propósito: sólo se declara cuando el archivo
        // existe de verdad en `public/media/video/`. Estaba declarado sin
        // que el archivo existiera y, en cuanto F1 arregló la carga diferida,
        // el navegador empezó a pedirlo y a recibir un 404. Para añadirlo,
        // deja el .webm en esa carpeta y reactiva esta línea:
        // webm: '/media/video/about-highlight.webm',
        poster: aboutPoster,
        ratio: '16/9',
        w: 1920,
        h: 1080,
        label: 'Así se vive la experiencia AIChE GDL — video highlight',
    } satisfies VideoAsset,

    aboutPoster,

    /* ---- Participaciones (p.6) ------------------------------- */
    chemECar,

    /** Segundo video del sitio: panel derecho de Participaciones. */
    participationsVideo: {
        mp4: '/media/video/participations-highlight.mp4',
        poster: chemECar,
        ratio: '4039/2286',
        w: 1920,
        h: 1080,
        label: 'Vehículo Chem-E-Car del equipo AIChE GDL en pista.',
    } satisfies VideoAsset,

    /* ---- Mesa directiva (p.12) -------------------------------- */
    /** Retratos 3:4 — siluetas geométricas como placeholders (RULES §10.2). */
    board: Array.from({ length: 6 }, (_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return {
            src: `/media/team/board-${n}.jpg`,
            alt: `Retrato ${n} de la mesa directiva — placeholder.`,
            w: 600,
            h: 800,
        } satisfies ImageAsset;
    }),

    /** Foto grupal del equipo. */
    teamGroup: {
        src: '/media/team/team-group.jpg',
        alt: 'Foto grupal del equipo AIChE GDL en el laboratorio.',
        w: 1800,
        h: 1200,
    } satisfies ImageAsset,

    /* ---- La competencia (p.7/p.11) — galería 3:2 -------------- */
    competitionGallery: [
        {
            src: '/media/images/competition-01.jpg',
            alt: 'Equipo en laboratorio durante una sesión de trabajo.',
            w: 1200,
            h: 800,
        },
        {
            src: '/media/images/competition-02.jpg',
            alt: 'Trabajo de laboratorio con pipetas y muestras.',
            w: 1200,
            h: 800,
        },
        {
            src: '/media/images/competition-03.jpg',
            alt: 'Taller IQ-Móvil: presentación del equipo.',
            w: 1200,
            h: 800,
        },
    ] satisfies ImageAsset[],

    /** Recorte con alfa del Chem-E-Car que aparece en la variante navy. */
    competitionCarCutout: {
        src: '/media/images/competition-car-cutout.png',
        alt: 'Vehículo Chem-E-Car construido para la competencia regional.',
        w: 489,
        h: 334,
    } satisfies ImageAsset,

    /* ---- Patrocinios (p.9/p.10) ------------------------------- */
    sponsorsHero: {
        src: '/media/images/sponsors-hero.jpg',
        alt: 'Vehículo Chem-E-Car en pista, listo para competir.',
        w: 1600,
        h: 900,
    } satisfies ImageAsset,

    sponsorsTierImages: [
        {
            src: '/media/sponsors/tier-01.jpg',
            alt: 'Vehículo Chem-E-Car en pista.',
            w: 800,
            h: 600,
        },
        {
            src: '/media/sponsors/tier-02.jpg',
            alt: 'Equipo de AIChE GDL presentando el taller IQ-Móvil.',
            w: 800,
            h: 600,
        },
        {
            src: '/media/sponsors/tier-03.jpg',
            alt: 'Integrantes del equipo realizando trabajo de laboratorio.',
            w: 800,
            h: 600,
        },
    ] satisfies ImageAsset[],

    /* ---- Contacto (p.13) -------------------------------------- */
    contactGroup: {
        src: '/media/team/team-group.jpg',
        alt: 'Foto grupal del equipo AIChE GDL.',
        w: 1600,
        h: 1200,
    } satisfies ImageAsset,

    /* ---- OG image (RULES §14) --------------------------------- */
    ogImage: {
        src: '/og.jpg',
        alt: 'AIChE GDL — Tec de Monterrey Campus Guadalajara.',
        w: 1200,
        h: 630,
    } satisfies ImageAsset,
} as const;
