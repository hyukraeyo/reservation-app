
'use client';

import { useEffect, useState } from 'react';
import styles from './toast.module.scss';
import { createPortal } from 'react-dom';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${toast.type === 'error' ? styles.error : ''}`}
          onAnimationEnd={() => {
             // Optional: could auto-remove here if we relied purely on CSS animation end for exit
          }}
        >
           {toast.type === 'error' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
           )}
           {toast.type !== 'error' && (
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <polyline points="20 6 9 17 4 12"></polyline>
             </svg>
           )}
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000); // Duration
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
