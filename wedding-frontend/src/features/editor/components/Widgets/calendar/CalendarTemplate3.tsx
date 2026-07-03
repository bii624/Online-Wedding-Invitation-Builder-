import React from 'react';
import type { CalendarContent } from '../../../types/editor.types';
import { getFirstDayOfMonth, getMonthDays, isSameDay, parseDate } from './calendarUtils';
import { HeartMarker } from './HeartMarker';
import type { CalendarTemplateBaseProps } from './CalendarTemplate1';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const CalendarTemplate3 = React.memo(({ content, currentMonth }: CalendarTemplateBaseProps) => {
  const daysInMonth = getMonthDays(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const primaryDate = content.primaryDate ? parseDate(content.primaryDate) : null;
  const secondaryDate = content.showTwoDates && content.secondaryDate ? parseDate(content.secondaryDate) : null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: content.backgroundColor,
      border: `${content.border.width}px ${content.border.style} ${content.border.color}`,
      borderRadius: content.border.radius,
      boxShadow: `${content.shadow.x}px ${content.shadow.y}px ${content.shadow.blur}px ${content.shadow.spread}px ${content.shadow.color}`,
      fontFamily: content.font,
      color: content.textColor,
      display: 'flex',
      flexDirection: 'column',
      opacity: content.opacity,
      boxSizing: 'border-box',
      overflow: 'hidden', // to keep banner header corners rounded
      position: 'relative'
    }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: content.primaryColor,
        color: '#fff',
        padding: '16px',
        textAlign: content.alignment,
        fontSize: content.fontSize * 1.5,
        fontWeight: 'bold'
      }}>
        {currentMonth.getMonth() + 1}.{currentMonth.getFullYear()}
      </div>

      <div style={{ padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`, position: 'relative', flex: 1 }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: content.fontSize * 6,
          fontWeight: 900,
          color: content.primaryColor,
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {currentMonth.getFullYear()}
        </div>

        {/* Weekdays */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: 16,
          position: 'relative',
          zIndex: 1
        }}>
          {WEEKDAYS.map(day => (
            <div key={day} style={{ textAlign: 'center', color: content.textColor, fontSize: content.fontSize * 0.8, fontWeight: 'bold' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 16, position: 'relative', zIndex: 1 }}>
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
                    <HeartMarker color={`url(#grad3-${content.primaryColor.replace('#', '')}-${content.secondaryColor.replace('#', '')})`} size={32} dayNumber={date.getDate()} />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id={`grad3-${content.primaryColor.replace('#', '')}-${content.secondaryColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
    </div>
  );
});
