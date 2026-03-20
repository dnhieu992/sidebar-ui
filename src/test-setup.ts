import '@testing-library/jest-dom';

// Polyfill Pointer Capture APIs for jsdom (not implemented natively)
if (typeof HTMLElement.prototype.setPointerCapture === 'undefined') {
  HTMLElement.prototype.setPointerCapture = function () {};
  HTMLElement.prototype.releasePointerCapture = function () {};
  HTMLElement.prototype.hasPointerCapture = function () {
    return false;
  };
}

// Polyfill PointerEvent with clientX/clientY support for jsdom
// jsdom creates pointer events as generic Events, losing MouseEvent properties
if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
    }
  }
  (window as unknown as Record<string, unknown>).PointerEvent = PointerEvent;
}
