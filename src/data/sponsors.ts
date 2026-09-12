/**
 * Fuente canónica de los paquetes de patrocinio (RULES §6, §9.5).
 *
 * Lo que aparece en este archivo se consume desde:
 *   - `components/sections/SponsorTeaser.astro` (home)
 *   - `components/sections/SponsorHero.astro` (/patrocinios, hero p.9)
 *   - `components/sections/SponsorTiers.astro` (/patrocinios, p.10)
 *
 * El contador `N BENEFICIOS` se calcula en runtime como
 * `tier.benefits.length`; nunca se escribe a mano (RULES §6: cero
 * duplicación; S6 criterio de aceptación).
 *
 * La moneda queda como variable (`$` por defecto, MXN asumido) aquí,
 * para que cambiarla toque un solo archivo. P-001.
 */

export interface SponsorTier {
    /** Identificador estable para atributos de datos y futuras anclas. */
    id: 'tier-1' | 'tier-2' | 'tier-3';
    /** Etiqueta visible: "PAQUETE 1". */
    label: string;
    /** Precio sin moneda (la moneda viene de `sponsorCurrencySymbol`). */
    price: string;
    /** El PDF destaca únicamente el Paquete 1. */
    featured: boolean;
    /** Lista verbatim de beneficios (RULES §9.5). */
    benefits: readonly string[];
}

/** [PENDIENTE-USUARIO] Moneda asumida; el PDF muestra únicamente `$`. */
export const sponsorCurrencySymbol = '$';

export const sponsorTiers: readonly SponsorTier[] = [
    {
        id: 'tier-1',
        label: 'PAQUETE 1',
        price: '10,000',
        featured: true,
        benefits: [
            'Mención especial redes sociales de la Federación de Estudiantes (FETEC).',
            'Logo/banner en coche y uniforme del equipo.',
            'Certificado de reconocimiento.',
            // FIX: el PDF escribe "agradeciemgto" (RULES §9.5).
            'Post de agradecimiento en redes sociales oficiales del equipo.',
            // FIX: el PDF dice "Campus GDA" (debe ser GDL).
            'Espacio para hablar sobre su empresa a alumnos de ingeniería química del Tecnológico de Monterrey Campus GDL.',
            'Posibilidad de facturación.',
        ],
    },
    {
        id: 'tier-2',
        label: 'PAQUETE 2',
        price: '5,000',
        featured: false,
        benefits: [
            'Logo/banner en uniformes del equipo.',
            'Certificado de reconocimiento.',
            'Post de agradecimiento en redes sociales oficiales del equipo.',
            'Posibilidad de facturación.',
        ],
    },
    {
        id: 'tier-3',
        label: 'PAQUETE 3',
        price: '2,500',
        featured: false,
        benefits: [
            'Post de agradecimiento en redes sociales oficiales del equipo.',
            'Certificado de reconocimiento.',
            'Posibilidad de facturación.',
        ],
    },
] as const;
