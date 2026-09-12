/**
 * Fuente ÚNICA de los datos del evento competitivo (ADENDA §A4).
 *
 * Aquí y sólo aquí se definen la fecha, el nombre y la sede de
 * The 2027 AIChE Southwest Student Regional Conference. Todo lo demás
 * —el contador, el JSON-LD `Event`, las filas FECHA/SEDE/UBICACIÓN, las
 * descripciones SEO y la prosa que menciona la fecha— se deriva de estas
 * constantes.
 *
 * Antes de F3 estos datos estaban partidos: el ISO y el nombre vivían en
 * `site.ts` y la sede en este archivo, mientras dos cadenas de copy
 * repetían "27 de marzo de 2027" y "Lake Charles, Louisiana" escritas a
 * mano. Cambiar la fecha dejaba esas dos frases obsoletas en silencio
 * (`docs/AUDIT-F2.md` §4.4).
 *
 * **Si cambia la fecha o la sede, se cambia aquí y se propaga sola.**
 */

/** Momento exacto del evento, con zona horaria. Base de todo lo demás. */
export const eventStartIso = '2027-03-27T09:00:00-06:00';

/** Nombre oficial completo. Se usa también en el JSON-LD `Event`. */
export const eventName = 'The 2027 AIChE Southwest Student Regional Conference';

/** Sede (RULES §9.4). */
export const venue = {
    name: 'McNeese State University',
    addressLocality: 'Lake Charles',
    addressRegion: 'LA',
    addressCountry: 'US',
} as const;

/** "Lake Charles, Louisiana" — la forma en que la sede aparece en el copy. */
export const venueLocation = `${venue.addressLocality}, Louisiana`;

/** Fecha larga: "27 de marzo de 2027". Derivada en build desde el ISO. */
export const eventDateHuman = new Date(eventStartIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

/** Fecha corta sin año: "27 de marzo". Para la prosa que no repite el año. */
export const eventDateShort = new Date(eventStartIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
});

/** Etiquetas reutilizables en las filas `FECHA / SEDE / UBICACIÓN` (RULES §9.3). */
export const eventDateLabels = {
    date: 'FECHA',
    venue: 'SEDE',
    location: 'UBICACIÓN',
} as const;
