/**
 * Copy verbatim del sitio AIChE GDL (RULES §9).
 *
 * **Responsabilidad:** el TEXTO visible, y sólo eso. Los datos con vida
 * propia viven en su módulo y se importan desde allí, no desde aquí:
 *   · fecha, nombre y sede del evento → `data/event.ts`
 *   · lista de competencias          → `data/competitions.ts`
 *   · paquetes de patrocinio          → `data/sponsors.ts`
 *   · identidad, contacto y SEO       → `data/site.ts`
 *
 * Antes este archivo los re-exportaba, así que el mismo dato tenía dos
 * caminos de import válidos y cada consumidor elegía uno distinto
 * (ADENDA §A4). Los re-exports se eliminaron en F3.
 *
 * Cada bloque es `as const` para que TS lo trate como literal.
 * Los `[FIX]` aplicados aquí están documentados en `docs/TODO.md`.
 *
 * NO se copia copy dentro de archivos `.astro`: se importa desde aquí.
 */

// ============================================================
// 9.1 Hero (p.1)
// ============================================================
export const hero = {
    title: 'AIChE GDL',
    titleAccent: 'Capítulo estudiantil',
    paragraph:
        'Somos un grupo estudiantil del Instituto Tecnológico y de Estudios Superiores de Monterrey, Campus Guadalajara, que desarrolla talento, transforma conocimiento en proyectos y genera impacto mediante la participación en competencias, divulgación científica, innovación y colaboración, con la meta de representar a la institución en las distintas competencias impulsadas por el American Institute of Chemical Engineers (AIChE).',
    countdownEyebrow: 'FALTAN',
    countdownBoxes: ['DÍAS', 'HORAS', 'MIN', 'SEG'],
    /** CTA del SponsorTeaser (en home). */
    sponsorTeaserCta: 'Ver paquetes',
    sponsorTeaserCtaHref: '/patrocinios',
} as const;

// ============================================================
// 9.2 Acerca de Nosotros (p.5)
// ============================================================
export const about = {
    title: 'Acerca de Nosotros',
    question: '¿Qué puede lograr una comunidad con el deseo de crear algo significativo?',
    paragraph:
        'En la comunidad de AIChE GDL, creemos firmemente que la ingeniería también se construye fuera del aula: al compartir ideas, enfrentar desafíos y aprender unos de otros. Aunque nuestro origen está en la Ingeniería Química, colaboramos en un espacio interdisciplinario que involucra estudiantes de distintas carreras STEM, donde cada integrante puede descubrir sus capacidades únicas, aportar desde su perspectiva y crecer junto a personas que comparten el deseo de crear algo significativo. Más allá de formar equipos para concursos, buscamos construir una comunidad capaz de aprender de cada experiencia, ampliar sus horizontes e imaginar nuevas posibilidades, con el objetivo de avanzar con conocimiento, colaboración y visión hacia el futuro.',
    videoBadge: 'HIGHLIGHTS',
    videoTitle: 'Así se vive la experiencia AIChE GDL',
    videoCaption:
        'Más de 200 estudiantes de distintas carreras y niveles educativos han participado en el proyecto.',
    videoChip: '19 SEP · 19:00 H',
} as const;

// ============================================================
// 9.3 Participaciones (p.6)
// ============================================================
// Datos del evento (sede/fecha) vienen de `event.ts` para evitar
// duplicación. La lista de competencias viene de `competitions.ts`
// (RULES §6: archivo propio para el data layer). Aquí sólo queda
// el copy propio de la sección.
import {
    contactEmail,
    contactMailto,
    contactInstagramHandle,
    contactInstagramUrl,
} from './site';
import {
    venue,
    venueLocation,
    eventName,
    eventDateHuman,
    eventDateShort,
    eventDateLabels,
} from './event';

// ============================================================
// 9.4 La competencia (p.7 azul + p.11 crema — una sección, dos variantes)
// ============================================================
export const competition = {
    eyebrow: 'LA COMPETENCIA',
    whatTitle: '¿Qué es la Southwest Student Regional Conference?',
    // FIX importante: el PDF tiene dos versiones contradictorias
    // (McNeese/primavera vs Texas/27 de marzo). McNeese State University
    // está en Lake Charles, Louisiana. Unificamos (RULES §9.4).
    whatBody: `La Regional South West de Chem-E-Car es una competencia organizada por AIChE donde equipos universitarios del suroeste de Estados Unidos y México diseñan y construyen un vehículo a pequeña escala impulsado y detenido mediante reacciones químicas. El objetivo es recorrer con precisión una distancia anunciada el mismo día de la competencia, demostrando innovación, seguridad y aplicación práctica de la ingeniería química. Esta regional se llevará a cabo en ${venue.name}, en ${venueLocation}, el ${eventDateHuman}, y funciona como clasificatoria para la competencia nacional.`,
    whyTitle: '¿Por qué queremos participar?',
    whyBody:
        'Participar en esta competencia nos permite aplicar conocimientos de ingeniería química en un reto real, desarrollar habilidades clave como trabajo en equipo, liderazgo y resolución de problemas, y representar a nuestra institución a nivel internacional. Además, es una oportunidad para vincularnos con la industria, ganar visibilidad como capítulo estudiantil y prepararnos para competir en la conferencia anual de AIChE.',
} as const;

export const participations = {
    title: 'Participaciones',
    subtitle:
        '¡Conoce los equipos, proyectos y capacidades que estamos desarrollando para representar a la institución en las competencias internacionales del American Institute of Chemical Engineers (AIChE)!',
    // FIX: el PDF dice "compentencias" y "de el" (RULES §9.3).
    nextEvent: {
        eyebrow: 'PRÓXIMO EVENTO',
        title: eventName,
        rows: [
            { label: eventDateLabels.date, value: eventDateHuman },
            { label: eventDateLabels.venue, value: venue.name },
            {
                label: eventDateLabels.location,
                value: `${venue.addressLocality}, Louisiana`,
            },
        ] as const,
    },
    /**
     * Botón de la tarjeta hacia la página del evento. Sólo lo muestra
     * `/participaciones`: sin él, esa página no tiene ningún enlace dentro
     * del sitio. `srSuffix` completa el nombre accesible («Ver más sobre
     * The 2027…») sin alargar el texto visible, que tiene que caber junto
     * al chip «PRÓXIMO EVENTO».
     */
    eventLink: {
        label: 'Ver más',
        srSuffix: `sobre ${eventName}`,
        href: '/participaciones/southwest-2027',
    },
} as const;

// ============================================================
// 9.5 Patrocinios (p.9 + p.10)
// ============================================================
// Los paquetes (precio, beneficios) viven en `src/data/sponsors.ts`
// (RULES §6: archivo propio para el data layer). Aquí sólo queda el
// copy y los meta-datos propios de la sección: el contador
// `N BENEFICIOS` se calcula como `tier.benefits.length` desde el
// array, NUNCA se escribe a mano.
export const sponsors = {
    eyebrow: 'PATROCINIOS',
    title: 'Tu patrocinio nos lleva a competir',
    // RULES §9.5 ya elimina el inciso erróneo "en Texas" del PDF.
    paragraph: `Somos un capítulo estudiantil y cada competencia depende del apoyo que conseguimos. Un patrocinio nos permite diseñar y construir el vehículo de Chem-E-Car y llevarlo a la Southwest Student Regional Conference, el ${eventDateShort}, representando al Tecnológico de Monterrey Campus Guadalajara.`,
    packagesLabel: 'TRES PAQUETES',
    benefitsTitle: 'Qué recibe tu empresa',
    benefitsNote: 'Los tres paquetes incluyen posibilidad de facturación.',
} as const;

// ============================================================
// 9.6 Equipo (p.12)
// ============================================================
// El copy del encabezado vive aquí; la lista de la mesa directiva y los
// retratos viven en `src/data/team.ts` (RULES §6).
export const team = {
    /**
     * El PDF rotula esta diapositiva «ACERCA DE NOSOTROS» (p.13), pero desde
     * F6b el item del menú que lleva aquí se llama «Nuestro equipo»: las dos
     * etiquetas convivían en la misma pantalla diciendo cosas distintas. El
     * usuario decidió alinear el rótulo con el menú. Es la única desviación de
     * copy respecto a RULES §9 y está registrada en D-161.
     */
    eyebrow: 'NUESTRO EQUIPO',
    title: 'Conoce a nuestra mesa directiva y equipo',
    boardLabel: 'MESA DIRECTIVA',
    teamLabel: 'EQUIPO',
    /** Bajada del bloque EQUIPO (mismo texto que en p.5 video caption). */
    caption: 'Más de 200 estudiantes de distintas carreras y niveles educativos han participado en el proyecto.',
} as const;

// ============================================================
// 9.8 Página 404 (no está en RULES §9 — se documenta aquí)
// ============================================================
export const notFound = {
    eyebrow: '404',
    title: 'No encontramos esa página',
    body: 'La ruta que pediste no existe o se movió. Vuelve al inicio o usa los enlaces de abajo para encontrar lo que buscas.',
    ctaLabel: 'Volver al inicio',
    usefulHeading: 'ENLACES ÚTILES',
} as const;

// ============================================================
// 9.7 Contacto (p.13)
// ============================================================
export const contact = {
    eyebrow: 'CONTACTO',
    title: '¡TRABAJEMOS JUNTOS!',
    subtitle: 'CONTÁCTANOS',
    emailLabel: 'CORREO',
    instagramLabel: 'INSTAGRAM',
    // [PENDIENTE-USUARIO] La p.8 muestra hola@aichegdl.org.
    // Se usa el de la p.13 como oficial (RULES §9.7).
} as const;

/**
 * Los datos que necesita `ui/ContactActions` en un solo objeto.
 *
 * Existe para que esa primitiva no importe nada de `data/` (ADENDA §A4):
 * junta en un sitio los valores de contacto (`site.ts`) y sus etiquetas
 * (el bloque `contact` de arriba), y quien la use pasa este objeto tal
 * cual. Los valores siguen definidos UNA sola vez, en `site.ts`.
 */
export const contactActions = {
    email: contactEmail,
    mailto: contactMailto,
    instagramHandle: contactInstagramHandle,
    instagramUrl: contactInstagramUrl,
    emailLabel: contact.emailLabel,
    instagramLabel: contact.instagramLabel,
} as const;

// ============================================================
// 9.8 CTA de cierre (p.8)
// ============================================================
// Email/Instagram derivan de site.ts para no duplicar ni contradecir §9.7
// (el de la p.13 es el oficial: aiche.gdl@gmail.com).
export const joinCta = {
    title: '¡Súmate al capítulo!',
    subtitle: 'El siguiente reto empieza contigo',
} as const;

// ============================================================
// SEO por ruta (RULES §14)
// ============================================================
export const seoRoutes = {
    home: {
        title: 'AIChE GDL — Capítulo Estudiantil',
        description:
            'Capítulo Estudiantil AIChE — Tec de Monterrey Campus Guadalajara. Conoce nuestras competencias, equipo y cómo sumarte.',
    },
    team: {
        title: 'Nuestro equipo',
        description:
            'Conoce a las personas que hacen posible AIChE GDL: mesa directiva y equipo.',
    },
    participations: {
        title: 'Participaciones',
        description:
            'Equipos y proyectos del capítulo para las competencias internacionales AIChE.',
    },
    southwest2027: {
        title: eventName,
        description: `La Regional South West de Chem-E-Car en ${venue.name}, ${venue.addressLocality}, Louisiana — ${eventDateHuman}.`,
    },
    sponsors: {
        title: 'Patrocinios',
        description:
            'Tres paquetes de patrocinio para llevar a AIChE GDL a la Southwest Student Regional Conference 2027.',
    },
    contact: {
        title: 'Contacto',
        description: 'Hablemos: correo e Instagram del Capítulo Estudiantil AIChE GDL.',
    },
} as const;
