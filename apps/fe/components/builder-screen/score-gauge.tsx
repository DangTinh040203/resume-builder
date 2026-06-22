"use client";
import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const getScoreColor = (score: number) => {
  if (score < 50) {
    return { stroke: "#ef4444", text: "text-red-500", bg: "bg-red-500/10" };
  }
  if (score <= 80) {
    return {
      stroke: "#eab308",
      text: "text-yellow-500",
      bg: "bg-yellow-500/10",
    };
  }
  return { stroke: "#22c55e", text: "text-green-500", bg: "bg-green-500/10" };
};

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 140 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const colors = getScoreColor(score);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  const label =
    score < 50 ? "Needs Work" : score <= 80 ? "Good Fit" : "Excellent";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
          />
        </svg>
        <div
          className={`
            absolute inset-0 flex flex-col items-center justify-center
          `}
        >
          <span
            className={`
              text-3xl font-bold
              ${colors.text}
            `}
          >
            {animatedScore}%
          </span>
        </div>
      </div>
      <span
        className={`
          rounded-full px-3 py-1 text-xs font-semibold
          ${colors.bg}
          ${colors.text}
        `}
      >
        {label}
      </span>
    </div>
  );
};

export { getScoreColor, ScoreGauge };
