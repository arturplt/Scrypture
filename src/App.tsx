import { useState, useRef, useEffect } from 'react';
import { TaskProvider, useTasks } from './hooks/useTasks';
import { UserProvider, useUser } from './hooks/useUser';
import { HabitProvider, useHabits } from './hooks/useHabits';
import { AchievementProvider, useAchievements } from './hooks/useAchievements';
import { TutorialProvider, useTutorial } from './hooks/useTutorial';
import { tutorialService } from './services/tutorialService';
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
import { AchievementGrid } from './components/AchievementGrid';
import { AchievementNotification } from './components/AchievementNotification';
import BobrPen from './components/BobrPen';
import { TutorialCompletionCelebration } from './components/TutorialCompletionCelebration';
import AnalyticsDashboard from './components/AnalyticsDashboard';

import { Task, Achievement } from './types';
import styles from './App.module.css';
import { Modal } from './components/Modal';
import { TaskEditForm } from './components/TaskEditForm';
import { LevelUpModal } from './components/app/LevelUpModal';
import { SpinnerOverlay } from './components/app/SpinnerOverlay';
import { OnboardingRouter } from './components/app/OnboardingRouter';
import { SecretTools } from './components/app/SecretTools';


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
  } = useTutorial();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showTutorialCompletion, setShowTutorialCompletion] = useState(false);
  const [hasSeenTutorialCompletion, setHasSeenTutorialCompletion] = useState(false);
  const [isTutorialStateLoaded, setIsTutorialStateLoaded] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPixelite, setShowPixelite] = useState(false);
  const [showSynthesizer, setShowSynthesizer] = useState(false);
  const [showSanctuaryDemo, setShowSanctuaryDemo] = useState(false);
  const [showUIBuilder, setShowUIBuilder] = useState(false);
  const [showCardDemo, setShowCardDemo] = useState(false);
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



  // Check for achievement unlocks when user data, tasks, or habits change (debounced to prevent flickering)
  useEffect(() => {
    if (user && tasks && habits) {
      const timeoutId = setTimeout(() => {
        const newlyUnlocked = checkAchievements(user, tasks, habits);
        if (newlyUnlocked.length > 0) {
          // Add newly unlocked achievements to notifications
          setAchievementNotifications(prev => [...prev, ...newlyUnlocked]);
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [user, tasks, habits, checkAchievements]);

  // Load tutorial completion state from localStorage on mount
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenTutorialCompletion') === 'true';
    console.log('Loading tutorial state from localStorage:', { hasSeen });
    setHasSeenTutorialCompletion(hasSeen);
    setIsTutorialStateLoaded(true);
  }, []);

  // Helper function to mark tutorial completion as seen
  const markTutorialCompletionAsSeen = () => {
    setHasSeenTutorialCompletion(true);
    localStorage.setItem('hasSeenTutorialCompletion', 'true');
  };

  // Listen for tutorial completion
  useEffect(() => {
    const handleTutorialCompleted = () => {
      console.log('Tutorial completion event received in App');
      setShowTutorialCompletion(true);
      markTutorialCompletionAsSeen();
    };

    window.addEventListener('tutorialCompleted', handleTutorialCompleted);
    
    return () => {
      window.removeEventListener('tutorialCompleted', handleTutorialCompleted);
    };
  }, []);

  // Check if tutorial is already completed on mount (only show once)
  useEffect(() => {
    console.log('Tutorial completion check:', { 
      isTutorialStateLoaded, 
      isTutorialCompleted: tutorialService.isTutorialCompleted(), 
      hasSeenTutorialCompletion 
    });
    
    // Only check after we've loaded the state AND the tutorial is completed AND we haven't seen it
    if (isTutorialStateLoaded && tutorialService.isTutorialCompleted() && !hasSeenTutorialCompletion) {
      console.log('Tutorial already completed, showing celebration');
      setShowTutorialCompletion(true);
      markTutorialCompletionAsSeen();
    }
  }, [isTutorialStateLoaded, hasSeenTutorialCompletion]);

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



  const handleTutorialSkipReset = () => {
    setHasSeenTutorialCompletion(false);
    localStorage.removeItem('hasSeenTutorialCompletion');
  };

  const shouldBlockForOnboarding =
    !user ||
    shouldShowStep('welcome') ||
    shouldShowStep('bobrIntroduction') ||
    shouldShowStep('firstTask');

  if (shouldBlockForOnboarding) {
    return (
      <OnboardingRouter
        user={user}
        shouldShowStep={shouldShowStep}
        markStepComplete={markStepComplete}
        startTutorial={startTutorial}
        skipTutorial={skipTutorial}
        onTutorialSkipReset={handleTutorialSkipReset}
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
      {showTutorialCompletion && isTutorialStateLoaded && (
        <TutorialCompletionCelebration 
          user={user}
          onClose={() => {
            setShowTutorialCompletion(false);
            markTutorialCompletionAsSeen();
          }}
        />
      )}
      <OnboardingRouter
        user={user}
        shouldShowStep={shouldShowStep}
        markStepComplete={markStepComplete}
        startTutorial={startTutorial}
        skipTutorial={skipTutorial}
        onTutorialSkipReset={handleTutorialSkipReset}
      />

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
          onOpenSanctuaryModal={() => setShowSanctuaryDemo(true)}
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
            onDataChange={refreshTasks}
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
        
        <SecretTools
          isSecretMenuUnlocked={isSecretMenuUnlocked}
          setIsSecretMenuUnlocked={setIsSecretMenuUnlocked}
          showCombinationLock={showCombinationLock}
          setShowCombinationLock={setShowCombinationLock}
          isClosingLock={isClosingLock}
          setIsClosingLock={setIsClosingLock}
          showPixelite={showPixelite}
          setShowPixelite={setShowPixelite}
          showSynthesizer={showSynthesizer}
          setShowSynthesizer={setShowSynthesizer}
          showUIBuilder={showUIBuilder}
          setShowUIBuilder={setShowUIBuilder}
          showCardDemo={showCardDemo}
          setShowCardDemo={setShowCardDemo}
          showSanctuaryDemo={showSanctuaryDemo}
          setShowSanctuaryDemo={setShowSanctuaryDemo}
        />


      </main>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />



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
