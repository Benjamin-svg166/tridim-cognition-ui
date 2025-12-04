# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## 3D Chess Prototype (Overview)
- Purpose: Experimental multi-level chess board rendered on canvas with basic move validation, path obstruction checks, captures, turn enforcement, undo/redo, and simple move animations.
- Main files:
	- `src/components/ThreeDChessBoard.jsx`
	- `src/components/threeDChessUtils.js`
	- Tests: `src/components/ThreeDChessBoard.test.js`, `src/components/threeDChessUtils.test.js`, `src/components/threeDChessUtils.path.test.js`

### Run & Test
- Install dependencies:
	- `npm install`
- Run tests (non-watch):
	- `npm test -- --watchAll=false`
- Start dev server:
	- `npm start` (http://localhost:3000)

### Features
- Multi-level board rendering on canvas.
- Rook/Bishop/Knight/Queen movement rules via utilities.
- Path obstruction checking and capture handling.
- Turn enforcement, move history, undo/redo.
- Basic animation: interpolated piece movement with requestAnimationFrame.

### Notes
- Animation and board state use `useRef` to avoid excessive React re-renders.
- Canvas event listeners are cleaned up in `useEffect`.
- Tests rely on canvas API mocks in `src/setupTests.js`.

## Project Cleanup

### Post-PR Cleanup (Optional)
After merging the `chess-prototype-clean` branch, clean up temporary artifacts:

**Remove temporary clone:**
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\tmp-tridim-clean"
```

**Remove nested repository (if present):**
Only after confirming your changes are merged and backed up on GitHub:
```powershell
Remove-Item -Recurse -Force "C:\Users\bussi\Documents\cognition-board-ui-react\.git"
```

### File Structure Consolidation
The project now uses a single BoardRenderer component:
- **Active:** `src/components/BoardRenderer.jsx` (canonical implementation)
- **Re-export:** `src/BoardRenderer.jsx` (compatibility shim for legacy imports)
- **Removed:** `src/canvas/`, `src/canvas - Copy/`, `src/New folder/` (obsolete duplicates)

### Branch Protection (Recommended)
To require CI checks before merging, set up branch protection:

1. Go to: `https://github.com/Benjamin-svg166/tridim-cognition-ui/settings/branches`
2. Click "Add rule" for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select: `build-and-test` (from `.github/workflows/ci.yml`)
   - ✅ Require linear history (optional)
4. Save changes

Alternatively, use GitHub CLI (requires authentication):
```powershell
gh api repos/Benjamin-svg166/tridim-cognition-ui/branches/main/protection -X PUT -F required_status_checks='{"strict":true,"contexts":["build-and-test"]}' -F enforce_admins=true -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false}'
```

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
 
## Deployment Test
Triggering GitHub Pages workflow run