import { render } from '@testing-library/react';
import App from './App';

test('renders expected canvas layers from both renderers', () => {
  const { container } = render(<App />);
  const canvases = container.querySelectorAll('canvas');
  // BoardRenderer provides 3 canvases and ThreeDChessBoard provides 3 canvases
  expect(canvases.length).toBe(6);
});
