'use client';

import React from 'react';
import styles from './FilterSortBar.module.scss';
import Select, { Option } from './Select';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSortBarProps<T extends string, S extends string> {
    filterOptions: readonly FilterOption[];
    currentFilter: T;
    onFilterChange: (filter: T) => void;
    sortOptions: readonly Option[];
    currentSort: S;
    onSortChange: (sort: S) => void;
    className?: string; // Allow external override for margin etc. but internal structure is fixed
}

const SortIcon = () => (
    <svg
        className={styles.sortIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 6h18M7 12h10M10 18h4" />
    </svg>
);

export default function FilterSortBar<T extends string, S extends string>({
    filterOptions,
    currentFilter,
    onFilterChange,
    sortOptions,
    currentSort,
    onSortChange,
    className = ''
}: FilterSortBarProps<T, S>) {
    return (
        <div className={`${styles.filterSection} ${className}`}>
            <div className={styles.filterChips}>
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        className={`${styles.filterChip} ${currentFilter === option.value ? styles.active : ''}`}
                        onClick={() => onFilterChange(option.value as T)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <Select
                value={currentSort}
                onChange={(val) => onSortChange(val as S)}
                options={sortOptions}
                className={styles.sortSelectOrAction}
                align="right"
                triggerRender={(selectedOption, isOpen, toggle) => (
                    <button className={styles.sortTrigger} onClick={toggle}>
                        <SortIcon />
                        <span>{selectedOption?.label || '정렬'}</span>
                    </button>
                )}
            />
        </div>
    );
}
