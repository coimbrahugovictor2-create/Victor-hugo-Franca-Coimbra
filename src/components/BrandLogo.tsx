import React from 'react';

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'dark' | 'light' | 'primary' | 'current';
  hasDuplicatePrefix?: boolean;
}

const StylizedA: React.FC = () => (
  <svg 
    viewBox="0 0 100 100" 
    className="inline-block h-[0.72em] w-[0.74em] align-baseline select-none mx-[0.03em]"
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M10 90 L50 10 L90 90" 
      stroke="currentColor" 
      strokeWidth="20" 
      strokeLinecap="butt" 
      strokeLinejoin="miter" 
    />
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  textColor = 'current',
  hasDuplicatePrefix
}) => {
  const [internalHasDup, setInternalHasDup] = React.useState(false);

  React.useEffect(() => {
    // Immediate fallback check in localStorage to synchronize state globally
    try {
      const cached = localStorage.getItem('bc_fleet');
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list)) {
          const prefixes = list.map((v: any) => v.prefix);
          const hasDup = prefixes.some((p: string, idx: number) => prefixes.indexOf(p) !== idx);
          setInternalHasDup(hasDup);
        }
      }
    } catch (e) {
      // Silently catch errors
    }
  }, [hasDuplicatePrefix]);

  const isAlertActive = hasDuplicatePrefix !== undefined ? hasDuplicatePrefix : internalHasDup;

  // Determine scale based on size prop
  const sizeClasses = {
    sm: { icon: 'h-6 w-6', text: 'text-[13px] tracking-[0.1em]' },
    md: { icon: 'h-10 w-10', text: 'text-[17px] tracking-[0.1em]' },
    lg: { icon: 'h-14 w-14', text: 'text-2xl tracking-[0.12em]' },
    xl: { icon: 'h-20 w-20', text: 'text-4xl tracking-[0.15em]' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const isLight = textColor === 'light';

  // Set precise outer container frames with borders and backgrounds to highlight the logo with subtle hover glows
  const containerFrames = {
    sm: isLight 
      ? 'px-1 py-0.5 rounded-xl bg-transparent border-none' 
      : 'px-2 py-1 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs hover:shadow-[0_0_12px_rgba(16,93,56,0.25)] dark:hover:shadow-[0_0_12px_rgba(30,163,98,0.35)] hover:border-[#105d38]/30 dark:hover:border-[#1ea362]/30 hover:scale-[1.02]',
    md: isLight 
      ? 'px-1 py-1 rounded-2xl bg-transparent border-none' 
      : 'px-3 py-1.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-sm hover:shadow-[0_0_15px_rgba(16,93,56,0.25)] dark:hover:shadow-[0_0_15px_rgba(30,163,98,0.35)] hover:border-[#105d38]/30 dark:hover:border-[#1ea362]/30 hover:scale-[1.02]',
    lg: isLight 
      ? 'px-1.5 py-1 rounded-[22px] bg-transparent border-none' 
      : 'px-4 py-2.5 rounded-[22px] border border-slate-150 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-md hover:shadow-[0_0_20px_rgba(16,93,56,0.25)] dark:hover:shadow-[0_0_20px_rgba(30,163,98,0.35)] hover:border-[#105d38]/30 dark:hover:border-[#1ea362]/30 hover:scale-[1.02]',
    xl: isLight 
      ? 'px-2 py-1.5 rounded-3xl bg-transparent border-none' 
      : 'px-5 py-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-lg hover:shadow-[0_0_25px_rgba(16,93,56,0.25)] dark:hover:shadow-[0_0_25px_rgba(30,163,98,0.35)] hover:border-[#105d38]/30 dark:hover:border-[#1ea362]/30 hover:scale-[1.02]'
  };

  const currentFrame = containerFrames[size] || containerFrames.md;

  // Text color mapping
  const textColorClasses = {
    dark: 'text-slate-800 dark:text-white',
    light: 'text-white',
    primary: 'text-[#105d38]',
    current: ''
  };

  const currentTextColor = textColorClasses[textColor];

  return (
    <div className={`BrandLogo brand-logo-glow flex items-center gap-1.5 select-none transition-all duration-300 ${isAlertActive ? 'brand-logo-alert-duplicate' : currentFrame} ${className}`}>
      {/* Icon: Yellow play triangle container with bold green L */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${currentSize.icon} flex-shrink-0 animate-fade-in`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="L Logo"
      >
        {/* Soft rounded shadow backplate if on complex themes */}
        <path 
          d="M74.8 44.4C78.3 46.5 78.3 51.5 74.8 53.6L32.8 78.9C29.2 81.1 24.5 78.5 24.5 74.3V23.7C24.5 19.5 29.2 16.9 32.8 19.1L74.8 44.4Z" 
          fill="#edd116" /* Bright yellow/gold matching original */
        />
        <path 
          d="M36 31V65C36 67.2 37.8 69 40 69H55" 
          stroke="#105d38" /* Brand deep green inside play button */
          strokeWidth="9.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>

      {/* Styled text "IDERANÇA" */}
      {!iconOnly && (
        <span className={`font-sans font-bold flex items-center leading-none ${currentSize.text} ${currentTextColor}`}>
          <span>IDER</span>
          <StylizedA />
          <span>NÇ</span>
          <StylizedA />
        </span>
      )}
    </div>
  );
};
