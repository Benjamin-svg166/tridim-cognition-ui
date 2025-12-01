import React, { useEffect, useRef } from 'react';

const BoardRenderer = () => {

  const baseCanvasRef = useRef(null);
  const middleCanvasRef = useRef(null);
  const topCanvasRef = useRef(null);
  const pulseRadiusRef = useRef(20);
  const isHoveringRef = useRef(false); // ✅ Track hover state
  const cognitionPointsRef = useRef([]); 
  
  useEffect(() => {

    console.log('✅ BoardRenderer mounted');

    // Base layer
    const baseCanvas = baseCanvasRef.current;
    const baseCtx = baseCanvas.getContext('2d');
    baseCanvas.width = 600;
    baseCanvas.height = 400;

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
    baseCtx.font = '20px Arial';
    baseCtx.fillText('🧠 Cognition Grid Ready', 180, 200);

    // Middle layer
    const middleCanvas = middleCanvasRef.current;
    const middleCtx = middleCanvas.getContext('2d');
    middleCanvas.width = 600;
    middleCanvas.height = 400;

    middleCtx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    middleCtx.fillRect(120, 120, 120, 120);

    middleCtx.strokeStyle = '#d32f2f';
    middleCtx.lineWidth = 2;
    middleCtx.strokeRect(120, 120, 120, 120);

    middleCtx.fillStyle = '#d32f2f';
    middleCtx.font = '16px Arial';
    middleCtx.fillText('Attention Zone', 130, 190);

    // Top layer
    const topCanvas = topCanvasRef.current;
    const topCtx = topCanvas.getContext('2d');
    topCanvas.width = 600;
    topCanvas.height = 400;

    let growing = true;

  const animatePulse = () => {
  topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height);

  let radius = pulseRadiusRef.current;
  if (growing) {
    radius += 0.5;
    if (radius >= 30) growing = false;
  } else {
    radius -= 0.5;
    if (radius <= 20) growing = true;
  }
  pulseRadiusRef.current = radius;

  topCtx.beginPath();
  topCtx.arc(180, 180, radius, 0, 2 * Math.PI);
  topCtx.fillStyle = 'rgba(0, 150, 255, 0.3)';
  topCtx.fill();

  topCtx.strokeStyle = '#0288d1';
  topCtx.lineWidth = 2;
  topCtx.stroke();

  topCtx.fillStyle = '#0288d1';
  topCtx.font = '14px Arial';
  topCtx.fillText('Cognition Pulse', 150, 175);

  // ✅ Hover effect
  if (isHoveringRef.current) {
    topCtx.strokeStyle = '#ff9800';
    topCtx.lineWidth = 3;
    topCtx.strokeRect(120, 120, 120, 120);
  }

  // 🧠 Cognition trail markers
  cognitionPointsRef.current.forEach((point) => {
    topCtx.beginPath();
    topCtx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    topCtx.fillStyle = 'rgba(255, 193, 7, 0.8)';
    topCtx.fill();

    topCtx.strokeStyle = '#ff9800';
    topCtx.lineWidth = 2;
    topCtx.stroke();
  });

  requestAnimationFrame(animatePulse);
};  

    animatePulse(); // ✅ Starts the animation loop     

const handleClick = (e) => {
  const rect = topCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  cognitionPointsRef.current.push({ x, y });
};
topCanvas.addEventListener('click', handleClick);
  
    // ✅ Hover detection

    const handleMouseMove = (e) => {
      const rect = topCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const isHovering =
        mouseX >= 120 &&
        mouseX <= 240 &&
        mouseY >= 120 &&
        mouseY <= 240;

      isHoveringRef.current = isHovering;
    };

    topCanvas.addEventListener('mousemove', handleMouseMove);

    return () => {
    topCanvas.removeEventListener('click', handleClick);  
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '600px',
        height: '400px',
        margin: '0 auto',
        border: '2px solid #00796b',
      }}
    >
      <canvas
        ref={baseCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      />
      <canvas
        ref={middleCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      <canvas
        ref={topCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
      />
    </div>
  );
};

export default BoardRenderer;
