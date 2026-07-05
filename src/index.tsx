'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { CursorProps, CursorRule, CursorVariant, CursorType, SnapOptions } from './types';
import { isMobile, isInteractive, isText } from './utils';

const DEFAULT_SPRING = { stiffness: 750, damping: 55, mass: 0.35 };

const DEFAULT_SNAP: Required<SnapOptions> = {
  padding: 8,
  radius: 'auto',
  magnetism: 0.15,
};

interface SnapState {
  element: HTMLElement;
  rect: DOMRect;
  radius: number;
  options: Required<SnapOptions>;
}

const Cursor: React.FC<CursorProps> = ({
  zIndex = 9999,
  theme = {},
  scaleOnClick = true,
  defaultColor: customDefaultColor,
  spring = DEFAULT_SPRING,
}) => {
  const [currentVariant, setCurrentVariant] = useState<CursorType>('default');
  const [fontSize, setFontSize] = useState(16);
  const [isClicking, setIsClicking] = useState(false);
  const [snap, setSnap] = useState<SnapState | null>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [contentDimensions, setContentDimensions] = useState({ width: 0, height: 0 });

  // Transient values live in motion values / refs, not state: tracking the
  // pointer must not re-render the component (can be hundreds of events/sec)
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);
  const springX = useSpring(targetX, spring);
  const springY = useSpring(targetY, spring);
  const pointerRef = useRef({ x: -100, y: -100 });
  const snapRef = useRef<SnapState | null>(null);

  const prefersReducedMotion = useReducedMotion();
  // With reduced motion the cursor sticks to the pointer instead of trailing it
  const x = prefersReducedMotion ? targetX : springX;
  const y = prefersReducedMotion ? targetY : springY;

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

  const defaultColor = useMemo(() => {
    const fallbackColor = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'hsl(0 0% 98%)'
      : 'hsl(240 10% 3.9%)';
    return customDefaultColor || fallbackColor;
  }, [customDefaultColor]);

  const defaultTextColor = useMemo(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 98%)';
  }, []);

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

  /** Moves the springs' target: the pointer, or the snapped element's center with a magnetic drift */
  const retarget = useCallback(() => {
    const { x: px, y: py } = pointerRef.current;
    const activeSnap = snapRef.current;

    if (activeSnap) {
      const { rect, options } = activeSnap;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX.set(cx + (px - cx) * options.magnetism);
      targetY.set(cy + (py - cy) * options.magnetism);
    } else {
      targetX.set(px);
      targetY.set(py);
    }
  }, [targetX, targetY]);

  const enterSnap = useCallback(
    (element: HTMLElement, snapOption: boolean | SnapOptions) => {
      if (snapRef.current?.element === element) return;

      const options = { ...DEFAULT_SNAP, ...(snapOption === true ? {} : snapOption) };
      const rect = element.getBoundingClientRect();

      let radius: number;
      if (options.radius === 'auto') {
        // Concentric radii: the outer radius is the element's own radius plus the gap
        const parsed = parseFloat(window.getComputedStyle(element).borderRadius);
        radius = (Number.isFinite(parsed) ? parsed : 0) + options.padding;
      } else {
        radius = options.radius;
      }

      const state: SnapState = { element, rect, radius, options };
      snapRef.current = state;
      setSnap(state);
      retarget();
    },
    [retarget],
  );

  const clearSnap = useCallback(() => {
    if (!snapRef.current) return;
    snapRef.current = null;
    setSnap(null);
    retarget();
  }, [retarget]);

  const findMatchingRule = useCallback(
    (target: HTMLElement): { rule: CursorRule; element: HTMLElement } | null => {
      if (!theme.rules?.length) return null;

      return (
        theme.rules
          .map((rule) => {
            const selectors = Array.isArray(rule.selector) ? rule.selector : [rule.selector];
            for (const selector of selectors) {
              // closest() so descendants of the matched element keep the rule (and its snap)
              const element = target.closest<HTMLElement>(selector);
              if (element) return { rule, element };
            }
            return null;
          })
          .filter((match) => match !== null)
          .sort((a, b) => (b.rule.priority || 0) - (a.rule.priority || 0))[0] || null
      );
    },
    [theme.rules],
  );

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const match = findMatchingRule(target);
      if (match) {
        setCurrentVariant(match.rule.variant);
        if (match.rule.snap) {
          enterSnap(match.element, match.rule.snap);
        } else {
          clearSnap();
        }
        return;
      }

      clearSnap();
      if (target.hasAttribute('disabled')) {
        setCurrentVariant('disabled');
        // Prioritize interactive elements
      } else if (isInteractive(target)) {
        setCurrentVariant('hover');
      } else if (isText(target)) {
        setFontSize(parseFloat(window.getComputedStyle(target).fontSize));
        setCurrentVariant('text');
      } else {
        setCurrentVariant('default');
      }
    },
    [findMatchingRule, enterSnap, clearSnap],
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      // Only reset when the pointer leaves the window; element-to-element
      // moves are handled by the mouseover of the new target
      if (e.relatedTarget === null) {
        setCurrentVariant('default');
        clearSnap();
      }
    },
    [clearSnap],
  );

  useEffect(() => {
    if (isMobile()) return;

    const handleMouseMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      retarget();
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // The snapped element's viewport position changes on scroll; re-measure without re-rendering
    const handleScroll = () => {
      const activeSnap = snapRef.current;
      if (!activeSnap) return;
      activeSnap.rect = activeSnap.element.getBoundingClientRect();
      retarget();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [handleMouseOver, handleMouseOut, retarget]);

  const currentVariantData = variants[currentVariant];
  const hasContent = !!currentVariantData?.content?.text;

  // Pre-calculate final styles by replacing 'auto' with computed values
  // This is necessary because using 'auto' dimensions with animations can cause jittery/non-smooth transitions
  // Instead, we measure the content and use its exact dimensions
  const finalStyle = useMemo(() => {
    const style = { ...(currentVariantData?.style || {}) };

    if (snap) {
      return {
        ...style,
        width: snap.rect.width + snap.options.padding * 2,
        height: snap.rect.height + snap.options.padding * 2,
        borderRadius: snap.radius,
      };
    }

    if (hasContent && (style.width === 'auto' || style.height === 'auto')) {
      return {
        ...style,
        width: contentDimensions.width,
        height: contentDimensions.height,
      };
    }

    return style;
  }, [currentVariantData, contentDimensions, hasContent, snap]);

  if (isMobile()) return null;

  return (
    // Position layer: driven only by motion values, it never re-renders on pointer moves
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x,
        y,
        pointerEvents: 'none',
        zIndex,
      }}
    >
      {/* Morph layer: variant styles, snap dimensions and click scale */}
      <motion.div
        className="react-dot-cursor"
        style={{
          x: '-50%',
          y: '-50%',
          backgroundColor: `var(--cursor-color, ${defaultColor})`,
          transformOrigin: 'left center',
          overflow: 'hidden', // Important for the compression effect
        }}
        animate={{
          ...finalStyle,
          scale: scaleOnClick && isClicking ? 0.9 : 1,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: 0.15,
                ease: [0.32, 0.72, 0, 1], // Custom bezier curve for more natural animation
              }
        }
      >
        {hasContent && currentVariantData.content && (
          <span
            ref={contentRef}
            className={`react-dot-cursor-content ${currentVariantData.content.className || ''}`}
            style={{
              color: `var(--cursor-text-color, ${defaultTextColor})`,
              fontSize: '16px',
              ...currentVariantData.content.style,
            }}
          >
            {currentVariantData.content.text}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

export { Cursor };
export type { CursorProps, CursorVariant, CursorRule, CursorType, CursorTheme, SnapOptions } from './types';
