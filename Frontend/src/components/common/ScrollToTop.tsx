import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in-75 duration-300">
      <button
        id="scroll-to-top-btn"
        onClick={scrollToTop}
        className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f1b26] to-[#0a131c] border border-teal-500/40 text-teal-300 shadow-2xl shadow-teal-950/80 hover:border-teal-400 hover:text-white transition-all transform hover:-translate-y-1 hover:scale-105 cursor-pointer"
        aria-label="Scroll smoothly to top"
        title="Scroll to top"
      >
        {/* Circular SVG progress ring around the button */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="rgba(45, 212, 191, 0.15)"
            strokeWidth="2.5"
          />
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="url(#mint-gradient)"
            strokeWidth="2.5"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (119.38 * scrollProgress) / 100}
            strokeLinecap="round"
            className="transition-all duration-150"
          />
          <defs>
            <linearGradient id="mint-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>

        <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 text-teal-300 group-hover:text-teal-100" />
      </button>
    </div>
  );
};
