import { SpringOptions, TargetAndTransition } from 'motion/react';

/** Defines the possible cursor states/variants. Can be default system types for override or custom string */
export type CursorType = 'default' | 'hover' | 'text' | 'disabled' | string;

/** Defines the content that can be displayed alongside the cursor */
export interface CursorContent {
  /** Optional text to display */
  text?: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

/** Defines a cursor variant with its animation style and optional content */
export interface CursorVariant {
  /** Motion animation properties for this variant */
  style: TargetAndTransition;
  /** Optional content to display for this variant */
  content?: CursorContent;
}

/** Options controlling how the cursor magnetically snaps onto matched elements */
export interface SnapOptions {
  /** Extra space between the element and the cursor edge, in px. Defaults to 8 */
  padding?: number;
  /** Border radius of the snapped cursor, in px. 'auto' derives it from the element's own radius. Defaults to 'auto' */
  radius?: number | 'auto';
  /** How much the cursor drifts toward the pointer while snapped, from 0 (locked on the element) to 1 (follows the pointer). Defaults to 0.15 */
  magnetism?: number;
  /** How much the element itself is pulled toward the pointer while snapped, from 0 (static) to 1 (glued to the pointer). Defaults to 0 */
  pull?: number;
  /** Attraction margin around the element (px): the snap engages and releases this far from its border. Clicks in this zone activate the element. Defaults to 6 */
  margin?: number;
}

/** Defines a rule for when to apply a specific cursor variant */
export interface CursorRule {
  /** CSS selector(s) that triggers this rule. Matches the hovered element or any of its ancestors */
  selector: string | string[];
  /** Cursor variant to apply when selector matches */
  variant: CursorType;
  /** Optional priority for resolving conflicts between rules */
  priority?: number;
  /** Magnetically snap the cursor onto the matched element. Pass true for defaults or an options object */
  snap?: boolean | SnapOptions;
}

/** Theme configuration for the cursor component */
export interface CursorTheme {
  /** Map of cursor variants keyed by variant name */
  variants?: Partial<Record<CursorType, CursorVariant>>;
  /** List of rules that determine when to apply variants */
  rules?: CursorRule[];
}

/** Props for the main Cursor component */
export interface CursorProps {
  /** Custom z-index for the cursor. Defaults to 9999 */
  zIndex?: number;
  /** Theme configuration for variants and rules */
  theme?: CursorTheme;
  /** Whether to scale cursor on click */
  scaleOnClick?: boolean;
  /** Default color in valid CSS format (e.g., 'hsl(240 10% 3.9%)', '#ff4081', 'rgb(255 64 129)', 'oklch(0.7 0.15 330)') */
  defaultColor?: string;
  /** Spring driving the magnetic snap (enter, exit and drift). Free tracking is always 1:1. Defaults to \{ stiffness: 450, damping: 38 } */
  spring?: SpringOptions;
  /** Hide the native cursor by injecting `* { cursor: none !important }` while mounted. Set to false to manage it yourself. Defaults to true */
  hideNativeCursor?: boolean;
}

export interface Position {
  x: number;
  y: number;
}
