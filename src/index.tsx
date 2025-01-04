'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'motion/react';
import { CursorType, Position, CursorProps } from './types';

const INTERACTIVE_ELEMENTS: string[] = ['BUTTON', 'A', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY'];

const TEXT_ELEMENTS: string[] = [
  'P',
  'SPAN',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'LI',
  'TD',
  'TH',
  'BLOCKQUOTE',
  'CODE',
  'PRE',
  'STRONG',
  'B',
  'I',
  'EM',
  'S',
  'U',
  'MARK',
  'Q',
  'CITE',
];

const Cursor: React.FC<CursorProps> = ({ zIndex = 9999 }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const defaultColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? '0 0% 98%' : '240 10% 3.9%';

  const variants: Variants = {
    default: {
      scale: isClicking ? 0.9 : 1,
      borderRadius: '50%',
      width: 16,
      height: 16,
    },
    hover: {
      scale: isClicking ? 0.9 : 1,
      borderRadius: '50%',
      width: 30,
      height: 30,
    },
    text: {
      scale: isClicking ? 0.9 : 1,
      width: 3,
      height: fontSize,
      borderRadius: '1rem',
    },
    disabled: {
      scale: 1,
      borderRadius: '50%',
      opacity: 0.5,
      width: 12,
      height: 12,
    },
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;

      if (target.hasAttribute('disabled')) {
        setCursorType('disabled');
      } else if (INTERACTIVE_ELEMENTS.includes(target.tagName)) {
        setCursorType('hover');
      } else if (TEXT_ELEMENTS.includes(target.tagName)) {
        setFontSize(parseFloat(getComputedStyle(target).fontSize));
        setCursorType('text');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseDown = (): void => setIsClicking(true);
    const handleMouseUp = (): void => setIsClicking(false);
    const handleMouseOut = (): void => setCursorType('default');

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
  }, []);

  return (
    <motion.div
      className="custom-cursor"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        pointerEvents: 'none',
        backgroundColor: `hsl(var(--cursor-color, ${defaultColor}))`,
        zIndex,
        transform: 'translate(-50%, -50%)',
      }}
      variants={variants}
      animate={cursorType}
    />
  );
};

export { Cursor };
export type { CursorProps };
