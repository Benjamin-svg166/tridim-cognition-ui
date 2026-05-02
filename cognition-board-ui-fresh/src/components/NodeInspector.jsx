import React from 'react';
import { useCognition } from '../context/CognitionContext';
import { sampleTrail, nodeTypes } from '../trails/trailSchema';
import '../styles/NodeInspector.css';

function NodeInspector() {
  const { inspectedNode, setInspectedNode } = useCognition();

  if (!inspectedNode) return null;

  const node     = sampleTrail.nodes.find((n) => n.id === inspectedNode);
  if (!node) return null;

  const typeInfo  = nodeTypes[node.type] ?? { color: '#fff', label: node.type };
  const outgoing  = sampleTrail.pulses.filter((p) => p.from === node.id);
  const incoming  = sampleTrail.pulses.filter((p) => p.to   === node.id);
  const signalStrength = outgoing.reduce((acc, p) => acc + (p.weight ?? 1), 0)
                       + incoming.reduce((acc, p) => acc + (p.weight ?? 1), 0);
  const maxSignal = 8;

  return (
    <div className="inspector">
      <div className="inspector__header" style={{ borderTopColor: typeInfo.color }}>
        <div className="inspector__type-dot" style={{ background: typeInfo.color }} />
        <span className="inspector__type-label" style={{ color: typeInfo.color }}>
          {typeInfo.label}
        </span>
        <button className="inspector__close" onClick={() => setInspectedNode(null)}>✕</button>
      </div>

      <div className="inspector__body">
        <div className="inspector__node-name">{node.label}</div>
        <div className="inspector__node-id">ID: {node.id}</div>

        <div className="inspector__section-title">Signal Strength</div>
        <div className="inspector__signal-bar">
          <div
            className="inspector__signal-fill"
            style={{
              width: `${(signalStrength / maxSignal) * 100}%`,
              background: `linear-gradient(90deg, ${typeInfo.color}88, ${typeInfo.color})`,
            }}
          />
        </div>
        <div className="inspector__signal-value" style={{ color: typeInfo.color }}>
          {signalStrength} / {maxSignal}
        </div>

        {incoming.length > 0 && (
          <>
            <div className="inspector__section-title">Incoming ({incoming.length})</div>
            {incoming.map((p) => {
              const from = sampleTrail.nodes.find((n) => n.id === p.from);
              const fromColor = nodeTypes[from?.type]?.color ?? '#888';
              return (
                <div key={p.from} className="inspector__connection">
                  <span className="inspector__conn-dot" style={{ background: fromColor }} />
                  <span className="inspector__conn-label">{from?.label ?? p.from}</span>
                  <span className={`inspector__conn-type inspector__conn-type--${p.type}`}>{p.type}</span>
                </div>
              );
            })}
          </>
        )}

        {outgoing.length > 0 && (
          <>
            <div className="inspector__section-title">Outgoing ({outgoing.length})</div>
            {outgoing.map((p) => {
              const to = sampleTrail.nodes.find((n) => n.id === p.to);
              const toColor = nodeTypes[to?.type]?.color ?? '#888';
              return (
                <div key={p.to} className="inspector__connection">
                  <span className="inspector__conn-dot" style={{ background: toColor }} />
                  <span className="inspector__conn-label">{to?.label ?? p.to}</span>
                  <span className={`inspector__conn-type inspector__conn-type--${p.type}`}>{p.type}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default NodeInspector;
