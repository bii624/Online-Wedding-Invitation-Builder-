import React from 'react';
import type { CalendarContent } from '../../../types/editor.types';
import { getFirstDayOfMonth, getMonthDays, isSameDay, parseDate } from './calendarUtils';
import { HeartMarker } from './HeartMarker';
import type { CalendarTemplateBaseProps } from './CalendarTemplate1';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const CalendarTemplate2 = React.memo(({ content, currentMonth }: CalendarTemplateBaseProps) => {
  const daysInMonth = getMonthDays(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  
  const primaryDate = content.primaryDate ? parseDate(content.primaryDate) : null;
  const secondaryDate = content.showTwoDates && content.secondaryDate ? parseDate(content.secondaryDate) : null;

  const bgColor = content.primaryColor || '#8B0000'; // Default to dark red if empty

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: bgColor,
      padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`,
      border: `${content.border.width}px double #D4AF37`, // Double gold border
      borderRadius: content.border.radius,
      boxShadow: `${content.shadow.x}px ${content.shadow.y}px ${content.shadow.blur}px ${content.shadow.spread}px ${content.shadow.color}`,
      fontFamily: content.font,
      color: '#fff', // Default text is white/gold
      display: 'flex',
      flexDirection: 'column',
      opacity: content.opacity,
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 4, left: 4, width: 24, height: 24, borderTop: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }}></div>
      <div style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderTop: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }}></div>
      <div style={{ position: 'absolute', bottom: 4, left: 4, width: 24, height: 24, borderBottom: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37' }}></div>
      <div style={{ position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, borderBottom: '2px solid #D4AF37', borderRight: '2px solid #D4AF37' }}></div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 12, marginTop: 8 }}>
        <span style={{ fontSize: content.fontSize * 1.2, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 }}>
          Tháng {currentMonth.getMonth() + 1} / {currentMonth.getFullYear()}
        </span>
      </div>
      
      <div style={{ height: 1, backgroundColor: '#D4AF37', marginBottom: 16, opacity: 0.6 }} />

      {/* Weekdays */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        marginBottom: 16
      }}>
        {WEEKDAYS.map(day => (
          <div key={day} style={{ textAlign: 'center', color: '#D4AF37', fontSize: content.fontSize * 0.9, fontWeight: 600 }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ height: 1, backgroundColor: '#D4AF37', marginBottom: 16, opacity: 0.6 }} />

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 16, zIndex: 1 }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map(date => {
          const isPrimary = primaryDate && isSameDay(date, primaryDate);
          const isSecondary = secondaryDate && isSameDay(date, secondaryDate);
          
          return (
            <div key={date.toISOString()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 32 }}>
              {isPrimary && isSecondary ? (
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(45deg, #D4AF37, ${content.secondaryColor})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: bgColor, fontWeight: 'bold', fontSize: content.fontSize
                }}>
                  {date.getDate()}
                </div>
              ) : isPrimary ? (
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: '#D4AF37',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: bgColor, fontWeight: 'bold', fontSize: content.fontSize
                }}>
                  {date.getDate()}
                </div>
              ) : isSecondary ? (
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: content.secondaryColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 'bold', fontSize: content.fontSize
                }}>
                  {date.getDate()}
                </div>
              ) : (
                <span style={{ fontSize: content.fontSize, color: '#fff' }}>{date.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
