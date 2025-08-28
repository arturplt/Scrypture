import React from 'react';
import { Frame, type FrameProps } from './Frame';
import { Button } from './Button';
import styles from './Card.module.css';

export interface CardProps extends Omit<FrameProps, 'children'> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  status?: 'default' | 'completed' | 'active' | 'highlighted' | 'disabled';
  priority?: 'low' | 'medium' | 'high';
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  actions?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
}

const STATUS_THEMES = {
  default: 'silver',
  completed: 'pale-blue',
  active: 'green-frame',
  highlighted: 'green-ornate',
  disabled: 'gunmetal'
};

const PRIORITY_THEMES = {
  low: 'pale-blue',
  medium: 'silver',
  high: 'red-frame'
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  status = 'default',
  priority,
  onClick,
  onEdit,
  onDelete,
  actions,
  className = '',
  hoverable = true,
  loading = false,
  compact = false,
  theme,
  variant = 'standard',
  customWidth,
  customHeight,
  scale = 2,
  style,
  ...frameProps
}) => {
  // Determine theme based on priority or status
  const cardTheme = theme || 
    (priority ? PRIORITY_THEMES[priority] : STATUS_THEMES[status]);

  // Use custom dimensions if provided, otherwise use default
  const cardWidth = customWidth;
  const cardHeight = customHeight;

  const cardClasses = [
    styles.card,
    styles[`status-${status}`],
    priority && styles[`priority-${priority}`],
    hoverable && styles.hoverable,
    loading && styles.loading,
    compact && styles.compact,
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !loading) {
      // Don't trigger card click if clicking on action buttons
      if (!(e.target as HTMLElement).closest(`.${styles.actions}`)) {
        onClick();
      }
    }
  };

  return (
    <Frame
      theme={cardTheme}
      variant={variant}
      customWidth={cardWidth}
      customHeight={cardHeight}
      scale={scale}
      className={`${styles.cardFrame} ${cardClasses}`}
      style={style}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      {...frameProps}
    >
      <div className={styles.cardContent}>
        {/* Header */}
        {(title || subtitle || actions || onEdit || onDelete) && (
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              {title && (
                <h3 className={`${styles.cardTitle} ${status === 'completed' ? styles.titleCompleted : ''}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`${styles.cardSubtitle} ${status === 'completed' ? styles.subtitleCompleted : ''}`}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            {(actions || onEdit || onDelete) && (
              <div className={styles.actions}>
                {actions}
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    disabled={loading}
                  >
                    ✏️
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    disabled={loading}
                  >
                    🗑️
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner}>⟳</span>
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </Frame>
  );
};

export default Card;