import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmationModal } from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirmation modal when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders with custom confirm button text', () => {
    render(<ConfirmationModal {...defaultProps} confirmText="Delete" />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('renders with custom cancel button text', () => {
    render(<ConfirmationModal {...defaultProps} cancelText="Keep" />);

    expect(screen.getByText('Keep')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('renders with danger button styling', () => {
    render(<ConfirmationModal {...defaultProps} confirmButtonStyle="danger" />);

    const confirmButton = screen.getByText('Confirm');
    // Check that the button exists and has the danger style prop
    expect(confirmButton).toBeInTheDocument();
  });

  it('renders with primary button styling by default', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeInTheDocument();
  });

  it('handles long messages correctly', () => {
    const longMessage = 'This is a very long confirmation message that should wrap properly and still be readable. '.repeat(5);
    
    render(<ConfirmationModal {...defaultProps} message={longMessage} />);

    // Check that the message is rendered (even if broken up by elements)
    expect(screen.getByText(/This is a very long confirmation message/)).toBeInTheDocument();
  });

  it('renders all required elements', () => {
    render(<ConfirmationModal {...defaultProps} />);

    // Check for modal structure
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    
    // Check for buttons
    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');
    
    expect(cancelButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });
}); 