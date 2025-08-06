import React from 'react';
import styles from '../Sanctuary.module.css';

interface LoadingOverlayProps {
  isLoaded: boolean;
  tileSheetLoaded: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoaded, tileSheetLoaded }) => {
  if (isLoaded && tileSheetLoaded) return null;

  return (
    <div className={styles.loadingOverlay}>
      {!isLoaded ? 'Loading Optimized Sanctuary...' : 'Loading Tile Sheet...'}
    </div>
  );
};

export default LoadingOverlay; 