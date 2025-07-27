import React from 'react';
import { User } from '../types';
import styles from './BobrIntroduction.module.css';

interface BobrIntroductionProps {
  user: User;
  onContinue: () => void;
  onSkip: () => void;
}

const BobrIntroduction: React.FC<BobrIntroductionProps> = ({
  user,
  onContinue,
  onSkip
}) => {
  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        <h1 className={styles.title}>
          Meet Your Companion
        </h1>
        
        <div className={styles.bobrDisplay} role="img" aria-label="Bóbr companion">
          <img 
            src="/assets/Icons/beaver_32.png" 
            alt="Bóbr the beaver companion"
            style={{ 
              width: '96px', 
              height: '96px',
              imageRendering: 'pixelated'
            }}
          />
        </div>
        
        <div className={styles.description}>
          <strong>Welcome, {user.name}!</strong>
          <br /><br />
          This is <strong>Bóbr</strong>, your mystical forest companion. Together, you'll build a magnificent dam that represents your growth and achievements. Every task you complete adds another stick to your shared creation, and Bóbr will evolve alongside your journey.
        </div>
        
        <ul className={styles.features}>
          <li className={styles.feature}>
            <span className={styles.featureIcon}>🌱</span>
            <span className={styles.featureText}>
              <strong>Evolution:</strong> Bóbr grows from hatchling to mature companion as you level up
            </span>
          </li>
          <li className={styles.feature}>
            <span className={styles.featureIcon}>🏗️</span>
            <span className={styles.featureText}>
              <strong>Dam Building:</strong> Each completed task adds to your mystical dam structure
            </span>
          </li>
          <li className={styles.feature}>
            <span className={styles.featureIcon}>💬</span>
            <span className={styles.featureText}>
              <strong>Encouragement:</strong> Receive motivational messages and celebrations for your achievements
            </span>
          </li>
          <li className={styles.feature}>
            <span className={styles.featureIcon}>🎉</span>
            <span className={styles.featureText}>
              <strong>Celebrations:</strong> Special animations and messages for milestones and level-ups
            </span>
          </li>
        </ul>
        
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
            Skip Intro
          </button>
        </div>
        
        <div className={styles.skipText}>
          You can always visit Bóbr in your dashboard
        </div>
      </div>
    </div>
  );
};

export default BobrIntroduction; 