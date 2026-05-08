# Copilot Instructions for Cognition Board UI

## Project Overview
**Cognition Board UI** is a React-based visualization component built with Create React App. It renders a multi-layered canvas system representing cognitive/attention mechanisms with interactive pulse animations, hover detection, and click-based trail markers.

## Top 3 Critical Rules

**Before implementing, verify you have:**

□ **1. Use `useRef()` NOT `useState()`** for animation state to avoid re-renders
   - Example: `const pulseRadiusRef = useRef(20)` ✓
   - Never: `const [pulseRadius, setPulseRadius] = useState(20)` ✗

□ **2. Set canvas dimensions for all layers via properties** (`canvas.width/height`), never CSS
   - Example: `canvas.width = 600; canvas.height = 400;` ✓
   - Never: `canvas.style.width = '600px'` ✗

□ **3. Always cleanup event listeners** in `useEffect` return function
   - Example: `return () => canvas.removeEventListener('click', handler)` ✓
   - Never: Forget to remove listeners ✗

## Quick Reference Table

**Implementation Order:** Follow Canvas Rendering → State Management → Event Listeners → Styling

| Category | Rule | Details |
|----------|------|---------|
| **Canvas Rendering** | Get context | `const ctx = canvas.getContext('2d')` |
| | Set dimensions | `canvas.width = 600; canvas.height = 400;` (required before rendering) |
| | Clear before redraw | `ctx.clearRect(0, 0, width, height)` |
| | Animation loop | Use `requestAnimationFrame()` for 60fps |
| **State Management** | Animation state | Use `useRef()` NOT `useState()` to avoid re-renders |
| **Event Listeners** | Attach in useEffect | Always attach listeners to canvas refs in `useEffect` |
| | Cleanup required | Return cleanup function to prevent memory leaks |
| | Coordinate calc | `e.clientX - rect.left` (canvas.getBoundingClientRect()) |
| | Error handling | For click and hover events, validate that coordinates are within the bounds: 0-600px width and 0-400px height |
| **Styling** | Container position | `position: 'relative'` for absolute-positioned children |
| | Canvas stacking | All at `top: 0, left: 0` with explicit z-index |

## Step-by-Step Implementation Guide

1. **Canvas Setup**: Set dimensions via properties (`canvas.width = 600; canvas.height = 400`)
2. **State Initialization**: Create refs with `useRef()` for animation values
3. **Event Listeners**: Attach in `useEffect`, return cleanup function
4. **Animation Loop**: Use `requestAnimationFrame()` to continuously redraw
5. **Styling**: Apply z-index stacking to layer canvases correctly

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
- **Hover detection**: `mousemove` listener calculates if coordinates fall within 120-240px bounds relative to the canvas top-left corner (this is the Attention Zone area on the middle layer)
- **Click handler**: Records click positions as cognition trail markers on top canvas. Markers persist until page refresh and are rendered as visual points on each animation frame. Clicks outside canvas bounds should be ignored.
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
