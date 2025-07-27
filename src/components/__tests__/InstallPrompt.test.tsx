import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InstallPrompt } from '../InstallPrompt';

describe('InstallPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    // Mock navigator.standalone
    Object.defineProperty(window.navigator, 'standalone', {
      writable: true,
      value: false,
    });
    
    // Mock userAgent for non-iOS/Android
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
  });

  it('renders install prompt with instructions', () => {
    render(<InstallPrompt onClose={jest.fn()} />);

    expect(screen.getByText(/Install App/)).toBeInTheDocument();
    expect(screen.getByText(/For the best experience/)).toBeInTheDocument();
    expect(screen.getByText(/Got it!/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<InstallPrompt onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close install prompt');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Got it button is clicked', () => {
    const onClose = jest.fn();
    render(<InstallPrompt onClose={onClose} />);

    const gotItButton = screen.getByText('Got it!');
    fireEvent.click(gotItButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays install icon', () => {
    render(<InstallPrompt onClose={jest.fn()} />);

    expect(screen.getByText(/📱/)).toBeInTheDocument();
  });

  it('displays close icon', () => {
    render(<InstallPrompt onClose={jest.fn()} />);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('displays installation steps', () => {
    render(<InstallPrompt onClose={jest.fn()} />);

    expect(screen.getByText(/Open this page in your mobile browser/)).toBeInTheDocument();
    expect(screen.getByText(/Use your browser's 'Add to Home Screen' option/)).toBeInTheDocument();
    expect(screen.getByText(/Launch from your home screen for full-screen experience/)).toBeInTheDocument();
  });

  it('displays benefits of installing', () => {
    render(<InstallPrompt onClose={jest.fn()} />);

    expect(screen.getByText(/Full-screen experience/)).toBeInTheDocument();
    expect(screen.getByText(/No address bar/)).toBeInTheDocument();
    expect(screen.getByText(/App-like feel/)).toBeInTheDocument();
    expect(screen.getByText(/Offline access/)).toBeInTheDocument();
  });

  it('does not render when in standalone mode', () => {
    // Mock standalone mode
    Object.defineProperty(window.navigator, 'standalone', {
      writable: true,
      value: true,
    });

    const { container } = render(<InstallPrompt onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('sets localStorage when closed', () => {
    const onClose = jest.fn();
    render(<InstallPrompt onClose={onClose} />);

    const gotItButton = screen.getByText('Got it!');
    fireEvent.click(gotItButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('installPromptShown', 'true');
  });

  it('handles multiple clicks on close button', () => {
    const onClose = jest.fn();
    render(<InstallPrompt onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close install prompt');
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
}); 