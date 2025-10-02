import React from 'react';

interface SevenSegmentIconProps extends React.SVGProps<SVGSVGElement> {
  segments?: Record<string, boolean>; // e.g., { a: true, b: false, ... }
}

const SEGMENT_PATHS: Record<string, string> = {
  a: "M15 12 L35 12 L40 17 L35 22 L15 22 L10 17 Z",
  b: "M36 18 L41 23 L41 43 L36 48 L31 43 L31 23 Z",
  c: "M36 52 L41 57 L41 77 L36 82 L31 77 L31 57 Z",
  d: "M15 88 L35 88 L40 83 L35 78 L15 78 L10 83 Z",
  e: "M9 52 L14 57 L14 77 L9 82 L4 77 L4 57 Z",
  f: "M9 18 L14 23 L14 43 L9 48 L4 43 L4 23 Z",
  g: "M15 50 L35 50 L40 55 L35 60 L15 60 L10 55 Z",
  dp: "M43 90 a 4 4 0 1 1 0.01 0",
};

const ACTIVE_COLOR = "#ef4444";
const INACTIVE_COLOR = "#3f3f46";

export const SevenSegmentIcon: React.FC<SevenSegmentIconProps> = ({ segments = {}, className, ...props }) => {
  return (
    <svg viewBox="0 0 50 100" className={className} {...props}>
      <rect x="0" y="0" width="50" height="100" fill="#1f2937" rx="5" />
      {Object.entries(SEGMENT_PATHS).map(([key, path]) => (
        <path
          key={key}
          d={path}
          fill={segments[key] ? ACTIVE_COLOR : INACTIVE_COLOR}
          style={{ transition: 'fill 0.2s ease' }}
        />
      ))}
    </svg>
  );
};
