"use client";

import { useEffect, useRef } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "executing" | "speaking" | "error";

interface VoiceOrbProps {
  state: OrbState;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const STATE_COLORS: Record<OrbState, string> = {
  idle: "from-background-tertiary to-background-secondary",
  listening: "from-status-listening/30 to-status-listening/10",
  thinking: "from-status-thinking/30 to-status-thinking/10",
  executing: "from-status-executing/30 to-status-executing/10",
  speaking: "from-status-speaking/30 to-status-speaking/10",
  error: "from-status-error/30 to-status-error/10",
};

const STATE_RING_COLORS: Record<OrbState, string> = {
  idle: "border-text-muted/20",
  listening: "border-status-listening",
  thinking: "border-status-thinking",
  executing: "border-status-executing",
  speaking: "border-status-speaking",
  error: "border-status-error",
};

const STATE_INNER_COLORS: Record<OrbState, string> = {
  idle: "bg-text-muted/30",
  listening: "bg-status-listening",
  thinking: "bg-status-thinking",
  executing: "bg-status-executing",
  speaking: "bg-status-speaking",
  error: "bg-status-error",
};

const SIZE_CLASSES = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const INNER_SIZE_CLASSES = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export function VoiceOrb({ state, onClick, size = "md" }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state !== "speaking") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let phase = 0;

    const drawWaveform = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();

      const centerY = height / 2;
      const amplitude = 8;

      ctx.moveTo(0, centerY);
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin((x / width) * Math.PI * 4 + phase) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = "rgba(34, 197, 94, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      phase += 0.15;
      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  const isAnimated = state !== "idle" && state !== "error";

  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-full flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${SIZE_CLASSES[size]}
        ${isAnimated ? "animate-pulse-slow" : ""}
      `}
      aria-label={`Voice assistant status: ${state}`}
    >
      <div
        className={`
          absolute inset-0 rounded-full bg-gradient-to-b
          ${STATE_COLORS[state]}
          transition-colors duration-300
        `}
      />

      <div
        className={`
          absolute inset-1 rounded-full border-2
          ${STATE_RING_COLORS[state]}
          transition-colors duration-300
          ${isAnimated ? "animate-spin-slow" : ""}
        `}
      />

      <div className="relative z-10 flex items-center justify-center">
        {state === "speaking" ? (
          <canvas
            ref={canvasRef}
            width={64}
            height={32}
            className="w-16 h-8"
          />
        ) : (
          <div
            className={`
              rounded-full
              ${INNER_SIZE_CLASSES[size]}
              ${STATE_INNER_COLORS[state]}
              transition-colors duration-300
            `}
          />
        )}
      </div>

      {state === "thinking" && (
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-status-thinking animate-spin" />
      )}

      {state === "executing" && (
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-status-executing animate-spin" />
      )}
    </button>
  );
}
