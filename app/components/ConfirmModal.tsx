'use client';

import { createPortal } from 'react-dom';
import { useState, useCallback, useEffect } from 'react';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소',
    variant = 'default'
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttons}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${variant === 'danger' ? styles.danger : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Custom hook for confirm modal
export function useConfirmModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'default' as 'danger' | 'default'
    });

    const confirm = useCallback((options: {
        title: string;
        message: string;
        variant?: 'danger' | 'default';
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfig({
                title: options.title,
                message: options.message,
                variant: options.variant || 'default',
                onConfirm: () => {
                    setIsOpen(false);
                    resolve(true);
                }
            });
            setIsOpen(true);
        });
    }, []);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
    }, []);

    const ModalComponent = (
        <ConfirmModal
            isOpen={isOpen}
            title={config.title}
            message={config.message}
            onConfirm={config.onConfirm}
            onCancel={handleCancel}
            confirmText="확인"
            cancelText="취소"
            variant={config.variant}
        />
    );

    return { confirm, ModalComponent, isOpen };
}
