import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * React Bits / Motion.dev AnimatedNumber
 * Smoothly interpolates numeric values using spring physics.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = '',
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  const [rendered, setRendered] = useState(`${prefix}${value.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setRendered(latest);
    });
  }, [display]);

  return <span className={className}>{rendered}</span>;
};
