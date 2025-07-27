import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import styles from './BobrInteraction.module.css';

interface BobrInteractionProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (taskId: string) => void;
}

interface FeelingOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  taskSuggestions: string[];
  bobrResponse: string;
}

const feelingOptions: FeelingOption[] = [
  {
    id: 'energized',
    label: 'Energized',
    emoji: '⚡',
    description: 'Feeling motivated and ready to tackle challenges',
    taskSuggestions: [
      'Start a new project',
      'Exercise or workout',
      'Learn something new',
      'Organize your workspace',
      'Set ambitious goals'
    ],
    bobrResponse: "*excited flutter* Your energy is contagious! Let's channel that motivation into something amazing!"
  },
  {
    id: 'focused',
    label: 'Focused',
    emoji: '🎯',
    description: 'Clear mind and ready to concentrate',
    taskSuggestions: [
      'Deep work session',
      'Study or research',
      'Complete complex tasks',
      'Review and plan',
      'Practice a skill'
    ],
    bobrResponse: "*attentive pose* Perfect timing for focused work! Your clarity will make everything easier."
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    description: 'Low energy, need rest or gentle activities',
    taskSuggestions: [
      'Take a short break',
      'Light stretching',
      'Read something relaxing',
      'Organize small tasks',
      'Plan for tomorrow'
    ],
    bobrResponse: "*gentle chirp* It's okay to rest, friend. Sometimes the best progress comes from taking care of yourself."
  },
  {
    id: 'stressed',
    label: 'Stressed',
    emoji: '😰',
    description: 'Feeling overwhelmed or anxious',
    taskSuggestions: [
      'Take deep breaths',
      'Write down your thoughts',
      'Break tasks into smaller pieces',
      'Ask for help',
      'Practice self-care'
    ],
    bobrResponse: "*calming presence* Let's take this one step at a time. You don't have to carry everything alone."
  },
  {
    id: 'creative',
    label: 'Creative',
    emoji: '🎨',
    description: 'Feeling inspired and artistic',
    taskSuggestions: [
      'Start a creative project',
      'Write or journal',
      'Draw or design',
      'Explore new ideas',
      'Share your creativity'
    ],
    bobrResponse: "*inspired flutter* Your imagination is a gift! Let's create something beautiful together."
  },
  {
    id: 'social',
    label: 'Social',
    emoji: '👥',
    description: 'Wanting to connect with others',
    taskSuggestions: [
      'Reach out to a friend',
      'Plan a meetup',
      'Join a community',
      'Share your progress',
      'Collaborate on something'
    ],
    bobrResponse: "*friendly chirp* Connection is what makes our dam strong! Let's build bridges together."
  }
];

export const BobrInteraction: React.FC<BobrInteractionProps> = ({
  isOpen,
  onClose,
  onTaskCreated
}) => {
  const { user } = useUser();
  const { tasks, addTask } = useTasks();
  const { habits } = useHabits();
  const [currentStep, setCurrentStep] = useState<'greeting' | 'feeling' | 'suggestions' | 'task-creation'>('greeting');
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOption | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [customTaskName, setCustomTaskName] = useState('');
  const [showBobr, setShowBobr] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowBobr(true);
      // Start directly with feeling selection for better UX
      setCurrentStep('feeling');
    } else {
      setShowBobr(false);
      setCurrentStep('greeting');
      setSelectedFeeling(null);
      setSelectedSuggestion('');
      setCustomTaskName('');
    }
  }, [isOpen]);

  const handleFeelingSelect = (feeling: FeelingOption) => {
    setSelectedFeeling(feeling);
    setCurrentStep('suggestions');
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomTaskName(suggestion);
    setCurrentStep('task-creation');
  };

  const handleCreateTask = () => {
    if (customTaskName.trim()) {
      const newTask = {
        title: customTaskName,
        description: `Suggested by Bobr based on your feeling: ${selectedFeeling?.label}`,
        completed: false,
        categories: ['personal'],
        priority: 'medium' as const,
        difficulty: 2,
        statRewards: {
          body: 1,
          mind: 1,
          soul: 1,
          xp: 10
        }
      };

      const createdTask = addTask(newTask);
      setCurrentStep('greeting');
      onClose();
      
      // Notify parent component about the created task
      if (onTaskCreated && createdTask) {
        onTaskCreated(createdTask.id);
      }
    }
  };

  const handleSkip = () => {
    setCurrentStep('greeting');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.bobrContainer}>
          {/* Bobr Avatar */}
          <div className={styles.bobrAvatar}>
            <img 
              src="/assets/Icons/beaver_32.png" 
              alt="Bobr" 
              className={styles.bobrImage}
            />
            {showBobr && <div className={styles.bobrGlow} />}
          </div>

          {/* Conversation Content */}
          <div className={styles.conversation}>
            {currentStep === 'greeting' && (
              <div className={styles.message}>
                <div className={styles.bobrMessage}>
                  *gentle flutter* Hello, {user?.name}! How are you feeling today?
                </div>
              </div>
            )}

            {currentStep === 'feeling' && (
              <div className={styles.feelingSelection}>
                <div className={styles.bobrMessage}>
                  *curious tilt* I'd love to know how you're feeling right now...
                </div>
                <div className={styles.feelingGrid}>
                  {feelingOptions.map((feeling) => (
                    <button
                      key={feeling.id}
                      className={styles.feelingOption}
                      onClick={() => handleFeelingSelect(feeling)}
                    >
                      <span className={styles.feelingEmoji}>{feeling.emoji}</span>
                      <span className={styles.feelingLabel}>{feeling.label}</span>
                      <span className={styles.feelingDescription}>{feeling.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'suggestions' && selectedFeeling && (
              <div className={styles.suggestions}>
                <div className={styles.bobrMessage}>
                  {selectedFeeling.bobrResponse}
                </div>
                <div className={styles.suggestionList}>
                  <h3 className={styles.suggestionTitle}>
                    Based on feeling {selectedFeeling.emoji} {selectedFeeling.label}, I suggest:
                  </h3>
                  {selectedFeeling.taskSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className={styles.suggestionOption}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'task-creation' && (
              <div className={styles.taskCreation}>
                <div className={styles.bobrMessage}>
                  *excited flutter* Great choice! Let's make it happen!
                </div>
                <div className={styles.taskForm}>
                  <label className={styles.taskLabel}>
                    Task Name:
                  </label>
                  <input
                    type="text"
                    value={customTaskName}
                    onChange={(e) => setCustomTaskName(e.target.value)}
                    className={styles.taskInput}
                    placeholder="Enter task name..."
                    autoFocus
                  />
                  <div className={styles.taskActions}>
                    <button 
                      className={styles.createButton}
                      onClick={handleCreateTask}
                      disabled={!customTaskName.trim()}
                    >
                      Create Task
                    </button>
                    <button 
                      className={styles.skipButton}
                      onClick={handleSkip}
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 