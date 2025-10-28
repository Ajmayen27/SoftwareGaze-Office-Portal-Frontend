import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div 
            className={`bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

const CardBody = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
};

const CardFooter = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
