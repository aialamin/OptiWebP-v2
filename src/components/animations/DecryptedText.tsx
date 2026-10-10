import React, { useState, useEffect, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  className?: string;
  characters?: string;
  triggerOnHover?: boolean;
}

/**
 * React Bits - DecryptedText
 * High-tech character scramble decoding effect for technical metrics and labels.
 */
export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 35,
  maxIterations = 10,
  sequential = true,
  className = '',
  characters = '01ABCDEF#%*!@&',
  triggerOnHover = false,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startDecryption = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (sequential) {
              if (index < iteration) {
                return text[index];
              }
            } else {
              if (iteration >= maxIterations) {
                return text[index];
              }
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length + maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
      }
      iteration += 1;
    }, speed);
  };

  useEffect(() => {
    if (!triggerOnHover) {
      startDecryption();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, triggerOnHover]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      setIsHovered(true);
      startDecryption();
    }
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      className={`font-mono inline-block ${className}`}
    >
      {displayText}
    </span>
  );
};
