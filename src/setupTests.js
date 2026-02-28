// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Provide a minimal mock for canvas getContext in jsdom tests.
// jsdom does not implement the Canvas API; tests that render canvas components
// expect `getContext` to exist. This mock implements the common methods used
// by our `BoardRenderer` component as no-ops so tests can run.
if (typeof HTMLCanvasElement !== 'undefined') {
	HTMLCanvasElement.prototype.getContext = function () {
		return {
			fillRect: () => {},
			clearRect: () => {},
			getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4) }),
			putImageData: () => {},
			createImageData: () => [],
			setTransform: () => {},
			drawImage: () => {},
			save: () => {},
			restore: () => {},
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			closePath: () => {},
			stroke: () => {},
			strokeRect: () => {},
			arc: () => {},
			fill: () => {},
			fillText: () => {},
			measureText: () => ({ width: 0 }),
			translate: () => {},
			rotate: () => {},
			scale: () => {},
			transform: () => {},
			setLineDash: () => {},
			getLineDash: () => [],
			fillStyle: '',
			strokeStyle: '',
			lineWidth: 1,
		};
	};
}
