import { useState, useRef, useEffect } from 'react';
import { TaskProvider, useTasks } from './hooks/useTasks';
import { UserProvider, useUser } from './hooks/useUser';
import { HabitProvider, useHabits } from './hooks/useHabits';
import { AchievementProvider, useAchievements } from './hooks/useAchievements';
import { TutorialProvider, useTutorial } from './hooks/useTutorial';
import { initializeMobileViewportFix } from './utils/mobileViewportFix';
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
import WelcomeScreen from './components/WelcomeScreen';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Pixelite from './components/Pixelite';
import { Synthesizer } from './components/Synthesizer';
import { CombinationLockModal } from './components/CombinationLockModal';

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

function SpinnerOverlay() {
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

function AppContent() {
  const { tasks, isSaving, lastSaved, refreshTasks } = useTasks();
  const { user, isSaving: userIsSaving } = useUser();
  const { habits, isSaving: habitsIsSaving } = useHabits();
  const { achievements, achievementProgress, checkAchievements, refreshAchievements } = useAchievements();
  const {
    shouldShowStep,
    markStepComplete,
    startTutorial,
    skipTutorial,
    isTutorialCompleted,
    getCurrentStep,
  } = useTutorial();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showTutorialCompletion, setShowTutorialCompletion] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPixelite, setShowPixelite] = useState(false);
  const [showSynthesizer, setShowSynthesizer] = useState(false);
  const [showCombinationLock, setShowCombinationLock] = useState(false);
  const [isSecretMenuUnlocked, setIsSecretMenuUnlocked] = useState(false);
  const [isClosingLock, setIsClosingLock] = useState(false);

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

  // Check if tutorial is already completed on mount
  useEffect(() => {
    if (tutorialService.isTutorialCompleted() && !showTutorialCompletion) {
      console.log('Tutorial already completed, showing celebration');
      setShowTutorialCompletion(true);
    }
  }, [showTutorialCompletion]);

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
      console.log('✅ User created, starting tutorial');
      startTutorial();
    }} />;
  }

  // Show welcome screen for new users
  if (shouldShowStep('welcome')) {
    return (
      <WelcomeScreen
        onContinue={() => {
          markStepComplete('welcome');
        }}
        onSkip={() => {
          console.log('⏭️ Skipping entire tutorial from welcome screen');
          skipTutorial();
        }}
      />
    );
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

  // Show task completion step (this happens automatically when first task is completed)
  if (shouldShowStep('taskCompletion')) {
    // This step is handled automatically in the task completion logic
    // We'll mark it complete and move to next step
    markStepComplete('taskCompletion');
    markStepComplete('hatchlingEvolution');
    markStepComplete('completion');
  }

  // Show hatchling evolution step (this happens automatically when Bóbr evolves)
  if (shouldShowStep('hatchlingEvolution')) {
    // This step is handled automatically in the Bóbr evolution logic
    // We'll mark it complete and move to next step
    markStepComplete('hatchlingEvolution');
    markStepComplete('completion');
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
            className={styles.analyticsButton}
            onClick={() => setShowAnalytics(true)}
            title="View Analytics"
          >
            📊
          </button>
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
          onTaskCreated={handleTaskCreated}
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
        
        {/* Secret Menu Section */}
        <div className={styles.secretMenuSection}>
          <h3 className={styles.secretMenuTitle}>🔐 Secret Menu</h3>
          <div className={styles.secretMenuButtons}>
            {!isSecretMenuUnlocked ? (
              <button 
                className={styles.secretMenuButton}
                onClick={() => setShowCombinationLock(true)}
                title="Enter combination to unlock"
              >
                🔒 LOCKED
              </button>
            ) : (
              <>
                <button 
                  className={styles.secretMenuButton}
                  onClick={() => setShowPixelite(true)}
                  title="Advanced Pixel Grid Converter"
                >
                  🎨 Pixelite
                </button>
                <button 
                  className={styles.secretMenuButton}
                  onClick={() => setShowSynthesizer(true)}
                  title="8-Bit Synthesizer"
                >
                  🎵 Synthesizer
                </button>
              </>
            )}
          </div>
        </div>


      </main>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {/* Pixelite Modal */}
      <Pixelite
        isOpen={showPixelite}
        onClose={() => setShowPixelite(false)}
      />

      {/* Synthesizer Modal */}
      <Synthesizer
        isOpen={showSynthesizer}
        onClose={() => setShowSynthesizer(false)}
      />

      {/* Combination Lock - Expanding from Secret Menu */}
      {showCombinationLock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isClosingLock ? 'fadeOut 0.3s ease-in' : 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            animation: isClosingLock ? 'shrinkToCenter 0.3s ease-in' : 'expandFromCenter 0.4s ease-out',
            transformOrigin: 'center'
          }}>
            <CombinationLockModal
              isOpen={showCombinationLock}
              onClose={() => {
                setIsClosingLock(true);
                setTimeout(() => {
                  setShowCombinationLock(false);
                  setIsClosingLock(false);
                }, 300);
              }}
              onUnlock={() => {
                setIsSecretMenuUnlocked(true);
                setIsClosingLock(true);
                setTimeout(() => {
                  setShowCombinationLock(false);
                  setIsClosingLock(false);
                }, 300);
              }}
            />
          </div>
        </div>
      )}



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
  useEffect(() => {
    // Initialize mobile viewport fix
    const cleanup = initializeMobileViewportFix();
    return cleanup;
  }, []);

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
