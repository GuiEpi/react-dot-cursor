export type CursorType = 'default' | 'hover' | 'text' | 'disabled';

export interface CursorProps {
  /** Custom z-index for the cursor. Defaults to 9999 */
  zIndex?: number;
}

export interface Position {
  x: number;
  y: number;
}
