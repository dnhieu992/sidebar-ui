import '@testing-library/jest-dom';

// Polyfill Pointer Capture APIs for jsdom (not implemented natively)
if (typeof HTMLElement.prototype.setPointerCapture === 'undefined') {
  HTMLElement.prototype.setPointerCapture = function () {};
  HTMLElement.prototype.releasePointerCapture = function () {};
  HTMLElement.prototype.hasPointerCapture = function () {
    return false;
  };
}
