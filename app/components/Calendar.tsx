
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  duration?: number; // duration in minutes, default 30
}

export default function Calendar({ onSelect, initialValue, reservedSlots = [], onDateChange, duration = 30 }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Refs
  const timeSectionRef = useRef<HTMLDivElement>(null);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Scroll state for fade indicators
  const [scrollState, setScrollState] = useState({ top: false, bottom: false });

  // Optimize reserved slot lookups with useMemo
  const reservedTimeSet = useMemo(() =>
    new Set(reservedSlots.map(iso => format(new Date(iso), 'HH:mm'))),
    [reservedSlots]
  );

  // Calculate blocks needed (e.g., 60m -> 2 blocks of 30m)
  const blocksNeeded = Math.ceil(duration / 30);

  useEffect(() => {
    if (initialValue) {
      const date = new Date(initialValue);
      if (!isNaN(date.getTime())) {
        // Only update selectedDate if it's a different day to avoid regenerating timeSlots and resetting scroll
        setSelectedDate(prev => (!prev || !isSameDay(date, prev) ? date : prev));

        // Only update current month if different (optional, but good for UX)
        setCurrentMonth(prev => (!isSameMonth(date, prev) ? date : prev));

        setSelectedTime(format(date, 'HH:mm'));

        // We might want to call onDateChange only if day changed, but the prop implies it handles date changes.
        // If we strictly follow limiting updates:
        if (!selectedDate || !isSameDay(date, selectedDate)) {
          onDateChange?.(date);
        }
      }
    }
  }, [initialValue, onDateChange]); // removed selectedDate from dependency to avoid complications, but logic uses functional updates or check inside


  // Scroll to time section when date is selected
  useEffect(() => {
    if (selectedDate && timeSectionRef.current) {
      setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedDate]);

  // Check scroll position to toggle fades
  const checkScroll = () => {
    if (timeGridRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = timeGridRef.current;
      setScrollState({
        top: scrollTop > 10,
        bottom: scrollTop + clientHeight < scrollHeight - 10
      });
    }
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: { time: string; disabled: boolean }[] = [];
    const isTodayDate = isToday(selectedDate);
    const now = new Date();

    const allBaseSlots: string[] = [];
    for (let hour = 10; hour <= 20; hour++) {
      [0, 30].forEach(minutes => {
        if (hour === 20 && minutes > 0) return;
        if (hour === 20 && minutes === 30) return;
        allBaseSlots.push(`${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
      });
    }

    // Map base slots to disabled status
    allBaseSlots.forEach((timeString, index) => {
      const [h, m] = timeString.split(':').map(Number);
      const slotDate = setMinutes(setHours(selectedDate, h), m);

      let isDisabled = false;

      // 1. Check past time
      if (isTodayDate && isBefore(slotDate, now)) {
        isDisabled = true;
      }

      // 2. Check if this slot OR required future slots are occupied or out of bounds
      if (!isDisabled) {
        for (let i = 0; i < blocksNeeded; i++) {
          if (index + i >= allBaseSlots.length) {
            isDisabled = true;
            break;
          }
          const checkTimeStr = allBaseSlots[index + i];
          if (reservedTimeSet.has(checkTimeStr)) {
            isDisabled = true;
            break;
          }
        }
      }

      slots.push({
        time: timeString,
        disabled: isDisabled
      });
    });

    return slots;
  }, [selectedDate, reservedTimeSet, blocksNeeded]);

  // Re-check scroll whenever time slots change
  useEffect(() => {
    // Also scroll to top of grid when date changes (new slots)
    if (timeGridRef.current) {
      timeGridRef.current.scrollTop = 0;
      // Small timeout to allow layout to settle before checking scroll height
      setTimeout(checkScroll, 0);
    }
  }, [timeSlots]);

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
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className={styles.grid}>
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
        <div
          className={`${styles.timeContainer} ${scrollState.top ? styles.showTopFade : ''} ${scrollState.bottom ? styles.showBottomFade : ''}`}
          ref={timeSectionRef}
        >
          <div className={styles.timeTitle}>
            {format(selectedDate, 'M월 d일', { locale: ko })} 시간 선택
          </div>
          <div
            className={styles.timeGrid}
            ref={timeGridRef}
            onScroll={checkScroll}
          >
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
