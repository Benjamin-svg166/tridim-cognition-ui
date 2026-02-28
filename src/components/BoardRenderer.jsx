import React, { useEffect, useRef, useCallback } from 'react';

// Global state outside React's control
let globalWatchdog = null;
let globalAnimatePulse = null;
let globalMounted = null;
let globalLastFrameTime = null;
let globalAnimationFrameRef = null;

const BoardRenderer = () => {

  const baseCanvasRef = useRef(null);
  const middleCanvasRef = useRef(null);
  const topCanvasRef = useRef(null);
  const pulseRadiusRef = useRef(20);
  const isHoveringRef = useRef(false);
  const cognitionPointsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const growingRef = useRef(true);
  const isMountedRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const watchdogRef = useRef(null);
  
  // Define animation function with useCallback to maintain stable reference
  const animatePulse = useCallback(() => {
    // Check if animation should continue
    if (!isMountedRef.current) {
      console.log('🛑 Animation stopped: component unmounted');
      return;
    }
    
    frameCountRef.current++;
    lastFrameTimeRef.current = Date.now();
    globalLastFrameTime = Date.now(); // Update global
    
    const canvas = topCanvasRef.current;
    if (!canvas) {
      console.log('⚠️ Canvas missing at frame:', frameCountRef.current);
      animationFrameRef.current = requestAnimationFrame(animatePulse);
      return;
    }
    
    // Check if canvas is still in the document
    if (!document.body.contains(canvas)) {
      console.log('⚠️ Canvas detached from DOM at frame:', frameCountRef.current);
      animationFrameRef.current = requestAnimationFrame(animatePulse);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('⚠️ Context missing at frame:', frameCountRef.current);
      animationFrameRef.current = requestAnimationFrame(animatePulse);
      return;
    }
    
    // Verify canvas dimensions
    if (canvas.width === 0 || canvas.height === 0) {
      console.log('⚠️ Canvas has zero dimensions at frame:', frameCountRef.current);
      animationFrameRef.current = requestAnimationFrame(animatePulse);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let radius = pulseRadiusRef.current;
    if (growingRef.current) {
      radius += 0.5;
      if (radius >= 30) growingRef.current = false;
    } else {
      radius -= 0.5;
      if (radius <= 20) growingRef.current = true;
    }
    pulseRadiusRef.current = radius;

    ctx.beginPath();
    ctx.arc(90, 90, radius / 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
    ctx.fill();

    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0288d1';
    ctx.font = '10px Arial';
    ctx.fillText('Pulse', 75, 88);

    // Hover effect
    if (isHoveringRef.current) {
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, 60, 60);
    }

    // Cognition trail markers
    cognitionPointsRef.current.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 193, 7, 0.8)';
      ctx.fill();

      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Draw frame counter for visual confirmation
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.fillText(`Frame: ${frameCountRef.current}`, 220, 15);

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(animatePulse);
  }, []);
  
  useEffect(() => {
    console.log('🧠 BoardRenderer mounted, starting animation');
    isMountedRef.current = true;
    frameCountRef.current = 0;
    
    // Update global references
    globalMounted = isMountedRef;
    globalLastFrameTime = Date.now();
    globalAnimationFrameRef = animationFrameRef;
    globalAnimatePulse = animatePulse;

    // Base layer
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) {
      console.error('❌ Base canvas ref is null!');
      return;
    }
    const baseCtx = baseCanvas.getContext('2d');

    baseCtx.fillStyle = '#f0f0f0';
    baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

    baseCtx.strokeStyle = '#333';
    for (let x = 0; x <= baseCanvas.width; x += 60) {
      baseCtx.beginPath();
      baseCtx.moveTo(x, 0);
      baseCtx.lineTo(x, baseCanvas.height);
      baseCtx.stroke();
    }
    for (let y = 0; y <= baseCanvas.height; y += 60) {
      baseCtx.beginPath();
      baseCtx.moveTo(0, y);
      baseCtx.lineTo(baseCanvas.width, y);
      baseCtx.stroke();
    }

    baseCtx.fillStyle = '#00796b';
    baseCtx.font = '14px Arial';
    baseCtx.fillText('🧠 Cognition Grid', 90, 100);

    // Middle layer
    const middleCanvas = middleCanvasRef.current;
    if (!middleCanvas) {
      console.error('❌ Middle canvas ref is null!');
      return;
    }
    const middleCtx = middleCanvas.getContext('2d');

    middleCtx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    middleCtx.fillRect(60, 60, 60, 60);

    middleCtx.strokeStyle = '#d32f2f';
    middleCtx.lineWidth = 2;
    middleCtx.strokeRect(60, 60, 60, 60);

    middleCtx.fillStyle = '#d32f2f';
    middleCtx.font = '11px Arial';
    middleCtx.fillText('Attention', 65, 95);

    // Start animation only if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animatePulse);
    }
    
    // Clear any existing global watchdog
    if (globalWatchdog) {
      clearInterval(globalWatchdog);
    }
    
    // Global watchdog that React can't interfere with
    globalWatchdog = setInterval(() => {
      if (globalMounted && globalMounted.current && globalAnimatePulse) {
        const timeSinceLastFrame = Date.now() - globalLastFrameTime;
        if (timeSinceLastFrame > 32) {
          console.log('⚠️ GLOBAL watchdog restarting animation, stalled for:', timeSinceLastFrame + 'ms');
          if (globalAnimationFrameRef && globalAnimationFrameRef.current) {
            cancelAnimationFrame(globalAnimationFrameRef.current);
          }
          globalLastFrameTime = Date.now();
          const frameId = requestAnimationFrame(globalAnimatePulse);
          if (globalAnimationFrameRef) {
            globalAnimationFrameRef.current = frameId;
          }
        }
      }
    }, 16);

const handleClick = (e) => {
  const canvas = topCanvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  cognitionPointsRef.current.push({ x, y });
};

    const canvas = topCanvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }
  
    // ✅ Hover detection

    const handleMouseMove = (e) => {
      const canvas = topCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const isHovering =
        mouseX >= 60 &&
        mouseX <= 120 &&
        mouseY >= 60 &&
        mouseY <= 120;

      isHoveringRef.current = isHovering;
    };

    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      console.log('🧠 BoardRenderer unmounting, stopping animation at frame:', frameCountRef.current);
      isMountedRef.current = false;
      
      // Clear global watchdog
      if (globalWatchdog) {
        clearInterval(globalWatchdog);
        globalWatchdog = null;
      }
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Remove event listeners
      const canvas = topCanvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [animatePulse]);

  return (
    <div
      style={{
        position: 'relative',
        width: '300px',
        height: '200px',
        margin: '0 auto',
        border: '2px solid #00796b',
      }}
    >
      <canvas
        ref={baseCanvasRef}
        width={300}
        height={200}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={middleCanvasRef}
        width={300}
        height={200}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
      />
      <canvas
        ref={topCanvasRef}
        width={300}
        height={200}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, cursor: 'pointer' }}
      />
    </div>
  );
};

export default React.memo(BoardRenderer);
