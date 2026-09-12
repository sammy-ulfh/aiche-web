# VIDEO — decisión auto-alojado, comandos ffmpeg, presupuestos

> Decisión cerrada (RULES §11): los videos se sirven desde
> `public/media/video/` con `<video>` nativo. **Nada de YouTube, Vimeo
> ni iframes de terceros.** El componente `<LazyVideo />` implementa
> la carga diferida exigida por RULES §11.2.

## 1. Restricciones de los archivos finales

- **≤ 8 MB** por video (ideal 4–6 MB), duración **≤ 30–40 s**, 1080p o 720p.
- **Sin pista de audio** (`-an`): el autoplay es silencioso y se ahorra peso.
- **MP4/H.264** (`yuv420p`, `+faststart`) como fuente universal.
- **WebM/VP9** opcional como fuente adicional más ligera (mejor compresión).
- Poster: JPG extraído a 1–2 s, ≤ 80 KB.

| Slot | Ruta | MP4 | Poster | Estado actual |
|---|---|---|---|---|
| Acerca | `/acerca` | `about-highlight.mp4` | `about-poster.jpg` | stub de 20 B |
| Participaciones | `/participaciones` | `participations-highlight.mp4` | `chem-e-car.jpg` | stub de 20 B, añadido en F5 |

## 2. Comandos ffmpeg (producción)

```bash
# MP4
ffmpeg -i input.mov \
  -an -vf "scale=1920:-2" \
  -c:v libx264 -crf 26 -preset slow \
  -pix_fmt yuv420p -movflags +faststart \
  public/media/video/about-highlight.mp4

# WebM (opcional, fuente más ligera)
ffmpeg -i input.mov \
  -an -vf "scale=1920:-2" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 \
  public/media/video/about-highlight.webm

# Poster a partir del propio clip
ffmpeg -ss 00:00:01 -i public/media/video/about-highlight.mp4 \
  -frames:v 1 -q:v 3 \
  src/assets/media/images/about-poster.jpg
```

Para el segundo clip se repite el comando cambiando la salida a
`public/media/video/participations-highlight.mp4`; su poster esperado es
`src/assets/media/images/chem-e-car.jpg`. Ambos nombres están aislados en
`src/data/media.ts`.

> Si un video definitivo supera ~15 MB o dura minutos, hay que avisar
> al usuario antes de publicarlo (RULES §11.1). En ese caso se
> evaluaría Cloudflare Stream / Bunny — decisión del usuario, aislada
> en este único archivo.

## 3. Comportamiento del componente (RULES §11.2)

`src/components/media/LazyVideo.astro` + `src/scripts/lazy-video.ts`:

1. **0 bytes hasta el viewport.** El `<video>` se renderiza **sin `src`**.
   Las URLs viven en `<template><source data-src=...></template>` y el
   JS las mueve a `src` solo cuando el `IntersectionObserver` dispara.
2. **Autoplay silenciado:** `muted playsinline loop preload="none"`.
3. **Pausa al salir:** el observer dispara `video.pause()` cuando el
   video deja de intersectar.
4. **Pausa con pestaña oculta:** listener de `visibilitychange`.
5. **`prefers-reduced-motion: reduce`** → sin autoplay: poster + botón
   de play accesible con `aria-label="Reproducir video"`.
6. **`navigator.connection.saveData === true` o `effectiveType` 2g/**
   → mismo comportamiento que reduced-motion.
7. Si `play()` es rechazada por el navegador → mostrar el botón
   (nunca dejar un rectángulo negro).
8. El script se importa una sola vez en la página que use el
   componente, no se duplica por instancia.

## 4. Verificación end-to-end

Para confirmar que el video NO descarga nada hasta el viewport:

1. Abrir DevTools → Network → filtrar por `media`.
2. Cargar la página. No debe aparecer ninguna solicitud al `.mp4`/`.webm`.
3. Hacer scroll hasta que el video entre en viewport.
4. En ese momento, debe aparecer la solicitud al `.mp4` (o `.webm`
   si el navegador lo prefiere).

Adicionalmente, con `prefers-reduced-motion: reduce` activado (DevTools
→ Rendering → Emulate CSS media feature):

- El botón de play debe ser visible desde el inicio.
- Pulsarlo debe iniciar la carga + reproducción.

## 5. Generación de placeholders (RULES §10.3)

Si `ffmpeg` está disponible en el entorno:

```bash
ffmpeg -f lavfi -i "gradients=s=1920x1080:c0=0x0d2f57:c1=0x1a4f8a:speed=0.015:d=20:r=30" \
  -vf "drawgrid=w=120:h=120:t=1:c=white@0.08,drawtext=text='VIDEO PLACEHOLDER · 16\\:9':\
fontcolor=white@0.85:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2" \
  -an -c:v libx264 -crf 30 -preset veryfast -pix_fmt yuv420p -movflags +faststart \
  public/media/video/about-highlight.mp4

ffmpeg -ss 00:00:02 -i public/media/video/about-highlight.mp4 -frames:v 1 -q:v 3 \
  src/assets/media/images/about-poster.jpg
```

**Estado actual:** `ffmpeg` no está disponible en el entorno de desarrollo. Los
dos MP4 esperados existen como stubs válidos de 20 B para comprobar rutas y
carga diferida, pero no contienen frames decodificables; el poster permanece
visible. Cuando el usuario entregue los videos reales, se sobrescriben ambos
archivos con los nombres de la tabla y los componentes los reproducen sin
cambios.
