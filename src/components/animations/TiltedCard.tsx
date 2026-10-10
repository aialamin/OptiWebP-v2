import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';

interface TiltedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees
  scale?: number;
  glareOpacity?: number;
}

/**
 * React Bits Pro - TiltedCard
 * Interactive 3D perspective card with hardware-accelerated spring physics and dynamic specular glare.
 */
export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className = '',
  maxTilt = 7,
  scale = 1.01,
  glareOpacity = 0.12,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const springConfig = { stiffness: 260, damping: 20 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    rotateX.set(rotX);
    rotateY.set(rotY);

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 inline-block w-full"
      {...props}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scale : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`relative overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-[#11141b] gpu-smooth shadow-sm transition-colors ${className}`}
      >
        {/* Specular Glare Reflection */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-20"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4), transparent 80%)`,
          }}
        />

        {/* Card Content with 3D separation */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
};
