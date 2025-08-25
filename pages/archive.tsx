import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getESTDateString } from "../lib/timezone";

export default function ArchivePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 7, 1)); // Start with August 2025
  const [isClient, setIsClient] = useState(false);

  // Start date: August 24, 2025 (when daily puzzles actually began)
  const START_DATE = new Date(2025, 7, 24); // Month is 0-indexed, so 7 = August

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isDateSelectable = (date: Date) => {
    // Use EST timezone for today's date comparison
    const today = new Date(getESTDateString() + 'T00:00:00');
    return date >= START_DATE && date <= today;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    return { firstDayOfWeek, daysInMonth };
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const hasPlayedPuzzle = (date: Date) => {
    try {
      const stats = localStorage.getItem('wordibble:stats:v1');
      if (!stats) return false;
      
      const statsData = JSON.parse(stats);
      const dateString = formatDateKey(date);
      
      // Check if any results exist for this date
      return statsData.results && statsData.results.some((result: any) => 
        result.dateISO === dateString
      );
    } catch (error) {
      return false;
    }
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const { firstDayOfWeek, daysInMonth } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelectable = isDateSelectable(date);
      const isSelected = selectedDate && formatDateKey(date) === formatDateKey(selectedDate);
      const isToday = formatDateKey(date) === getESTDateString();
      
      days.push(
        <button
          key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`}
          onClick={() => handleDateSelect(date)}
          disabled={!isSelectable}
          className={`
            w-10 h-10 rounded-lg text-sm font-medium transition-colors relative
            ${isSelectable 
              ? 'hover:bg-gray-200 cursor-pointer' 
              : 'text-gray-300 cursor-not-allowed'
            }
            ${isSelected 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'text-gray-800'
            }
            ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
          `}
        >
          {/* Puzzle status indicator box above date - only show on client to prevent hydration mismatch */}
          {isSelectable && (
            <>
              {isClient ? (
                <div className={`
                  absolute -top-1 left-1/2 transform -translate-x-1/2
                  w-3 h-3 rounded-sm
                  ${hasPlayedPuzzle(date) ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              ) : (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-sm bg-gray-200 animate-pulse" />
              )}
            </>
          )}
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-1 w-6 h-6">
            <div className="bg-green-500 rounded-sm"></div>
            <div className="bg-yellow-500 rounded-sm"></div>
            <div className="bg-gray-500 rounded-sm"></div>
            <div className="bg-green-500 rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Wordibble archive</h1>
        </div>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to game
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600 text-center mb-8">
          Play puzzles since August 24, 2025
        </p>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => navigateMonth('prev')}
            disabled={currentMonth <= START_DATE}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) => setCurrentMonth(prev => {
                const newMonth = new Date(prev);
                newMonth.setMonth(parseInt(e.target.value));
                return newMonth;
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {months.map((month, index) => (
                <option key={`month-${index}`} value={index}>{month}</option>
              ))}
            </select>
            
            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => setCurrentMonth(prev => {
                const newMonth = new Date(prev);
                newMonth.setFullYear(parseInt(e.target.value));
                return newMonth;
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {years.map(year => (
                <option key={`year-${year}`} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            disabled={currentMonth.getMonth() === new Date(getESTDateString() + 'T00:00:00').getMonth() && currentMonth.getFullYear() === new Date(getESTDateString() + 'T00:00:00').getFullYear()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="max-w-md mx-auto mb-8">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={`day-label-${index}`} className="w-10 h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>

        {/* Wordibble Length Selection */}
        {selectedDate && isDateSelectable(selectedDate) && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900 font-medium">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Choose Puzzle:</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/?date=${formatDateKey(selectedDate)}&archive=true&length=5`}
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Wordibble 5
                </Link>
                <Link
                  href={`/?date=${formatDateKey(selectedDate)}&archive=true&length=6`}
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Wordibble 6
                </Link>
                <Link
                  href={`/?date=${formatDateKey(selectedDate)}&archive=true&length=7`}
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Wordibble 7
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
