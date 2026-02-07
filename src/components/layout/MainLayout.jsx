import React from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

const MainLayout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="min-h-screen modern-bg">
            <div className="floating-shapes"></div>
            <div className="pattern-overlay"></div>
            <div className="content-layer">
                <MobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex">
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="flex-1 min-w-0 p-4 lg:p-8 text-[var(--color-text-primary)]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
