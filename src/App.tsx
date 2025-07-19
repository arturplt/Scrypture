import React from 'react';
import { TaskProvider } from './hooks/useTasks';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { TaskCounter } from './components/TaskCounter';
import styles from './App.module.css';

function App() {
  return (
    <TaskProvider>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.title}>Scrypture</h1>
          <p className={styles.subtitle}>Grimorium Vivendi</p>
        </header>
        
        <main className={styles.main}>
          <TaskCounter className={styles.taskCounter} />
          <TaskForm />
          <TaskList />
        </main>
      </div>
    </TaskProvider>
  );
}

export default App; 