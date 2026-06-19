'use client';

import { Sector } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

export type ScalableBarShapeProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  fill?: string;
  payload?: { label?: string };
  habitId: string;
  activeHoverKey: string | null;
  onHoverChange: (key: string | null) => void;
};

export function ScalableBarShape({
  x: rawX = 0,
  y: rawY = 0,
  width: rawWidth = 0,
  height: rawHeight = 0,
  fill,
  payload,
  habitId,
  activeHoverKey,
  onHoverChange,
}: ScalableBarShapeProps) {
  const x = Number(rawX);
  const y = Number(rawY);
  const width = Number(rawWidth);
  const height = Number(rawHeight);

  if (height <= 0 || width <= 0) {
    return null;
  }

  const label = String(payload?.label ?? '');
  const hoverKey = `${label}-${habitId}`;
  const isHovered = activeHoverKey === hoverKey;
  const scale = isHovered ? 1.1 : 1;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = height - scaledHeight;

  return (
    <rect
      x={x + offsetX}
      y={y + offsetY}
      width={scaledWidth}
      height={scaledHeight}
      fill={fill}
      rx={2}
      className="cursor-pointer transition-[transform,filter,opacity] duration-200 ease-out"
      style={{
        filter: isHovered ? 'brightness(1.12)' : undefined,
        opacity: isHovered ? 1 : 0.92,
      }}
      onMouseEnter={() => onHoverChange(hoverKey)}
      onMouseLeave={() => onHoverChange(null)}
    />
  );
}

type ScalableLineDotProps = {
  cx?: number;
  cy?: number;
  fill?: string;
  stroke?: string;
  index?: number;
  dataKey?: string;
  activeHoverKey: string | null;
  onHoverChange: (key: string | null) => void;
};

export function ScalableLineDot({
  cx,
  cy,
  fill,
  stroke,
  index,
  dataKey,
  activeHoverKey,
  onHoverChange,
}: ScalableLineDotProps) {
  if (cx == null || cy == null) {
    return null;
  }

  const hoverKey = `${String(dataKey ?? '')}-${index ?? 0}`;
  const isHovered = activeHoverKey === hoverKey;
  const radius = isHovered ? 7 : 4;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      className="cursor-pointer transition-[r,filter] duration-200 ease-out"
      style={{ filter: isHovered ? 'brightness(1.15)' : undefined }}
      onMouseEnter={() => onHoverChange(hoverKey)}
      onMouseLeave={() => onHoverChange(null)}
    />
  );
}

export function ActiveDonutSector(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={Number(outerRadius) + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      className="cursor-pointer transition-all duration-200 ease-out"
      style={{ filter: 'brightness(1.1)' }}
    />
  );
}

export function ActiveRadialSector(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={Math.max(0, Number(innerRadius) - 2)}
      outerRadius={Number(outerRadius) + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      className="cursor-pointer transition-all duration-200 ease-out"
      style={{ filter: 'brightness(1.12)' }}
    />
  );
}

export const chartHoverContainerClass =
  '[&_.recharts-line-curve]:transition-all [&_.recharts-line-curve]:duration-200 [&_.recharts-sector]:cursor-pointer [&_.recharts-sector]:transition-all [&_.recharts-sector]:duration-200';
