import { useEffect, useRef } from "react";
import { readRgbToken, rgbaFromToken } from "../../lib/designTokens";
import "./DotNetworks.css";

type Dot = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
};

export function DotNetworks({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const redColor = readRgbToken("--fx-red");

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let animationFrame = 0;
    let lastFrame = 0;
    const connectionDistance = 150;

    const draw = (moveDots: boolean) => {
      context.clearRect(0, 0, width, height);

      if (moveDots) {
        dots.forEach((dot) => {
          dot.x += dot.velocityX;
          dot.y += dot.velocityY;

          if (dot.x < 0 || dot.x > width) dot.velocityX *= -1;
          if (dot.y < 0 || dot.y > height) dot.velocityY *= -1;
          dot.x = Math.max(0, Math.min(width, dot.x));
          dot.y = Math.max(0, Math.min(height, dot.y));
        });
      }

      dots.forEach((dot, index) => {
        for (
          let otherIndex = index + 1;
          otherIndex < dots.length;
          otherIndex += 1
        ) {
          const other = dots[otherIndex];
          const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
          if (distance >= connectionDistance) continue;

          const opacity = (1 - distance / connectionDistance) * 0.28;
          context.strokeStyle = rgbaFromToken(redColor, opacity);
          context.lineWidth = 1.5;
          context.beginPath();
          context.moveTo(dot.x, dot.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      });

      dots.forEach(({ x, y }) => {
        context.beginPath();
        context.arc(x, y, 2.25, 0, Math.PI * 2);
        context.fillStyle = rgbaFromToken(redColor, 1);
        context.fill();
      });
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const dotCount = Math.min(
        100,
        Math.max(12, Math.round((width * height) / 18000)),
      );
      dots = Array.from({ length: dotCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
      }));
      draw(false);
    };

    const animate = (time: number) => {
      if (time - lastFrame >= 33) {
        draw(true);
        lastFrame = time;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    const updateMotion = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (motionPreference.matches) {
        draw(false);
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
    <div className="dotNetworksContainer">
      <canvas ref={canvasRef} className="dotNetworks" aria-hidden="true" />
      <div className="dotNetworksContent">{children}</div>
    </div>
  );
}
