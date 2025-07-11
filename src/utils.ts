import { INTERACTIVE_ELEMENTS, TEXT_ELEMENTS } from './constants';

/** Normalize different color formats to CSS-compatible string */
export const normalizeColor = (color: string): string => {
  // Trim whitespace
  const trimmedColor = color.trim();
  
  // If it's already a CSS function (hsl, rgb, oklch, etc.), return as-is
  if (/^(hsl|rgb|oklch|lab|lch|color|hwb|hsv|cmyk)\(/i.test(trimmedColor)) {
    return trimmedColor;
  }
  
  // If it's a hex color, return as-is
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmedColor)) {
    return trimmedColor;
  }
  
  // If it's a named color, return as-is
  if (/^[a-zA-Z]+$/.test(trimmedColor)) {
    return trimmedColor;
  }
  
  // If it looks like HSL values without function wrapper (e.g., "240 10% 3.9%")
  if (/^\d+\s+\d+%\s+\d+%/.test(trimmedColor)) {
    return `hsl(${trimmedColor})`;
  }
  
  // If it looks like RGB values without function wrapper (e.g., "255 0 0")
  if (/^\d+\s+\d+\s+\d+/.test(trimmedColor)) {
    return `rgb(${trimmedColor})`;
  }
  
  // If it looks like OKLCH values without function wrapper (e.g., "0.7 0.15 180")
  if (/^\d*\.?\d+\s+\d*\.?\d+\s+\d+/.test(trimmedColor)) {
    return `oklch(${trimmedColor})`;
  }
  
  // Default: assume it's HSL format and wrap it
  return `hsl(${trimmedColor})`;
};

/** Check if the user is on a mobile device */
export const isMobile = (): boolean => {
  return /iPhone|iPad|iPod|Android|WebOS/i.test(navigator.userAgent);
};

/** Check if the target is an interactive element */
export const isInteractive = (target: HTMLElement): boolean => {
  if (INTERACTIVE_ELEMENTS.includes(target.tagName as any)) {
    return true;
  }
  // Check interactions via a role or an 'onclick' event
  if (
    target.getAttribute('role') === 'button' ||
    target.getAttribute('role') === 'link' ||
    target.hasAttribute('onclick')
  ) {
    return true;
  }
  // Check if the element belongs to an interactive container
  if (target.closest('A') || target.closest('BUTTON')) {
    return true;
  }

  return false;
};

/** Check if the target is a text element */
export const isText = (target: HTMLElement): boolean => {
  if (TEXT_ELEMENTS.includes(target.tagName as any)) {
    return true;
  }

  return false;
};
