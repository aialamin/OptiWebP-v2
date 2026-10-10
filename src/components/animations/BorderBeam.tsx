import React from 'react';
import { motion } from 'motion/react';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}

/**
 * React Bits / Animate UI style BorderBeam component
 * Renders an animated glowing beam that circles the border smoothly using CSS masks.
 * Guaranteed 60fps GPU execution without blocking or covering child content.
 */
export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  size = 200,
  duration = 8,
  borderWidth = 1.5,
  colorFrom = '#10b981',
  colorTo = '#06b6d4',
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
      style={{
        padding: `${borderWidth}px`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
      }}
    >
      <motion.div
        className="absolute inset-[-100%] rounded-[inherit] gpu-smooth"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 45deg, ${colorTo} 85deg, transparent 110deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
        }}
      />
    </div>
  );
};
