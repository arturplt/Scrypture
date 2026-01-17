export function SpinnerOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(var(--vh, 1vh) * 100)',
        background: 'var(--color-bg-primary)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Press Start 2P, monospace',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-lg)',
          padding: 'var(--spacing-xl)',
          background: 'var(--color-bg-secondary)',
          border: '4px solid var(--color-accent-gold)',
          borderRadius: '0px',
          boxShadow: '0 0 20px rgba(182, 164, 50, 0.6)',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-accent-gold)',
            border: '2px solid var(--color-accent-gold)',
            borderRadius: '0px',
            animation: 'beaverBounce 2s ease-in-out infinite',
          }}
        >
          <img 
            src="/assets/Icons/beaver_32.png" 
            alt="Bóbr" 
            style={{
              width: '32px',
              height: '32px',
              filter: 'brightness(0) saturate(100%) invert(1)',
            }}
          />
        </div>
        
        <div style={{ fontSize: 'var(--font-size-md)', textAlign: 'center' }}>
          Loading...
        </div>
        
        <div
          style={{
            width: 120,
            height: 4,
            background: 'var(--color-bg-tertiary)',
            borderRadius: '0px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'var(--color-accent-gold)',
              borderRadius: '0px',
              animation: 'loadingProgress 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes beaverBounce {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 8px rgba(182, 164, 50, 0.5);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
            box-shadow: 0 0 16px rgba(182, 164, 50, 0.8);
          }
          50% {
            transform: scale(1.15) rotate(0deg);
            box-shadow: 0 0 20px rgba(182, 164, 50, 1);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 0 16px rgba(182, 164, 50, 0.8);
          }
        }
        
        @keyframes loadingProgress {
          0% {
            width: 0%;
            opacity: 0.5;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
