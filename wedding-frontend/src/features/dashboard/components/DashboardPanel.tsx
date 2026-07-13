import React from 'react';

export const DashboardPanel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-[2.5rem] border border-[rgb(255,166,166)]/30 shadow-md shadow-[rgb(255,166,166)]/5 p-6 sm:p-10 ${className}`}>
      {children}
    </div>
  );
};

export default DashboardPanel;
