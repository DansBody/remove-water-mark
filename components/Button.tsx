import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:border-cyan-400 py-3 px-6 neon-glow",
    secondary: "bg-slate-700/30 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 hover:text-white py-3 px-6",
    icon: "p-3 bg-slate-800/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-full border border-slate-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
           <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
};