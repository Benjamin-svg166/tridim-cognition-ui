import React from 'react';

// Modal for pawn promotion - player chooses replacement piece
const PromotionModal = ({ color, onSelect, onCancel }) => {
  const pieces = [
    { type: 'queen', symbol: color === 'white' ? '♕' : '♛', label: 'Queen' },
    { type: 'rook', symbol: color === 'white' ? '♖' : '♜', label: 'Rook' },
    { type: 'bishop', symbol: color === 'white' ? '♗' : '♝', label: 'Bishop' },
    { type: 'knight', symbol: color === 'white' ? '♘' : '♞', label: 'Knight' },
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Promote Pawn</h3>
        <p style={styles.subtitle}>Choose a piece:</p>
        <div style={styles.grid}>
          {pieces.map((piece) => (
            <button
              key={piece.type}
              onClick={() => onSelect(piece.type)}
              style={styles.button}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            >
              <div style={styles.symbol}>{piece.symbol}</div>
              <div style={styles.label}>{piece.label}</div>
            </button>
          ))}
        </div>
        {onCancel && (
          <button onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    minWidth: 320,
    maxWidth: 400,
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 16px 0',
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f9f9f9',
    border: '2px solid #ddd',
    borderRadius: 8,
    padding: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 48,
    lineHeight: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#555',
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    color: '#666',
  },
};

export default PromotionModal;
