
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  isBefore,
  startOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import styles from './calendar.module.scss';

interface CalendarProps {
  onSelect: (isoString: string) => void;
  initialValue?: string;
  reservedSlots?: string[];
  onDateChange?: (date: Date) => void;
}

export default function Calendar({ onSelect, initialValue, reservedSlots = [], onDateChange }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Optimize reserved slot lookups with useMemo
  const reservedTimeSet = useMemo(() =>
    new Set(reservedSlots.map(iso => format(new Date(iso), 'HH:mm'))),
    [reservedSlots]
  );

  useEffect(() => {
    if (initialValue) {
      const date = new Date(initialValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
        setSelectedTime(format(date, 'HH:mm'));
        onDateChange?.(date);
      }
    }
  }, [initialValue, onDateChange]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const handleDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;

    setSelectedDate(day);
    setSelectedTime(null);
    onSelect('');
    onDateChange?.(day);
  };

  const handleTimeClick = (timeStr: string) => {
    if (!selectedDate) return;
    setSelectedTime(timeStr);

    const [hours, minutes] = timeStr.split(':').map(Number);
    const combinedDate = setMinutes(setHours(selectedDate, hours), minutes);
    onSelect(combinedDate.toISOString());
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots = [];
    const isTodayDate = isToday(selectedDate);
    const now = new Date();

    for (let hour = 10; hour <= 20; hour++) {
      [0, 30].forEach(minutes => {
        if (hour === 20 && minutes === 30) return; // End at 20:00 or as defined

        const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const slotDate = setMinutes(setHours(selectedDate, hour), minutes);

        if (isTodayDate && isBefore(slotDate, now)) return;

        slots.push({
          time: timeString,
          disabled: reservedTimeSet.has(timeString)
        });
      });
    }
    return slots;
  }, [selectedDate, reservedTimeSet]);

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton} aria-label="Previous month">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2>{format(currentMonth, 'yyyy년 M월', { locale: ko })}</h2>
        <button onClick={handleNextMonth} className={styles.navButton} aria-label="Next month">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return (
      <div className={styles.grid}>
        {days.map((day) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    const days = [];
    const day = startDate;
    const formattedDate = '';

    // Create one flat array of days to map over
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className={styles.grid}>
        {/* Helper to just use the grid directly without nested rows div for CSS Grid */}
        {allDays.map((val, i) => {
          const isSelected = selectedDate ? isSameDay(val, selectedDate) : false;
          const isTodayDate = isToday(val);
          const isCurrentMonth = isSameMonth(val, monthStart);
          const isDisabled = isBefore(val, startOfDay(new Date()));

          return (
            <button
              key={i}
              className={`${styles.dayButton} 
                ${!isCurrentMonth ? styles.disabled : ''} 
                ${isSelected ? styles.selected : ''} 
                ${isTodayDate ? styles.today : ''}
              `}
              disabled={isDisabled}
              onClick={() => handleDateClick(val)}
              style={!isCurrentMonth ? { opacity: 0.3 } : {}}
            >
              {format(val, dateFormat)}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.calendarContainer}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {selectedDate && (
        <div className={styles.timeContainer}>
          <div className={styles.timeTitle}>
            {format(selectedDate, 'M월 d일', { locale: ko })} 시간 선택
          </div>
          <div className={styles.timeGrid}>
            {timeSlots.map(({ time, disabled }) => (
              <button
                key={time}
                disabled={disabled}
                className={`${styles.timeButton} ${selectedTime === time ? styles.selected : ''}`}
                onClick={() => !disabled && handleTimeClick(time)}
                style={disabled ? { opacity: 0.3, textDecoration: 'line-through', cursor: 'not-allowed' } : {}}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
