import React from 'react';

const Table = ({ children, className = '' }) => {
    return (
        <div className="overflow-x-auto">
            <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
                {children}
            </table>
        </div>
    );
};

const TableHeader = ({ children, className = '' }) => {
    return (
        <thead className={`bg-gray-50 ${className}`}>
            {children}
        </thead>
    );
};

const TableBody = ({ children, className = '' }) => {
    return (
        <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
            {children}
        </tbody>
    );
};

const TableRow = ({ children, className = '', hover = true }) => {
    return (
        <tr className={`${hover ? 'hover:bg-gray-50' : ''} ${className}`}>
            {children}
        </tr>
    );
};

const TableCell = ({ children, className = '', header = false }) => {
    const baseClasses = header
        ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

    return (
        <td className={`${baseClasses} ${className}`}>
            {children}
        </td>
    );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;
