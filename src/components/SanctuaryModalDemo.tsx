import React from 'react';
import SanctuaryModal from './SanctuaryModal';

interface SanctuaryModalDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const SanctuaryModalDemo: React.FC<SanctuaryModalDemoProps> = ({ isOpen, onClose }) => {

  return (
    <SanctuaryModal 
      isOpen={isOpen} 
      onClose={onClose}
    />
  );
};

export default SanctuaryModalDemo; 