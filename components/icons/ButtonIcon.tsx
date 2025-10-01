import React from 'react';

interface ButtonIconProps extends React.SVGProps<SVGSVGElement> {
  isPressed: boolean;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({ isPressed, className, ...props }) => {
  return (
    <svg 
      viewBox="0 0 50 50" 
      className={className} 
      {...props}
    >
      <g transform={isPressed ? "translate(0, 2)" : ""}>
        {/* Button Cap */}
        <circle cx="25" cy="23" r="10" fill={isPressed ? "#ef4444" : "#f87171"} stroke="#dc2626" strokeWidth="1" />
        {/* Button Housing */}
        <rect x="10" y="25" width="30" height="10" rx="2" fill="#a1a1aa" />
        <rect x="12" y="27" width="26" height="6" fill="#71717a" />
      </g>
      {/* Pins */}
      <path d="M18 35 v5" stroke="#a1a1aa" strokeWidth="2" />
      <path d="M32 35 v5" stroke="#a1a1aa" strokeWidth="2" />
    </svg>
  );
};
