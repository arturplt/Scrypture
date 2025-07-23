import { TaskProvider, useTasks } from './hooks/useTasks';
import { UserProvider, useUser } from './hooks/useUser';
import { HabitProvider, useHabits } from './hooks/useHabits';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { TaskCounter } from './components/TaskCounter';
import { StatsDisplay } from './components/StatsDisplay';
import { UserCreation } from './components/UserCreation';
import { DataManager } from './components/DataManager';
import { AutoSaveIndicator } from './components/AutoSaveIndicator';
import { StartHereModal } from './components/StartHereModal';

import styles from './App.module.css';
import { useRef, useEffect, useState } from 'react';

function LevelUpModal({
  level,
  onClose,
}: {
  level: number;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
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
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-primary)',
          border: '4px solid var(--color-accent-gold)',
          padding: 32,
          borderRadius: 0,
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

function SpinnerOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          border: '8px solid #eee',
          borderTop: '8px solid var(--color-accent-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AppContent() {
  const { isSaving, lastSaved, refreshTasks } = useTasks();
  const { user, isSaving: userIsSaving } = useUser();
  const { isSaving: habitsIsSaving } = useHabits();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const lastLevel = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      if (lastLevel.current !== null && user.level > lastLevel.current) {
        setShowLevelUp(true);
      }
      lastLevel.current = user.level;
    }
  }, [user]);

  // Show user creation if no user exists
  if (!user) {
    return <UserCreation />;
  }

  return (
    <div className={styles.app}>
      {(userIsSaving || habitsIsSaving) && <SpinnerOverlay />}
      {showLevelUp && (
        <LevelUpModal
          level={user.level}
          onClose={() => setShowLevelUp(false)}
        />
      )}
      <header className={styles.header}>
        <h1 className={styles.title}>Scrypture</h1>
        <p className={styles.subtitle}>Grimorium Vivendi</p>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userLevel}>Level {user.level}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.startHereSection}>
          <button 
            className={styles.startHereButton}
            onClick={() => setShowStartHere(true)}
          >
            Start Here
          </button>
        </div>
        <TaskCounter className={styles.taskCounter} />
        <StatsDisplay />
        <TaskForm />
        <TaskList />
        <DataManager onDataChange={refreshTasks} />
      </main>

      <StartHereModal 
        isOpen={showStartHere}
        onClose={() => setShowStartHere(false)}
      />

      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <TaskProvider>
        <HabitProvider>
          <AppContent />
        </HabitProvider>
      </TaskProvider>
    </UserProvider>
  );
}

export default App;
