import React from "react";
import { useAuth } from "../hooks/useAuth.jsx";

export const ProtectedRoute = ({ children, requireAuth = true, fallback = null }) => {
    const { isAuthenticated } = useAuth();

    if (requireAuth && !isAuthenticated) {
        return fallback || <AuthRequired />;
    }

    return children;
};

export const AuthRequired = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <i className="fas fa-shield-alt text-white text-3xl"></i>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Acceso Restringido
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    Esta sección requiere autenticación administrativa.
                    Por favor, inicia sesión para acceder a esta funcionalidad.
                </p>



                <button
                    onClick={() => document.dispatchEvent(new CustomEvent('showLogin'))}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2 mx-auto"
                >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Iniciar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // Si está autenticado, mostrar contenido público limitado
    if (isAuthenticated) {
        return children;
    }

    // Si no está autenticado, mostrar contenido público básico
    return (
        <div className="min-h-[60vh]">
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
                <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-laptop-code text-2xl"></i>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
                        Plataforma IT
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
                        Sistema integral de gestión para equipos de IT. Para acceder a las funcionalidades completas,
                        inicia sesión con credenciales administrativas.
                    </p>



                    <button
                        onClick={() => document.dispatchEvent(new CustomEvent('showLogin'))}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-3 mx-auto"
                    >
                        <i className="fas fa-shield-alt text-xl"></i>
                        <span>Acceder al Sistema</span>
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {/* Funcionalidades disponibles (solo información) */}
            <div className="px-6 py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Funcionalidades del Sistema
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "fas fa-ticket-alt",
                                title: "Sistema de Tickets",
                                description: "Gestión completa de tickets de soporte con exportación PDF/Excel",
                                color: "from-orange-500 to-red-500"
                            },
                            {
                                icon: "fas fa-th",
                                title: "Matrices de Análisis",
                                description: "Matrices RACI, SWOT y análisis estratégico con exportación",
                                color: "from-purple-500 to-pink-500"
                            },
                            {
                                icon: "fas fa-book",
                                title: "Bitácora de Actividades",
                                description: "Registro detallado de actividades con filtros avanzados",
                                color: "from-green-500 to-teal-500"
                            },
                            {
                                icon: "fas fa-calendar-alt",
                                title: "Gestión de Calendario",
                                description: "Programación de eventos y gestión de tiempo",
                                color: "from-blue-500 to-indigo-500"
                            },
                            {
                                icon: "fas fa-columns",
                                title: "Tablero Kanban",
                                description: "Gestión visual de tareas y proyectos",
                                color: "from-cyan-500 to-blue-500"
                            },
                            {
                                icon: "fas fa-chart-bar",
                                title: "Dashboard Analítico",
                                description: "Métricas y estadísticas del sistema en tiempo real",
                                color: "from-yellow-500 to-orange-500"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className={`bg-gradient-to-r ${feature.color} p-6 text-white`}>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                        <i className={`${feature.icon} text-xl`}></i>
                                    </div>
                                    <h3 className="text-lg font-bold">{feature.title}</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600">{feature.description}</p>
                                    <div className="mt-4 text-sm text-gray-500 flex items-center space-x-2">
                                        <i className="fas fa-lock"></i>
                                        <span>Requiere autenticación</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};