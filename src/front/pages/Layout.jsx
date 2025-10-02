import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom/dist";
import ScrollToTop from "../components/ScrollToTop";
import Sidebar from "../components/Sidebar";
import { TopNavbar } from "../components/TopNavbar";
import { Footer } from "../components/Footer";

// Ultra-Modern Layout with Figma-inspired design
export const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ScrollToTop>
            {/* Modern App Shell */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }}></div>
                </div>

                {/* Sidebar */}
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Top Navigation */}
                <TopNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Main Content Area - Ajustado para navbar más pequeño */}
                <main className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-64'
                    } ${isMobile ? 'ml-0' : ''} pt-12 relative z-10`}>

                    {/* Content Container */}
                    <div className="min-h-[calc(100vh-3rem)] p-4 lg:p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Glass morphism container */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl shadow-blue-500/5 min-h-[calc(100vh-6rem)] overflow-hidden">
                                <Outlet />
                            </div>
                        </div>
                    </div>

                    {/* Modern Footer */}
                    <div className="mt-8">
                        <Footer />
                    </div>
                </main>

                {/* Mobile Overlay */}
                {isMobile && !isCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setIsCollapsed(true)}
                    />
                )}
            </div>
        </ScrollToTop>
    );
};