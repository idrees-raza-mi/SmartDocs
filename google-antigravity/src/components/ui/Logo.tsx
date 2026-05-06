'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  wordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, font: 'text-lg' },
  md: { icon: 36, font: 'text-2xl' },
  lg: { icon: 48, font: 'text-3xl' },
};

export const Logo = ({ size = 'md', wordmark = true, className = '' }: LogoProps) => {
  const { icon, font } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background circle */}
        <rect width="48" height="48" rx="14" fill="#FFFFFF" />
        {/* DW wave mark */}
        <path
          d="M10 32 L16 18 L22 28 L24 24 L26 28 L32 18 L38 32"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <radialGradient id="glow" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      {wordmark && (
        <span className={`${font} font-bold tracking-tight leading-none select-none`}>
          <span className="text-white/50 font-normal">Doc</span>
          <span className="text-white">Wise</span>
        </span>
      )}
    </div>
  );
};
