'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { CursorProps, CursorRule, CursorVariant, CursorType, SnapOptions } from './types';
import { isMobile, isDisabled, isInteractive, isText } from './utils';

const DEFAULT_SPRING = { stiffness: 450, damping: 45 };

const DEFAULT_SNAP: Required<SnapOptions> = {
  padding: 8,
  radius: 'auto',
  magnetism: 0.15,
  pull: 0,
  margin: 6,
};

// Opacity of the default snap overlay, derived from the cursor color
const SNAP_OVERLAY_ALPHA = 0.15;

/** Derives a translucent version of a resolved CSS color */
const toTranslucent = (color: string, alpha: number): string => {
  const match = color.match(/^rgba?\(([^)]+)\)$/);
  if (match) {
    const [r, g, b] = match[1].split(',').map((part) => part.trim());
    if (r && g && b) return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
};

/** Whether the pointer is within `margin` px of the rect */
const isNearRect = (rect: DOMRect, margin: number, px: number, py: number): boolean => {
  return px >= rect.left - margin && px <= rect.right + margin && py >= rect.top - margin && py <= rect.bottom + margin;
};

interface SnapState {
  element: HTMLElement;
  rect: DOMRect;
  radius: number;
  /** Default translucent background while snapped, derived from the cursor color */
  overlay?: string;
  options: Required<SnapOptions>;
}

const Cursor: React.FC<CursorProps> = ({
  zIndex = 9999,
  theme = {},
  scaleOnClick = true,
  defaultColor: customDefaultColor,
  spring = DEFAULT_SPRING,
  hideNativeCursor = true,
}) => {
  const [currentVariant, setCurrentVariant] = useState<CursorType>('default');
  const [fontSize, setFontSize] = useState(16);
  const [isClicking, setIsClicking] = useState(false);
  const [snap, setSnap] = useState<SnapState | null>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const [contentDimensions, setContentDimensions] = useState({ width: 0, height: 0 });

  // Transient values live in motion values / refs, not state: tracking the
  // pointer must not re-render the component (can be hundreds of events/sec).
  //
  // Three position modes:
  //  - 'free':    the cursor IS the pointer, written 1:1, never smoothed
  //  - 'snap':    the cursor is locked on the element and only follows the
  //               magnetic drift target, through a spring: raw mouse movement
  //               never leaks into the position
  //  - 'release': leaving a snap, the spring glides back to the pointer, then
  //               hands over to direct tracking once it has caught up
  const [mode, setMode] = useState<'free' | 'snap' | 'release'>('free');
  const modeRef = useRef(mode);
  const setPositionMode = useCallback((next: 'free' | 'snap' | 'release') => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);
  const springX = useSpring(targetX, spring);
  const springY = useSpring(targetY, spring);
  // Pulled element displacement, smoothed by the same spring as the cursor
  // so the element and the cursor move as one
  const pullTargetX = useMotionValue(0);
  const pullTargetY = useMotionValue(0);
  const pullX = useSpring(pullTargetX, spring);
  const pullY = useSpring(pullTargetY, spring);
  const pointerRef = useRef({ x: -100, y: -100 });
  const snapRef = useRef<SnapState | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const useDirect = mode === 'free' || prefersReducedMotion;
  const x = useDirect ? rawX : springX;
  const y = useDirect ? rawY : springY;

  // Hide the native cursor while the component is mounted; removing the
  // stylesheet on unmount brings it back
  useEffect(() => {
    if (!hideNativeCursor || isMobile()) return;
    const style = document.createElement('style');
    style.setAttribute('data-react-dot-cursor', '');
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);
    return () => style.remove();
  }, [hideNativeCursor]);

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

  // Radii are in px (half the size = a circle) rather than '50%': the snap
  // radius is a px value, and mixing units makes the morph pass through an
  // oval instead of interpolating cleanly
  const defaultVariants: Record<CursorType, CursorVariant> = useMemo(
    () => ({
      default: {
        style: {
          scale: 1,
          borderRadius: 8,
          width: 16,
          height: 16,
        },
      },
      hover: {
        style: {
          scale: 1,
          borderRadius: 15,
          width: 30,
          height: 30,
        },
      },
      text: {
        style: {
          scale: 1,
          width: 3,
          height: fontSize,
          borderRadius: 2,
        },
      },
      disabled: {
        style: {
          scale: 1,
          borderRadius: 6,
          opacity: 0.5,
          width: 12,
          height: 12,
        },
      },
    }),
    [fontSize],
  );

  const variants = useMemo(
    () => ({
      ...defaultVariants,
      ...theme.variants,
    }),
    [defaultVariants, theme.variants],
  );

  /** Writes the raw pointer 1:1 and points the spring at the drift target (snapped) or the pointer (releasing) */
  const retarget = useCallback(() => {
    const { x: px, y: py } = pointerRef.current;
    rawX.set(px);
    rawY.set(py);

    const activeSnap = snapRef.current;
    if (activeSnap && !prefersReducedMotion) {
      const { rect, options } = activeSnap;
      let cx = rect.left + rect.width / 2;
      let cy = rect.top + rect.height / 2;

      // Pull the element itself toward the pointer (the smoothed value is
      // written to the element by the spring subscription); the cursor wraps
      // the element's displaced position so both move together
      if (options.pull > 0) {
        const dx = (px - cx) * options.pull;
        const dy = (py - cy) * options.pull;
        pullTargetX.set(dx);
        pullTargetY.set(dy);
        cx += dx;
        cy += dy;
      }

      targetX.set(cx + (px - cx) * options.magnetism);
      targetY.set(cy + (py - cy) * options.magnetism);
    } else {
      targetX.set(px);
      targetY.set(py);
    }
  }, [rawX, rawY, targetX, targetY, pullTargetX, pullTargetY, prefersReducedMotion]);

  // Write the smoothed pull displacement to the snapped element
  useEffect(() => {
    const write = () => {
      const activeSnap = snapRef.current;
      if (!activeSnap || activeSnap.options.pull <= 0) return;
      activeSnap.element.style.translate = `${pullX.get()}px ${pullY.get()}px`;
    };
    const unsubX = pullX.on('change', write);
    const unsubY = pullY.on('change', write);
    return () => {
      unsubX();
      unsubY();
    };
  }, [pullX, pullY]);

  /** Animates a pulled element back into place (WAAPI, so its own CSS transitions are untouched) */
  const releasePull = useCallback(
    (state: SnapState) => {
      if (state.options.pull <= 0) return;
      const element = state.element;
      const current = element.style.translate;
      element.style.translate = '';
      if (current && current !== '0px 0px') {
        element.animate([{ translate: current }, { translate: '0px 0px' }], {
          duration: 250,
          easing: 'ease-out',
        });
      }
      // Reset for the next snapped element
      pullTargetX.jump(0);
      pullTargetY.jump(0);
    },
    [pullTargetX, pullTargetY],
  );

  const enterSnap = useCallback(
    (element: HTMLElement, snapOption: boolean | SnapOptions) => {
      if (snapRef.current?.element === element) return;

      const options = { ...DEFAULT_SNAP, ...(snapOption === true ? {} : snapOption) };
      const rect = element.getBoundingClientRect();

      let radius: number;
      if (options.radius === 'auto') {
        // Concentric radii: the outer radius is the element's own radius plus the gap.
        // borderTopLeftRadius: the shorthand can be empty in some browsers.
        const computed = window.getComputedStyle(element).borderTopLeftRadius;
        let parsed = parseFloat(computed);
        if (!Number.isFinite(parsed)) parsed = 0;
        // Percentage radii are relative to the element's box
        if (computed.trim().endsWith('%')) parsed = (parsed / 100) * Math.min(rect.width, rect.height);
        radius = parsed + options.padding;
      } else {
        radius = options.radius;
      }
      // A shape can't be rounder than half its smallest side. Also guards
      // against huge values like Tailwind's rounded-full (calc(infinity*1px)),
      // which would otherwise poison the radius animation
      radius = Math.min(radius, (Math.min(rect.width, rect.height) + options.padding * 2) / 2);

      // Moving directly from one snapped element to another: put the previous one back
      if (snapRef.current) releasePull(snapRef.current);

      // Unless the variant sets its own backgroundColor, the snapped cursor
      // uses a translucent version of its current color so the element stays
      // visible underneath
      const overlay = morphRef.current
        ? toTranslucent(window.getComputedStyle(morphRef.current).backgroundColor, SNAP_OVERLAY_ALPHA)
        : undefined;

      const state: SnapState = { element, rect, radius, overlay, options };
      snapRef.current = state;
      // Coming from direct tracking: start the glide from the cursor's actual
      // spot. Coming from a release glide: continue from where the spring is.
      if (modeRef.current === 'free') {
        springX.jump(pointerRef.current.x);
        springY.jump(pointerRef.current.y);
      }
      setPositionMode('snap');
      setSnap(state);
      retarget();
    },
    [retarget, setPositionMode, springX, springY, releasePull],
  );

  const clearSnap = useCallback(() => {
    if (!snapRef.current) return;
    releasePull(snapRef.current);
    snapRef.current = null;
    setSnap(null);
    setPositionMode('release');
    retarget();
  }, [retarget, setPositionMode, releasePull]);

  // While releasing, hand back to direct tracking once the spring has caught
  // up with the pointer (with a time cap as a safety net)
  useEffect(() => {
    if (mode !== 'release') return;

    const check = () => {
      const dx = springX.get() - pointerRef.current.x;
      const dy = springY.get() - pointerRef.current.y;
      if (Math.hypot(dx, dy) < 4) setPositionMode('free');
    };
    const unsubscribe = springX.on('change', check);
    const timer = setTimeout(() => setPositionMode('free'), 500);
    check();

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [mode, springX, springY, setPositionMode]);

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

  const applyTarget = useCallback(
    (target: HTMLElement, px: number, py: number) => {
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

      // Keep the snap while the pointer is still within its margin of the element
      const activeSnap = snapRef.current;
      if (activeSnap && isNearRect(activeSnap.rect, activeSnap.options.margin, px, py)) return;

      clearSnap();
      if (isDisabled(target)) {
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

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      applyTarget(e.target as HTMLElement, e.clientX, e.clientY);
    },
    [applyTarget],
  );

  // Largest margin among snap rules: how far around the pointer we probe
  const maxSnapMargin = useMemo(() => {
    let max = 0;
    for (const rule of theme.rules ?? []) {
      if (!rule.snap) continue;
      max = Math.max(max, rule.snap === true ? DEFAULT_SNAP.margin : (rule.snap.margin ?? DEFAULT_SNAP.margin));
    }
    return max;
  }, [theme.rules]);

  const hasSnapRules = useMemo(() => theme.rules?.some((rule) => rule.snap) ?? false, [theme.rules]);

  /** Hit-test a small ring around the pointer so the snap engages just before the border is touched */
  const probeProximity = useCallback(
    (px: number, py: number) => {
      const m = maxSnapMargin;
      if (m <= 0) return;
      const d = m * Math.SQRT1_2;
      const probes: Array<[number, number]> = [
        [px + m, py],
        [px - m, py],
        [px, py + m],
        [px, py - m],
        [px + d, py + d],
        [px + d, py - d],
        [px - d, py + d],
        [px - d, py - d],
      ];

      for (const [qx, qy] of probes) {
        const el = document.elementFromPoint(qx, qy);
        if (!(el instanceof HTMLElement)) continue;
        const match = findMatchingRule(el);
        if (!match?.rule.snap) continue;

        // Engage only within this rule's own margin
        const margin = match.rule.snap === true ? DEFAULT_SNAP.margin : (match.rule.snap.margin ?? DEFAULT_SNAP.margin);
        if (isNearRect(match.element.getBoundingClientRect(), margin, px, py)) {
          setCurrentVariant(match.rule.variant);
          enterSnap(match.element, match.rule.snap);
          return;
        }
      }
    },
    [findMatchingRule, enterSnap, maxSnapMargin],
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

      const activeSnap = snapRef.current;
      if (activeSnap) {
        // The margin boundary can be crossed without a mouseover firing
        // (moving within the same background element), so check it here too
        if (!isNearRect(activeSnap.rect, activeSnap.options.margin, e.clientX, e.clientY)) {
          const under = document.elementFromPoint(e.clientX, e.clientY);
          if (under instanceof HTMLElement) {
            applyTarget(under, e.clientX, e.clientY);
          } else {
            clearSnap();
          }
        }
      } else if (hasSnapRules) {
        probeProximity(e.clientX, e.clientY);
      }

      retarget();
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // The cursor visually wraps the snapped element while the real pointer
    // can still be in the attraction margin around it: forward those clicks
    // to the element so what the cursor shows is what a click does
    const handleClick = (e: MouseEvent) => {
      const activeSnap = snapRef.current;
      if (!activeSnap) return;
      const { element, rect, options } = activeSnap;
      if (e.target instanceof Node && element.contains(e.target)) return; // the click already hit it
      if (isNearRect(rect, options.margin, e.clientX, e.clientY)) {
        element.click();
      }
    };

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
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      // Unmounting while snapped: don't leave a pulled element displaced
      if (snapRef.current) releasePull(snapRef.current);
    };
  }, [handleMouseOver, handleMouseOut, retarget, applyTarget, clearSnap, probeProximity, hasSnapRules, releasePull]);

  const currentVariantData = variants[currentVariant];
  const hasContent = !!currentVariantData?.content?.text;

  // Pre-calculate final styles by replacing 'auto' with computed values
  // This is necessary because using 'auto' dimensions with animations can cause jittery/non-smooth transitions
  // Instead, we measure the content and use its exact dimensions
  const finalStyle = useMemo(() => {
    const style = { ...currentVariantData?.style };

    if (snap) {
      const snapStyle = {
        ...style,
        width: snap.rect.width + snap.options.padding * 2,
        height: snap.rect.height + snap.options.padding * 2,
        borderRadius: snap.radius,
      };
      if (snapStyle.backgroundColor === undefined && snap.overlay) {
        snapStyle.backgroundColor = snap.overlay;
      }
      return snapStyle;
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
        ref={morphRef}
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
            : snap
              ? // Same physics as the snap offset so size and position read as one gesture
                { type: 'spring', ...spring }
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
