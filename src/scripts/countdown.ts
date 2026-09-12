/**
 * scripts/countdown.ts — contador regresivo (RULES §15).
 *
 * Vanilla TS, sin dependencias. Wrapeado en IIFE para evitar
 * colisiones de scope con otros scripts (D-028).
 *
 * Comportamiento:
 *  - Lee `data-target` (ISO con zona) del contenedor en build-time
 *    (el componente Astro ya pinta los números correctos → cero flash).
 *  - Un único `setInterval(1s)`.
 *  - `visibilitychange` → pausa si la pestaña está oculta; al volver,
 *    recalcula desde `Date.now()` (sin acumular drift).
 *  - `IntersectionObserver` → pausa si el contador sale del viewport;
 *    al volver, recalcula.
 *  - Estado post-evento: muestra el mensaje de `data-post-event`
 *    y oculta los números. NUNCA números negativos.
 *  - ARIA: `aria-live="off"` en los números (no se lee cada segundo)
 *    + texto accesible alterno "Faltan N días…" en `[data-sr-text]`.
 *  - `tabular-nums` (clase `.stat-num` en global.css) evita CLS
 *    porque los dígitos mantienen el mismo ancho.
 */

(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    function pad2(n: number): string {
        return n < 10 ? `0${n}` : String(n);
    }

    function compute(targetMs: number) {
        const diff = targetMs - Date.now();
        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
        }
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { days, hours, minutes, seconds, isOver: false };
    }

    function setup(root: HTMLElement) {
        const targetIso = root.dataset.target;
        const postEventMsg = root.dataset.postEvent || '¡Ya estamos compitiendo!';
        if (!targetIso) return;

        const targetMs = new Date(targetIso).getTime();
        if (Number.isNaN(targetMs)) return;

        const daysEl = root.querySelector<HTMLElement>('[data-cd-days]');
        const hoursEl = root.querySelector<HTMLElement>('[data-cd-hours]');
        const minutesEl = root.querySelector<HTMLElement>('[data-cd-minutes]');
        const secondsEl = root.querySelector<HTMLElement>('[data-cd-seconds]');
        const srTextEl = root.querySelector<HTMLElement>('[data-cd-sr]');
        const postEventEl = root.querySelector<HTMLElement>('[data-cd-post]');
        const boxesEl = root.querySelector<HTMLElement>('[data-cd-boxes]');
        const eyebrowEl = root.querySelector<HTMLElement>('[data-cd-eyebrow]');
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        let intervalId: number | null = null;
        let isVisible = true;
        let isHidden = false;
        let isOver = false;

        const stop = () => {
            if (intervalId === null) return;
            window.clearInterval(intervalId);
            intervalId = null;
        };

        /**
         * Estado post-evento (RULES §15). Es terminal: se pinta una vez,
         * se para el intervalo y no se vuelve a tocar nada.
         *
         * F6 corrige dos cosas:
         *  - El intervalo seguía corriendo para siempre después de la
         *    fecha, repintando el mismo mensaje cada segundo.
         *  - El eyebrow «FALTAN» se quedaba encima del mensaje.
         * Y el texto accesible alterno pasa también al mensaje: antes se
         * quedaba congelado en el último «Faltan 0 días…».
         */
        const showPostEvent = () => {
            if (isOver) return;
            isOver = true;
            if (boxesEl) boxesEl.hidden = true;
            if (eyebrowEl) eyebrowEl.hidden = true;
            if (srTextEl) srTextEl.textContent = postEventMsg;
            if (postEventEl) {
                postEventEl.hidden = false;
                postEventEl.textContent = postEventMsg;
            }
            stop();
        };

        const render = () => {
            const { days, hours, minutes, seconds, isOver } = compute(targetMs);
            if (isOver) {
                showPostEvent();
                return;
            }
            daysEl.textContent = String(days);
            hoursEl.textContent = pad2(hours);
            minutesEl.textContent = pad2(minutes);
            secondsEl.textContent = pad2(seconds);
            if (srTextEl) {
                srTextEl.textContent =
                    `Faltan ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos para nuestra próxima competencia.`;
            }
        };

        const start = () => {
            if (intervalId !== null) return;
            render();
            intervalId = window.setInterval(render, 1000);
        };

        const evaluate = () => {
            if (isHidden || !isVisible) stop();
            else if (!isOver) start();
        };

        // Pausa con visibilitychange.
        const onVisibility = () => {
            isHidden = document.hidden;
            evaluate();
        };
        document.addEventListener('visibilitychange', onVisibility);

        // Pausa al salir del viewport. Sin soporte de IntersectionObserver
        // el contador simplemente no se pausa: sigue contando.
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        isVisible = entry.isIntersecting;
                        evaluate();
                    }
                },
                { threshold: 0 },
            );
            io.observe(root);
        }

        // Primer arranque (no necesitamos esperar al primer tick: el
        // componente ya pintó el valor inicial en build).
        if (mql.matches) {
            // reduced-motion: pintar una vez y dejar de actualizar.
            render();
        } else {
            start();
        }
    }

    function init() {
        document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
            // Un contador que falle no puede dejar a los demás sin
            // inicializar (ADENDA §A2).
            try {
                setup(el);
            } catch {
                /* se quedan los valores pintados en build */
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
        /* el componente ya pintó los números en build: no se pierde nada */
    }
})();
