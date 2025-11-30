import { render, screen } from '@testing-library/react';
import ThreeDChessBoard from './ThreeDChessBoard';

test('renders correct number of level canvases and level selector', () => {
  const levels = 3;
  const { container } = render(<ThreeDChessBoard size={8} levels={levels} canvasSize={120} />);
  const select = screen.getByTestId('level-select');
  expect(select).toBeInTheDocument();
  const canvases = container.querySelectorAll('canvas');
  expect(canvases.length).toBe(levels);
});
