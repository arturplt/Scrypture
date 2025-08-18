/**
 * Modal Test Component - Demonstrates enhanced modal system
 * Shows various modal configurations, themes, and features
 */

import React, { useState } from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';
import { useAssetManager } from '../../hooks/useAssetManager';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { Button } from './Button';
import { Frame } from './Frame';
import styles from './ModalTest.module.css';

export interface ModalTestProps {
  className?: string;
}

export const ModalTest: React.FC<ModalTestProps> = ({ className }) => {
  const { state, getAvailableFrameThemes } = useThemeManager();
  const { state: assetState } = useAssetManager();
  
  // Modal states
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showBottomModal, setShowBottomModal] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('current');

  if (assetState.loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>Loading asset manager...</div>
      </div>
    );
  }

  if (assetState.error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.error}>Error loading assets: {assetState.error}</div>
      </div>
    );
  }

  const availableThemes = getAvailableFrameThemes();

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2>🎭 Enhanced Modal System</h2>
        <div className={styles.stats}>
          <span>Current Theme: {state.currentFrameTheme}</span>
          <span>Available Themes: {availableThemes.length}</span>
          <span>Asset Status: {assetState.loading ? 'Loading' : 'Ready'}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.themeSelector}>
          <label>Frame Theme:</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className={styles.select}
          >
            <option value="current">Current Theme</option>
            {availableThemes.map(theme => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.demoSection}>
        <h3>Modal Demonstrations</h3>
        
        <div className={styles.modalGrid}>
          <div className={styles.modalCard}>
            <h4>Basic Modal</h4>
            <p>Standard modal with default settings</p>
            <Button 
              theme="mind" 
              size="medium" 
              onClick={() => setShowBasicModal(true)}
            >
              Open Basic Modal
            </Button>
          </div>

          <div className={styles.modalCard}>
            <h4>Large Modal</h4>
            <p>Modal with large size for more content</p>
            <Button 
              theme="body" 
              size="medium" 
              onClick={() => setShowLargeModal(true)}
            >
              Open Large Modal
            </Button>
          </div>

          <div className={styles.modalCard}>
            <h4>Bottom Modal</h4>
            <p>Modal that slides up from bottom</p>
            <Button 
              theme="soul" 
              size="medium" 
              onClick={() => setShowBottomModal(true)}
            >
              Open Bottom Modal
            </Button>
          </div>

          <div className={styles.modalCard}>
            <h4>Full Modal</h4>
            <p>Modal that takes most of the screen</p>
            <Button 
              theme="mind" 
              size="medium" 
              onClick={() => setShowFullModal(true)}
            >
              Open Full Modal
            </Button>
          </div>

          <div className={styles.modalCard}>
            <h4>Confirmation Modal</h4>
            <p>Standard confirmation dialog</p>
            <Button 
              theme="body" 
              size="medium" 
              onClick={() => setShowConfirmationModal(true)}
            >
              Open Confirmation
            </Button>
          </div>

          <div className={styles.modalCard}>
            <h4>Danger Modal</h4>
            <p>Confirmation with danger styling</p>
            <Button 
              theme="body" 
              size="medium" 
              onClick={() => setShowDangerModal(true)}
            >
              Open Danger Modal
            </Button>
          </div>

          <div className={styles.modalCard}>
            <h4>Icon Modal</h4>
            <p>Confirmation with custom icon</p>
            <Button 
              theme="soul" 
              size="medium" 
              onClick={() => setShowIconModal(true)}
            >
              Open Icon Modal
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.featuresSection}>
        <h3>Modal Features</h3>
        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h4>🎨 Theme Integration</h4>
            <p>Modals automatically adapt to current frame theme</p>
          </div>
          <div className={styles.feature}>
            <h4>📱 Responsive Design</h4>
            <p>Optimized for mobile and desktop devices</p>
          </div>
          <div className={styles.feature}>
            <h4>♿ Accessibility</h4>
            <p>WCAG 2.1 AA compliant with keyboard navigation</p>
          </div>
          <div className={styles.feature}>
            <h4>🎭 Multiple Sizes</h4>
            <p>Small, medium, large, and full-size options</p>
          </div>
          <div className={styles.feature}>
            <h4>📍 Positioning</h4>
            <p>Center and bottom positioning modes</p>
          </div>
          <div className={styles.feature}>
            <h4>🔘 Button Integration</h4>
            <p>Uses new button system for consistent theming</p>
          </div>
        </div>
      </div>

      {/* Modal Instances */}
      
      <Modal
        isOpen={showBasicModal}
        onClose={() => setShowBasicModal(false)}
        title="Basic Modal Example"
        size="medium"
      >
        <div className={styles.modalContent}>
          <p>This is a basic modal with default settings. It demonstrates the standard modal behavior and styling.</p>
          <div className={styles.modalActions}>
            <Button theme="soul" size="medium" onClick={() => setShowBasicModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showLargeModal}
        onClose={() => setShowLargeModal(false)}
        title="Large Modal Example"
        size="large"
      >
        <div className={styles.modalContent}>
          <p>This is a large modal that provides more space for content. It's useful for forms, detailed information, or complex interactions.</p>
          <Frame theme="current" scale={1} className={styles.demoFrame}>
            <div className={styles.frameContent}>
              <h4>Frame Integration Demo</h4>
              <p>This frame demonstrates how the modal system integrates with our frame components.</p>
            </div>
          </Frame>
          <div className={styles.modalActions}>
            <Button theme="mind" size="medium" onClick={() => setShowLargeModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showBottomModal}
        onClose={() => setShowBottomModal(false)}
        title="Bottom Modal Example"
        position="bottom"
        size="medium"
      >
        <div className={styles.modalContent}>
          <p>This modal slides up from the bottom of the screen. It's perfect for mobile interfaces and quick actions.</p>
          <div className={styles.modalActions}>
            <Button theme="body" size="medium" onClick={() => setShowBottomModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        title="Full Modal Example"
        size="full"
      >
        <div className={styles.modalContent}>
          <p>This is a full-size modal that takes up most of the screen. It's ideal for immersive experiences, detailed views, or complex workflows.</p>
          <div className={styles.fullModalDemo}>
            <h4>Full Modal Features</h4>
            <ul>
              <li>Maximum screen real estate</li>
              <li>Ideal for complex forms</li>
              <li>Great for detailed content</li>
              <li>Perfect for immersive experiences</li>
            </ul>
          </div>
          <div className={styles.modalActions}>
            <Button theme="soul" size="medium" onClick={() => setShowFullModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action? This will make changes to your data."
        onConfirm={() => setShowConfirmationModal(false)}
        onCancel={() => setShowConfirmationModal(false)}
        confirmText="Proceed"
        cancelText="Cancel"
        confirmButtonStyle="primary"
      />

      <ConfirmationModal
        isOpen={showDangerModal}
        title="Dangerous Action"
        message="This action cannot be undone. Are you absolutely sure you want to delete this item?"
        onConfirm={() => setShowDangerModal(false)}
        onCancel={() => setShowDangerModal(false)}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        showIcon={true}
        icon="🗑️"
      />

      <ConfirmationModal
        isOpen={showIconModal}
        title="Custom Icon Modal"
        message="This modal demonstrates the custom icon feature. You can use any emoji or icon to match your use case."
        onConfirm={() => setShowIconModal(false)}
        onCancel={() => setShowIconModal(false)}
        confirmText="Continue"
        cancelText="Go Back"
        confirmButtonStyle="secondary"
        showIcon={true}
        icon="✨"
      />
    </div>
  );
};
