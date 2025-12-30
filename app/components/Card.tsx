import styles from './Card.module.scss'

interface CardProps {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function Card({ title, badge, children, className }: CardProps) {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {badge && <div className={styles.badge}>{badge}</div>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
