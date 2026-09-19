import React, { useRef, useState, useCallback } from 'react';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxTilt?: number;
  glareOpacity?: number;
  glareColor?: string;
  glowColor?: string;
  onClick?: () => void;
  id?: string;
}

/**
 * ThreeDCard
 * Provides a gentle, calm, elevated 3D perspective response on hover.
 * Adds tactile depth without chaotic motion.
 */
export const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  className = '',
  containerClassName = '',
  maxTilt = 5,
  glareOpacity = 0.12,
  glareColor = 'rgba(45, 212, 191, 0.22)',
  glowColor = 'rgba(45, 212, 191, 0.14)',
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotations, setRotations] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Normalized coordinates from -0.5 to 0.5
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;

      // Soft tilt physics
      const rotX = (0.5 - y) * (maxTilt * 2);
      const rotY = (x - 0.5) * (maxTilt * 2);

      setRotations({ x: rotX, y: rotY });
      setGlarePosition({
        x: x * 100,
        y: y * 100,
        opacity: glareOpacity,
      });
    },
    [maxTilt, glareOpacity]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotations({ x: 0, y: 0 });
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      id={id}
      className={`perspective-1000 ${containerClassName}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative transition-all duration-200 ease-out will-change-transform ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `rotateX(${rotations.x.toFixed(2)}deg) rotateY(${rotations.y.toFixed(
                2
              )}deg) translateZ(12px) scale3d(1.012, 1.012, 1.012)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
          boxShadow: isHovered
            ? `0 20px 40px -15px ${glowColor}, 0 0 20px -5px ${glowColor}`
            : undefined,
        }}
      >
        {/* Calm fresh specular glare light */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? glarePosition.opacity : 0,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor}, transparent 65%)`,
          }}
        />

        {/* Card Content with 3D Depth support */}
        <div className="relative z-0 h-full">{children}</div>
      </div>
    </div>
  );
};
