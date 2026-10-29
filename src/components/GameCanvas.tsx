import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { ColorTheme } from '../types/game';

interface GameCanvasProps {
  engine: GameEngine | null;
  theme: ColorTheme;
  onCanvasClick: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, theme, onCanvasClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Resize and Retina scaling handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (rendererRef.current) {
        rendererRef.current.setDimensions(width, height, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Renderer and Theme updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(canvas, theme);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      rendererRef.current.setDimensions(window.innerWidth, window.innerHeight, dpr);
    } else {
      rendererRef.current.setTheme(theme);
    }
  }, [theme]);

  // Render loop
  useEffect(() => {
    const render = () => {
      if (rendererRef.current && engine) {
        rendererRef.current.render(engine);
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [engine]);

  // Pointer / Tap / Click handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    onCanvasClick();
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 w-full h-full cursor-pointer select-none touch-none"
    />
  );
};
