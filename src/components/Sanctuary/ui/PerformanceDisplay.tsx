import React from 'react';
import styles from '../Sanctuary.module.css';

interface PerformanceDisplayProps {
  isVisible: boolean;
  fps: number;
  renderTime: number;
  blockCount: number;
  visibleBlocks: number;
  drawCalls: number;
  isOptimized: boolean;
}

const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  isVisible,
  fps,
  renderTime,
  blockCount,
  visibleBlocks,
  drawCalls,
  isOptimized
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.performanceDisplay}>
      <div>FPS: {fps.toFixed(1)}</div>
      <div>Render: {renderTime.toFixed(1)}ms</div>
      <div>Blocks: {blockCount}</div>
      <div>Visible: {visibleBlocks}</div>
      <div>Draw Calls: {drawCalls}</div>
      <div>Grade: {isOptimized ? 'Optimized' : 'Standard'}</div>
    </div>
  );
};

export default PerformanceDisplay; 