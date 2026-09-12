/**
 * scripts/lazy-video.ts — videos que no descargan nada hasta el viewport.
 *
 * Vanilla TS, sin dependencias. Se carga una sola vez por página desde
 * el componente raíz que use `<LazyVideo />` (RULES §3.5).
 *
 * Envuelto en IIFE para evitar colisiones de scope cuando varios scripts
 * se importan en la misma página (Astro los concatena implícitamente).
 *
 * Reglas (RULES §11.2):
 *  - Atributos `data-src` en `<source>` hasta que el video entra al
 *    viewport; entonces se mueven a `src` y se hace `load()` + `play()`.
 *  - `muted playsinline loop preload="none"` ya en el HTML (los pone
 *    el componente).
 *  - Pausa al salir del viewport.
 *  - Pausa con `visibilitychange` si la pestaña se oculta.
 *  - `prefers-reduced-motion: reduce` → poster + botón de play manual.
 *  - `navigator.connection.saveData === true` o 2g/slow-2g → idem.
 *  - Si `play()` es rechazada → mostrar el botón.
 *  - Botón con `aria-label` en español.
 */

(() => {
    interface LazyVideoFigure extends HTMLElement {
        _io?: IntersectionObserver;
        _visible?: boolean;
        _ready?: boolean;
    }

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = () => mql.matches;

    const isSlowConnection = () => {
        const c = (
            navigator as Navigator & {
                connection?: { saveData?: boolean; effectiveType?: string };
            }
        ).connection;
        if (!c) return false;
        if (c.saveData) return true;
        return c.effectiveType === '2g' || c.effectiveType === 'slow-2g';
    };

    function setupVideo(figure: LazyVideoFigure, observerSupported = true): void {
        const video = figure.querySelector<HTMLVideoElement>('[data-lazy-video-el]');
        const playBtn = figure.querySelector<HTMLButtonElement>('[data-lazy-video-play]');
        const tpl = figure.querySelector<HTMLTemplateElement>('[data-lazy-video-template]');
        if (!video || !playBtn || !tpl) return;

        const forceAutoplay = figure.dataset.forceAutoplay === 'true';
        const shouldAutoplay =
            forceAutoplay || (!prefersReducedMotion() && !isSlowConnection());

        let activated = false;
        let userWantsPlay = false;

        const injectSources = () => {
            if (activated) return;
            activated = true;
            const sources = tpl.content.querySelectorAll<HTMLSourceElement>('source');
            for (const tplSource of Array.from(sources)) {
                const url = tplSource.dataset.src;
                if (!url) continue;
                // El `<source>` del template guarda la URL en `data-src` para
                // que el navegador no descargue nada. Al activarse hay que
                // pasarla a `src`: clonar el nodo tal cual dejaba el `<source>`
                // sin `src` y el video no cargaba nunca (F1).
                const live = document.createElement('source');
                live.src = url;
                if (tplSource.type) live.type = tplSource.type;
                video.appendChild(live);
            }
        };

        const showPlay = () => {
            playBtn.hidden = false;
            playBtn.classList.remove('opacity-0');
            playBtn.classList.add('opacity-100');
        };

        const hidePlay = () => {
            playBtn.hidden = true;
            playBtn.classList.add('opacity-0');
            playBtn.classList.remove('opacity-100');
        };

        const tryPlay = async () => {
            try {
                await video.play();
                hidePlay();
            } catch {
                showPlay();
            }
        };

        const pause = () => {
            if (!video.paused) video.pause();
        };

        const onIntersect: IntersectionObserverCallback = (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    figure._visible = true;
                    injectSources();
                    video.load();
                    if (shouldAutoplay || userWantsPlay) tryPlay();
                } else {
                    figure._visible = false;
                    pause();
                }
            }
        };

        if (observerSupported) {
            const observer = new IntersectionObserver(onIntersect, {
                threshold: 0.25,
                rootMargin: '200px 0px',
            });
            observer.observe(figure);
            figure._io = observer;
        } else {
            // Sin observer no se puede saber cuándo entra en pantalla: se
            // ofrece el play manual en vez de descargar el video a ciegas.
            showPlay();
        }

        const onVisibility = () => {
            if (document.hidden) pause();
        };
        document.addEventListener('visibilitychange', onVisibility);

        playBtn.addEventListener('click', async () => {
            userWantsPlay = true;
            injectSources();
            video.load();
            await tryPlay();
        });

        // Si reduced-motion o saveData, mostrar el botón desde el inicio.
        if (!shouldAutoplay) {
            showPlay();
        }
    }

    function init() {
        // Sin IntersectionObserver no hay carga diferida posible: se deja el
        // poster y el botón de play manual, que no dependen del observer.
        const supported = 'IntersectionObserver' in window;
        document
            .querySelectorAll<HTMLElement>('[data-lazy-video]')
            .forEach((el) => {
                // Un video que falle no puede dejar a los demás sin
                // inicializar (ADENDA §A2).
                try {
                    setupVideo(el as LazyVideoFigure, supported);
                } catch {
                    /* este video se queda en su poster */
                }
            });
    }

    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    } catch {
        /* el poster del video ya está en el HTML: no se pierde contenido */
    }
})();
