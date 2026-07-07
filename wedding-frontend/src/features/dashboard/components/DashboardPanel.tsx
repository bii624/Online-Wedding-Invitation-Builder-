import React from 'react';

export const DashboardPanel: React.FC<React.PropsWithChildren<{className?:string}>> = ({ children, className='' }) => {
  return (
    <div className={`bg-white/60 backdrop-blur-3xl backdrop-saturate-125 rounded-3xl border border-white/10 shadow-xl ring-1 ring-white/5 p-6 sm:p-10 ${className}`}>
      {children}
    </div>
  );
};

export default DashboardPanel;
