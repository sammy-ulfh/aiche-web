/**
 * scripts/nav.ts — comportamiento del Nav y del MobileMenu.
 *
 * Vanilla TS, sin dependencias. Se carga una sola vez por página
 * desde `Layout.astro` (RULES §3.5: cero JS de framework).
 *
 * Envuelto en IIFE + try/catch por bloque (ADENDA §A2): cada
 * responsabilidad se inicializa por su cuenta y sale sin lanzar si su
 * elemento no existe. Un fallo en el menú móvil no puede dejar el nav
 * sin su comportamiento sticky, ni al revés.
 *
 * Responsabilidades (dos desde F5b):
 *  1. Sticky con sentinel + IntersectionObserver (RULES §7.1):
 *     evita listeners de scroll. Reserva altura desde el primer
 *     render → cero CLS (RULES §7.7).
 *  2. Menú móvil (RULES §7.3): hamburguesa + panel, focus trap simple,
 *     bloqueo de scroll del body.
 *
 * **Los submenús de escritorio ya no llevan JS.** En F5b los tres items
 * con subpáginas pasaron a ser enlaces directos y su panel se despliega
 * con `:hover` / `:focus-within` en CSS (`global.css`). Eso retira ~70
 * líneas de estado, ARIA manual y listeners de documento, y elimina de
 * paso el acordeón del panel móvil, cuyos hijos van ahora siempre a la
 * vista.
 *
 * Nota de mejora progresiva: el nav es navegable sin JS. Todos los
 * enlaces son `<a>` en el marcado; lo único que aporta el JS es el
 * panel móvil.
 */

(() => {
    /* ---------- 1. Sticky con sentinel ------------------------------ */
    function setupSticky(nav: HTMLElement): void {
        const sentinel = nav.querySelector<HTMLElement>('[data-nav-sentinel]');
        if (!sentinel) return;
        if (!('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                // El sentinel queda fuera del viewport → nav está en posición sticky.
                nav.dataset.stuck = entry.isIntersecting ? 'false' : 'true';
            },
            { threshold: 0 },
        );
        observer.observe(sentinel);
    }

    /* ---------- 2. Menú móvil con focus trap ------------------------ */
    function setupMobileMenu(nav: HTMLElement): void {
        // Hay DOS disparadores: la hamburguesa y la ✕ de dentro del panel.
        // Antes se usaba `querySelector` y la ✕ se quedaba sin listener.
        const toggles = Array.from(
            nav.querySelectorAll<HTMLButtonElement>('[data-mobile-toggle]'),
        );
        const panel = nav.querySelector<HTMLElement>('[data-mobile-panel]');
        if (toggles.length === 0 || !panel) return;

        /** La hamburguesa: es a quien se devuelve el foco al cerrar. */
        const opener = toggles[0];
        let open = false;

        const focusableSelector =
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

        const getFocusable = () =>
            Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));

        /**
         * La visibilidad del panel la resuelve el CSS a partir de
         * `data-open` (ver global.css). El marcado ya no lleva la clase
         * `hidden` de Tailwind, que antes lo mantenía en `display:none`
         * pasara lo que pasara y hacía que el menú no se abriera nunca.
         */
        const setOpen = (next: boolean, moveFocus = true) => {
            open = next;
            toggles.forEach((t) => t.setAttribute('aria-expanded', String(next)));
            panel.dataset.open = next ? 'true' : 'false';
            document.body.style.overflow = next ? 'hidden' : '';
            if (!moveFocus) return;
            if (next) {
                getFocusable()[0]?.focus({ preventScroll: true });
            } else {
                opener.focus({ preventScroll: true });
            }
        };

        const onToggle = () => setOpen(!open);

        const onPanelKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
            } else if (e.key === 'Tab' && open) {
                // Focus trap simple: mantener el foco dentro del panel.
                const items = getFocusable();
                if (items.length === 0) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        /**
         * Frontera del lienzo: 80rem. Es el mismo valor que
         * `--breakpoint-canvas` en `global.css`, y por eso se LEE de ahí
         * en vez de repetirlo: si el token cambia, el JS lo sigue solo.
         * El fallback de 80rem sólo actúa si la variable no resolviera.
         */
        const canvasQuery = () => {
            const bp =
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--breakpoint-canvas')
                    .trim() || '80rem';
            return window.matchMedia(`(min-width: ${bp})`);
        };

        const onResize = () => {
            // Si pasamos al lienzo, cerrar el panel y liberar el scroll:
            // ahí el panel es `display:none` y su foco quedaría huérfano.
            if (open && canvasQuery().matches) {
                setOpen(false, false);
            }
        };

        // El `click` ya cubre Enter y Espacio en un <button>; el keydown
        // extra que había antes disparaba `setOpen` dos veces por pulsación.
        toggles.forEach((t) => t.addEventListener('click', onToggle));
        panel.addEventListener('keydown', onPanelKey);
        window.addEventListener('resize', onResize);

        setOpen(false, false); // estado inicial cerrado, sin tocar el foco
    }

    /* ---------- bootstrap ------------------------------------------- */
    function init() {
        const nav = document.querySelector<HTMLElement>('[data-nav]');
        if (!nav) return;

        // Cada bloque se aísla: si uno lanza, el otro se inicializa
        // igualmente (ADENDA §A2).
        try {
            setupSticky(nav);
        } catch {
            /* el nav sigue siendo sticky por CSS */
        }

        try {
            setupMobileMenu(nav);
        } catch {
            /* sin panel móvil */
        }
    }

    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    } catch {
        /* el nav es navegable sin JS */
    }
})();
