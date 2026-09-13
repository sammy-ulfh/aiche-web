/**
 * Datos del sitio AIChE GDL.
 *
 * Fuente única para: identidad del sitio, URLs, contacto y SEO por
 * defecto. Si el usuario cambia el dominio o el correo, se modifica aquí
 * y se propaga a todo el sitio (RULES §19).
 *
 * **Los datos del evento (fecha, nombre, sede) NO están aquí**: viven en
 * `data/event.ts`, que es su fuente única (ADENDA §A4).
 */

// Dominio de producción: el subdominio que Vercel asigna al proyecto
// `aiche-web`. Si se compra un dominio propio, se cambia aquí.
//
// **Esta línea es el único sitio donde vive el dominio.** Cambiarla
// propaga a canonical, Open Graph, Twitter, el JSON-LD de Organization y
// Event, los dos sitemaps y `robots.txt`. Verificado en F8 sustituyéndola
// y comprobando que no queda una sola aparición del dominio anterior en
// `dist/` (D-183). Hasta F8 no era cierto: `astro.config.mjs` y
// `public/robots.txt` lo tenían escrito a mano por su cuenta.
export const siteUrl = 'https://aiche-web.vercel.app';

/**
 * Preview pública: bloquea a los buscadores (D-185).
 *
 * Mientras el sitio vive en un bucket de S3 como preview y `siteUrl`
 * sigue siendo el placeholder, cualquier indexación apuntaría a un
 * dominio que no existe. Con esto en `true`, el `robots.txt` que genera
 * el build es un `Disallow: /` para todos los agentes y **no publica el
 * sitemap**.
 *
 * **El día del lanzamiento hay que ponerlo en `false`** — junto con el
 * dominio real en `siteUrl`, es lo único que separa el sitio de estar
 * indexable. Anotado en `docs/TODO.md` (P-005).
 *
 * Ojo con el alcance: `robots.txt` impide el *rastreo*, no garantiza la
 * desindexación de una URL que alguien enlace desde fuera. Para eso
 * haría falta además `noindex` en todas las páginas; no se hace porque
 * ese mismo `noindex` es justo lo que no se puede olvidar encendido el
 * día del lanzamiento.
 */
export const previewNoIndex = false;

// Identidad
export const siteName = 'AIChE GDL';
export const siteTagline = 'Capítulo Estudiantil';
export const siteOrg = 'Tec de Monterrey · Campus Guadalajara';
export const siteDescription =
    'Capítulo Estudiantil AIChE — Tec de Monterrey Campus Guadalajara. Participamos en competencias internacionales de ingeniería química, divulgación científica e innovación.';

// Contacto (RULES §9.7). El de la p.13 es el oficial.
export const contactEmail = 'aiche.gdl@gmail.com';
export const contactEmailSubject = 'Contacto AIChE GDL';
export const contactInstagramHandle = 'aiche.gdl';
export const contactInstagramUrl = 'https://instagram.com/aiche.gdl';
export const contactMailto = `mailto:${contactEmail}?subject=${encodeURIComponent(contactEmailSubject)}`;

// Contador regresivo (RULES §15).
// La fecha y el nombre del evento NO están aquí: son datos del evento y
// viven en `data/event.ts`, su fuente única (ADENDA §A4). Aquí sólo queda
// el copy propio del componente contador.
export const countdownLabel = '¡PARA NUESTRA PRÓXIMA COMPETENCIA!';
/** Etiquetas de las 4 cajas del contador (en orden). Centralizadas para
 *  que el componente `Countdown` no tenga strings de copy hardcoded. */
export const countdownBoxLabels = ['DÍAS', 'HORAS', 'MIN', 'SEG'] as const;
/** Mensaje post-evento (RULES §15: nunca números negativos). */
export const countdownPostEvent = '¡Ya estamos compitiendo!';

// Footer (RULES §9.8). El año se calcula en build.
export const footerLegalText =
    'CAPÍTULO ESTUDIANTIL AICHE · TEC DE MONTERREY GUADALAJARA';
export const footerBuildYear = new Date().getFullYear();

// SEO por defecto (RULES §14).
export const seoDefaults = {
    locale: 'es_MX',
    type: 'website' as const,
    themeColor: '#123f72',
    twitterCard: 'summary_large_image' as const,
};
