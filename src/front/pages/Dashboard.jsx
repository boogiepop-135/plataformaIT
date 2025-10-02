import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import BACKEND_URL from '../config/backend.js';

const Dashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTickets: 0,
        pendingTickets: 0,
        completedTickets: 0,
        totalEvents: 0,
        todayEvents: 0,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchDashboardData();
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Simular datos del dashboard
            // En producción, esto vendría de APIs reales
            setTimeout(() => {
                setStats({
                    totalUsers: 156,
                    totalTickets: 1847,
                    pendingTickets: 23,
                    completedTickets: 1789,
                    totalEvents: 45,
                    todayEvents: 3,
                    recentActivities: [
                        {
                            id: 1,
                            type: 'ticket',
                            title: 'Ticket #1234 completado',
                            user: 'María González',
                            time: new Date(Date.now() - 5 * 60 * 1000),
                            icon: 'fa-check-circle',
                            color: 'text-green-600'
                        },
                        {
                            id: 2,
                            type: 'user',
                            title: 'Nuevo usuario registrado',
                            user: 'Carlos Ruiz',
                            time: new Date(Date.now() - 15 * 60 * 1000),
                            icon: 'fa-user-plus',
                            color: 'text-blue-600'
                        },
                        {
                            id: 3,
                            type: 'event',
                            title: 'Reunión de equipo programada',
                            user: 'Admin',
                            time: new Date(Date.now() - 30 * 60 * 1000),
                            icon: 'fa-calendar-alt',
                            color: 'text-purple-600'
                        },
                        {
                            id: 4,
                            type: 'ticket',
                            title: 'Ticket #1235 creado',
                            user: 'Ana Martínez',
                            time: new Date(Date.now() - 45 * 60 * 1000),
                            icon: 'fa-plus-circle',
                            color: 'text-orange-600'
                        }
                    ]
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTimeAgo = (date) => {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours}h`;
        return date.toLocaleDateString('es-ES');
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {getGreeting()}, {user?.full_name || user?.name || 'Usuario'}
                            </h1>
                            <p className="text-gray-600 text-lg capitalize">
                                {formatDate(currentTime)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-indigo-600">
                                {formatTime(currentTime)}
                            </div>
                            <div className="text-sm text-gray-500 font-medium">
                                Hora del sistema
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="stats-card bg-gradient-to-r from-blue-600 to-cyan-600 animate-fadeIn">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
                                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                                </div>
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i className="fas fa-users text-white text-2xl"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-blue-100 text-sm">
                                <i className="fas fa-arrow-up mr-1"></i>
                                <span>12% desde el mes pasado</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-card bg-gradient-to-r from-green-600 to-emerald-600 animate-fadeIn animate-delay-100">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Tickets Completados</p>
                                    <p className="text-3xl font-bold text-white">{stats.completedTickets}</p>
                                </div>
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i className="fas fa-check-circle text-white text-2xl"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-green-100 text-sm">
                                <i className="fas fa-arrow-up mr-1"></i>
                                <span>8% desde la semana pasada</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-card bg-gradient-to-r from-orange-600 to-amber-600 animate-fadeIn animate-delay-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Tickets Pendientes</p>
                                    <p className="text-3xl font-bold text-white">{stats.pendingTickets}</p>
                                </div>
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i className="fas fa-clock text-white text-2xl"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-orange-100 text-sm">
                                <i className="fas fa-arrow-down mr-1"></i>
                                <span>3% menos que ayer</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-card bg-gradient-to-r from-purple-600 to-indigo-600 animate-fadeIn animate-delay-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Eventos Hoy</p>
                                    <p className="text-3xl font-bold text-white">{stats.todayEvents}</p>
                                </div>
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i className="fas fa-calendar-day text-white text-2xl"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-purple-100 text-sm">
                                <i className="fas fa-calendar mr-1"></i>
                                <span>{stats.totalEvents} este mes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <div className="card animate-fadeIn animate-delay-200">
                            <div className="card-header">
                                <h2 className="text-xl font-semibold flex items-center gap-3">
                                    <i className="fas fa-activity"></i>
                                    Actividad Reciente
                                </h2>
                            </div>
                            <div className="card-body p-0">
                                <div className="divide-y divide-gray-200">
                                    {stats.recentActivities.map((activity, index) => (
                                        <div 
                                            key={activity.id} 
                                            className="p-6 hover:bg-gray-50 transition-colors duration-200 animate-slideInUp"
                                            style={{animationDelay: `${index * 100}ms`}}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                                                    <i className={`fas ${activity.icon} ${activity.color}`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                            {getTimeAgo(activity.time)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Por {activity.user}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-gray-50">
                                    <button className="btn btn-outline-primary w-full">
                                        <i className="fas fa-history mr-2"></i>
                                        Ver todo el historial
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Info */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="card animate-fadeIn animate-delay-300">
                            <div className="card-header">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <i className="fas fa-bolt"></i>
                                    Acciones Rápidas
                                </h3>
                            </div>
                            <div className="card-body space-y-3">
                                <button className="btn btn-primary w-full justify-start">
                                    <i className="fas fa-plus mr-3"></i>
                                    Crear Ticket
                                </button>
                                <button className="btn btn-outline-primary w-full justify-start">
                                    <i className="fas fa-calendar-plus mr-3"></i>
                                    Nuevo Evento
                                </button>
                                <button className="btn btn-outline-primary w-full justify-start">
                                    <i className="fas fa-user-plus mr-3"></i>
                                    Añadir Usuario
                                </button>
                                <button className="btn btn-outline-primary w-full justify-start">
                                    <i className="fas fa-chart-bar mr-3"></i>
                                    Ver Reportes
                                </button>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="card animate-fadeIn animate-delay-400">
                            <div className="card-header">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <i className="fas fa-server"></i>
                                    Estado del Sistema
                                </h3>
                            </div>
                            <div className="card-body space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Servidor</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-green-600">En línea</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Base de datos</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-green-600">Conectada</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Último backup</span>
                                    <span className="text-sm text-gray-600">Hace 2h</span>
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Uso de CPU</span>
                                        <span className="font-medium">23%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{width: '23%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Memoria RAM</span>
                                        <span className="font-medium">45%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div className="bg-green-600 h-2 rounded-full transition-all duration-1000" style={{width: '45%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weather Widget (Simulado) */}
                        <div className="card animate-fadeIn animate-delay-500">
                            <div className="card-body text-center">
                                <div className="text-4xl mb-2">🌤️</div>
                                <h4 className="font-semibold text-gray-900">República Dominicana</h4>
                                <p className="text-2xl font-bold text-gray-900">28°C</p>
                                <p className="text-sm text-gray-600">Parcialmente nublado</p>
                                <p className="text-xs text-gray-500 mt-2">Actualizado hace 10 min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;