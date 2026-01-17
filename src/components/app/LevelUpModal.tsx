import { useEffect } from 'react';

type LevelUpModalProps = {
  level: number;
  onClose: () => void;
};

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  // Scroll to top when level up modal appears
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: 'calc(var(--vh, 1vh) * 100)',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'var(--color-accent-gold)',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: 32,
        textAlign: 'center',
        animation: 'fadeIn 0.5s',
        padding: 'var(--spacing-md)',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        style={{
          background: 'var(--color-bg-primary)',
          border: '4px solid var(--color-accent-gold)',
          padding: 32,
          borderRadius: 0,
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <div>Level Up!</div>
        <div style={{ fontSize: 40, margin: '16px 0' }}>Level {level}</div>
        <button
          style={{
            marginTop: 24,
            fontSize: 18,
            padding: '8px 24px',
            background: 'var(--color-accent-gold)',
            color: 'var(--color-bg-primary)',
            border: 'none',
            fontFamily: 'Press Start 2P, monospace',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
