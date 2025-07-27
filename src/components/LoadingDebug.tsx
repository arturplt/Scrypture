import React, { useState } from 'react';

interface LoadingDebugProps {
  onTriggerLoading: (duration: number) => void;
  isVisible: boolean;
}

export const LoadingDebug: React.FC<LoadingDebugProps> = ({ onTriggerLoading, isVisible }) => {
  const [customDuration, setCustomDuration] = useState(3000);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-accent-gold)',
        padding: 'var(--spacing-md)',
        borderRadius: '0px',
        zIndex: 10001,
        fontFamily: 'Press Start 2P, monospace',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-primary)',
        minWidth: '200px',
      }}
    >
      <div style={{ marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>
        🐛 Loading Debug
      </div>
      
      <div style={{ marginBottom: 'var(--spacing-sm)' }}>
        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
          Duration (ms):
        </label>
        <input
          type="number"
          value={customDuration}
          onChange={(e) => setCustomDuration(Number(e.target.value))}
          style={{
            width: '100%',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-primary)',
            padding: 'var(--spacing-xs)',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 'var(--font-size-xs)',
          }}
        />
      </div>
      
      <button
        onClick={() => onTriggerLoading(customDuration)}
        style={{
          width: '100%',
          background: 'var(--color-accent-gold)',
          color: 'var(--color-bg-primary)',
          border: 'none',
          padding: 'var(--spacing-xs)',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: 'var(--font-size-xs)',
          cursor: 'pointer',
          marginBottom: 'var(--spacing-xs)',
        }}
      >
        Test Loading ({customDuration}ms)
      </button>
      
      <button
        onClick={() => onTriggerLoading(1000)}
        style={{
          width: '100%',
          background: 'var(--color-focus)',
          color: 'var(--color-bg-primary)',
          border: 'none',
          padding: 'var(--spacing-xs)',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: 'var(--font-size-xs)',
          cursor: 'pointer',
          marginBottom: 'var(--spacing-xs)',
        }}
      >
        Quick Test (1s)
      </button>
      
      <button
        onClick={() => onTriggerLoading(5000)}
        style={{
          width: '100%',
          background: 'var(--color-chill)',
          color: 'var(--color-bg-primary)',
          border: 'none',
          padding: 'var(--spacing-xs)',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: 'var(--font-size-xs)',
          cursor: 'pointer',
        }}
      >
        Long Test (5s)
      </button>
    </div>
  );
}; 