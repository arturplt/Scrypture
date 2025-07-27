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
  const [isCreating, setIsCreating] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Create Your First Task',
      description: 'Let\'s start your journey by creating your very first task! This will help you understand how Scrypture works.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.illustration}>
            <div className={styles.taskIcon}>📝</div>
          </div>
          <p className={styles.stepDescription}>
            Tasks are the building blocks of your progress. Each task you complete helps build your mystical dam with Bóbr!
          </p>
          <div className={styles.tipBox}>
            <span className={styles.tipIcon}>💡</span>
            <p>Start with something simple and achievable - even "Drink a glass of water" counts!</p>
          </div>
        </div>
      )
    },
    {
      id: 'title',
      title: 'What do you want to accomplish?',
      description: 'Give your task a clear and specific title. This helps you know exactly what needs to be done.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="task-title">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              className={styles.input}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g., Read for 30 minutes, Take a walk, Call a friend..."
              autoFocus
            />
          </div>
          <div className={styles.exampleBox}>
            <h4>Good task examples:</h4>
            <ul>
              <li>"Read one chapter of my book"</li>
              <li>"Organize my desk"</li>
              <li>"Write in my journal for 10 minutes"</li>
              <li>"Do 20 push-ups"</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'category',
      title: 'What type of task is this?',
      description: 'Categories help you organize your tasks and track progress in different areas of your life.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.categoryGrid}>
            {[
              { id: 'personal', name: 'Personal', icon: '🌟', description: 'Self-care, hobbies, personal growth' },
              { id: 'work', name: 'Work', icon: '💼', description: 'Professional tasks and projects' },
              { id: 'health', name: 'Health', icon: '💪', description: 'Exercise, nutrition, wellness' },
              { id: 'learning', name: 'Learning', icon: '📚', description: 'Education, skills, knowledge' },
              { id: 'social', name: 'Social', icon: '👥', description: 'Friends, family, relationships' },
              { id: 'creative', name: 'Creative', icon: '🎨', description: 'Art, writing, creative projects' }
            ].map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryCard} ${taskCategory === category.id ? styles.selected : ''}`}
                onClick={() => setTaskCategory(category.id)}
              >
                <div className={styles.categoryIcon}>{category.icon}</div>
                <div className={styles.categoryName}>{category.name}</div>
                <div className={styles.categoryDescription}>{category.description}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'description',
      title: 'Add some details (optional)',
      description: 'You can add more details to help you remember what this task involves, but this is completely optional.',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="task-description">
              Task Description (Optional)
            </label>
            <textarea
              id="task-description"
              className={styles.textarea}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Add any additional details, notes, or reminders..."
              rows={4}
            />
          </div>
          <div className={styles.tipBox}>
            <span className={styles.tipIcon}>✨</span>
            <p>You can always edit or add to your tasks later!</p>
          </div>
        </div>
      )
    },
    {
      id: 'stats',
      title: 'Choose your stat rewards',
      description: 'Select which core attributes this task will improve when completed. You can choose multiple!',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.statsExplanation}>
            <p className={styles.stepDescription}>
              Every task you complete can strengthen your core attributes:
            </p>
            <div className={styles.statsList}>
              <div className={styles.statExplanation}>
                <span className={styles.statEmoji}>💪</span>
                <div>
                  <strong>Body:</strong> Physical activities, exercise, health
                </div>
              </div>
              <div className={styles.statExplanation}>
                <span className={styles.statEmoji}>🧠</span>
                <div>
                  <strong>Mind:</strong> Learning, thinking, mental challenges
                </div>
              </div>
              <div className={styles.statExplanation}>
                <span className={styles.statEmoji}>✨</span>
                <div>
                  <strong>Soul:</strong> Creativity, relationships, personal growth
                </div>
              </div>
            </div>
          </div>
          
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
                {bodyReward > 0 && <span className={styles.statButtonReward}>+1</span>}
              </button>
              
              <button
                type="button"
                className={`${styles.statButton} ${mindReward > 0 ? styles.statButtonActive : ''} ${styles.mindButton}`}
                onClick={() => setMindReward(mindReward > 0 ? 0 : 1)}
              >
                <span className={styles.statButtonIcon}>🧠</span>
                <span className={styles.statButtonText}>MIND</span>
                {mindReward > 0 && <span className={styles.statButtonReward}>+1</span>}
              </button>
              
              <button
                type="button"
                className={`${styles.statButton} ${soulReward > 0 ? styles.statButtonActive : ''} ${styles.soulButton}`}
                onClick={() => setSoulReward(soulReward > 0 ? 0 : 1)}
              >
                <span className={styles.statButtonIcon}>✨</span>
                <span className={styles.statButtonText}>SOUL</span>
                {soulReward > 0 && <span className={styles.statButtonReward}>+1</span>}
              </button>
            </div>
          </div>
          
          <div className={styles.tipBox}>
            <span className={styles.tipIcon}>🎯</span>
            <p>Choose what fits your task best - you can always adjust this for future tasks!</p>
          </div>
        </div>
      )
    },
    {
      id: 'review',
      title: 'Ready to create your task?',
      description: 'Here\'s what your first task will look like. Once you create it, you can complete it to see Bóbr celebrate!',
      component: (
        <div className={styles.stepContent}>
          <div className={styles.taskPreview}>
            <div className={styles.previewHeader}>
              <span className={styles.previewIcon}>📝</span>
              <span className={styles.previewTitle}>Task Preview</span>
            </div>
            <div className={styles.previewContent}>
              <h3 className={styles.previewTaskTitle}>{taskTitle || 'Task Title'}</h3>
              <div className={styles.previewCategory}>
                <span className={styles.categoryTag}>{taskCategory}</span>
              </div>
              {taskDescription && (
                <p className={styles.previewDescription}>{taskDescription}</p>
              )}
              {(bodyReward > 0 || mindReward > 0 || soulReward > 0) && (
                <div className={styles.previewRewards}>
                  <span className={styles.rewardsLabel}>Rewards:</span>
                  <div className={styles.rewardsList}>
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
              )}
            </div>
          </div>
          <div className={styles.celebrationHint}>
            <span className={styles.celebrationIcon}>🎉</span>
            <p>After creating this task, try completing it to see Bóbr's celebration!</p>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const canProceed = currentStepIndex === 0 || 
                     (currentStepIndex === 1 && taskTitle.trim().length > 0) ||
                     (currentStepIndex === 4 && (bodyReward > 0 || mindReward > 0 || soulReward > 0)) ||
                     (currentStepIndex !== 1 && currentStepIndex !== 4);
  
  console.log('🔍 FirstTaskWizard canProceed check:', { 
    currentStepIndex, 
    canProceed, 
    taskTitle: taskTitle.trim(), 
    bodyReward, 
    mindReward, 
    soulReward 
  });

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
        xp: 10, // Base XP reward
      };

      console.log('🎯 Creating first task with stat rewards:', statRewards);

      const taskData = {
        title: taskTitle.trim(),
        categories: [taskCategory],
        description: taskDescription.trim() || undefined,
        priority: 'medium' as const,
        completed: false,
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
        </div>

        {/* Content */}
        <div className={styles.content}>
          {currentStep.component}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.skipButton}
            onClick={handleSkip}
            disabled={isCreating}
            aria-label="Close wizard"
          >
            Skip Tutorial
          </button>
          
          <div className={styles.navigationButtons}>
            {currentStepIndex > 0 && (
              <button 
                className={styles.backButton}
                onClick={handleBack}
                disabled={isCreating}
              >
                Back
              </button>
            )}
            
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
        </div>
      </div>
    </div>
  );
}; 