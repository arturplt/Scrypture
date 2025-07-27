import React from 'react';
import { User } from '../types';
import styles from './TutorialCompletionCelebration.module.css';

interface TutorialCompletionCelebrationProps {
  user: User;
  onClose: () => void;
}

export const TutorialCompletionCelebration: React.FC<TutorialCompletionCelebrationProps> = ({
  user,
  onClose
}) => {
  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        <div className={styles.celebration}>
          <div className={styles.fireworks}>
            🎆🎇✨🎉
          </div>
          
          <h1 className={styles.title}>
            Congratulations, {user.name}!
          </h1>
          
          <div className={styles.subtitle}>
            You've completed the Scrypture tutorial!
          </div>
          
          <div className={styles.achievementGrid}>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🦫</span>
              <span className={styles.achievementText}>Met your companion Bóbr</span>
            </div>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>📝</span>
              <span className={styles.achievementText}>Created your first task</span>
            </div>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🏗️</span>
              <span className={styles.achievementText}>Started building your mystical dam</span>
            </div>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🌱</span>
              <span className={styles.achievementText}>Began your journey of growth</span>
            </div>
          </div>
          
          <div className={styles.unlockedFeatures}>
            <h3 className={styles.featuresTitle}>Features Now Available:</h3>
            <div className={styles.featuresList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✅</span>
                <span className={styles.featureText}>Complete tasks to gain experience</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <span className={styles.featureText}>Track your Body, Mind, and Soul stats</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🏆</span>
                <span className={styles.featureText}>Unlock achievements as you progress</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔄</span>
                <span className={styles.featureText}>Build habits for daily growth</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📈</span>
                <span className={styles.featureText}>Level up and watch Bóbr evolve</span>
              </div>
            </div>
          </div>
          
          <div className={styles.encouragement}>
            <div className={styles.bobrMessage}>
              <img 
                src="/assets/Icons/beaver_32.png" 
                alt="Bóbr companion"
                className={styles.bobrAvatar}
              />
              <div className={styles.messageText}>
                "Great job! I'm excited to grow alongside you. Every task you complete 
                helps us build something amazing together. Let's start this journey!"
              </div>
            </div>
          </div>
          
          <button 
            className={styles.continueButton}
            onClick={onClose}
          >
            Begin My Journey!
          </button>
          
          <div className={styles.hint}>
            💡 Tip: Start by completing the task you just created!
          </div>
        </div>
      </div>
    </div>
  );
}; 