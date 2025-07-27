import React, { useState, useEffect, useMemo } from 'react';
import styles from './DamVisualization.module.css';

interface DamVisualizationProps {
  completedTasks: number;
  totalTasks?: number;
  damProgress: number; // 0-100
  className?: string;
  showCelebration?: boolean;
  onCelebrationComplete?: () => void;
}

interface DamStick {
  id: string;
  left: number;
  bottom: number;
  width: number;
  height: number;
  rotation: number;
}

const DamVisualization: React.FC<DamVisualizationProps> = ({
  completedTasks,
  totalTasks = 20, // Default target for full dam
  damProgress,
  className = '',
  showCelebration = false,
  onCelebrationComplete
}) => {
  const [sticks, setSticks] = useState<DamStick[]>([]);
  const [animatingStick, setAnimatingStick] = useState<string | null>(null);

  // Calculate water level based on dam progress
  const waterLevel = Math.min(damProgress * 0.8, 80); // Max 80% of container height

  // Calculate dam height based on completed tasks
  const damHeight = Math.min((completedTasks / totalTasks) * 160, 160); // Max 160px

  // Get dam stage for styling
  const getDamStage = (progress: number): string => {
    if (progress >= 75) return 'damStage4';
    if (progress >= 50) return 'damStage3';
    if (progress >= 25) return 'damStage2';
    return 'damStage1';
  };

  // Generate dam sticks based on completed tasks
  const generateSticks = useMemo(() => {
    const newSticks: DamStick[] = [];
    const sticksPerTask = 3; // 3 sticks per completed task
    const totalSticks = completedTasks * sticksPerTask;

    for (let i = 0; i < totalSticks; i++) {
      const layer = Math.floor(i / (sticksPerTask * 2)); // 2 tasks per layer
      const positionInLayer = i % (sticksPerTask * 2);
      
      newSticks.push({
        id: `stick-${i}`,
        left: 10 + (positionInLayer * 15) + (Math.random() * 8 - 4), // Randomize position slightly
        bottom: layer * 8 + Math.random() * 3, // Stack with slight randomness
        width: 20 + Math.random() * 10, // Random width
        height: 4 + Math.random() * 2, // Random height
        rotation: Math.random() * 30 - 15 // Random rotation (-15 to 15 degrees)
      });
    }

    return newSticks;
  }, [completedTasks]);

  // Update sticks when completed tasks change
  useEffect(() => {
    const prevSticksCount = sticks.length;
    const newSticksNeeded = generateSticks.length - prevSticksCount;

    if (newSticksNeeded > 0) {
      // Add new sticks with animation
      const newSticks = generateSticks.slice(prevSticksCount);
      setSticks(generateSticks);
      
      // Animate new sticks one by one
      newSticks.forEach((stick, index) => {
        setTimeout(() => {
          setAnimatingStick(stick.id);
          setTimeout(() => setAnimatingStick(null), 500);
        }, index * 100);
      });
    } else {
      setSticks(generateSticks);
    }
  }, [generateSticks, sticks.length]);

  // Handle celebration animation
  useEffect(() => {
    if (showCelebration) {
      setTimeout(() => {
        onCelebrationComplete?.();
      }, 2000);
    }
  }, [showCelebration, onCelebrationComplete]);

  const milestones = [25, 50, 75, 100];

  return (
    <div className={`${styles.damContainer} ${styles[getDamStage(damProgress)]} ${className}`}>
      {/* Dam Info */}
      <div className={styles.damInfo}>
        <div className={styles.damTitle}>
          Mystical Dam
        </div>
        <div className={styles.damStats}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Tasks</div>
            <div className={styles.statValue}>{completedTasks}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Progress</div>
            <div className={styles.statValue}>{Math.round(damProgress)}%</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Water</div>
            <div className={styles.statValue}>{Math.round(waterLevel)}%</div>
          </div>
        </div>
      </div>

      {/* Water */}
      <div 
        className={styles.water}
        style={{ height: `${waterLevel}%` }}
      />

      {/* Dam Structure */}
      <div 
        className={styles.dam}
        style={{ height: `${damHeight}px` }}
      >
        {sticks.map((stick) => (
          <div
            key={stick.id}
            className={`${styles.damStick} ${animatingStick === stick.id ? styles.newStick : ''}`}
            style={{
              left: `${stick.left}%`,
              bottom: `${stick.bottom}px`,
              width: `${stick.width}px`,
              height: `${stick.height}px`,
              transform: `rotate(${stick.rotation}deg)`,
              '--stick-rotation': `${stick.rotation}deg`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Milestone Markers */}
      <div className={styles.milestones}>
        {milestones.map((milestone) => (
          <div
            key={milestone}
            className={`${styles.milestone} ${damProgress >= milestone ? styles.reached : ''}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${damProgress}%` }}
        />
      </div>

      {/* Completion Celebration */}
      {showCelebration && (
        <div className={styles.completionCelebration}>
          🎉
        </div>
      )}
    </div>
  );
};

export default DamVisualization; 