import React from 'react';

export const DashboardPanel: React.FC<React.PropsWithChildren<{className?:string}>> = ({ children, className='' }) => {
  return (
    <div className={`bg-white rounded-4xl border border-rose-100/50 shadow-[0_15px_40px_rgba(244,63,94,0.015)] flex-1 flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default DashboardPanel;
