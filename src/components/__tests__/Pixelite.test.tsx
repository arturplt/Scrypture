import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pixelite from '../Pixelite';

describe('Pixelite', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Pixelite')).toBeInTheDocument();
    expect(screen.getByText('🖼️ Image Management')).toBeInTheDocument();
    expect(screen.getByText('📐 Grid System')).toBeInTheDocument();
    expect(screen.getByText('🎨 Cell Shading')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Pixelite isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Pixelite')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows drop zone when no image is loaded', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Drop image here or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports: PNG, JPG, GIF, WebP')).toBeInTheDocument();
  });

  it('has all control sections', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('🖼️ Image Management')).toBeInTheDocument();
    expect(screen.getByText('📐 Grid System')).toBeInTheDocument();
    expect(screen.getByText('🎨 Cell Shading')).toBeInTheDocument();
    expect(screen.getByText('🔍 Preview Options')).toBeInTheDocument();
    expect(screen.getByText('📐 Navigation')).toBeInTheDocument();
    expect(screen.getByText('💾 Export')).toBeInTheDocument();
  });

  it('has export buttons', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Download PNG')).toBeInTheDocument();
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
  });

  it('has navigation controls', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Reset View')).toBeInTheDocument();
    expect(screen.getByText('Fit to Screen')).toBeInTheDocument();
  });

  it('has grid controls', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Grid Size:')).toBeInTheDocument();
    expect(screen.getByText('Offset X:')).toBeInTheDocument();
    expect(screen.getByText('Offset Y:')).toBeInTheDocument();
    expect(screen.getByText('Show Coordinates')).toBeInTheDocument();
    expect(screen.getByText('Snap to Grid')).toBeInTheDocument();
  });

  it('has cell shading controls', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Mode:')).toBeInTheDocument();
    const modeSelect = screen.getByRole('combobox');
    expect(modeSelect).toBeInTheDocument();
    expect(modeSelect).toHaveValue('none');
  });

  it('has preview options', () => {
    render(<Pixelite isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Show Palette')).toBeInTheDocument();
    expect(screen.getByText('Show Thumbnail')).toBeInTheDocument();
  });
}); 