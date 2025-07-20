import { TaskProvider, useTasks } from './hooks/useTasks';
import { UserProvider, useUser } from './hooks/useUser';
import { HabitProvider } from './hooks/useHabits';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { TaskCounter } from './components/TaskCounter';
import { StatsDisplay } from './components/StatsDisplay';
import { UserCreation } from './components/UserCreation';
import { DataManager } from './components/DataManager';
import { AutoSaveIndicator } from './components/AutoSaveIndicator';
import styles from './App.module.css';

function AppContent() {
  const { isSaving, lastSaved } = useTasks();
  const { user } = useUser();

  // Show user creation if no user exists
  if (!user) {
    return <UserCreation />;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Scrypture</h1>
        <p className={styles.subtitle}>Grimorium Vivendi</p>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userLevel}>Level {user.level}</span>
        </div>
      </header>
      
      <main className={styles.main}>
        <TaskCounter className={styles.taskCounter} />
        <StatsDisplay />
        <TaskForm />
        <TaskList />
        <DataManager />
      </main>
      
      <AutoSaveIndicator 
        isSaving={isSaving} 
        lastSaved={lastSaved}
      />
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