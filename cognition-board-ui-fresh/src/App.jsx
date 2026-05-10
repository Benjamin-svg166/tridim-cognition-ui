// App.jsx
import { useState, useEffect } from 'react';
import { CognitionProvider } from './cognition/CognitionContext';
import CognitionShell from './components/CognitionShell';
import IntroPage from './components/IntroPage';

function App() {
  // Default to showing intro
  const [showIntro, setShowIntro] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check localStorage after mount
    try {
      const saved = localStorage.getItem('gen2-show-intro');
      if (saved === 'false') {
        setShowIntro(false);
      }
    } catch (e) {
      console.error('localStorage error:', e);
    }
    setIsReady(true);
  }, []);

  const handleEnter = () => {
    setShowIntro(false);
    try {
      localStorage.setItem('gen2-show-intro', 'false');
    } catch (e) {
      console.error('localStorage error:', e);
    }
  };

  // Show nothing until we've checked localStorage
  if (!isReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050812',
        color: '#ffffff'
      }}>
        Loading...
      </div>
    );
  }

  if (showIntro) {
    return <IntroPage onEnter={handleEnter} />;
  }

  return (
    <CognitionProvider>
      <CognitionShell />
    </CognitionProvider>
  );
}

export default App;
