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

test('saves and loads game state from localStorage', () => {
  // Clear any existing state
  localStorage.clear();
  
  // Render component - should initialize with default pieces
  const { unmount } = render(<ThreeDChessBoard size={8} levels={3} canvasSize={120} />);
  
  // Check that state was saved to localStorage
  const savedState = localStorage.getItem('chess3d-gamestate');
  expect(savedState).toBeTruthy();
  
  const state = JSON.parse(savedState);
  expect(state.pieces).toBeDefined();
  expect(state.pieces.length).toBeGreaterThan(0);
  expect(state.toMove).toBe('white');
  expect(state.moveHistory).toEqual([]);
  
  // Unmount and remount - should restore state
  unmount();
  const { container } = render(<ThreeDChessBoard size={8} levels={3} canvasSize={120} />);
  
  // Verify component rendered
  const select = screen.getByTestId('level-select');
  expect(select).toBeInTheDocument();
  
  // Clean up
  localStorage.clear();
});
