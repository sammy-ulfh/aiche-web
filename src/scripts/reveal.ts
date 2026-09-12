/**
 * scripts/reveal.ts — fade + translateY al entrar al viewport.
 *
 * Vanilla TS, sin dependencias. Envuelto en IIFE + try/catch para que
 * una excepción aquí no pueda tumbar a los demás módulos de cliente
 * (ADENDA §A2).
 *
 * ── Contrato de mejora progresiva (ADENDA §A2) ──────────────────────
 * El estado por defecto de `[data-reveal]` es **VISIBLE**. Quien oculta
 * es el CSS, y sólo cuando `<html>` lleva la clase `js-reveal`, que
 * añade el script inline del `<head>` en `Layout.astro`.
 *
 * Por tanto:
 *  - Sin JavaScript          → no hay clase → todo visible.
 *  - Con `reduce`            → el CSS no oculta → todo visible.
 *  - Si este módulo no carga → el interruptor de hombre muerto del
 *    `<head>` retira la clase → todo visible.
 *
 * Ningún camino de fallo deja texto invisible. Ésta es la corrección de
 * la causa raíz documentada en `docs/AUDIT-F2.md` §1.
 *
 * Al arrancar, los elementos que ya están dentro del viewport inicial se
 * revelan **sin animación**: evita el parpadeo de entrada en el contenido
 * que el usuario ya está mirando.
 */

(() => {
    try {
        const root = document.documentElement;

        /**
         * Avisa al `<head>` de que este módulo tomó el control y desarma su
         * temporizador de hombre muerto.
         *
         * Además deja `data-reveal-state="ready"` en el `<html>`. Es la
         * señal que usa `scripts/check-render.mjs` para distinguir dos
         * situaciones que se ven igual en pantalla: que el reveal funcione,
         * o que haya muerto y el fallback del `<head>` haya salvado la
         * página. Sin este marcador el guard daría por bueno un reveal
         * silenciosamente roto.
         */
        const takeOver = () => {
            root.dataset.revealState = 'ready';
            const w = window as Window & { __revealReady?: () => void };
            if (typeof w.__revealReady === 'function') w.__revealReady();
        };

        /** Devuelve el sitio a su estado visible y desarma el ocultado. */
        const showEverything = () => {
            root.classList.remove('js-reveal');
            takeOver();
        };

        const prefersReducedMotion = () =>
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function init() {
            // Sin soporte de IntersectionObserver o con reduced-motion no
            // hay nada que animar: se retira el ocultado y listo.
            if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
                showEverything();
                return;
            }

            const els = Array.from(
                document.querySelectorAll<HTMLElement>('[data-reveal]'),
            );

            // Página sin reveals (p. ej. una ruta futura): nada que hacer,
            // pero hay que desarmar el ocultado igualmente.
            if (els.length === 0) {
                showEverything();
                return;
            }

            takeOver();

            const observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (!entry.isIntersecting) continue;
                        const el = entry.target as HTMLElement;
                        const delay = Number(el.dataset.revealDelay || 0);
                        const once = el.dataset.revealOnce !== 'false';
                        window.setTimeout(() => el.classList.add('is-revealed'), delay);
                        if (once) observer.unobserve(el);
                    }
                },
                { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
            );

            const viewportH = window.innerHeight;

            for (const el of els) {
                // Lo que ya está en pantalla se muestra de inmediato y sin
                // animación: nada de fundido sobre contenido ya visible.
                if (el.getBoundingClientRect().top < viewportH) {
                    el.classList.add('is-revealed', 'is-revealed-instant');
                    continue;
                }
                observer.observe(el);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    } catch {
        // Último recinto de seguridad: pase lo que pase, el contenido se ve.
        document.documentElement.classList.remove('js-reveal');
    }
})();
