import { useEffect, useRef } from "react";
import "./Dither.css";

// A dependency-light canvas version of the React Bits Dither treatment.
// It keeps the background usable even when WebGL/postprocessing is unavailable.
export default function Dither({ waveColor = [0.25, 0.48, 0.34], waveSpeed = 0.05, pixelSize = 3 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const pointer = { x: 0.5, y: 0.5 };
    let frame;
    let start = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * ratio);
      canvas.height = Math.floor(canvas.clientHeight * ratio);
    };
    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
    };
    const render = (now) => {
      const width = canvas.width;
      const height = canvas.height;
      const size = Math.max(2, pixelSize * (window.devicePixelRatio || 1));
      const time = (now - start) * waveSpeed * 0.001;
      const base = waveColor.map((value) => Math.round(value * 255));
      context.fillStyle = `rgb(${base[0] * 0.16}, ${base[1] * 0.16}, ${base[2] * 0.16})`;
      context.fillRect(0, 0, width, height);
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          const nx = x / width;
          const ny = y / height;
          const wave = Math.sin(nx * 15 + time) + Math.cos(ny * 12 - time * 1.3);
          const distance = Math.hypot(nx - pointer.x, ny - pointer.y);
          const glow = Math.max(0, 1 - distance * 2.4);
          const brightness = Math.max(0, Math.min(1, (wave + 2) / 4 + glow * 0.18));
          const threshold = ((x / size) % 2 + (y / size) % 2) % 2 ? 0.18 : -0.08;
          if (brightness + threshold > 0.48) {
            context.fillStyle = `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${0.18 + brightness * 0.52})`;
            context.fillRect(x, y, size, size);
          }
        }
      }
      frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", move);
    };
  }, [pixelSize, waveColor, waveSpeed]);

  return <canvas ref={canvasRef} className="dither-canvas" aria-hidden="true" />;
}
