import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { tutorialService } from '../services/tutorialService';
import styles from './FirstTaskWizard.module.css';

interface FirstTaskWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const FirstTaskWizard: React.FC<FirstTaskWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const { addTask } = useTasks();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('personal');
  const [taskDescription, setTaskDescription] = useState('');
  const [bodyReward, setBodyReward] = useState(0);
  const [mindReward, setMindReward] = useState(0);
  const [soulReward, setSoulReward] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [isHabit, setIsHabit] = useState(false);
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isCreating, setIsCreating] = useState(false);

  // Calculate XP based on priority and difficulty
  const priorityXp = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;
  const fibonacciXp = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const difficultyXp = fibonacciXp[difficulty];
  const totalXp = 5 + priorityXp + difficultyXp; // Base 5xp + priority + difficulty

  // Handle Enter key press for title input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStepIndex === 0 && taskTitle.trim().length >= 2) {
      handleNext();
    }
  };

  const canProceed = (currentStepIndex === 0 && taskTitle.trim().length >= 2) ||
                     (currentStepIndex === 4 && (bodyReward > 0 || mindReward > 0 || soulReward > 0)) ||
                     (currentStepIndex !== 0 && currentStepIndex !== 4);
  
  console.log('🔍 FirstTaskWizard canProceed check:', { 
    currentStepIndex, 
    canProceed, 
    taskTitle: taskTitle.trim(), 
    bodyReward, 
    mindReward, 
    soulReward 
  });

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Create Your First Task',
      description: 'Let\'s start your journey by creating your very first task! Give your task a clear, specific title.',
      component: null // Will be set after handlers are defined
    },
    {
      id: 'taskDescription',
      title: 'Add more details (optional)',
      description: 'You can add a description to clarify what you mean or add context.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Description (optional)</label>
            <textarea
              className={styles.textarea}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="e.g., Read any book or article, even just one page counts"
              maxLength={500}
              style={{ minHeight: '100px' }}
            />
          </div>
          <div className={styles.tipBox}>
            <span className={styles.tipIcon}>💡</span>
            <p>Descriptions help you remember exactly what you meant when you created the task.</p>
          </div>
        </div>
      )
    },
    {
      id: 'taskRewards',
      title: 'Choose stat rewards',
      description: 'Select which stats you want to improve when you complete this task.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.statsSelection}>
            <label className={styles.statsLabel}>
              Choose rewards for this task:
            </label>
            <div className={styles.statButtons}>
              <button
                type="button"
                className={`${styles.statButton} ${bodyReward > 0 ? styles.statButtonActive : ''} ${styles.bodyButton}`}
                onClick={() => setBodyReward(bodyReward > 0 ? 0 : 1)}
              >
                <span className={styles.statButtonIcon}>💪</span>
                <span className={styles.statButtonText}>BODY</span>
                <span className={styles.statButtonDescription}>Health & strength</span>
                {bodyReward > 0 && <span className={styles.statButtonReward}>+1</span>}
              </button>
              
              <button
                type="button"
                className={`${styles.statButton} ${mindReward > 0 ? styles.statButtonActive : ''} ${styles.mindButton}`}
                onClick={() => setMindReward(mindReward > 0 ? 0 : 1)}
              >
                <span className={styles.statButtonIcon}>🧠</span>
                <span className={styles.statButtonText}>MIND</span>
                <span className={styles.statButtonDescription}>Knowledge & learning</span>
                {mindReward > 0 && <span className={styles.statButtonReward}>+1</span>}
              </button>
              
              <button
                type="button"
                className={`${styles.statButton} ${soulReward > 0 ? styles.statButtonActive : ''} ${styles.soulButton}`}
                onClick={() => setSoulReward(soulReward > 0 ? 0 : 1)}
              >
                <span className={styles.statButtonIcon}>✨</span>
                <span className={styles.statButtonText}>SOUL</span>
                <span className={styles.statButtonDescription}>Creativity & spirit</span>
                {soulReward > 0 && <span className={styles.statButtonReward}>+1</span>}
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'taskCategory',
      title: 'Choose a category',
      description: 'Categories help organize your tasks and group similar activities together.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.categoryGrid}>
            <button
              type="button"
              className={`${styles.categoryCard} ${selectedCategory === 'home' ? styles.selected : ''}`}
              onClick={() => setSelectedCategory('home')}
            >
              <div className={styles.categoryIcon}>🏠</div>
              <div className={styles.categoryName}>Home</div>
              <div className={styles.categoryDescription}>Household tasks and chores</div>
            </button>
            <button
              type="button"
              className={`${styles.categoryCard} ${selectedCategory === 'free-time' ? styles.selected : ''}`}
              onClick={() => setSelectedCategory('free-time')}
            >
              <div className={styles.categoryIcon}>🎮</div>
              <div className={styles.categoryName}>Free Time</div>
              <div className={styles.categoryDescription}>Hobbies and entertainment</div>
            </button>
            <button
              type="button"
              className={`${styles.categoryCard} ${selectedCategory === 'garden' ? styles.selected : ''}`}
              onClick={() => setSelectedCategory('garden')}
            >
              <div className={styles.categoryIcon}>🌱</div>
              <div className={styles.categoryName}>Garden</div>
              <div className={styles.categoryDescription}>Gardening and outdoor activities</div>
            </button>
            <button
              type="button"
              className={`${styles.categoryCard} ${selectedCategory === 'work' ? styles.selected : ''}`}
              onClick={() => setSelectedCategory('work')}
            >
              <div className={styles.categoryIcon}>💼</div>
              <div className={styles.categoryName}>Work</div>
              <div className={styles.categoryDescription}>Professional and career tasks</div>
            </button>
            <button
              type="button"
              className={`${styles.categoryCard} ${selectedCategory === 'health' ? styles.selected : ''}`}
              onClick={() => setSelectedCategory('health')}
            >
              <div className={styles.categoryIcon}>🏥</div>
              <div className={styles.categoryName}>Health</div>
              <div className={styles.categoryDescription}>Medical and wellness activities</div>
            </button>
            <button
              type="button"
              className={`${styles.categoryCard} ${selectedCategory === 'learning' ? styles.selected : ''}`}
              onClick={() => setSelectedCategory('learning')}
            >
              <div className={styles.categoryIcon}>📚</div>
              <div className={styles.categoryName}>Learning</div>
              <div className={styles.categoryDescription}>Education and skill development</div>
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'taskPriority',
      title: 'Priority and difficulty',
      description: 'Priority and difficulty affect your XP rewards. Higher priority and difficulty = more XP!',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.prioritySection}>
            <label className={styles.label}>Priority:</label>
            <div className={styles.priorityButtons}>
              <button
                type="button"
                className={`${styles.priorityButton} ${styles.priorityLow} ${priority === 'low' ? styles.priorityButtonActive : ''}`}
                onClick={() => setPriority('low')}
              >
                <div className={styles.priorityName}>Low</div>
                <div className={styles.priorityXp}>5 XP</div>
              </button>
              <button
                type="button"
                className={`${styles.priorityButton} ${styles.priorityMedium} ${priority === 'medium' ? styles.priorityButtonActive : ''}`}
                onClick={() => setPriority('medium')}
              >
                <div className={styles.priorityName}>Medium</div>
                <div className={styles.priorityXp}>10 XP</div>
              </button>
              <button
                type="button"
                className={`${styles.priorityButton} ${styles.priorityHigh} ${priority === 'high' ? styles.priorityButtonActive : ''}`}
                onClick={() => setPriority('high')}
              >
                <div className={styles.priorityName}>High</div>
                <div className={styles.priorityXp}>15 XP</div>
              </button>
            </div>
          </div>
          
          <div className={styles.difficultySection}>
            <label className={styles.label}>Difficulty:</label>
            <div className={styles.difficultyButtons}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <button
                  key={level}
                  type="button"
                  data-difficulty={level}
                  className={`${styles.difficultyButton} ${difficulty === level ? styles.difficultyButtonActive : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  <div className={styles.difficultyNumber}>{level}</div>
                  <div className={styles.difficultyXp}>{fibonacciXp[level]} XP</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.xpCalculation}>
            <h4>XP Calculation:</h4>
            <div className={styles.xpBreakdown}>
              <span>Base: +5 XP</span>
              <span>Priority: +{priorityXp} XP</span>
              <span>Difficulty: +{difficultyXp} XP</span>
              <span className={styles.totalXp}>Total: +{totalXp} XP</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'taskType',
      title: 'Task type',
      description: 'Choose whether this is a one-time task or a habit you want to build.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.taskTypeSection}>
            <button
              type="button"
              className={`${styles.makeHabitButton} ${isHabit ? styles.makeHabitButtonActive : ''}`}
              onClick={() => setIsHabit(!isHabit)}
            >
              <div className={styles.makeHabitIcon}>🔄</div>
              <div className={styles.makeHabitText}>Make it a habit</div>
            </button>
            
            {isHabit && (
              <div className={styles.frequencySection}>
                <label className={styles.label}>Frequency:</label>
                <div className={styles.frequencyButtons}>
                  <button
                    type="button"
                    className={`${styles.frequencyButton} ${habitFrequency === 'daily' ? styles.frequencyButtonActive : ''}`}
                    onClick={() => setHabitFrequency('daily')}
                  >
                    <div className={styles.frequencyIcon}>📅</div>
                    <div className={styles.frequencyText}>Daily</div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.frequencyButton} ${habitFrequency === 'weekly' ? styles.frequencyButtonActive : ''}`}
                    onClick={() => setHabitFrequency('weekly')}
                  >
                    <div className={styles.frequencyIcon}>📆</div>
                    <div className={styles.frequencyText}>Weekly</div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.frequencyButton} ${habitFrequency === 'monthly' ? styles.frequencyButtonActive : ''}`}
                    onClick={() => setHabitFrequency('monthly')}
                  >
                    <div className={styles.frequencyIcon}>🗓️</div>
                    <div className={styles.frequencyText}>Monthly</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'taskPreview',
      title: 'Ready to create your task?',
      description: 'Here\'s what your first task will look like. Once you create it, you can complete it to see Bóbr celebrate!',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.taskPreview}>
            <div className={styles.previewHeader}>
              <span className={styles.previewIcon}>{isHabit ? '🔄' : '📝'}</span>
              <h3 className={styles.previewTitle}>{isHabit ? 'Habit Preview' : 'Task Preview'}</h3>
            </div>
            <div className={styles.previewContent}>
              <h4 className={styles.previewTaskTitle}>{taskTitle || 'Your task title'}</h4>
              {taskDescription && (
                <p className={styles.previewDescription}>{taskDescription}</p>
              )}
              <div className={styles.previewCategory}>
                {selectedCategory && (
                  <span className={styles.categoryTag} style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg-primary)' }}>
                    {selectedCategory.toUpperCase().replace('-', ' ')}
                  </span>
                )}
                {isHabit && (
                  <span className={styles.categoryTag} style={{ backgroundColor: 'var(--color-chill)', color: 'var(--color-text-primary)' }}>
                    HABIT
                  </span>
                )}
                {isHabit && habitFrequency && (
                  <span className={styles.categoryTag} style={{ backgroundColor: 'var(--color-waiting)', color: 'var(--color-text-primary)' }}>
                    {habitFrequency.toUpperCase()}
                  </span>
                )}
              </div>
              <div className={styles.previewRewards}>
                <span className={styles.rewardsLabel}>Rewards:</span>
                <div className={styles.rewardsList}>
                  <span className={styles.rewardBadge} style={{ backgroundColor: 'var(--color-accent-gold)' }}>
                    ⭐ XP: +{totalXp}
                  </span>
                  {bodyReward > 0 && (
                    <span className={`${styles.rewardBadge} ${styles.bodyReward}`}>
                      💪 Body: +{bodyReward}
                    </span>
                  )}
                  {mindReward > 0 && (
                    <span className={`${styles.rewardBadge} ${styles.mindReward}`}>
                      🧠 Mind: +{mindReward}
                    </span>
                  )}
                  {soulReward > 0 && (
                    <span className={`${styles.rewardBadge} ${styles.soulReward}`}>
                      ✨ Soul: +{soulReward}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.celebrationHint}>
            <span className={styles.celebrationIcon}>🎉</span>
            <p>After creating this {isHabit ? 'habit' : 'task'}, try completing it to see Bóbr's celebration!</p>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const handleNext = () => {
    if (isLastStep) {
      handleCreateTask();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;

    setIsCreating(true);
    
    try {
      // Create the task with stat rewards
      const statRewards = {
        ...(bodyReward > 0 && { body: bodyReward }),
        ...(mindReward > 0 && { mind: mindReward }),
        ...(soulReward > 0 && { soul: soulReward }),
        xp: totalXp, // Calculated XP based on priority and difficulty
      };

      console.log('🎯 Creating first task with stat rewards:', statRewards);

      const taskData = {
        title: taskTitle.trim(),
        categories: [taskCategory, selectedCategory].filter(Boolean),
        description: taskDescription.trim() || undefined,
        priority,
        difficulty,
        completed: false,
        isHabit,
        habitFrequency: isHabit ? habitFrequency : undefined,
        statRewards,
      };

      console.log('📝 Task data being created:', taskData);
      const createdTask = addTask(taskData);
      console.log('✅ Task created:', createdTask);
      
      // Mark tutorial step as complete
      tutorialService.markStepComplete('firstTask');
      
      // Complete the wizard
      setTimeout(() => {
        setIsCreating(false);
        onComplete();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating first task:', error);
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    tutorialService.markStepComplete('firstTask');
    onSkip();
  };

  const renderFirstStepContent = () => (
    <div className={styles.stepContent}>
      <div className={styles.illustration}>
        <img 
          src="/assets/Icons/beaver_32.png" 
          alt="Bóbr the beaver" 
          className={styles.taskIcon}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="task-title-input">Task Title</label>
        <div className={styles.titleInputContainer}>
          <input
            id="task-title-input"
            type="text"
            className={styles.input}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Read for 10 minutes"
            maxLength={100}
          />
          <button 
            className={`${styles.nextButton} ${!canProceed ? styles.disabled : ''}`}
            onClick={handleNext}
            disabled={!canProceed || isCreating}
          >
            {isCreating ? (
              <span>Creating...</span>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
      <div className={styles.exampleBox}>
        <h4>Good examples:</h4>
        <ul>
          <li>"Read for 10 minutes"</li>
          <li>"Drink a glass of water"</li>
          <li>"Write one sentence"</li>
          <li>"Take 3 deep breaths"</li>
        </ul>
      </div>
      <div className={styles.tipBox}>
        <span className={styles.tipIcon}>💡</span>
        <p>Tasks are the building blocks of your progress. Each task you complete helps build your mystical dam with Bóbr!</p>
      </div>
    </div>
  );

  // Set the component for the first step after handlers are defined
  steps[0].component = renderFirstStepContent();

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.wizard} role="dialog" aria-labelledby="wizard-title" aria-describedby="wizard-description">
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title} id="wizard-title">{currentStep.title}</h1>
          <p className={styles.description} id="wizard-description">{currentStep.description}</p>
          
          {/* Progress indicator */}
          <div className={styles.progress}>
            <div 
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={currentStepIndex + 1}
              aria-valuemax={steps.length}
              aria-label="Tutorial progress"
            >
              <div 
                className={styles.progressFill}
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span className={styles.progressText}>
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Navigation buttons - only show for non-first steps */}
          {currentStepIndex > 0 && (
            <div className={styles.navigationButtons}>
              <button 
                className={styles.backButton}
                onClick={handleBack}
                disabled={isCreating}
              >
                Back
              </button>
              
              <button 
                className={`${styles.nextButton} ${!canProceed ? styles.disabled : ''}`}
                onClick={handleNext}
                disabled={!canProceed || isCreating}
              >
                {isCreating ? (
                  <span>Creating...</span>
                ) : isLastStep ? (
                  'Create My First Task!'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {currentStep.component}
        </div>

        {/* Footer - only skip button */}
        <div className={styles.footer}>
          <button 
            className={styles.skipButton}
            onClick={handleSkip}
            disabled={isCreating}
            aria-label="Close wizard"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}; 