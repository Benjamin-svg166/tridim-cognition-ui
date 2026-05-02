import React, { createContext, useContext, useState } from 'react';

const CognitionContext = createContext(null);

// Maps architecture feature IDs → trail node types
export const featureToNodeType = {
  search:  'search',
  spatial: 'spatial',
  agents:  'agent',
  memory:  'memory',
};

export function CognitionProvider({ children }) {
  const [activeNodeType, setActiveNodeType]     = useState(null);
  const [inspectedNode,  setInspectedNode]      = useState(null);

  return (
    <CognitionContext.Provider value={{
      activeNodeType,
      setActiveNodeType,
      inspectedNode,
      setInspectedNode,
    }}>
      {children}
    </CognitionContext.Provider>
  );
}

export function useCognition() {
  return useContext(CognitionContext);
}
