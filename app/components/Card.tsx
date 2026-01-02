import { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  badge?: ReactNode;
}

export default function Card({ children, className = '', title, badge, ...props }: CardProps) {
  return (
    <div
      className={`${styles.card} ${className}`}
      {...props}
    >
      {(title || badge) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}
