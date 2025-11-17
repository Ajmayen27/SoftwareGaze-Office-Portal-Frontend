import React from 'react';

const Input = ({ 
    label, 
    error, 
    className = '', 
    ...props 
}) => {
    return (
        <div className="mb-5">
            {label && (
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 tracking-wide uppercase">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 text-base rounded-xl bg-[rgba(10,15,35,0.65)] border-2 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-[#38bdf8] transition-all duration-200 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] ${
                    error ? 'border-[#f87171]' : 'border-[rgba(148,163,184,0.25)]'
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm font-medium text-[#fca5a5]">{error}</p>
            )}
        </div>
    );
};

export default Input;
