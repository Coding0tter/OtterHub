const hasCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches;
const hasMobileWidth = (maxWidth = 639) =>
  window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
const hasMultipleTouchPoints = () => navigator.maxTouchPoints > 1;
const hasTouchEvents = () => "ontouchstart" in document.documentElement;

export const isMobile = () => {
  return (
    hasCoarsePointer() &&
    hasMultipleTouchPoints() &&
    hasMobileWidth() &&
    hasTouchEvents()
  );
};
