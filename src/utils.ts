import { INTERACTIVE_ELEMENTS, TEXT_ELEMENTS } from './constants';

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
