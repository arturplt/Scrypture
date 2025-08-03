import React, { useState, useEffect, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Aggressively disable autofill
  useEffect(() => {
    if (inputRef.current) {
      // Set multiple non-standard autocomplete values
      const preventAutofill = () => {
        if (inputRef.current) {
          inputRef.current.setAttribute('autocomplete', 'nope');
          inputRef.current.setAttribute('data-lpignore', 'true');
          inputRef.current.setAttribute('data-1p-ignore', 'true');
          inputRef.current.setAttribute('data-autocomplete', 'off');
          
          // Set readonly temporarily to prevent autofill
          inputRef.current.setAttribute('readonly', 'true');
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.removeAttribute('readonly');
            }
          }, 100);
        }
      };
      
      // Apply prevention immediately
      preventAutofill();
      
      // Disable autofill via JavaScript on multiple events
      const events = ['focus', 'input', 'blur', 'change', 'keydown', 'keyup'];
      
      events.forEach(event => {
        inputRef.current?.addEventListener(event, preventAutofill);
      });
      
      // Also prevent on form submission
      const form = inputRef.current.closest('form');
      if (form) {
        form.addEventListener('submit', preventAutofill);
      }
      
      // Cleanup function
      return () => {
        events.forEach(event => {
          inputRef.current?.removeEventListener(event, preventAutofill);
        });
        if (form) {
          form.removeEventListener('submit', preventAutofill);
        }
      };
    }
  }, []);

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
          {/* Multiple hidden fake inputs to completely confuse browser autofill */}
          <input
            type="text"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            autoComplete="username"
            tabIndex={-1}
          />
          <input
            type="email"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            autoComplete="email"
            tabIndex={-1}
          />
          <input
            type="password"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            autoComplete="current-password"
            tabIndex={-1}
          />
          
          <div className={styles.inputGroup}>
            <label htmlFor="characterName" className={styles.label}>
              Character Name
            </label>
            <input
              ref={inputRef}
              id="characterName"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your character's name"
              className={styles.input}
              maxLength={20}
              disabled={isSubmitting}
              autoFocus
              autoComplete="nope"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              data-autocomplete="off"
              data-cy="character-name-input"
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
