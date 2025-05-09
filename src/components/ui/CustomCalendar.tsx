
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { format, startOfDay, isSameDay, isSunday, addMonths, subMonths, getDaysInMonth as dateFnsGetDaysInMonth, getDay, getDate, getMonth, getYear, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './custom-calendar.css'; // Import the CSS file

export type AvailabilityStatus = 'available' | 'partial' | 'occupied' | 'unavailable';

interface CustomCalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
  availability: Record<string, AvailabilityStatus>; // e.g., {'2024-07-20': 'available'}
  holidays?: Date[];
  minDate?: Date;
  maxDate?: Date;
  initialDisplayMonth?: Date;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  value,
  onChange,
  availability,
  holidays = [],
  minDate,
  maxDate,
  initialDisplayMonth,
}) => {
  const [displayDate, setDisplayDate] = useState(startOfDay(initialDisplayMonth || value || new Date()));

  const currentDisplayMonth = getMonth(displayDate);
  const currentDisplayYear = getYear(displayDate);
  const today = startOfDay(new Date());

  const getMonthName = (monthIndex: number, year: number): string => {
    return format(new Date(year, monthIndex), "MMMM yyyy", { locale: es });
  };

  const handlePrevMonth = () => {
    setDisplayDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => addMonths(prev, 1));
  };

  const generateCalendarDays = () => {
    const daysInCurrentMonth = dateFnsGetDaysInMonth(displayDate);
    const firstDayOfMonthRaw = getDay(new Date(currentDisplayYear, currentDisplayMonth, 1)); // Sunday is 0, Saturday is 6
    // Adjust so Monday is 0, Sunday is 6 if needed, but react-day-picker's default is Sunday=0
    const firstDayOfMonth = firstDayOfMonthRaw; // Sunday = 0

    const calendarDays: Array<{
      dayNumber: number;
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
      status?: AvailabilityStatus;
    } | null> = [];

    // Fill initial empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }

    // Fill days of the month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = startOfDay(new Date(currentDisplayYear, currentDisplayMonth, day));
      const dateString = format(date, 'yyyy-MM-dd');
      let isDisabled = false;

      if (minDate && isBefore(date, startOfDay(minDate))) {
        isDisabled = true;
      }
      if (maxDate && isAfter(date, startOfDay(maxDate))) {
        isDisabled = true;
      }
      if (isSunday(date)) {
        isDisabled = true;
      }
      if (holidays.some(h => isSameDay(date, startOfDay(h)))) {
        isDisabled = true;
      }
      
      const status = availability[dateString];
      // If a day is disabled for other reasons (Sunday, holiday, past), its availability status shouldn't allow booking
      // So, if it's explicitly marked 'unavailable' or becomes disabled, it's effectively unavailable.
      const effectiveStatus = isDisabled && status !== 'unavailable' ? 'unavailable' : status;


      calendarDays.push({
        dayNumber: day,
        date: date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: !!value && isSameDay(date, startOfDay(value)),
        isDisabled: isDisabled || effectiveStatus === 'unavailable' || effectiveStatus === 'occupied', // Also disable if occupied or generally unavailable by status
        status: effectiveStatus,
      });
    }
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];


  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} aria-label="Mes anterior">
          <ChevronLeft size={20} />
        </button>
        <span>{getMonthName(currentDisplayMonth, currentDisplayYear)}</span>
        <button onClick={handleNextMonth} aria-label="Mes siguiente">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map(wd => <span key={wd}>{wd}</span>)}
      </div>
      <div className="calendar-days">
        {calendarDays.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="calendar-cell empty" />;
          }
          const { dayNumber, date, isToday, isSelected, isDisabled, status } = cell;
          
          let cellClassName = "calendar-cell";
          if (isToday) cellClassName += " today";
          if (isSelected) cellClassName += " selected";
          if (isDisabled) cellClassName += " disabled";
          
          if (status && !isSelected) { // Don't let status override selected style unless disabled
             cellClassName += ` ${status}`;
          } else if (isDisabled && !status) { // Default to unavailable if disabled and no specific status
             cellClassName += " unavailable";
          }


          return (
            <div
              key={`${currentDisplayYear}-${currentDisplayMonth}-${dayNumber}`}
              className={cellClassName}
              onClick={() => !isDisabled && onChange(date)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}
              aria-label={`Fecha ${format(date, 'd \'de\' MMMM', { locale: es })}, estado: ${status || (isDisabled ? 'no disponible' : 'disponible')}`}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
