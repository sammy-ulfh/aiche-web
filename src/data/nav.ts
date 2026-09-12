/**
 * Estructura del menú de navegación (RULES §7, §8).
 *
 * Un solo archivo define todos los enlaces: tocarlos aquí propaga
 * los cambios a Nav, MobileMenu y a los breadcrumbs futuros. Cero
 * duplicación (RULES §3.2).
 *
 * - Los elementos `href` que empiezan por `/` son rutas absolutas.
 * - Los que empiezan por `#` son anclas dentro de la misma página.
 * - El botón "Únete" siempre apunta a la constante `joinHref` (RULES §8).
 * - `chrome` concentra todos los textos del chrome de navegación
 *   (Nav + MobileMenu + SkipLink + Footer) para que un cambio de
 *   wording futuro toque un único archivo (RULES §6).
 */

import { contactMailto, contactInstagramUrl } from './site';
import { eventName } from './event';

export interface NavItem {
    /** Etiqueta visible en español. */
    label: string;
    /** Ruta absoluta (`/equipo`) o ancla (`#paquetes`). */
    href: string;
    /**
     * `true` = el item tiene subpáginas. Desde F5b **no** dibuja ningún
     * "+": el padre es un enlace directo a su propia página y el submenú
     * se despliega al pasar el ratón o al entrar el foco.
     */
    hasSubmenu?: boolean;
    /** Sub-elementos cuando `hasSubmenu`. */
    children?: readonly NavItem[];
}

/** Enlace del botón "Únete" del nav (RULES §8: apunta a /contacto#unete). */
export const joinHref = '/contacto/index.html';

/** Etiqueta del botón "Únete" (esquina superior derecha del nav + final del mobile menu). */
export const joinLabel = 'Únete';

/** Bloque izquierdo del nav: icono de casa + etiqueta. */
export const homeLink = { label: 'Inicio', href: '/index.html' } as const;

/** Identidad (isotipo + wordmark + bajada) del centro del nav. */
export const brand = {
    wordmark: 'AIChE GDL',
    tagline: 'TEC DE MONTERREY · CAMPUS GUADALAJARA',
} as const;

/**
 * Textos del chrome (Nav + MobileMenu + SkipLink + Footer).
 * Centralizados aquí para que un cambio de wording futuro toque
 * un único archivo (RULES §6 — "ningún string de copy vive en un .astro").
 */
export const chrome = {
    /** aria-label del `<nav>` principal en desktop. */
    navAria: 'Navegación principal',
    /** aria-label del icono de casa ("Inicio"). */
    homeAria: 'Ir al inicio',
    /** Sufijo sr-only del enlace de marca (isotipo + wordmark + bajada).
     *  Antes esto era un `aria-label` que sustituía al texto visible; el
     *  nombre accesible resultante no contenía la bajada y rompía WCAG
     *  2.5.3. Ahora se concatena al contenido visible (F7, D-166). */
    brandLinkSuffix: '— ir al inicio',
    /** aria-label del icono "Únete" (no se usa en markup actual — el texto va visible). */
    joinAria: 'Unirse al capítulo',
    /** aria-label del `<nav>` dentro del panel móvil. */
    mobileNavAria: 'Navegación móvil',
    /** aria-label del `<dialog>` del panel móvil. */
    mobilePanelAria: 'Menú principal',
    /** Etiqueta visible de la cabecera del panel móvil ("Menú"). */
    mobilePanelHeading: 'Menú',
    /** aria-label del botón hamburguesa. */
    mobileOpenAria: 'Abrir menú',
    /** aria-label del botón cerrar. */
    mobileCloseAria: 'Cerrar menú',
    /** Texto del SkipLink (primer elemento enfocable). */
    skipLink: 'Saltar al contenido principal',
} as const;

/** Contacto resumido para el nav (los valores definitivos viven en site.ts). */
export const navContact = {
    email: contactMailto,
    instagram: contactInstagramUrl,
} as const;

/** Estructura completa del menú principal. */
export const mainNav: readonly NavItem[] = [
    // El primer item del menú es la presentación del equipo: retratos de la
    // mesa directiva y foto de grupo (p.13 del PDF). No lleva submenú porque
    // no tiene subpáginas — antes era «Acerca de nosotros» con `/acerca/equipo`
    // colgando, y ni la etiqueta ni el destino decían lo que había dentro.
    { label: 'Nuestro equipo', href: '/equipo/index.html' },
    {
        label: 'Participaciones',
        href: '/participaciones/index.html',
        hasSubmenu: true,
        children: [
            {
                label: eventName,
                href: '/participaciones/southwest-2027',
            },
        ],
    },
    {
        label: 'Patrocinios',
        href: '/patrocinios/index.html',
        hasSubmenu: true,
        children: [
            { label: 'Tres paquetes', href: '/patrocinios#paquetes' },
            { label: 'Qué recibe tu empresa', href: '/patrocinios#beneficios' },
            { label: 'La competencia', href: '/patrocinios#competencia' },
        ],
    },
    { label: 'Contacto', href: '/contacto/index.html' },
] as const;
