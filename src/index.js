import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

console.log('✅ index.js is running');

// Lazy load App for code splitting
const App = lazy(() => import('./App'));

// Minimal loading placeholder
const Loader = () => <div className="loading-container">
  <h3 className="loading-header">3D Chess Game - Expanded View</h3>
  <div className="loading-hero">
    <div className="loading-icons">♔♕♖</div>
    <div className="loading-title">3D Chess</div>
    <div className="loading-subtitle">Loading...</div>
  </div>
</div>;

// Single root for better performance
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<Loader />}>
      <App />
    </Suspense>
  </React.StrictMode>
);

// Defer CSS to after initial paint (non-blocking)
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(() => {
    import('./index.css');
  }, { timeout: 2000 });
} else {
  setTimeout(() => import('./index.css'), 1000);
}