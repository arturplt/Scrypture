import { useState, useRef, useEffect } from 'react';
import { TaskProvider, useTasks } from './hooks/useTasks';
import { UserProvider, useUser } from './hooks/useUser';
import { HabitProvider, useHabits } from './hooks/useHabits';
import { AchievementProvider, useAchievements } from './hooks/useAchievements';
import { TutorialProvider, useTutorial } from './hooks/useTutorial';
import { TaskForm } from './components/TaskForm';
import { TaskList, TaskListRef } from './components/TaskList';
import { HabitList } from './components/HabitList';
import { TaskCounter } from './components/TaskCounter';
import { StatsDisplay } from './components/StatsDisplay';
import { DataManager } from './components/DataManager';
import { StartHereSection } from './components/StartHereSection';
import { AutoSaveIndicator } from './components/AutoSaveIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { UserCreation } from './components/UserCreation';
import { AchievementGrid } from './components/AchievementGrid';
import { AchievementNotification } from './components/AchievementNotification';
import BobrPen from './components/BobrPen';
import BobrIntroduction from './components/BobrIntroduction';
import { FirstTaskWizard } from './components/FirstTaskWizard';
import { TutorialCompletionCelebration } from './components/TutorialCompletionCelebration';
import { Task, Achievement } from './types';
import styles from './App.module.css';
import { Modal } from './components/Modal';
import { TaskEditForm } from './components/TaskEditForm';

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
  const { tasks, isSaving, lastSaved, refreshTasks } = useTasks();
  const { user, isSaving: userIsSaving } = useUser();
  const { habits, isSaving: habitsIsSaving } = useHabits();
  const { achievements, achievementProgress, checkAchievements, refreshAchievements } = useAchievements();
  const { shouldShowStep, markStepComplete, startTutorial, skipTutorial } = useTutorial();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showTutorialCompletion, setShowTutorialCompletion] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [achievementNotifications, setAchievementNotifications] = useState<Achievement[]>([]);
  const lastLevel = useRef<number | null>(null);
  const taskListRef = useRef<TaskListRef | null>(null);

  useEffect(() => {
    if (user) {
      if (lastLevel.current !== null && user.level > lastLevel.current) {
        setShowLevelUp(true);
      }
      lastLevel.current = user.level;
    }
  }, [user]);

  // Check for achievement unlocks when user data, tasks, or habits change
  useEffect(() => {
    if (user && tasks && habits) {
      const newlyUnlocked = checkAchievements(user, tasks, habits);
      if (newlyUnlocked.length > 0) {
        // Add newly unlocked achievements to notifications
        setAchievementNotifications(prev => [...prev, ...newlyUnlocked]);
      }
    }
  }, [user, tasks, habits, checkAchievements]);

  // Listen for tutorial completion
  useEffect(() => {
    const handleTutorialCompleted = () => {
      console.log('Tutorial completion event received in App');
      setShowTutorialCompletion(true);
    };

    window.addEventListener('tutorialCompleted', handleTutorialCompleted);
    
    return () => {
      window.removeEventListener('tutorialCompleted', handleTutorialCompleted);
    };
  }, []);

  // Show install prompt on mobile devices after a delay (only on first visit)
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || 
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if install prompt has been shown before
    const hasShownInstallPrompt = localStorage.getItem('installPromptShown');
    
    if (isMobile && !isStandalone && !hasShownInstallPrompt) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000); // Show after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNavigateToTask = (taskId: string) => {
    if (taskListRef.current) {
      taskListRef.current.navigateToTask(taskId);
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('handleEditTask called with task:', task);
    console.log('Current editingTask state before set:', editingTask);
    setEditingTask(task);
    console.log('setEditingTask called with task:', task);
  };

  const handleCloseEditModal = () => {
    console.log('handleCloseEditModal called');
    console.log('Current editingTask state before clear:', editingTask);
    setEditingTask(null);
  };

  const handleTaskCreated = (taskId: string) => {
    // Navigate to and highlight the newly created task
    if (taskListRef.current) {
      taskListRef.current.navigateToTask(taskId);
    }
  };

  const handleAchievementNotificationClose = (achievementId: string) => {
    setAchievementNotifications(prev => 
      prev.filter(achievement => achievement.id !== achievementId)
    );
  };

  const handleAchievementClick = (achievement: Achievement) => {
    // Could open a modal with more details, for now just log
    console.log('Achievement clicked:', achievement);
  };

  // Show user creation if no user exists
  if (!user) {
    return <UserCreation onUserCreated={() => {
      console.log('User created, starting tutorial');
      startTutorial();
    }} />;
  }

  // Show onboarding flow for new users
  if (shouldShowStep('bobrIntroduction')) {
    return (
      <BobrIntroduction
        user={user}
        onContinue={() => {
          markStepComplete('bobrIntroduction');
          // Mark dam metaphor as complete since it's covered in the intro
          markStepComplete('damMetaphor');
        }}
        onSkip={() => {
          console.log('Skipping entire tutorial from Bóbr introduction');
          skipTutorial();
        }}
      />
    );
  }

  // Show first task wizard
  if (shouldShowStep('firstTask')) {
    return (
      <FirstTaskWizard
        onComplete={() => {
          console.log('First task wizard completed');
          // The wizard handles marking the step complete internally
        }}
        onSkip={() => {
          console.log('Skipping entire tutorial from task wizard');
          skipTutorial();
        }}
      />
    );
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
      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
      {showTutorialCompletion && (
        <TutorialCompletionCelebration 
          user={user}
          onClose={() => setShowTutorialCompletion(false)}
        />
      )}
      <header className={styles.header}>
        <h1 className={styles.title}>Scrypture</h1>
        <p className={styles.subtitle}>Grimorium Vivendi</p>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userLevel}>Level {user.level}</span>
          <button 
            className={styles.achievementsButton}
            onClick={() => setShowAchievements(!showAchievements)}
            title="View Achievements"
          >
            🏆 {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Bóbr's Pen - positioned above start button */}
        <BobrPen 
          user={user}
          completedTasksCount={tasks.filter(task => task.completed).length}
        />
        
        {!showStartHere ? (
          <div className={styles.startHereSection}>
            <button 
              className={styles.startHereButton}
              onClick={() => setShowStartHere(true)}
            >
              Start Here
            </button>
          </div>
        ) : (
          <StartHereSection 
            isVisible={true}
            onClose={() => setShowStartHere(false)}
          />
        )}
        <TaskCounter className={styles.taskCounter} />
        <StatsDisplay />
        {showAchievements && (
          <AchievementGrid
            achievements={achievements}
            achievementProgress={achievementProgress}
            onAchievementClick={handleAchievementClick}
            onRefresh={refreshAchievements}
          />
        )}
        <TaskForm 
          onNavigateToTask={handleNavigateToTask} 
          onEditTask={handleEditTask}
          onTaskCreated={handleTaskCreated}
        />
        <TaskList ref={taskListRef} onEditTask={handleEditTask} />
        <HabitList />
        <DataManager onDataChange={refreshTasks} />
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          isOpen={!!editingTask}
          onClose={handleCloseEditModal}
          title="Edit Task"
          customPadding="4px"
        >
          <TaskEditForm task={editingTask} onCancel={handleCloseEditModal} />
        </Modal>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'test' && (
        <div style={{ position: 'fixed', top: 0, right: 0, background: 'red', color: 'white', padding: '10px', zIndex: 10000 }}>
          editingTask: {editingTask ? 'SET' : 'NULL'}
        </div>
      )}

      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      
      {/* Achievement Notifications */}
      {achievementNotifications.map((achievement, index) => (
        <AchievementNotification
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => handleAchievementNotificationClose(achievement.id)}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <TutorialProvider>
        <TaskProvider>
          <HabitProvider>
            <AchievementProvider>
              <AppContent />
            </AchievementProvider>
          </HabitProvider>
        </TaskProvider>
      </TutorialProvider>
    </UserProvider>
  );
}

export default App;
