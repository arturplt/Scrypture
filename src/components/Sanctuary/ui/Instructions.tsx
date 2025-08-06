import React from 'react';
import styles from '../Sanctuary.module.css';

interface InstructionsProps {
  isVisible: boolean;
}

const Instructions: React.FC<InstructionsProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.instructions}>
      <h4>Instructions</h4>
      <div className={styles.instructionItem}>
        <strong>Left Click:</strong> Place Block / Select Block
      </div>
      <div className={styles.instructionItem}>
        <strong>Right Click:</strong> Remove Block
      </div>
      <div className={styles.instructionItem}>
        <strong>Middle Drag:</strong> Pan Camera
      </div>
      <div className={styles.instructionItem}>
        <strong>Zoom Buttons:</strong> [1x] [2x] [4x]
      </div>
      <div className={styles.instructionItem}>
        <strong>R Key:</strong> Rotate Selected Block
      </div>
      <div className={styles.instructionItem}>
        <strong>Delete:</strong> Remove Selected Block
      </div>
      <div className={styles.instructionItem}>
        <strong>Ctrl+C:</strong> Toggle All Button Groups
      </div>
    </div>
  );
};

export default Instructions; 