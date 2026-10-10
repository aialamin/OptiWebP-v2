import React, { useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // 0 to 1
  springConfig?: { stiffness: number; damping: number; mass: number };
}

/**
 * React Bits Pro - Magnetic Component
 * Creates an ultra-smooth magnetic attraction pull towards the mouse cursor.
 * Uses Motion physics with zero stutter for buttons, icons and action badges.
 */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className = '',
  intensity = 0.35,
  springConfig = { stiffness: 180, damping: 14, mass: 0.1 },
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * intensity);
    y.set(middleY * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block gpu-smooth ${className}`}
    >
      {children}
    </motion.div>
  );
};
