import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();
    const [showUserManagement, setShowUserManagement] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    // Define navigation items with authentication requirements and categories
    const navigationSections = [
        {
            title: "Principal",
            items: [
                { path: "/", icon: "fas fa-home", label: "Dashboard", requireAuth: false },
                { path: "/calendar", icon: "fas fa-calendar-days", label: "Calendario", requireAuth: true },
            ]
        },
        {
            title: "Gestión",
            items: [
                { path: "/kanban", icon: "fas fa-columns", label: "Kanban", requireAuth: true },
                { path: "/tickets", icon: "fas fa-ticket", label: "Tickets", requireAuth: true },
                { path: "/matrices", icon: "fas fa-table-cells", label: "Matrices", requireAuth: true },
                { path: "/journal", icon: "fas fa-book-open", label: "Bitácora", requireAuth: true },
            ]
        },
        {
            title: "Finanzas",
            items: [
                { path: "/budget", icon: "fas fa-chart-line", label: "Presupuestos", requireAuth: true, financieroOnly: true },
                { path: "/payment-reminders", icon: "fas fa-money-bill-wave", label: "Recordatorios", requireAuth: true },
                { path: "/service-orders", icon: "fas fa-clipboard-list", label: "Órdenes", requireAuth: true },
            ]
        },
        {
            title: "Usuario",
            items: [
                { path: "/profile", icon: "fas fa-user-circle", label: "Mi Perfil", requireAuth: true },
                { path: "/users", icon: "fas fa-users-gear", label: "Usuarios", requireAuth: true, superAdminOnly: true },
                { path: "/hr-management", icon: "fas fa-user-friends", label: "Gestión RH", requireAuth: true, hrOrSuperAdmin: true },
                { path: "/settings", icon: "fas fa-gear", label: "Configuración", requireAuth: true, superAdminOnly: true },
            ]
        },
        {
            title: "Desarrollo",
            items: [
                { path: "/demo", icon: "fas fa-code", label: "Demo", requireAuth: false }
            ]
        }
    ];

    // Filter navigation sections based on authentication status and role
    const filteredSections = navigationSections.map(section => ({
        ...section,
        items: section.items.filter(item => {
            if (item.requireAuth && !isAuthenticated) {
                return false;
            }
            if (item.superAdminOnly && (!user || user.role !== 'super_admin')) {
                return false;
            }
            if (item.hrOrSuperAdmin && (!user || !['admin-rh-financiero', 'super_admin'].includes(user.role))) {
                return false;
            }
            if (item.financieroOnly && (!user || !['admin-rh-financiero', 'super_admin'].includes(user.role))) {
                return false;
            }
            return true;
        })
    })).filter(section => section.items.length > 0);

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
            {/* Ultra-Modern Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-gray-200/50 transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-16' : 'w-64'
                }`}>

                {/* Modern Logo Section - Compacto */}
                <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-lg shadow-lg flex items-center justify-center">
                                <i className="fas fa-laptop-code text-white text-sm"></i>
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse"></div>
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-black bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Plataforma IT
                                </h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide">
                                    Management Suite
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modern Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-16 w-7 h-7 bg-white border border-gray-200 hover:border-indigo-300 rounded-full flex items-center justify-center text-gray-600 hover:text-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
                >
                    <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs group-hover:scale-110 transition-transform`}></i>
                </button>

                {/* Modern Navigation - Con scroll optimizado */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                    <div className="space-y-4">
                        {filteredSections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-1">
                                {/* Section Title */}
                                {!isCollapsed && (
                                    <div className="px-3 mb-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                    </div>
                                )}

                                {/* Section Items */}
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = isActivePath(item.path);
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-md shadow-indigo-500/10 border border-indigo-100'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                                    }`}
                                            >
                                                {/* Active indicator */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"></div>
                                                )}

                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-500'
                                                    }`}>
                                                    <i className={`${item.icon} text-sm`}></i>
                                                </div>

                                                {/* Label */}
                                                {!isCollapsed && (
                                                    <div className="flex items-center justify-between flex-1">
                                                        <span className="font-medium text-sm">{item.label}</span>
                                                        {item.requireAuth && (
                                                            <div className="w-2 h-2 bg-amber-400 rounded-full opacity-60"></div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Tooltip for collapsed state */}
                                                {isCollapsed && (
                                                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                                        <div className="flex items-center space-x-2">
                                                            {item.requireAuth && (
                                                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                                            )}
                                                            <span>{item.label}</span>
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Modern Admin Section - Compacto */}
                {isAuthenticated && (
                    <div className="p-3 border-t border-gray-200/50 mt-auto">
                        <div className="space-y-2">
                            {!isCollapsed ? (
                                <>
                                    {/* Modern Admin Panel */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                                                    <i className="fas fa-user-shield text-white text-xs"></i>
                                                </div>
                                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-xs text-gray-900">{user?.name || 'Admin'}</div>
                                                <div className="text-emerald-600 text-xs font-medium">Online</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Compactos */}
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => setShowUserManagement(true)}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200 group"
                                        >
                                            <i className="fas fa-users text-xs group-hover:scale-110 transition-transform"></i>
                                            <span className="font-medium text-xs">Usuarios</span>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 group"
                                        >
                                            <i className="fas fa-sign-out-alt text-xs group-hover:scale-110 transition-transform"></i>
                                            <span className="font-medium text-xs">Salir</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Collapsed Admin Panel */}
                                    <div className="relative group">
                                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto relative">
                                            <i className="fas fa-user-shield text-white text-sm"></i>
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 top-0 shadow-xl">
                                            {user?.name || 'Administrador'}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setShowUserManagement(true)}
                                            className="relative group w-full p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 flex justify-center"
                                        >
                                            <i className="fas fa-users text-sm"></i>
                                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                                Gestión Usuarios
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="relative group w-full p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex justify-center"
                                        >
                                            <i className="fas fa-sign-out-alt text-sm"></i>
                                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                                Cerrar Sesión
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Modern Login Section for unauthenticated users */}
                {!isAuthenticated && (
                    <div className="p-4 border-t border-gray-200/50 mt-auto">
                        {!isCollapsed ? (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <i className="fas fa-lock text-indigo-500 text-lg"></i>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Inicia sesión para acceder a todas las funciones
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        document.dispatchEvent(new CustomEvent('showLogin'));
                                    }}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <i className="fas fa-shield-halved text-sm"></i>
                                    <span>Iniciar Sesión</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    document.dispatchEvent(new CustomEvent('showLogin'));
                                }}
                                className="relative group w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-3 rounded-xl transition-all duration-200 flex justify-center shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <i className="fas fa-shield-halved"></i>
                                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    Iniciar Sesión
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
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
                    className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden`}
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}
        </>
    );
};