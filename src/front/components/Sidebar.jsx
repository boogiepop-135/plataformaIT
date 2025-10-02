import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();
    const [collapsedSections, setCollapsedSections] = useState({});

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

    const toggleSection = (sectionTitle) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionTitle]: !prev[sectionTitle]
        }));
    };

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
            {/* Ultra-Modern Professional Sidebar */}
            <div className={`fixed left-0 top-0 h-full glass-effect shadow-2xl border-r border-gray-200/30 transition-all duration-500 ease-out z-50 ${
                isCollapsed ? 'w-16' : 'w-72'
            } backdrop-blur-xl`}>

                {/* Modern Logo Header */}
                <div className="p-6 border-b border-white/20 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all duration-300">
                                    <i className="fas fa-laptop-code text-white text-lg group-hover:scale-110 transition-transform duration-300"></i>
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            </div>
                            {!isCollapsed && (
                                <div className="text-white">
                                    <h1 className="font-bold text-xl tracking-tight">Informática IT</h1>
                                    <p className="text-white/70 text-sm font-medium">Sistema de Gestión Profesional</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-3">
                            {!isCollapsed && isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="text-white/80 hover:text-white hover:bg-red-500/20 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 group"
                                    title="Cerrar sesión"
                                >
                                    <i className="fas fa-sign-out-alt text-sm group-hover:rotate-12 transition-transform duration-300"></i>
                                </button>
                            )}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 group"
                                title={isCollapsed ? "Expandir" : "Contraer"}
                            >
                                <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm group-hover:scale-125 transition-all duration-300`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Professional Navigation Menu */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 space-y-2">
                    {filteredSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-2">
                            {/* Professional Section Headers */}
                            {!isCollapsed && (
                                <div className="flex items-center justify-between px-3 py-2 group cursor-pointer"
                                     onClick={() => toggleSection(section.title)}>
                                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors duration-300">
                                        {section.title}
                                    </h3>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                                        <i className={`fas fa-chevron-${collapsedSections[section.title] ? 'right' : 'down'} text-xs text-white transition-transform duration-300`}></i>
                                    </div>
                                </div>
                            )}

                            {/* Professional Menu Items */}
                            <div className={`space-y-1 transition-all duration-500 ${!isCollapsed && collapsedSections[section.title] ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-none opacity-100'}`}>
                                {section.items.map((item) => {
                                    const isActive = isActivePath(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-md shadow-indigo-500/10 border border-indigo-100'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                            }`}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"></div>
                                            )}

                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${
                                                isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-500'
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
                </nav>

                {/* Bottom User Section */}
                {isAuthenticated && user && (
                    <div className="p-4 border-t border-gray-200/50 mt-auto">
                        {!isCollapsed ? (
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white font-semibold text-sm">
                                            {(user.full_name || user.name || user.username || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {user.full_name || user.name || user.username}
                                        </p>
                                        <p className="text-xs text-gray-600 capitalize">
                                            {user.role?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md group cursor-pointer hover:scale-110 transition-transform duration-300">
                                    <span className="text-white font-semibold text-sm">
                                        {(user.full_name || user.name || user.username || 'U').charAt(0).toUpperCase()}
                                    </span>
                                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                        <div>
                                            <div className="font-semibold">{user.full_name || user.name || user.username}</div>
                                            <div className="text-xs text-gray-300 capitalize">{user.role?.replace('_', ' ')}</div>
                                        </div>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;