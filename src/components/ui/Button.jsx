import React from 'react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false,
    className = '',
    ...props 
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';
    
    const variants = {
        primary: 'bg-gradient-to-r from-[#7c3aed] via-[#5b21b6] to-[#0ea5e9] text-white hover:translate-y-[-1px] focus:ring-[#7c3aed] shadow-[0_15px_35px_rgba(88,28,135,0.45)]',
        secondary: 'bg-[rgba(148,163,184,0.12)] text-slate-100 border border-[rgba(148,163,184,0.25)] hover:bg-[rgba(148,163,184,0.2)] focus:ring-[#38bdf8] shadow-[0_8px_24px_rgba(15,23,42,0.65)]',
        danger: 'bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#be123c] text-white hover:translate-y-[-1px] focus:ring-[#f43f5e] shadow-[0_15px_35px_rgba(190,18,60,0.45)]',
        success: 'bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#22c55e] text-white hover:translate-y-[-1px] focus:ring-[#10b981] shadow-[0_15px_35px_rgba(16,185,129,0.45)]',
        outline: 'border-2 border-[#7c3aed] text-[#e0e7ff] hover:bg-[#7c3aed]/10 focus:ring-[#7c3aed] shadow-[0_10px_30px_rgba(124,58,237,0.25)]',
    };
    
    const sizes = {
        sm: 'px-3.5 py-2 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3 text-lg',
        xl: 'px-9 py-4 text-xl',
    };
    
    const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
    
    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;
