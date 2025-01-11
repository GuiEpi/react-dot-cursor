import { TargetAndTransition } from 'motion/react';

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

/** Defines a rule for when to apply a specific cursor variant */
export interface CursorRule {
  /** CSS selector(s) that triggers this rule. Can be a single selector or array of selectors */
  selector: string | string[];
  /** Cursor variant to apply when selector matches */
  variant: CursorType;
  /** Optional priority for resolving conflicts between rules */
  priority?: number;
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
  /** Default color in HSL format */
  defaultColor?: string;
}

export interface Position {
  x: number;
  y: number;
}
