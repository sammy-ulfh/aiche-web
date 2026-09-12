/**
 * Fuente única de las competencias AIChE a las que el capítulo se
 * prepara para participar (RULES §9.3, §6).
 *
 * Este archivo es la **única** referencia para:
 *   - La lista de 4 competencias que aparece en `/participaciones`.
 *   - El teaser "Rumbo a las competencias AIChE" del home (NextEvent).
 *
 * La lista es `as const` para que TS la trate como literal. Las
 * categorías (`SPRING 2027` / `OPEN CALL 2027`) son las mismas del
 * PDF p.6 — no se renombran ni se traducen.
 *
 * `competition` (el copy largo de §9.4: ¿qué es la SWSRC? + ¿por qué
 * queremos participar?) **no** vive aquí: está en `content.ts`
 * porque ya se gestiona junto al resto del copy verbatim.
 */

/** Categoría de la competencia según el PDF p.6. */
export type CompetitionTag = 'SPRING 2027' | 'OPEN CALL 2027';

export interface Competition {
    readonly tag: CompetitionTag;
    readonly name: string;
    readonly blurb: string;
}

/**
 * Bloque introductorio de "Rumbo a las competencias AIChE"
 * (RULES §9.3). Se renderiza junto a la lista.
 */
const competitionsTitleLines = ['Rumbo a las', 'competencias AIChE'] as const;

export const competitionsIntro = {
    title: competitionsTitleLines.join(' '),
    titleLines: competitionsTitleLines,
    body: 'Nos preparamos para llevar nuestro talento, creatividad y trabajo en equipo a las competencias AIChE del próximo año.',
} as const;

/**
 * Lista canónica de las 4 competencias. Mantenerla en este orden
 * (Chem-E-Car → ChemE Jeopardy → Chem-E-Cube → K12 STEM Outreach),
 * coincide con el orden del PDF p.6.
 */
export const competitions: readonly Competition[] = [
    {
        tag: 'SPRING 2027',
        name: 'Chem-E-Car Competition',
        blurb: 'Química que impulsa',
    },
    {
        tag: 'SPRING 2027',
        name: 'ChemE Jeopardy',
        blurb: 'Conocimiento bajo presión',
    },
    {
        tag: 'OPEN CALL 2027',
        name: 'Chem-E-Cube Competition',
        blurb: 'Ingeniería en acción',
    },
    {
        tag: 'OPEN CALL 2027',
        name: 'K12 STEM Outreach',
        blurb: 'Inspirando vocaciones científicas',
    },
] as const;
