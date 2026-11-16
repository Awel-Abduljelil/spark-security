import { useEffect, useRef } from "react";
import { readRgbToken, rgbaFromToken } from "../../lib/designTokens";
import "./MatrixRain.css";

const glyphs = "アカサタナハマヤラワ012345789:・";

type Stream = {
  head: number;
  speed: number;
  length: number;
};

export function MatrixRain({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const headColor = readRgbToken("--fx-green-bright");
    const tailColor = readRgbToken("--fx-green");

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let width = 0;
    let height = 0;
    let fontSize = 16;
    let streams: Stream[] = [];
    let animationFrame = 0;
    let lastFrame = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      fontSize = Math.max(14, Math.min(20, Math.round(width / 90)));

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = `${fontSize}px monospace`;
      context.textBaseline = "top";
      streams = Array.from({ length: Math.ceil(width / fontSize) }, () => ({
        head: -Math.random() * (height / fontSize),
        speed: 0.3 + Math.random() * 1.1,
        length: 8 + Math.floor(Math.random() * 18),
      }));
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      streams.forEach((stream, column) => {
        for (let tail = stream.length; tail >= 0; tail -= 1) {
          const row = Math.floor(stream.head - tail);
          const y = row * fontSize;
          if (y < 0 || y > height) continue;

          const opacity = 1 - tail / (stream.length + 1);
          context.fillStyle =
            tail === 0
              ? rgbaFromToken(headColor, opacity)
              : rgbaFromToken(tailColor, opacity * 0.72);
          const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
          context.fillText(glyph, column * fontSize, y);
        }

        stream.head += stream.speed;
        if (stream.head - stream.length > height / fontSize) {
          stream.head = -Math.random() * (height / fontSize);
        }
      });
    };

    const animate = (time: number) => {
      if (time - lastFrame >= 50) {
        draw();
        lastFrame = time;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    const updateMotion = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (motionPreference.matches) {
        draw();
      } else {
        lastFrame = 0;
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);
    motionPreference.addEventListener("change", updateMotion);
    resize();
    updateMotion();

    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", updateMotion);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="matrixRainContainer">
      <canvas ref={canvasRef} className="matrixRain" aria-hidden="true" />
      {children}
    </div>
  );
}
