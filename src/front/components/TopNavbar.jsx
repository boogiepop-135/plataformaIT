import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { usePageTitle } from "../hooks/usePageTitle.jsx";
import AdminLogin from "./AdminLogin.jsx";

export const TopNavbar = ({ isCollapsed, setIsCollapsed }) => {
    const { isAuthenticated } = useAuth();
    const pageInfo = usePageTitle();
    const [showLogin, setShowLogin] = useState(false);

    // Listen for custom login event from sidebar
    useEffect(() => {
        const handleShowLogin = () => setShowLogin(true);
        document.addEventListener('showLogin', handleShowLogin);
        return () => document.removeEventListener('showLogin', handleShowLogin);
    }, []);

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 z-30 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'
                }`}>
                <div className="h-full px-6 flex items-center justify-between">

                    {/* Left side - Mobile menu button (only visible on mobile) */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                        >
                            <i className={`fas ${isCollapsed ? 'fa-bars' : 'fa-times'} text-lg`}></i>
                        </button>
                    </div>

                    {/* Center - Dynamic page title and breadcrumb */}
                    <div className="flex-1 flex items-center justify-center md:justify-start">
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 text-gray-700">
                                    <i className={`${pageInfo.icon} text-lg text-blue-600`}></i>
                                    <h1 className="text-xl font-bold">{pageInfo.title}</h1>
                                </div>
                                <div className="text-gray-400">•</div>
                                <span className="text-sm text-gray-500">{pageInfo.description}</span>
                            </div>
                        </div>

                        {/* Mobile title */}
                        <div className="md:hidden">
                            <div className="flex items-center space-x-2">
                                <i className={`${pageInfo.icon} text-lg text-blue-600`}></i>
                                <h1 className="text-lg font-bold text-gray-700">{pageInfo.title}</h1>
                            </div>
                        </div>
                    </div>

                    {/* Right side - User info and notifications */}
                    <div className="flex items-center space-x-4">

                        {/* Notifications (future feature) */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            <i className="fas fa-bell text-lg"></i>
                            {/* Notification badge */}
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                3
                            </span>
                        </button>

                        {/* User avatar/status */}
                        {isAuthenticated && (
                            <div className="flex items-center space-x-3">
                                <div className="hidden sm:block text-right">
                                    <div className="text-sm font-semibold text-gray-900">Administrador</div>
                                    <div className="text-xs text-gray-500">En línea</div>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <i className="fas fa-user-shield text-white text-sm"></i>
                                </div>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        )}

                        {/* Settings */}
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            <i className="fas fa-cog text-lg"></i>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {showLogin && (
                <AdminLogin
                    onClose={() => setShowLogin(false)}
                    onLoginSuccess={() => setShowLogin(false)}
                />
            )}
        </>
    );
};