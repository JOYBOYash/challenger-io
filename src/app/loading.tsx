import type { SVGProps } from "react";

// Custom inline SVG for loading animation
const AnimatedLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      className="animate-loader-fill"
      style={{ strokeDasharray: 63, strokeDashoffset: 63, animationDelay: '0s' } as React.CSSProperties}
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
    />
    <path
      className="animate-loader-fill"
      style={{ strokeDasharray: 10, strokeDashoffset: 10, animationDelay: '0.4s' } as React.CSSProperties}
      d="m9.09 9.91 1.63.54c.22.07.36.29.3.5l-.54 1.63c-.07.22-.29.36-.5.3l-1.63-.54c-.22-.07-.36-.29-.3-.5l.54-1.63c.07-.22.29-.36.5-.3z"
    />
    <path
      className="animate-loader-fill"
      style={{ strokeDasharray: 20, strokeDashoffset: 20, animationDelay: '0.2s' } as React.CSSProperties}
      d="M12 22c-3.314 0-6-2.686-6-6"
    />
  </svg>
);


export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center cyber-grid">
      <AnimatedLogo 
        className="h-24 w-24 text-primary animate-loader-shake"
        style={{filter: `drop-shadow(0 0 15px hsl(var(--primary)))`}} 
      />
    </div>
  );
}
