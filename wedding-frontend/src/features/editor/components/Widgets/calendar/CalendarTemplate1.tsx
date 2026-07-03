import React from 'react';
import type { CalendarContent } from '../../../types/editor.types';
import { getFirstDayOfMonth, getMonthDays, isSameDay, parseDate } from './calendarUtils';
import { HeartMarker } from './HeartMarker';

export interface CalendarTemplateBaseProps {
  content: CalendarContent;
  currentMonth: Date;
}

const WEEKDAYS = ['HAI', 'BA', 'TƯ', 'NĂM', 'SÁU', 'BẢY', 'CN'];

export const CalendarTemplate1 = React.memo(({ content, currentMonth }: CalendarTemplateBaseProps) => {
  const daysInMonth = getMonthDays(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth); // 0 (Mon) to 6 (Sun)

  const primaryDate = content.primaryDate ? parseDate(content.primaryDate) : null;
  const secondaryDate = content.showTwoDates && content.secondaryDate ? parseDate(content.secondaryDate) : null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: content.backgroundColor,
      padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`,
      border: `${content.border.width}px ${content.border.style} ${content.border.color}`,
      borderRadius: content.border.radius,
      boxShadow: `${content.shadow.x}px ${content.shadow.y}px ${content.shadow.blur}px ${content.shadow.spread}px ${content.shadow.color}`,
      fontFamily: content.font,
      color: content.textColor,
      display: 'flex',
      flexDirection: 'column',
      opacity: content.opacity,
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <span style={{ fontSize: content.fontSize * 1.2, fontWeight: 500, color: content.primaryColor, opacity: 0.8 }}>
          {currentMonth.getFullYear()}
        </span>
        <span style={{ fontSize: content.fontSize * 1.5, fontWeight: 'bold', color: content.primaryColor }}>
          Tháng {currentMonth.getMonth() + 1}
        </span>
      </div>

      {/* Weekdays (Pill shape) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        backgroundColor: content.primaryColor,
        borderRadius: 20,
        padding: '8px 0',
        marginBottom: 16
      }}>
        {WEEKDAYS.map(day => (
          <div key={day} style={{ textAlign: 'center', color: '#fff', fontSize: content.fontSize * 0.8, fontWeight: 600 }}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 16 }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map(date => {
          const isPrimary = primaryDate && isSameDay(date, primaryDate);
          const isSecondary = secondaryDate && isSameDay(date, secondaryDate);

          return (
            <div key={date.toISOString()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 32 }}>
              {isPrimary && isSecondary ? (
                <div style={{ position: 'relative' }}>
                  {/* Blended heart for same day */}
                  <HeartMarker color={`url(#grad-${content.primaryColor.replace('#', '')}-${content.secondaryColor.replace('#', '')})`} size={32} dayNumber={date.getDate()} />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id={`grad-${content.primaryColor.replace('#', '')}-${content.secondaryColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={content.primaryColor} />
                        <stop offset="100%" stopColor={content.secondaryColor} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : isPrimary ? (
                <HeartMarker color={content.primaryColor} size={32} dayNumber={date.getDate()} />
              ) : isSecondary ? (
                <HeartMarker color={content.secondaryColor} size={32} dayNumber={date.getDate()} />
              ) : (
                <span style={{ fontSize: content.fontSize }}>{date.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
