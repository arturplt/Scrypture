import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryModal } from '../CategoryModal';
import { categoryService } from '../../services/categoryService';

// Mock the categoryService
jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(),
    addCustomCategory: jest.fn(),
  }
}));

const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

describe('CategoryModal', () => {
  const mockOnCategoryAdded = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryService.getCustomCategories.mockReturnValue([]);
  });

  it('renders modal when open', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    expect(screen.getByText('Add Custom Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Point Distribution (3 points total)')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CategoryModal
        isOpen={false}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    expect(screen.queryByText('Add Custom Category')).not.toBeInTheDocument();
  });

  it('allows entering category name', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'Test Category' } });

    expect(nameInput).toHaveValue('Test Category');
  });

  it('allows selecting icon', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const brainIcon = screen.getByText('🧠');
    fireEvent.click(brainIcon);

    expect(brainIcon).toHaveClass('iconButtonActive');
  });

  it('allows selecting color', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const colorButtons = screen.getAllByRole('button').filter(button => 
      button.style.backgroundColor && button.style.backgroundColor.includes('var(--color-')
    );
    
    if (colorButtons.length > 0) {
      fireEvent.click(colorButtons[0]);
      expect(colorButtons[0]).toHaveClass('colorButtonActive');
    }
  });

  it('allows adjusting point distribution', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const bodyPlusButton = screen.getAllByText('+')[0];
    const bodyMinusButton = screen.getAllByText('-')[0];

    // Test adding points
    fireEvent.click(bodyPlusButton);
    expect(screen.getByText('2')).toBeInTheDocument(); // Body should now have 2 points

    // Test removing points
    fireEvent.click(bodyMinusButton);
    expect(screen.getByText('1')).toBeInTheDocument(); // Body should be back to 1 point
  });

  it('shows validation error for empty name', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a category name')).toBeInTheDocument();
    });
  });

  it('shows validation error for short name', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'A' } });

    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Category name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('shows validation error for long name', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'A'.repeat(21) } });

    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Category name must be 20 characters or less')).toBeInTheDocument();
    });
  });

  it('shows validation error for existing default category name', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'body' } });

    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This category name already exists')).toBeInTheDocument();
    });
  });

  it('shows validation error for existing custom category name', async () => {
    mockCategoryService.getCustomCategories.mockReturnValue([
      { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
    ]);

    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'test' } });

    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This category name already exists')).toBeInTheDocument();
    });
  });

  it('successfully creates a new category', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    // Fill in the form
    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'test category' } });

    // Select an icon
    const brainIcon = screen.getByText('🧠');
    fireEvent.click(brainIcon);

    // Submit the form
    const submitButton = screen.getByText('Add Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCategoryAdded).toHaveBeenCalledWith({
        name: 'test category',
        icon: '🧠',
        color: 'var(--color-body)', // Default color
        points: { body: 1, mind: 1, soul: 1 } // Default points
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows preview of the category', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const nameInput = screen.getByLabelText('Category Name *');
    fireEvent.change(nameInput, { target: { value: 'Test Category' } });

    // Check if preview shows the category name
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('shows rewards preview', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    // Check if rewards section is present
    expect(screen.getByText('Rewards:')).toBeInTheDocument();
    expect(screen.getByText('BODY')).toBeInTheDocument();
    expect(screen.getByText('MIND')).toBeInTheDocument();
    expect(screen.getByText('SOUL')).toBeInTheDocument();
    expect(screen.getByText('XP')).toBeInTheDocument();
  });

  it('calculates XP correctly based on points', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    // With default 3 points (1 each), XP should be 0
    expect(screen.getByText('+0')).toBeInTheDocument(); // XP should be 30 - (3 * 10) = 0
  });

  it('closes modal when cancel is clicked', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryAdded={mockOnCategoryAdded}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
}); 