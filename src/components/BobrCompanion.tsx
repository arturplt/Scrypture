import React, { useState, useEffect, useCallback } from 'react';
import { BobrMessage, User } from '../types';
import { bobrService } from '../services/bobrService';
import styles from './BobrCompanion.module.css';

interface BobrCompanionProps {
  user: User;
  completedTasksCount: number;
  className?: string;
  showEvolutionNotification?: boolean;
  onEvolutionComplete?: () => void;
}

const BobrCompanion: React.FC<BobrCompanionProps> = ({
  user,
  completedTasksCount: _completedTasksCount,
  className = '',
  showEvolutionNotification = false,
  onEvolutionComplete
}) => {
  const [currentMessage, setCurrentMessage] = useState<BobrMessage | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'idle' | 'celebrate' | 'build' | 'evolve'>('idle');

  // Get Bóbr appearance based on stage - now using PNG asset
  const getBobrAppearance = (stage: 'hatchling' | 'young' | 'mature'): React.ReactNode => {
    return (
      <img 
        src="/assets/Icons/beaver_32.png" 
        alt={`Bóbr the beaver - ${stage} stage`}
        className={styles.bobrImage}
      />
    );
  };

  // Get stage description
  const getStageDescription = (stage: 'hatchling' | 'young' | 'mature'): string => {
    const descriptions = {
      hatchling: 'A curious young beaver, eager to learn and grow alongside you.',
      young: 'A capable beaver who has learned much from your journey together.',
      mature: 'An ancient and wise beaver, master of the mystical dam arts.'
    };
    return descriptions[stage];
  };

  // Show a specific message with animation
  const showMessage = useCallback((message: BobrMessage) => {
    setCurrentMessage(message);
    if (message.animation && message.animation !== 'idle') {
      setIsAnimating(true);
      setAnimationType(message.animation);
      
      // Reset animation after duration
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType('idle');
      }, message.animation === 'evolve' ? 2000 : 1000);
    }
  }, []);

  // Show greeting message on mount
  useEffect(() => {
    const greetingMessage = bobrService.generateMessage('greeting', user.bobrStage);
    showMessage(greetingMessage);
  }, [user.bobrStage, showMessage]);

  // Show evolution notification
  useEffect(() => {
    if (showEvolutionNotification) {
      const evolutionMessage = bobrService.getEvolutionMessage(user.bobrStage);
      showMessage(evolutionMessage);
      
      // Notify parent component when evolution animation completes
      setTimeout(() => {
        onEvolutionComplete?.();
      }, 2500);
    }
  }, [showEvolutionNotification, user.bobrStage, showMessage, onEvolutionComplete]);

  // Public method to show task completion celebration
  const _celebrateTaskCompletion = useCallback((taskTitle: string, category: string) => {
    const celebrationMessage = bobrService.getTaskCelebrationMessage(user, taskTitle, category);
    showMessage(celebrationMessage);
  }, [user, showMessage]);

  // Public method to show motivational message
  const _showMotivation = useCallback(() => {
    const motivationMessage = bobrService.getMotivationalMessage(user.bobrStage);
    showMessage(motivationMessage);
  }, [user.bobrStage, showMessage]);

  // Public method to show dam progress message
  const _celebrateDamProgress = useCallback(() => {
    const damMessage = bobrService.getDamProgressMessage(user.bobrStage, user.damProgress);
    showMessage(damMessage);
  }, [user.bobrStage, user.damProgress, showMessage]);



  // Methods are available via props and callbacks

  return (
    <div className={`${styles.companion} ${styles[user.bobrStage]} ${className}`}>
      {/* Evolution Notification */}
      {showEvolutionNotification && (
        <div className={styles.evolutionNotification}>
          Evolved!
        </div>
      )}

      {/* Bóbr Character */}
      <div 
        className={`${styles.bobrCharacter} ${isAnimating ? styles[`${animationType}ing`] : ''}`}
        role="img" 
        aria-label={`Bóbr companion in ${user.bobrStage} stage`}
      >
        {getBobrAppearance(user.bobrStage)}
      </div>

      {/* Stage Information */}
      <div className={styles.stageInfo}>
        <div className={styles.stageName}>
          {user.bobrStage}
        </div>
        <div className={styles.stageDescription}>
          {getStageDescription(user.bobrStage)}
        </div>
      </div>

      {/* Message Display */}
      {currentMessage && (
        <div className={styles.messageDisplay}>
          <div className={styles.message}>
            {currentMessage.message}
          </div>
        </div>
      )}

      {/* Dam Progress */}
      <div className={styles.damProgress}>
        <div className={styles.damLabel}>
          Dam Progress
        </div>
        <div className={styles.damBar}>
          <div 
            className={styles.damFill}
            style={{ width: `${user.damProgress}%` }}
          />
          <div className={styles.damPercentage}>
            {Math.round(user.damProgress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Forward ref version for imperative methods
export const BobrCompanionRef = React.forwardRef<
  {
    celebrateTaskCompletion: (taskTitle: string, category: string) => void;
    showMotivation: () => void;
    celebrateDamProgress: () => void;
  },
  BobrCompanionProps
>((props, ref) => {
  const [currentMessage, setCurrentMessage] = useState<BobrMessage | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'idle' | 'celebrate' | 'build' | 'evolve'>('idle');

  const showMessage = useCallback((message: BobrMessage) => {
    setCurrentMessage(message);
    if (message.animation && message.animation !== 'idle') {
      setIsAnimating(true);
      setAnimationType(message.animation);
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType('idle');
      }, message.animation === 'evolve' ? 2000 : 1000);
    }
  }, []);

  const celebrateTaskCompletion = useCallback((taskTitle: string, category: string) => {
    const celebrationMessage = bobrService.getTaskCelebrationMessage(props.user, taskTitle, category);
    showMessage(celebrationMessage);
  }, [props.user, showMessage]);

  const showMotivation = useCallback(() => {
    const motivationMessage = bobrService.getMotivationalMessage(props.user.bobrStage);
    showMessage(motivationMessage);
  }, [props.user.bobrStage, showMessage]);

  const celebrateDamProgress = useCallback(() => {
    const damMessage = bobrService.getDamProgressMessage(props.user.bobrStage, props.user.damProgress);
    showMessage(damMessage);
  }, [props.user.bobrStage, props.user.damProgress, showMessage]);

  React.useImperativeHandle(ref, () => ({
    celebrateTaskCompletion,
    showMotivation,
    celebrateDamProgress
  }));

  return <BobrCompanion {...props} />;
});

BobrCompanionRef.displayName = 'BobrCompanionRef';

export default BobrCompanion; 