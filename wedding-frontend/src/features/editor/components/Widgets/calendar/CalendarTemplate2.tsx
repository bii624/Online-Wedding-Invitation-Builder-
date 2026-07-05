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

  const textColor = content.textColor || '#8B2929';
  const frameColor = content.primaryColor || '#D4AF37'; 
  const heartColor = content.textColor || '#8B2929'; 
  const bgColor = content.backgroundColor || 'transparent';
  
  const borderWidth = content.border.width > 0 ? content.border.width : 1;
  const paddingObj = content.padding || { top: 16, right: 16, bottom: 16, left: 16 };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: bgColor,
      padding: `${paddingObj.top}px ${paddingObj.right}px ${paddingObj.bottom}px ${paddingObj.left}px`,
      border: `${borderWidth}px solid ${frameColor}`, 
      borderRadius: content.border.radius || 8,
      boxShadow: `${content.shadow.x}px ${content.shadow.y}px ${content.shadow.blur}px ${content.shadow.spread}px ${content.shadow.color}`,
      fontFamily: content.font,
      color: textColor, 
      display: 'flex',
      flexDirection: 'column',
      opacity: content.opacity,
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8, marginTop: 4 }}>
        <span style={{ fontSize: content.fontSize * 1.3, fontWeight: 500 }}>
          Tháng {currentMonth.getMonth() + 1} / {currentMonth.getFullYear()}
        </span>
      </div>
      
      {/* Weekdays */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        borderTop: `${borderWidth}px solid ${frameColor}`,
        borderBottom: `${borderWidth}px solid ${frameColor}`,
        padding: '6px 0',
        marginBottom: 12
      }}>
        {WEEKDAYS.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: content.fontSize * 0.95, opacity: 0.8, fontWeight: 400 }}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 12, zIndex: 1, paddingBottom: 8 }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map(date => {
          const isPrimary = primaryDate && isSameDay(date, primaryDate);
          const isSecondary = secondaryDate && isSameDay(date, secondaryDate);
          
          return (
            <div key={date.toISOString()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 28 }}>
              {isPrimary && isSecondary ? (
                <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                  <HeartMarker color={heartColor} size={content.fontSize * 2.8} dayNumber={date.getDate()} showDayNumber={true} />
                </div>
              ) : isPrimary ? (
                <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                  <HeartMarker color={heartColor} size={content.fontSize * 2.8} dayNumber={date.getDate()} showDayNumber={true} />
                </div>
              ) : isSecondary ? (
                <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                  <HeartMarker color={content.secondaryColor || '#D4AF37'} size={content.fontSize * 2.8} dayNumber={date.getDate()} showDayNumber={true} />
                </div>
              ) : (
                <span style={{ fontSize: content.fontSize * 1.1, fontWeight: 300, opacity: 0.9 }}>{date.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
