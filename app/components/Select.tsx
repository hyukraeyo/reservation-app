'use client';

import { useState, useRef, ReactNode } from 'react';
import styles from './Select.module.scss';

export interface Option {
    value: string;
    label: string | ReactNode;
}

interface SelectProps {
    value: string;
    options: readonly Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    triggerRender?: (selectedOption: Option | undefined, isOpen: boolean, toggle: () => void) => ReactNode;
    align?: 'left' | 'right';
}

export default function Select({
    value,
    options,
    onChange,
    placeholder = '선택해주세요',
    className = '',
    triggerRender,
    align = 'left'
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const toggle = () => setIsOpen(!isOpen);

    // Close on click outside is handled by the backdrop overlay in this design simple
    // But let's add proper click-outside listener if we don't want a full screen backdrop wrapper that might be intrusive?
    // Actually the RoleSelector uses a transparent fixed div. Let's do that, it's simpler.

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            {/* Custom Trigger or Default */}
            {triggerRender ? (
                // If custom trigger is provided, use it. Pass relevant state.
                triggerRender(selectedOption, isOpen, toggle)
            ) : (
                // Default Trigger
                <div
                    className={`${styles.trigger} ${isOpen ? styles.isOpen : ''}`}
                    onClick={toggle}
                >
                    <span className={styles.label}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <svg
                        className={`${styles.arrow} ${isOpen ? styles.up : ''}`}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
                    <div className={`${styles.dropdown} ${align === 'right' ? styles.alignRight : ''}`}>
                        {options.map((option) => (
                            <button
                                key={option.value}
                                className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
