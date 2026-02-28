# Copilot Instructions for Cognition Board UI

## Project Overview
**Cognition Board UI** is a React-based visualization component built with Create React App. It renders a multi-layered canvas system representing cognitive/attention mechanisms with interactive pulse animations, hover detection, and click-based trail markers.

## Architecture

### Core Component: BoardRenderer
Located in `src/BoardRenderer.jsx`, this is the **primary visualization component** with three canvas layers:
- **Base Layer (z-index 0)**: Static grid background with "Cognition Grid Ready" text
- **Middle Layer (z-index 1)**: Attention Zone (red rectangle at coords 120,120 with 120x120 dimensions)
- **Top Layer (z-index 2)**: Interactive animations including pulsing circle (centered at 180,180) and cognition trail markers

### State Management Pattern
Uses React `useRef` for performance-critical animation state:
- `pulseRadiusRef`: Tracks growing/shrinking pulse animation (20-30px range)
- `isHoveringRef`: Hover state within attention zone bounds
- `cognitionPointsRef`: Array of click-based trail marker coordinates

### Key Implementation Details
- **Animation loop**: `requestAnimationFrame()` continuously redraws top canvas
- **Hover detection**: `mousemove` listener calculates if coordinates fall within 120-240px bounds
- **Click handler**: Records click positions as cognition trail markers on top canvas
- **Canvas dimensions**: Fixed at 600x400px with 2px solid border (#00796b)

## Development Workflow

### Available Commands
```bash
npm start      # Development server (http://localhost:3000)
npm test       # Jest test runner in watch mode
npm run build  # Production bundle to /build folder
npm run eject  # ⚠️ One-way operation - full webpack control
```

### File Organization
- `src/App.js`: Root component wrapping BoardRenderer
- `src/components/`: Expected component directory (import pattern suggests this should exist)
- `src/canvas/`: Legacy/alternative canvas implementations (may be deprecated)
- Test files: `*.test.js` suffix with Jest/React Testing Library

## Critical Patterns & Conventions

### Canvas Rendering
1. Get context with `const ctx = canvas.getContext('2d')`
2. Set dimensions: `canvas.width = 600; canvas.height = 400;` (required before rendering)
3. Clear before re-rendering: `ctx.clearRect(0, 0, width, height)`
4. Animation loop must use `requestAnimationFrame()` for smooth 60fps rendering

### Refs for Performance
- **DON'T** use `useState()` for animation state that updates every frame - causes re-renders
- **DO** use `useRef()` for animation counters, positions, and flags that don't trigger renders
- Example: `const pulseRadiusRef = useRef(20)` for smooth animation without React overhead

### Event Listeners on Canvas
- Always attach listeners to canvas refs in `useEffect`
- **IMPORTANT**: Cleanup listeners in return function to prevent memory leaks
- Calculate relative coordinates: `e.clientX - rect.left` (canvas.getBoundingClientRect())

### Styling
- Container uses `position: 'relative'` for absolute-positioned child canvases
- All canvases positioned at `top: 0, left: 0` with stacking z-index
- Colors use hex (#) or rgba for transparency support

## Dependencies
- **React 19.2.0**: Latest version with new JSX transform
- **react-scripts 5.0.1**: Create React App tooling (handles webpack, babel, eslint)
- **Testing Library**: For component testing (@testing-library/react@16.3.0)

## Common Pitfalls to Avoid
1. **Canvas sizing**: Setting width/height in CSS instead of properties clears canvas
2. **Animation state**: Using `useState` for animation counters causes excessive re-renders
3. **Event cleanup**: Forgetting to remove listeners in useEffect cleanup function
4. **Z-index stacking**: Canvases must have explicit zIndex in style objects
5. **Reference coordinates**: Always use getBoundingClientRect() for mouse event calculations

## Testing Pattern
Uses Jest + React Testing Library. Test files co-located with source (`*.test.js`).
Example: `App.test.js` tests `App.js`

## Deploy Target
GitHub Pages workflow configured (see README deployment test note). Build folder is production-ready after `npm run build`.
