import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataManager } from '../DataManager';

// Mock the storage service
jest.mock('../../services/storageService', () => ({
  storageService: {
    createBackup: jest.fn(),
    restoreFromBackup: jest.fn(),
    exportData: jest.fn(),
    importData: jest.fn(),
    clearAllData: jest.fn(),
    getStorageStats: jest.fn(),
  },
}));

// Mock the services
jest.mock('../../services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(),
    saveTasks: jest.fn(),
  },
}));

jest.mock('../../services/userService', () => ({
  userService: {
    getUser: jest.fn(),
    saveUser: jest.fn(),
  },
}));

describe('DataManager', () => {
  const mockBackupData = {
    tasks: [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'high' as const,
        category: 'mind',
      },
    ],
    habits: [
      {
        id: '1',
        name: 'Test Habit',
        description: 'Test Habit Description',
        streak: 5,
        createdAt: new Date('2024-01-01'),
        targetFrequency: 'daily' as const,
      },
    ],
    user: {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 1000,
      body: 10,
      mind: 15,
      soul: 8,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    settings: {
      theme: 'dark',
      notifications: true,
    },
    customCategories: [
      {
        name: 'Custom Category',
        points: 10,
      },
    ],
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  const mockStorageStats = {
    used: 1024,
    available: 5242880, // 5MB
    percentage: 0.02,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { storageService } = require('../../services/storageService');
    storageService.createBackup.mockReturnValue(mockBackupData);
    storageService.exportData.mockReturnValue(JSON.stringify(mockBackupData));
    storageService.getStorageStats.mockReturnValue(mockStorageStats);
  });

  describe('Rendering', () => {
    it('renders data manager interface', () => {
      render(<DataManager />);

      expect(screen.getByText(/Data Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Export Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Import Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Clear All Data/i)).toBeInTheDocument();
    });

    it('displays storage statistics', () => {
      render(<DataManager />);

      expect(screen.getByText(/Storage Usage/i)).toBeInTheDocument();
      expect(screen.getByText(/0.02%/)).toBeInTheDocument();
    });

    it('shows backup information', () => {
      render(<DataManager />);

      expect(screen.getByText(/Backup/i)).toBeInTheDocument();
      expect(screen.getByText(/Restore/i)).toBeInTheDocument();
    });
  });

  describe('Export Data', () => {
    it('exports data successfully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.exportData.mockReturnValue(JSON.stringify(mockBackupData));

      render(<DataManager />);

      const exportButton = screen.getByText(/Export Data/i);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(storageService.exportData).toHaveBeenCalled();
      });
    });

    it('handles export errors gracefully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.exportData.mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(<DataManager />);

      const exportButton = screen.getByText(/Export Data/i);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Export failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Import Data', () => {
    it('imports data successfully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.importData.mockReturnValue(true);

      render(<DataManager />);

      const importButton = screen.getByText(/Import Data/i);
      fireEvent.click(importButton);

      // Simulate file input
      const fileInput = screen.getByLabelText(/Choose file/i);
      const file = new File([JSON.stringify(mockBackupData)], 'backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(storageService.importData).toHaveBeenCalledWith(JSON.stringify(mockBackupData));
      });
    });

    it('handles invalid file format', async () => {
      render(<DataManager />);

      const importButton = screen.getByText(/Import Data/i);
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Choose file/i);
      const invalidFile = new File(['invalid json'], 'invalid.txt', {
        type: 'text/plain',
      });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/i)).toBeInTheDocument();
      });
    });

    it('handles import errors gracefully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.importData.mockReturnValue(false);

      render(<DataManager />);

      const importButton = screen.getByText(/Import Data/i);
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Choose file/i);
      const file = new File([JSON.stringify(mockBackupData)], 'backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Import failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Backup and Restore', () => {
    it('creates backup successfully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.createBackup.mockReturnValue(mockBackupData);

      render(<DataManager />);

      const backupButton = screen.getByText(/Create Backup/i);
      fireEvent.click(backupButton);

      await waitFor(() => {
        expect(storageService.createBackup).toHaveBeenCalled();
      });
    });

    it('restores from backup successfully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.restoreFromBackup.mockReturnValue(true);

      render(<DataManager />);

      const restoreButton = screen.getByText(/Restore/i);
      fireEvent.click(restoreButton);

      await waitFor(() => {
        expect(storageService.restoreFromBackup).toHaveBeenCalled();
      });
    });

    it('handles restore errors gracefully', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.restoreFromBackup.mockReturnValue(false);

      render(<DataManager />);

      const restoreButton = screen.getByText(/Restore/i);
      fireEvent.click(restoreButton);

      await waitFor(() => {
        expect(screen.getByText(/Restore failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Clear All Data', () => {
    it('shows confirmation dialog', () => {
      render(<DataManager />);

      const clearButton = screen.getByText(/Clear All Data/i);
      fireEvent.click(clearButton);

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('clears data when confirmed', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.clearAllData.mockReturnValue(true);

      render(<DataManager />);

      const clearButton = screen.getByText(/Clear All Data/i);
      fireEvent.click(clearButton);

      const confirmButton = screen.getByText(/Yes, Clear All/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(storageService.clearAllData).toHaveBeenCalled();
      });
    });

    it('cancels clear operation', () => {
      render(<DataManager />);

      const clearButton = screen.getByText(/Clear All Data/i);
      fireEvent.click(clearButton);

      const cancelButton = screen.getByText(/Cancel/i);
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles storage service errors', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.getStorageStats.mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(<DataManager />);

      await waitFor(() => {
        expect(screen.getByText(/Error loading storage stats/i)).toBeInTheDocument();
      });
    });

    it('handles network errors during export', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.exportData.mockImplementation(() => {
        throw new Error('Network error');
      });

      render(<DataManager />);

      const exportButton = screen.getByText(/Export Data/i);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation', () => {
    it('validates backup data structure', async () => {
      const invalidBackupData = {
        tasks: 'invalid',
        habits: 'invalid',
        // Missing required fields
      };

      render(<DataManager />);

      const importButton = screen.getByText(/Import Data/i);
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Choose file/i);
      const file = new File([JSON.stringify(invalidBackupData)], 'invalid-backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Invalid backup format/i)).toBeInTheDocument();
      });
    });

    it('validates backup version compatibility', async () => {
      const incompatibleBackup = {
        ...mockBackupData,
        version: '0.1.0', // Old version
      };

      render(<DataManager />);

      const importButton = screen.getByText(/Import Data/i);
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Choose file/i);
      const file = new File([JSON.stringify(incompatibleBackup)], 'old-backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Incompatible backup version/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('shows loading states during operations', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.exportData.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(JSON.stringify(mockBackupData)), 100));
      });

      render(<DataManager />);

      const exportButton = screen.getByText(/Export Data/i);
      fireEvent.click(exportButton);

      expect(screen.getByText(/Exporting/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/Exporting/i)).not.toBeInTheDocument();
      });
    });

    it('provides success feedback', async () => {
      const { storageService } = require('../../services/storageService');
      storageService.exportData.mockReturnValue(JSON.stringify(mockBackupData));

      render(<DataManager />);

      const exportButton = screen.getByText(/Export Data/i);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Export successful/i)).toBeInTheDocument();
      });
    });
  });
}); 