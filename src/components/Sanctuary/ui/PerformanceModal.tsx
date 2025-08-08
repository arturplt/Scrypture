import React from 'react';
import styles from '../Sanctuary.module.css';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceReport: string;
  fps: number;
  frameTime: number;
  renderTime: number;
  blockCount: number;
  visibleBlocks: number;
  drawCalls: number;
  memoryUsage: number;
  isOptimized: boolean;
  targetFPS: number;
  enableVSync: boolean;
  enableCulling: boolean;
  enableBatching: boolean;
  enableLOD: boolean;
  onOptimizeForPerformance: () => void;
  onOptimizeForQuality: () => void;
  onAutoOptimize: () => void;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({
  isOpen,
  onClose,
  performanceReport,
  fps,
  frameTime,
  renderTime,
  blockCount,
  visibleBlocks,
  drawCalls,
  memoryUsage,
  isOptimized,
  targetFPS,
  enableVSync,
  enableCulling,
  enableBatching,
  enableLOD,
  onOptimizeForPerformance,
  onOptimizeForQuality,
  onAutoOptimize
}) => {
  if (!isOpen) return null;

  const getPerformanceLevel = (fps: number): string => {
    if (fps >= 55) return 'Excellent';
    if (fps >= 45) return 'Good';
    if (fps >= 30) return 'Acceptable';
    return 'Poor';
  };

  const performanceLevel = getPerformanceLevel(fps);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.performanceModal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>Performance Monitor</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            title="Close Performance Monitor"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Current Performance Overview */}
          <div className={styles.performanceOverview}>
            <div className={styles.performanceMetric}>
              <span className={styles.metricLabel}>FPS</span>
              <span className={`${styles.metricValue} ${fps >= 55 ? styles.excellent : fps >= 30 ? styles.good : styles.poor}`}>
                {fps.toFixed(1)}
              </span>
            </div>
            <div className={styles.performanceMetric}>
              <span className={styles.metricLabel}>Frame Time</span>
              <span className={`${styles.metricValue} ${frameTime <= 16.67 ? styles.excellent : frameTime <= 33 ? styles.good : styles.poor}`}>
                {frameTime.toFixed(2)}ms
              </span>
            </div>
            <div className={styles.performanceMetric}>
              <span className={styles.metricLabel}>Render Time</span>
              <span className={`${styles.metricValue} ${renderTime <= 16.67 ? styles.excellent : renderTime <= 33 ? styles.good : styles.poor}`}>
                {renderTime.toFixed(2)}ms
              </span>
            </div>
            <div className={styles.performanceMetric}>
              <span className={styles.metricLabel}>Performance Level</span>
              <span className={`${styles.metricValue} ${performanceLevel === 'Excellent' ? styles.excellent : performanceLevel === 'Good' ? styles.good : styles.poor}`}>
                {performanceLevel}
              </span>
            </div>
          </div>

          {/* Rendering Statistics */}
          <div className={styles.performanceSection}>
            <h4>Rendering Statistics</h4>
            <div className={styles.statGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Blocks:</span>
                <span className={styles.statValue}>{blockCount}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Visible Blocks:</span>
                <span className={styles.statValue}>{visibleBlocks}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Draw Calls:</span>
                <span className={styles.statValue}>{drawCalls}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Memory Usage:</span>
                <span className={styles.statValue}>{(memoryUsage / 1024 / 1024).toFixed(2)}MB</span>
              </div>
            </div>
          </div>

          {/* Optimization Settings */}
          <div className={styles.performanceSection}>
            <h4>Optimization Settings</h4>
            <div className={styles.settingsGrid}>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Target FPS:</span>
                <span className={styles.settingValue}>{targetFPS}</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>VSync:</span>
                <span className={`${styles.settingValue} ${enableVSync ? styles.enabled : styles.disabled}`}>
                  {enableVSync ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Culling:</span>
                <span className={`${styles.settingValue} ${enableCulling ? styles.enabled : styles.disabled}`}>
                  {enableCulling ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Batching:</span>
                <span className={`${styles.settingValue} ${enableBatching ? styles.enabled : styles.disabled}`}>
                  {enableBatching ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>LOD:</span>
                <span className={`${styles.settingValue} ${enableLOD ? styles.enabled : styles.disabled}`}>
                  {enableLOD ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Optimized:</span>
                <span className={`${styles.settingValue} ${isOptimized ? styles.enabled : styles.disabled}`}>
                  {isOptimized ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Optimization Actions */}
          <div className={styles.performanceSection}>
            <h4>Optimization Actions</h4>
            <div className={styles.optimizationButtons}>
              <button 
                className={styles.optimizeButton}
                onClick={onOptimizeForPerformance}
                title="Optimize for maximum performance"
              >
                Performance Mode
              </button>
              <button 
                className={styles.optimizeButton}
                onClick={onOptimizeForQuality}
                title="Optimize for maximum quality"
              >
                Quality Mode
              </button>
              <button 
                className={styles.optimizeButton}
                onClick={onAutoOptimize}
                title="Automatically optimize based on current performance"
              >
                Auto Optimize
              </button>
            </div>
          </div>

          {/* Detailed Report */}
          <div className={styles.performanceSection}>
            <h4>Detailed Performance Report</h4>
            <pre className={styles.performanceReport}>
              {performanceReport}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceModal; 