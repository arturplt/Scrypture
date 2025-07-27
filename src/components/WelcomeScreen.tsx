import React from 'react';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
  onSkip
}) => {
  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Welcome to Scrypture
          </h1>
          <div className={styles.subtitle}>
            Where productivity meets mysticism
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.storySection}>
            <div className={styles.storyIcon}>🌲</div>
            <p className={styles.storyText}>
              In the depths of an ancient forest, where time flows like a gentle stream, 
              there lives a mystical beaver named <strong>Bóbr</strong>. For centuries, 
              Bóbr has been the guardian of the sacred dam-building arts, helping 
              wanderers transform their scattered thoughts into magnificent structures 
              of achievement.
            </p>
          </div>
          
          <div className={styles.featuresSection}>
            <h2 className={styles.featuresTitle}>Your Journey Awaits</h2>
            <ul className={styles.featuresList}>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>📝</span>
                <span className={styles.featureText}>
                  <strong>Task Mastery:</strong> Transform your goals into mystical quests
                </span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🌱</span>
                <span className={styles.featureText}>
                  <strong>Character Growth:</strong> Evolve alongside your companion Bóbr
                </span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🏗️</span>
                <span className={styles.featureText}>
                  <strong>Dam Building:</strong> Watch your achievements construct a magical dam
                </span>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🏆</span>
                <span className={styles.featureText}>
                  <strong>Achievement Unlocks:</strong> Discover ancient rewards and milestones
                </span>
              </li>
            </ul>
          </div>
          
          <div className={styles.callToAction}>
            <p className={styles.ctaText}>
              Ready to begin your mystical journey of productivity?
            </p>
          </div>
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={onContinue}
          >
            Begin Journey
          </button>
          <button 
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onSkip}
          >
            Skip Introduction
          </button>
        </div>
        
        <div className={styles.skipText}>
          You can always learn about Scrypture later
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 