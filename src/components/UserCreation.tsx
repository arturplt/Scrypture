import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './UserCreation.module.css';

interface UserCreationProps {
  onUserCreated?: () => void;
}

export const UserCreation: React.FC<UserCreationProps> = ({
  onUserCreated,
}) => {
  const { user, createUser, isSaving } = useUser();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a name for your character');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (name.trim().length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newUser = createUser(name.trim());
      console.log('User created:', newUser);
      onUserCreated?.();
    } catch (error) {
      setError('Failed to create user. Please try again.');
      console.error('User creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  // If user already exists, don't show the creation form
  if (user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome to Scrypture</h2>
          <AutoSaveIndicator isSaving={isSaving} />
        </div>
        <p className={styles.subtitle}>
          Create your character to begin your journey
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="characterName" className={styles.label}>
              Character Name
            </label>
            <input
              id="characterName"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your character's name"
              className={styles.input}
              maxLength={20}
              disabled={isSubmitting}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
              data-form-type="other"
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.info}>
            <h3 className={styles.infoTitle}>Your Journey Awaits</h3>
            <ul className={styles.infoList}>
              <li>Complete tasks to gain experience and level up</li>
              <li>Develop your Body, Mind, and Soul attributes</li>
              <li>Build habits and track your progress</li>
              <li>Unlock achievements as you grow stronger</li>
            </ul>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Creating Character...' : 'Begin Your Journey'}
          </button>
        </form>
      </div>
    </div>
  );
};
