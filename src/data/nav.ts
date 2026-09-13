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

export interface NavItem {
    /** Etiqueta visible en español. */
    label: string;
    /** Ruta absoluta sin barra final (`/equipo`). */
    href: string;
}

/** Enlace del botón "Únete" del nav (RULES §8: apunta a /contacto#unete). */
export const joinHref = '/contacto#unete';

/** Etiqueta del botón "Únete" (esquina superior derecha del nav + final del mobile menu). */
export const joinLabel = 'Únete';

/** Bloque izquierdo del nav: icono de casa + etiqueta. */
export const homeLink = { label: 'Inicio', href: '/' } as const;

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
    // Sin submenús: cada item es un enlace directo a su página. Los
    // subenlaces y su desplegable se retiraron por decisión del usuario.
    // El primer item es la presentación del equipo: retratos de la mesa
    // directiva y foto de grupo (p.13 del PDF).
    { label: 'Nuestro equipo', href: '/equipo' },
    { label: 'Participaciones', href: '/participaciones' },
    { label: 'Patrocinios', href: '/patrocinios' },
    { label: 'Contacto', href: '/contacto' },
] as const;

/**
 * Valor de `aria-current` de un item del menú para la ruta actual (sin
 * barra final): `page` en su propia página y `location` en una subruta
 * suya —`/participaciones/southwest-2027` marca «Participaciones» como
 * sección—. Lo comparten el Nav de escritorio y el panel móvil.
 */
export function navCurrent(currentPath: string, href: string): 'page' | 'location' | undefined {
    if (currentPath === href) return 'page';
    if (href !== '/' && currentPath.startsWith(`${href}/`)) return 'location';
    return undefined;
}
