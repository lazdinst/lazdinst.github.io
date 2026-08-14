import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  className?: string;
  stroke?: string;
}

export function Sparkline({
  values,
  className,
  stroke = "var(--chart-1)",
}: SparklineProps) {
  if (values.length === 0) {
    return <div className={cn("h-8 w-full", className)} />;
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 4 + (1 - (value - min) / range) * 92;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,100 ${points} 100,100`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
      aria-hidden
    >
      <polygon points={area} fill={stroke} opacity={0.16} />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
