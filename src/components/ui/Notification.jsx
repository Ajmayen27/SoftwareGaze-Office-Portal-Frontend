import React, { useEffect } from 'react';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const typeStyles = {
        success: 'from-[#0ea5e9] via-[#10b981] to-[#22c55e]',
        error: 'from-[#f43f5e] via-[#e11d48] to-[#be123c]',
        warning: 'from-[#fde047] via-[#f97316] to-[#f43f5e]',
        info: 'from-[#7c3aed] via-[#5b21b6] to-[#0ea5e9]',
    };

    return (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full transform transition-all duration-500 ease-out animate-slide-down">
            <div className={`relative overflow-hidden rounded-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.55)] bg-gradient-to-r ${typeStyles[type]}`}>
                <div className="absolute inset-0 bg-[rgba(3,7,18,0.45)] backdrop-blur-xl"></div>
                <div className="relative p-5 flex items-start space-x-3">
                    <div className="mt-1 w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl">
                        {type === 'success' && '✓'}
                        {type === 'error' && '✕'}
                        {type === 'warning' && '!'}
                        {type === 'info' && 'i'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white leading-relaxed">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-start">
                </div>
            </div>
        </div>
    );
};

export default Notification;
