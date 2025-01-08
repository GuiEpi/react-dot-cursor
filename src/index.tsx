'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { CursorProps, Position, CursorRule, CursorVariant, CursorType, CursorTheme } from './types';
import { isMobile, isInteractive } from './utils';
import { TEXT_ELEMENTS } from './constants';

const Cursor: React.FC<CursorProps> = ({ zIndex = 9999, theme = {}, defaultColor: customDefaultColor }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [currentVariant, setCurrentVariant] = useState<CursorType>('default');
  const [fontSize, setFontSize] = useState(16);
  const [isClicking, setIsClicking] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [contentDimensions, setContentDimensions] = useState({ width: 0, height: 0 });

  // Measuring actual content dimensions
  useEffect(() => {
    if (contentRef.current) {
      const { offsetWidth, offsetHeight } = contentRef.current;
      setContentDimensions({
        // Add default padding
        width: offsetWidth + 16,
        height: offsetHeight + 8,
      });
    }
  }, [currentVariant]);

  const defaultColor = useMemo(
    () =>
      customDefaultColor || (window.matchMedia('(prefers-color-scheme: dark)').matches ? '0 0% 98%' : '240 10% 3.9%'),
    [customDefaultColor],
  );

  const defaultVariants: Record<CursorType, CursorVariant> = {
    default: {
      style: {
        scale: 1,
        borderRadius: '50%',
        width: 16,
        height: 16,
      },
    },
    hover: {
      style: {
        scale: 1,
        borderRadius: '50%',
        width: 30,
        height: 30,
      },
    },
    text: {
      style: {
        scale: 1,
        width: 3,
        height: fontSize,
        borderRadius: '1rem',
      },
    },
    disabled: {
      style: {
        scale: 1,
        borderRadius: '50%',
        opacity: 0.5,
        width: 12,
        height: 12,
      },
    },
  };

  const variants = useMemo(
    () => ({
      ...defaultVariants,
      ...theme.variants,
    }),
    [theme.variants, fontSize],
  );

  const findMatchingRule = useCallback(
    (target: HTMLElement): CursorRule | null => {
      if (!theme.rules?.length) return null;

      return (
        theme.rules
          .filter((rule) => target.matches(rule.selector))
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0] || null
      );
    },
    [theme.rules],
  );

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const matchingRule = findMatchingRule(target);
      if (matchingRule) {
        setCurrentVariant(matchingRule.variant);
        return;
      }

      if (target.hasAttribute('disabled')) {
        setCurrentVariant('disabled');
        // Prioritize interactive elements
      } else if (isInteractive(target)) {
        setCurrentVariant('hover');
      } else if (TEXT_ELEMENTS.includes(target.tagName as any)) {
        setFontSize(parseFloat(window.getComputedStyle(target).fontSize));
        setCurrentVariant('text');
      } else {
        setCurrentVariant('default');
      }
    },
    [findMatchingRule],
  );

  const handleMouseOut = useCallback(() => {
    setCurrentVariant('default');
  }, []);

  useEffect(() => {
    if (isMobile()) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseOver, handleMouseOut]);

  if (isMobile()) return null;

  const currentVariantData = variants[currentVariant];
  const hasContent = !!currentVariantData?.content?.text;

  // Pre-calculate final styles by replacing 'auto' with computed values
  // This is necessary because using 'auto' dimensions with animations can cause jittery/non-smooth transitions
  // Instead, we measure the content and use its exact dimensions
  const finalStyle = useMemo(() => {
    if (!currentVariantData?.style) return {};

    const style = { ...currentVariantData.style };

    if (hasContent && (style.width === 'auto' || style.height === 'auto')) {
      return {
        ...style,
        width: contentDimensions.width,
        height: contentDimensions.height,
      };
    }

    return style;
  }, [currentVariantData, contentDimensions, hasContent]);

  return (
    <motion.div
      className="react-dot-cursor"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        pointerEvents: 'none',
        zIndex,
        backgroundColor: `hsl(var(--cursor-color, ${defaultColor}))`,
        transformOrigin: 'left center',
        overflow: 'hidden', // Important for the compression effect
      }}
      animate={{
        ...finalStyle,
        x: '-50%',
        y: '-50%',
        scale: isClicking ? 0.9 : 1,
      }}
      transition={{
        duration: 0.15,
        ease: [0.32, 0.72, 0, 1], // Custom bezier curve for more natural animation
      }}
    >
      {hasContent && currentVariantData.content && (
        <span
          ref={contentRef}
          className={`react-dot-cursor-content ${currentVariantData.content.className || ''}`}
          style={{
            color: 'white',
            fontSize: '16px',
            ...currentVariantData.content.style,
          }}
        >
          {currentVariantData.content.text}
        </span>
      )}
    </motion.div>
  );
};

export { Cursor };
export type { CursorProps, CursorVariant, CursorRule, CursorType, CursorTheme };
