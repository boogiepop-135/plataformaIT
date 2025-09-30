import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { usePageTitle } from "../hooks/usePageTitle.jsx";
import AdminLogin from "./AdminLogin.jsx";

export const TopNavbar = ({ isCollapsed, setIsCollapsed }) => {
    const { isAuthenticated, user } = useAuth();
    const pageInfo = usePageTitle();
    const [showLogin, setShowLogin] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Listen for custom login event from sidebar
    useEffect(() => {
        const handleShowLogin = () => setShowLogin(true);
        document.addEventListener('showLogin', handleShowLogin);
        return () => document.removeEventListener('showLogin', handleShowLogin);
    }, []);

    return (
        <>
            {/* Ultra-Modern Top Navigation - Compacto */}
            <nav className={`fixed top-0 right-0 h-12 bg-white/70 backdrop-blur-2xl shadow-sm border-b border-gray-200/30 z-30 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'
                }`}>
                <div className="h-full px-4 flex items-center justify-between">

                    {/* Left side - Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                        >
                            <i className={`fas ${isCollapsed ? 'fa-bars' : 'fa-times'} text-lg`}></i>
                        </button>
                    </div>

                    {/* Center - Dynamic page info compacto */}
                    <div className="flex-1 flex items-center justify-center md:justify-start">
                        <div className="hidden md:flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md flex items-center justify-center">
                                    <i className={`${pageInfo.icon} text-indigo-600 text-xs`}></i>
                                </div>
                                <div>
                                    <h1 className="text-sm font-bold text-gray-900">{pageInfo.title}</h1>
                                </div>
                            </div>
                        </div>

                        {/* Mobile title - simplified */}
                        <div className="md:hidden flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center">
                                <i className={`${pageInfo.icon} text-indigo-600 text-xs`}></i>
                            </div>
                            <h1 className="text-sm font-bold text-gray-900">{pageInfo.title}</h1>
                        </div>
                    </div>

                    {/* Right side - Toolbar compacto */}
                    <div className="flex items-center space-x-1">

                        {/* Search button */}
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 hidden sm:flex items-center justify-center">
                            <i className="fas fa-search text-xs"></i>
                        </button>

                        {/* Notifications */}
                        <button className="relative p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                            <i className="fas fa-bell text-xs"></i>
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                2
                            </span>
                        </button>

                        {/* User section */}
                        {isAuthenticated && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                >
                                    <div className="hidden sm:block text-right">
                                        <div className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</div>
                                        <div className="text-xs text-emerald-600">En línea</div>
                                    </div>
                                    <div className="relative">
                                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <i className="fas fa-user-shield text-white text-sm"></i>
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                </button>

                                {/* Modern User Dropdown */}
                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50">
                                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200/50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                                                    <i className="fas fa-user-shield text-white"></i>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{user?.name || 'Administrador'}</div>
                                                    <div className="text-sm text-emerald-600">Acceso Total</div>
                                                    <div className="text-xs text-gray-500">{user?.email || 'admin@plataforma.it'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => setShowUserDropdown(false)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-150 flex items-center space-x-2"
                                            >
                                                <i className="fas fa-user-circle w-4"></i>
                                                <span>Mi Perfil</span>
                                            </button>
                                            <button
                                                onClick={() => setShowUserDropdown(false)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-150 flex items-center space-x-2"
                                            >
                                                <i className="fas fa-cog w-4"></i>
                                                <span>Configuración</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings (for non-authenticated users) */}
                        {!isAuthenticated && (
                            <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200">
                                <i className="fas fa-cog text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Close dropdown when clicking outside */}
            {showUserDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                />
            )}

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