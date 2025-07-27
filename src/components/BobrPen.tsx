import React, { useState, useEffect } from 'react';
import { User } from '../types';
import BobrCompanion from './BobrCompanion';
import DamVisualization from './DamVisualization';
import styles from './BobrPen.module.css';

interface BobrPenProps {
  user: User;
  completedTasksCount: number;
  className?: string;
}

const BobrPen: React.FC<BobrPenProps> = ({
  user,
  completedTasksCount,
  className = ''
}) => {
  const [showEvolutionNotification, setShowEvolutionNotification] = useState(false);

  // Get stage progress for visual indicators
  const getStageProgress = (level: number): { current: number; stages: string[] } => {
    const stages = ['Hatchling', 'Young', 'Mature'];
    if (level <= 3) return { current: 0, stages };
    if (level <= 7) return { current: 1, stages };
    return { current: 2, stages };
  };

  const { current: currentStage, stages } = getStageProgress(user.level);

  // Get next evolution level
  const getNextEvolutionLevel = (currentLevel: number): number | null => {
    if (currentLevel <= 3) return 4;
    if (currentLevel <= 7) return 8;
    return null; // Already at max stage
  };

  const nextEvolutionLevel = getNextEvolutionLevel(user.level);

  return (
    <div className={`${styles.bobrPen} ${className}`}>
      {/* Pen Header */}
      <div className={styles.penHeader}>
        <span className={styles.penIcon}>🏡</span>
        <h2 className={styles.penTitle}>Bóbr's Sanctuary</h2>
        <span className={styles.penIcon}>🌲</span>
      </div>

      {/* Stage Indicator */}
      <div className={styles.stageIndicator}>
        <div className={styles.stageDots}>
          {stages.map((stage, index) => (
            <div
              key={stage}
              className={`${styles.stageDot} ${index <= currentStage ? styles.active : ''}`}
              title={stage}
            />
          ))}
        </div>
        <div className={styles.stageLabel}>
          {stages[currentStage]} Stage
        </div>
      </div>

      {/* Evolution Progress */}
      {nextEvolutionLevel && (
        <div className={styles.evolutionProgress}>
          Next evolution at Level {nextEvolutionLevel} 
          ({nextEvolutionLevel - user.level} levels to go)
        </div>
      )}

      {/* Main Content */}
      <div className={styles.companionContainer}>
        {/* Bóbr Companion Section */}
        <div className={styles.companionSection}>
          <BobrCompanion 
            user={user}
            completedTasksCount={completedTasksCount}
            showEvolutionNotification={showEvolutionNotification}
            onEvolutionComplete={() => setShowEvolutionNotification(false)}
          />
        </div>

        {/* Dam Visualization Section */}
        <div className={styles.damSection}>
          <DamVisualization 
            completedTasks={completedTasksCount}
            damProgress={user.damProgress}
            showCelebration={false}
          />
        </div>
      </div>
    </div>
  );
};

export default BobrPen; 