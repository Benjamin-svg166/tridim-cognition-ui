// src/components/CognitionShell.jsx
import React, { useState, useRef, useCallback } from 'react';
import BoardRenderer from '../BoardRenderer';
import NineDCubeRenderer from '../nineDCube/NineDCubeRenderer';
import NodeInspector from './NodeInspector';
import CognitionControlPanel from './CognitionControlPanel';
import { useCognition } from '../cognition/CognitionContext';
import '../styles/CognitionShell.css';

const MIN_RIGHT_WIDTH = 260;
const MAX_RIGHT_WIDTH = 520;

const CognitionShell = () => {
  const [rightWidth, setRightWidth] = useState(340);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const { activeTrail } = useCognition();

  const onMouseDown = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      const fromRight = totalWidth - (e.clientX - rect.left);
      const clamped = Math.min(MAX_RIGHT_WIDTH, Math.max(MIN_RIGHT_WIDTH, fromRight));
      setRightWidth(clamped);
    },
    []
  );

  const onMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="cog-shell"
      style={{ '--right-width': `${rightWidth}px` }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="cog-shell-left" style={{ marginRight: rightWidth }}>
        {activeTrail?.type === 'hypercube' ? (
          <NineDCubeRenderer />
        ) : (
          <BoardRenderer />
        )}
      </div>

      <div className="cog-shell-splitter" onMouseDown={onMouseDown} aria-hidden="true" />

      <div className="cog-shell-right" style={{ width: rightWidth }}>
        <CognitionControlPanel />
        <div className="cog-shell-inspector">
          <NodeInspector />
        </div>
      </div>
    </div>
  );
};

export default CognitionShell;
