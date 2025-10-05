import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();

    const navigationSections = [
        {
            title: "Principal",
            items: [
                { path: "/", icon: "fas fa-home", label: "Inicio", requireAuth: false },
                { path: "/dashboard", icon: "fas fa-chart-pie", label: "Dashboard", requireAuth: true },
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
                { path: "/users", icon: "fas fa-users-gear", label: "Usuarios", requireAuth: true, adminOrHigher: true },
                { path: "/hr-management", icon: "fas fa-user-friends", label: "Personal RH", requireAuth: true, hrOrHigher: true },
                { path: "/roles-branches", icon: "fas fa-building", label: "Roles y Sucursales", requireAuth: true, superAdminOnly: true },
                { path: "/settings", icon: "fas fa-gear", label: "Configuración", requireAuth: true, adminOrHigher: true },
            ]
        },
        {
            title: "Desarrollo",
            items: [
                { path: "/demo", icon: "fas fa-code", label: "Demo", requireAuth: false }
            ]
        }
    ];

    const handleLogout = () => {
        logout();
    };

    // Filter navigation sections based on authentication status and role
    const filteredSections = navigationSections.map(section => ({
        ...section,
        items: section.items.filter(item => {
            if (item.requireAuth && !isAuthenticated) {
                return false;
            }
            if (item.superAdminOnly && (!user?.role || user.role !== 'super_admin')) {
                return false;
            }
            if (item.adminOrHigher && (!user?.role || !['admin', 'admin_rh', 'admin_finanzas', 'super_admin'].includes(user.role))) {
                return false;
            }
            if (item.hrOrHigher && (!user?.role || !['admin_rh', 'admin', 'super_admin'].includes(user.role))) {
                return false;
            }
            if (item.financieroOnly && (!user?.role || !['admin_finanzas', 'admin', 'super_admin'].includes(user.role))) {
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
            {/* Simplified Professional Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${isCollapsed ? 'w-16' : 'w-64'
                }`}>

                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-laptop-code text-white"></i>
                            </div>
                            {!isCollapsed && (
                                <div className="text-white">
                                    <h1 className="font-bold text-lg">Informática IT</h1>
                                    <p className="text-xs text-blue-100">Sistema de Gestión</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {!isCollapsed && isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="text-white/80 hover:text-white p-2 rounded transition-colors"
                                    title="Cerrar sesión"
                                >
                                    <i className="fas fa-sign-out-alt text-sm"></i>
                                </button>
                            )}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="text-white/80 hover:text-white p-2 rounded transition-colors"
                                title={isCollapsed ? "Expandir" : "Contraer"}
                            >
                                <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {filteredSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-6">
                            {/* Section Headers */}
                            {!isCollapsed && (
                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {section.title}
                                </h3>
                            )}

                            {/* Menu Items */}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = isActivePath(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                            title={isCollapsed ? item.label : ''}
                                        >
                                            <i className={`${item.icon} ${isCollapsed ? 'text-lg' : 'mr-3 text-sm'} ${isActive ? 'text-blue-700' : 'text-gray-400'
                                                }`}></i>
                                            {!isCollapsed && (
                                                <span className="truncate">{item.label}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Section */}
                {isAuthenticated && user && (
                    <div className="p-4 border-t border-gray-200">
                        {!isCollapsed ? (
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {(user.full_name || user.name || user.username || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.full_name || user.name || user.username}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user.role?.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {(user.full_name || user.name || user.username || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Toggle button cuando está colapsado */}
            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="fixed left-4 top-4 z-50 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
                    title="Expandir menú"
                >
                    <i className="fas fa-bars text-sm"></i>
                </button>
            )}

            {/* Mobile overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;