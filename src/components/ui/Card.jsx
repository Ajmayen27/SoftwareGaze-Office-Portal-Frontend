import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div 
            className={`bg-[rgba(10,15,35,0.92)] backdrop-blur-2xl rounded-2xl border border-[rgba(148,163,184,0.25)] shadow-[0_25px_60px_rgba(2,6,23,0.65)] hover:shadow-[0_35px_70px_rgba(2,6,23,0.75)] transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 border-b border-[rgba(148,163,184,0.25)] bg-[rgba(255,255,255,0.01)] ${className}`}>
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
        <div className={`px-6 py-4 border-t border-[rgba(148,163,184,0.25)] bg-[rgba(255,255,255,0.01)] ${className}`}>
            {children}
        </div>
    );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
