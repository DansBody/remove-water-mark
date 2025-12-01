import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div 
      className={`
        glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300
        ${hoverEffect ? 'hover:bg-slate-800/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' : ''}
        ${className}
      `}
    >
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
      
      {children}
    </div>
  );
};