/**
 * Datos de la mesa directiva y el equipo (RULES §6, §9.6).
 *
 * Los nombres y cargos son PLACEHOLDERS marcados como tales (no se
 * publican nombres reales hasta confirmación del usuario, RULES §3.5).
 * Para sustituirlos basta con editar este archivo: el resto del sitio
 * (p.12 del PDF, sección Mesa directiva + Equipo) los consume desde aquí.
 *
 * El copy del encabezado (eyebrow + título) sigue en `content.ts` por
 * coherencia con el resto de secciones; este archivo es solo la lista.
 */

export interface BoardMember {
    /** Marcado como placeholder hasta que el usuario confirme nombres reales. */
    name: string;
    /** Marcado como placeholder hasta que el usuario confirme cargos reales. */
    role: string;
}

/** 6 retratos de la p.12 del PDF (RULES §9.6). */
export const board: readonly BoardMember[] = [
    { name: 'José Cruz García', role: 'Presidente' },
    { name: 'Daniel Rosales Ruvalcaba', role: 'Vicepresidente' },
    { name: 'Andrés Eduardo Palma Fuentes', role: 'Responsabilidad social' },
    { name: 'Edgar Francisco Rincón Bello', role: 'Responsable de proyectos' },
    { name: 'Iker Montoro León', role: 'Finanzas' },
    { name: 'Isabella Susbielles Tobar', role: 'Comunicación' },
] as const;