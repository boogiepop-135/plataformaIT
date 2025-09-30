import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const [showUserManagement, setShowUserManagement] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    // Define navigation items with authentication requirements
    const allNavItems = [
        { path: "/", icon: "fas fa-home", label: "Dashboard", requireAuth: false },
        { path: "/kanban", icon: "fas fa-columns", label: "Kanban Board", requireAuth: true },
        { path: "/tickets", icon: "fas fa-ticket-alt", label: "Tickets", requireAuth: true },
        { path: "/calendar", icon: "fas fa-calendar-alt", label: "Calendario", requireAuth: true },
        { path: "/matrices", icon: "fas fa-th", label: "Matrices", requireAuth: true },
        { path: "/journal", icon: "fas fa-book", label: "Bitácora", requireAuth: true },
        { path: "/settings", icon: "fas fa-cogs", label: "Configuración", requireAuth: true },
        { path: "/demo", icon: "fas fa-flask", label: "Demo", requireAuth: false }
    ];

    // Filter navigation items based on authentication status
    const navItems = allNavItems.filter(item => {
        if (item.requireAuth && !isAuthenticated) {
            return false; // Hide protected routes if not authenticated
        }
        return true;
    });

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsCollapsed]);

    return (
        <>
            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-r border-blue-800/30 transition-all duration-300 z-40 ${isCollapsed ? 'w-16' : 'w-64'
                }`}>

                {/* Logo Section */}
                <div className="p-4 border-b border-blue-800/30">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                            <i className="fas fa-laptop-code text-white text-xl"></i>
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent whitespace-nowrap">
                                    Plataforma IT
                                </h1>
                                <p className="text-xs text-blue-300/80 font-medium tracking-wide whitespace-nowrap">
                                    Management Suite
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 z-50"
                >
                    <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
                </button>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = isActivePath(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div className="flex-shrink-0">
                                    <i className={`${item.icon} text-lg`}></i>
                                </div>
                                {!isCollapsed && (
                                    <div className="flex items-center justify-between flex-1">
                                        <span className="font-medium">{item.label}</span>
                                        {item.requireAuth && (
                                            <i className="fas fa-lock text-xs opacity-70"></i>
                                        )}
                                    </div>
                                )}

                                {/* Show only label in collapsed state */}
                                {isCollapsed && !item.requireAuth && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}

                                {/* Show protected route tooltip in collapsed state */}
                                {isCollapsed && item.requireAuth && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 flex items-center space-x-2">
                                        <i className="fas fa-lock text-xs"></i>
                                        <span>{item.label}</span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin Section */}
                {isAuthenticated && (
                    <div className="p-4 border-t border-blue-800/30">
                        <div className="space-y-2">
                            {!isCollapsed ? (
                                <>
                                    {/* Full Admin Panel */}
                                    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <i className="fas fa-user-shield text-white"></i>
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-white font-semibold text-sm">Administrador</div>
                                                <div className="text-green-300 text-xs">Acceso Total</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowUserManagement(true)}
                                        className="w-full flex items-center space-x-3 p-3 text-blue-100 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200"
                                    >
                                        <i className="fas fa-users text-lg"></i>
                                        <span className="font-medium">Gestión Usuarios</span>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 p-3 text-red-300 hover:bg-red-600/20 hover:text-red-200 rounded-xl transition-all duration-200"
                                    >
                                        <i className="fas fa-sign-out-alt text-lg"></i>
                                        <span className="font-medium">Cerrar Sesión</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Collapsed Admin Panel */}
                                    <div className="relative group">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                            <i className="fas fa-user-shield text-white"></i>
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-0">
                                            Administrador
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setShowUserManagement(true)}
                                            className="relative group w-full p-3 text-blue-100 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 flex justify-center"
                                        >
                                            <i className="fas fa-users text-lg"></i>
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                                Gestión Usuarios
                                            </div>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="relative group w-full p-3 text-red-300 hover:bg-red-600/20 hover:text-red-200 rounded-xl transition-all duration-200 flex justify-center"
                                        >
                                            <i className="fas fa-sign-out-alt text-lg"></i>
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                                Cerrar Sesión
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Protected Features Info for non-authenticated users */}
                {!isAuthenticated && (
                    <div className="p-4 border-t border-blue-800/30">
                        {!isCollapsed && (
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                                    Funciones Protegidas
                                </h3>
                                <div className="space-y-1">
                                    {allNavItems.filter(item => item.requireAuth).map((item) => (
                                        <div
                                            key={item.path}
                                            className="flex items-center space-x-2 p-2 text-blue-200/70 text-sm rounded-lg cursor-not-allowed"
                                        >
                                            <i className={`${item.icon} text-sm opacity-70`}></i>
                                            <span className="text-xs">{item.label}</span>
                                            <i className="fas fa-lock text-xs ml-auto"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isCollapsed ? (
                            <button
                                onClick={() => {
                                    document.dispatchEvent(new CustomEvent('showLogin'));
                                }}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <i className="fas fa-shield-alt"></i>
                                <span>Iniciar Sesión</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    document.dispatchEvent(new CustomEvent('showLogin'));
                                }}
                                className="relative group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl transition-all duration-200 flex justify-center"
                            >
                                <i className="fas fa-shield-alt"></i>
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Acceso Admin
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* User Management Modal */}
            {showUserManagement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 overflow-y-auto m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
                            <button
                                onClick={() => setShowUserManagement(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <p className="text-gray-600">Funcionalidad de gestión de usuarios (en desarrollo)</p>
                    </div>
                </div>
            )}

            {/* Overlay for mobile when sidebar is open */}
            {!isCollapsed && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden`}
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}
        </>
    );
};