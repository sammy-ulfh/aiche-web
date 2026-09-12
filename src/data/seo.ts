/**
 * JSON-LD generado desde data (RULES §14).
 *
 * Mantener estos objetos en un data layer (no en `pages/index.astro`)
 * evita que se dupliquen cuando otras rutas necesiten añadir Organization
 * o Event. Las páginas solo invocan `JSON.stringify(...)` y las inyectan
 * con `<script type="application/ld+json" set:html is:inline>`.
 */

import {
    siteName,
    siteUrl,
    siteDescription,
    contactEmail,
    contactInstagramUrl,
} from './site';
import { eventName, eventStartIso, venue } from './event';
import { media } from './media';

/** Rutas absolutas: schema.org las quiere completas, no relativas. */
const abs = (path: string) => new URL(path, siteUrl).toString();

/** `Event` para The 2027 AIChE Southwest Student Regional Conference. */
export const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventName,
    startDate: eventStartIso,
    // `url` e `image` son las dos propiedades recomendadas que faltaban
    // para que Google pueda mostrar el evento como resultado enriquecido
    // (F7). No se declara `endDate`: el PDF no da fecha de cierre y aquí
    // no se inventan datos (RULES regla 7).
    url: abs('/participaciones/southwest-2027/'),
    image: abs('/og.jpg'),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
        '@type': 'Place',
        name: venue.name,
        address: {
            '@type': 'PostalAddress',
            addressLocality: venue.addressLocality,
            addressRegion: venue.addressRegion,
            addressCountry: venue.addressCountry,
        },
    },
    organizer: {
        '@type': 'Organization',
        name: siteName,
        email: contactEmail,
        url: siteUrl,
    },
} as const;

/** `Organization` + `CollegeOrUniversity` padre (RULES §14). */
export const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    email: contactEmail,
    description: siteDescription,
    // `logo` y `sameAs` faltaban (F7): son las señales con las que un
    // buscador enlaza la organización con su marca y sus perfiles.
    logo: abs(media.isotipo.src),
    sameAs: [contactInstagramUrl],
    parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: 'Tecnológico de Monterrey, Campus Guadalajara',
    },
} as const;