import React, { useState } from 'react';
import { User } from '../types';
import BobrCompanion from './BobrCompanion';
import DamVisualization from './DamVisualization';
import { BobrInteraction } from './BobrInteraction';
import styles from './BobrPen.module.css';

interface BobrPenProps {
  user: User;
  completedTasksCount: number;
  className?: string;
  onTaskCreated?: (taskId: string) => void;
}

const BobrPen: React.FC<BobrPenProps> = ({
  user,
  completedTasksCount,
  className = '',
  onTaskCreated
}) => {
  const [showEvolutionNotification, setShowEvolutionNotification] = useState(false);
  const [activeView, setActiveView] = useState<'dam' | 'bobr'>('bobr');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showBobrInteraction, setShowBobrInteraction] = useState(false);

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
        <h2 className={styles.penTitle}>Dam & Sanctuary</h2>
        <button
          className={styles.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <>
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

          {/* View Toggle Buttons */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${activeView === 'dam' ? styles.active : ''}`}
              onClick={() => setActiveView('dam')}
            >
              🏗️ Dam
            </button>
            <button
              className={`${styles.toggleButton} ${activeView === 'bobr' ? styles.active : ''}`}
              onClick={() => setActiveView('bobr')}
            >
              🦫 Bóbr
            </button>
          </div>

          {/* Main Content */}
          <div className={styles.companionContainer}>
            {activeView === 'dam' ? (
              /* Dam Visualization Section */
              <div className={styles.activeSection}>
                <DamVisualization 
                  completedTasks={completedTasksCount}
                  damProgress={user.damProgress}
                  showCelebration={false}
                />
              </div>
            ) : (
              /* Bóbr Companion Section */
              <div className={styles.activeSection}>
                <BobrCompanion 
                  user={user}
                  completedTasksCount={completedTasksCount}
                  showEvolutionNotification={showEvolutionNotification}
                  onEvolutionComplete={() => setShowEvolutionNotification(false)}
                  onBobrClick={() => setShowBobrInteraction(true)}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Bobr Interaction Modal */}
      <BobrInteraction 
        isOpen={showBobrInteraction}
        onClose={() => setShowBobrInteraction(false)}
        onTaskCreated={onTaskCreated}
      />
    </div>
  );
};

export default BobrPen; 