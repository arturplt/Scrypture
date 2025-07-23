# Development Workflow Guide: Edit 1 Thing, Test, Document

## 🎯 Overview

This guide outlines the best practices for implementing the "Edit 1 Thing, Test, Document" workflow in the Scrypture project. This approach ensures code quality, maintainability, and clear documentation.

## 📋 The Workflow

### 1. **Edit 1 Thing** - Single Responsibility Principle

**Golden Rule:** Make one small, focused change at a time.

#### ✅ Good Examples:
- "Add validation to prevent empty task titles"
- "Fix the auto-save indicator display bug"
- "Update the task card styling for better mobile view"

#### ❌ Avoid:
- "Fix the task form, update styling, and add new features"
- "Refactor the entire component and add validation"

#### Implementation Steps:
1. **Identify the specific change needed**
2. **Locate the exact file(s) to modify**
3. **Make minimal changes to address only that issue**
4. **Ensure the change is self-contained**

### 2. **Test** - Verify Your Change

#### A. Write Tests First (TDD Approach)
```typescript
// 1. Write the test for your change
describe('TaskForm validation', () => {
  it('should show error when title is empty', () => {
    render(<TaskForm onSubmit={mockSubmit} />);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });
});

// 2. Run the test (it should fail)
npm test -- --testNamePattern="TaskForm validation"

// 3. Implement minimal code to pass the test
// 4. Refactor if needed
```

#### B. Test Your Specific Change
```bash
# Test only what you changed
npm test -- --testNamePattern="your specific test"

# Or test a specific file
npm test -- TaskForm.test.tsx

# Run all tests to ensure nothing broke
npm test
```

#### C. Quality Checks
```bash
# Run the complete validation workflow
npm run validate

# This runs: lint + type-check + tests
```

### 3. **Document** - Update Documentation

#### A. Code-Level Documentation
```typescript
/**
 * Validates task form input and returns error messages
 * @param formData - The form data to validate
 * @returns Object containing validation errors
 * @example
 * const errors = validateTaskForm({ title: '', description: 'test' });
 * // Returns: { title: 'Title is required' }
 */
export const validateTaskForm = (formData: TaskFormData): ValidationErrors => {
  // Implementation
};
```

#### B. Update Relevant Documentation Files

**For API Changes:**
- Update `Docs/04-api-reference.md`
- Document new functions, parameters, return types

**For New Features:**
- Update `Docs/02-mvp-features.md`
- Add feature specifications and requirements

**For Technical Changes:**
- Update `Docs/03-technical-specs.md`
- Document architectural decisions

**For Development Changes:**
- Update `Docs/06-development-guide.md`
- Add setup instructions or new workflows

## 🛠️ Practical Workflow Commands

### Quick Development Workflow
```bash
# 1. Make your change
# 2. Run the complete workflow
npm run dev:workflow

# This runs: format + lint + type-check + tests
```

### Step-by-Step Workflow
```bash
# 1. Format your code
npm run format

# 2. Check for linting issues
npm run lint

# 3. Fix linting issues automatically
npm run lint:fix

# 4. Check TypeScript types
npm run type-check

# 5. Run tests
npm test

# 6. Run tests in watch mode (for active development)
npm run test:watch
```

## 📝 Commit Best Practices

### Commit Message Format
```bash
git commit -m "type: brief description of the single change

- Detailed explanation of what was changed
- Why the change was made
- Any important implementation details
- Related issue numbers or references"
```

### Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Example Commit
```bash
git commit -m "feat: add validation for empty task titles

- Added form validation to prevent empty task titles
- Updated TaskForm component with error handling
- Added corresponding test cases in TaskForm.test.tsx
- Updated API documentation in 04-api-reference.md
- Fixes issue #123"
```

## 🔍 Quality Gates

Before committing, ensure:

1. **Code Quality:**
   - ✅ No linting errors (`npm run lint`)
   - ✅ TypeScript types are correct (`npm run type-check`)
   - ✅ Code is formatted (`npm run format`)

2. **Testing:**
   - ✅ All tests pass (`npm test`)
   - ✅ New functionality has tests
   - ✅ No regressions introduced

3. **Documentation:**
   - ✅ Code is documented with JSDoc comments
   - ✅ Relevant documentation files are updated
   - ✅ Commit message clearly describes the change

## 🚀 Advanced Workflow

### For Complex Changes
1. **Break down into smaller changes**
2. **Create a feature branch**
3. **Implement each change separately**
4. **Test each change individually**
5. **Document each change**
6. **Merge when all changes are complete**

### For Bug Fixes
1. **Write a test that reproduces the bug**
2. **Implement the fix**
3. **Verify the test passes**
4. **Ensure no other tests break**
5. **Document the fix**

### For New Features
1. **Write feature specifications**
2. **Create tests for the feature**
3. **Implement the feature**
4. **Update documentation**
5. **Create integration tests**

## 📊 Monitoring Your Workflow

### Test Coverage
```bash
# Check test coverage
npm run test:coverage

# Look for:
# - Lines covered: > 90%
# - Branches covered: > 80%
# - Functions covered: > 90%
```

### Code Quality Metrics
```bash
# Check for code quality issues
npm run lint

# Look for:
# - No errors
# - Minimal warnings
# - Consistent code style
```

## 🎯 Success Metrics

A successful "Edit 1 Thing, Test, Document" workflow results in:

- ✅ **Single, focused change** that's easy to understand
- ✅ **Comprehensive tests** that verify the change works
- ✅ **Updated documentation** that reflects the change
- ✅ **Clean commit history** with clear, descriptive messages
- ✅ **No regressions** in existing functionality
- ✅ **Maintainable code** that follows project standards

## 🔄 Continuous Improvement

Regularly review and improve your workflow:

1. **Track your development velocity**
2. **Identify bottlenecks in the process**
3. **Automate repetitive tasks**
4. **Share best practices with the team**
5. **Update this guide based on learnings**

---

*This workflow ensures that every change to the codebase is well-tested, documented, and maintainable. Follow these practices to maintain the high quality standards of the Scrypture project.* 