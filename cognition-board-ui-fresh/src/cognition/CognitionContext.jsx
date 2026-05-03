// src/cognition/CognitionContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { cognitionTrails } from './trails';
import { layoutHierarchical, layoutRadial, layoutForceDirected } from './layouts';

const CognitionContext = createContext(null);

export const featureToNodeType = {
  search: 'search',
  spatial: 'spatial',
  agents: 'agent',
  memory: 'memory',
};

export const useCognition = () => useContext(CognitionContext);

export const CognitionProvider = ({ children }) => {
  const [activeTrailId, setActiveTrailId] = useState('gen2-advanced');
  const [activeLayout, setActiveLayout] = useState('hierarchical'); // 'hierarchical' | 'radial' | 'force'
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [activeNodeType, setActiveNodeType] = useState(null);
  const [inspectedNode, setInspectedNode] = useState(null);

  const activeTrailRaw = useMemo(
    () => cognitionTrails.find((t) => t.id === activeTrailId) ?? cognitionTrails[0],
    [activeTrailId]
  );

  const activeTrail = useMemo(() => {
    if (!activeTrailRaw) return null;
    const { nodes, pulses, ...rest } = activeTrailRaw;

    if (activeLayout === 'hierarchical') {
      return { ...rest, nodes: layoutHierarchical(nodes, pulses), pulses };
    }
    if (activeLayout === 'radial') {
      return { ...rest, nodes: layoutRadial(nodes), pulses };
    }
    if (activeLayout === 'force') {
      return { ...rest, nodes: layoutForceDirected(nodes, pulses), pulses };
    }
    return activeTrailRaw;
  }, [activeTrailRaw, activeLayout]);

  const value = {
    activeTrail,
    activeTrailId,
    setActiveTrailId,
    activeLayout,
    setActiveLayout,
    isControlPanelOpen,
    setIsControlPanelOpen,
    activeNodeType,
    setActiveNodeType,
    inspectedNode,
    setInspectedNode,
  };

  return <CognitionContext.Provider value={value}>{children}</CognitionContext.Provider>;
};
