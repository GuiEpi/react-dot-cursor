import { INTERACTIVE_ELEMENTS, TEXT_ELEMENTS } from './constants';

// Matches interactive elements and containers: tags, roles or click handlers.
// closest() with this selector also catches children of interactive elements
// (e.g. the text node wrapper inside a button)
const INTERACTIVE_SELECTOR = [...INTERACTIVE_ELEMENTS, '[role="button"]', '[role="link"]', '[onclick]'].join(', ');

/** Check if the user is on a mobile device */
export const isMobile = (): boolean => {
  return /iPhone|iPad|iPod|Android|WebOS/i.test(navigator.userAgent);
};

/** Check if the target is, or belongs to, a disabled element */
export const isDisabled = (target: HTMLElement): boolean => {
  return target.closest('[disabled]') !== null;
};

/** Check if the target is, or belongs to, an interactive element */
export const isInteractive = (target: HTMLElement): boolean => {
  return target.closest(INTERACTIVE_SELECTOR) !== null;
};

/** Check if the target is a text element */
export const isText = (target: HTMLElement): boolean => {
  return (TEXT_ELEMENTS as readonly string[]).includes(target.tagName);
};
