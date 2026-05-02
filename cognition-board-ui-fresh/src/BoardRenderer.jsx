import React, { useEffect, useRef } from 'react';
import { sampleTrail } from './trails/trailSchema';

const BoardRenderer = () => {
  const canvasRef = useRef(null);
const drawPulse = (ctx, fromNode, toNode, color, blur = 10) => {
  ctx.save();
  ctx.shadowBlur = blur;
  ctx.shadowColor = color;

  ctx.beginPath();
  ctx.moveTo(fromNode.x, fromNode.y);
  ctx.lineTo(toNode.x, toNode.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}; 
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);


  
    // Draw nodes
    sampleTrail.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'blue';
      ctx.fill();
    });
// Animate pulses
sampleTrail.pulses.forEach(pulse => {
  const fromNode = sampleTrail.nodes.find(n => n.id === pulse.from);
  const toNode = sampleTrail.nodes.find(n => n.id === pulse.to);
  const color = pulse.type === 'hover' ? 'orange' : 'red';
const blur = pulse.type === 'click' ? 15 : 8;

setTimeout(() => {
  drawPulse(ctx, fromNode, toNode, color, blur);
}, toNode.timestamp);
  
});


    console.log('Loaded cognition trail:', sampleTrail);
  }, []);

  return <canvas ref={canvasRef} width={400} height={400} />;
};

export default BoardRenderer;