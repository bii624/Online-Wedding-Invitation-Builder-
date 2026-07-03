import React, { useMemo } from 'react';
import type { CanvasElement } from '../../types/editor.types';
import { CalendarTemplate1 } from './calendar/CalendarTemplate1';
import { CalendarTemplate2 } from './calendar/CalendarTemplate2';
import { CalendarTemplate3 } from './calendar/CalendarTemplate3';
import { parseDate } from './calendar/calendarUtils';
import { HeartMarker } from './calendar/HeartMarker';

import { DEFAULT_CALENDAR_PROPS } from '../../store/editorStore';

interface CalendarEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function CalendarEditorElement({ element, zoom }: CalendarEditorElementProps) {
  // If props is empty or missing fields, merge with defaults
  const rawProps: Partial<import('../../types/editor.types').CalendarContent> = element.calendarProps || {};
  const props = { ...DEFAULT_CALENDAR_PROPS, ...rawProps, padding: { ...DEFAULT_CALENDAR_PROPS.padding, ...(rawProps.padding || {}) }, border: { ...DEFAULT_CALENDAR_PROPS.border, ...(rawProps.border || {}) }, shadow: { ...DEFAULT_CALENDAR_PROPS.shadow, ...(rawProps.shadow || {}) } };

  const currentMonth = useMemo(() => {
    return props.primaryDate ? parseDate(props.primaryDate) : new Date();
  }, [props.primaryDate]);

  // Adjust content for scaling based on bounding box
  // A default width of 380px is expected. We scale accordingly.
  const scaleFactor = element.width / 380;
  
  const scaledProps = {
    ...props,
    fontSize: props.fontSize * scaleFactor,
    padding: {
      top: props.padding.top * scaleFactor,
      right: props.padding.right * scaleFactor,
      bottom: props.padding.bottom * scaleFactor,
      left: props.padding.left * scaleFactor,
    },
    border: {
      ...props.border,
      width: props.border.width * scaleFactor,
      radius: props.border.radius * scaleFactor,
    },
    shadow: {
      ...props.shadow,
      x: props.shadow.x * scaleFactor,
      y: props.shadow.y * scaleFactor,
      blur: props.shadow.blur * scaleFactor,
      spread: props.shadow.spread * scaleFactor,
    }
  };

  const renderTemplate = () => {
    switch (props.templateId) {
      case 2:
        return <CalendarTemplate2 content={scaledProps} currentMonth={currentMonth} />;
      case 3:
        return <CalendarTemplate3 content={scaledProps} currentMonth={currentMonth} />;
      case 1:
      default:
        return <CalendarTemplate1 content={scaledProps} currentMonth={currentMonth} />;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Calendar body */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderTemplate()}
      </div>

      {/* Two dates legend */}
      {props.showTwoDates && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24 * scaleFactor,
          marginTop: 8 * scaleFactor,
          fontSize: 12 * scaleFactor,
          fontFamily: props.font
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scaleFactor }}>
            <HeartMarker color={props.primaryColor} size={14 * scaleFactor} dayNumber={0} showDayNumber={false} />
            <span style={{ color: props.textColor }}>{props.groomSideLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scaleFactor }}>
            <HeartMarker color={props.secondaryColor} size={14 * scaleFactor} dayNumber={0} showDayNumber={false} />
            <span style={{ color: props.textColor }}>{props.brideSideLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
