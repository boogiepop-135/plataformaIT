import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../config/backend.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

export const TicketSystem = () => {
    const { isAuthenticated, token, user, getAuthHeaders } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({
        title: "",
        description: "",
        status: "open",
        priority: "medium",
        requester_name: "",
        requester_email: ""
    });
    const [editingTicket, setEditingTicket] = useState(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [filter, setFilter] = useState("all");
    const [exportLoading, setExportLoading] = useState(false);

    // Opciones para los selects
    const statusOptions = [
        { value: "open", label: "Abierto" },
        { value: "in_progress", label: "En Progreso" },
        { value: "resolved", label: "Resuelto" },
        { value: "closed", label: "Cerrado" }
    ];

    const priorityOptions = [
        { value: "low", label: "Baja" },
        { value: "medium", label: "Media" },
        { value: "high", label: "Alta" },
        { value: "urgent", label: "Urgente" }
    ];

    // Cargar tickets al montar el componente
    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/tickets`);
            if (response.ok) {
                const data = await response.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Error loading tickets:", error);
        }
    };

    const handleSaveTicket = async () => {
        try {
            const url = editingTicket
                ? `${BACKEND_URL}/api/tickets/${editingTicket.id}`
                : `${BACKEND_URL}/api/tickets`;

            const method = editingTicket ? "PUT" : "POST";

            // Para editar tickets, se requiere autenticación
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token && editingTicket) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(newTicket)
            });

            if (response.ok) {
                loadTickets();
                setShowTicketModal(false);
                setEditingTicket(null);
                setNewTicket({
                    title: "",
                    description: "",
                    status: "open",
                    priority: "medium",
                    requester_name: "",
                    requester_email: ""
                });
            } else if (response.status === 401) {
                alert("Se requiere autenticación administrativa para editar tickets.");
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Error al guardar el ticket'}`);
            }
        } catch (error) {
            console.error("Error saving ticket:", error);
            alert("Error de conexión al guardar el ticket");
        }
    };

    const handleEditTicket = (ticket) => {
        if (!token) {
            alert("Se requiere autenticación administrativa para editar tickets.");
            return;
        }
        setEditingTicket(ticket);
        setNewTicket({
            title: ticket.title,
            description: ticket.description || "",
            status: ticket.status,
            priority: ticket.priority,
            requester_name: ticket.requester_name || "",
            requester_email: ticket.requester_email || ""
        });
        setShowTicketModal(true);
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!token) {
            alert("Se requiere autenticación administrativa para eliminar tickets.");
            return;
        }

        if (confirm("¿Estás seguro de que quieres eliminar este ticket?")) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    loadTickets();
                } else {
                    alert("Se requiere autenticación administrativa para eliminar tickets.");
                }
            } catch (error) {
                console.error("Error deleting ticket:", error);
                alert("Error de conexión al eliminar el ticket");
            }
        }
    };

    const getFilteredTickets = () => {
        if (filter === "all") return tickets;
        return tickets.filter(ticket => ticket.status === filter);
    };

    const exportToExcel = async () => {
        if (!token) {
            alert("Se requiere autenticación administrativa para exportar datos.");
            return;
        }

        setExportLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/tickets/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'tickets.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Error al exportar tickets');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al exportar Excel');
        } finally {
            setExportLoading(false);
        }
    };

    const getTicketStats = () => {
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            in_progress: tickets.filter(t => t.status === 'in_progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length
        };
    };

    const getPriorityInfo = (priority) => {
        const priorityMap = {
            low: { label: "Baja", class: "success", icon: "fa-arrow-down" },
            medium: { label: "Media", class: "warning", icon: "fa-minus" },
            high: { label: "Alta", class: "danger", icon: "fa-arrow-up" },
            urgent: { label: "Urgente", class: "danger", icon: "fa-exclamation-triangle" }
        };
        return priorityMap[priority] || priorityMap.medium;
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            open: { label: "Abierto", class: "primary", icon: "fa-folder-open" },
            in_progress: { label: "En Progreso", class: "warning", icon: "fa-spinner" },
            resolved: { label: "Resuelto", class: "success", icon: "fa-check-circle" },
            closed: { label: "Cerrado", class: "secondary", icon: "fa-times-circle" }
        };
        return statusMap[status] || statusMap.open;
    };

    const stats = getTicketStats();

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
                {/* Ultra Professional Header with Glassmorphism */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-2xl">
                    <div className="px-6 py-12">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                            <i className="fas fa-ticket-alt text-white text-3xl"></i>
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                                            Sistema de <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Tickets</span>
                                        </h1>
                                        <p className="text-blue-200 text-lg font-medium">Gestión profesional de solicitudes de soporte técnico</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                                        onClick={exportToExcel}
                                        disabled={exportLoading}
                                    >
                                        <i className={`fas ${exportLoading ? 'fa-spinner fa-spin' : 'fa-file-excel'}`}></i>
                                        <span>{exportLoading ? 'Exportando...' : 'Exportar Excel'}</span>
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                                        onClick={() => setShowTicketModal(true)}
                                    >
                                        <i className="fas fa-plus text-xl"></i>
                                        <span>Nuevo Ticket</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {tickets.length > 0 ? (
                        <>
                            {/* Ultra Professional Stats Dashboard */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                                {/* Total Tickets */}
                                <div className="relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
                                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:scale-105 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-clipboard-list text-white text-xl"></i>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-800">{stats.total}</p>
                                                <p className="text-sm font-semibold text-gray-500">Total</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">Todos los tickets</p>
                                    </div>
                                </div>

                                {/* Open Tickets */}
                                <div className="relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl"></div>
                                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 transform hover:scale-105 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-folder-open text-white text-xl"></i>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-800">{stats.open}</p>
                                                <p className="text-sm font-semibold text-gray-500">Abiertos</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">{stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0}% del total</p>
                                    </div>
                                </div>

                                {/* In Progress */}
                                <div className="relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
                                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 transform hover:scale-105 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-spinner text-white text-xl"></i>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-800">{stats.in_progress}</p>
                                                <p className="text-sm font-semibold text-gray-500">En Progreso</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full" style={{ width: `${stats.total > 0 ? (stats.in_progress / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">{stats.total > 0 ? Math.round((stats.in_progress / stats.total) * 100) : 0}% del total</p>
                                    </div>
                                </div>

                                {/* Resolved */}
                                <div className="relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
                                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-500 transform hover:scale-105 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-check-circle text-white text-xl"></i>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-800">{stats.resolved}</p>
                                                <p className="text-sm font-semibold text-gray-500">Resueltos</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% del total</p>
                                    </div>
                                </div>

                                {/* Closed */}
                                <div className="relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-3xl blur-xl"></div>
                                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-gray-500/10 transition-all duration-500 transform hover:scale-105 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-times-circle text-white text-xl"></i>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-800">{stats.closed}</p>
                                                <p className="text-sm font-semibold text-gray-500">Cerrados</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-gray-500 to-slate-600 h-2 rounded-full" style={{ width: `${stats.total > 0 ? (stats.closed / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">{stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}% del total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ultra Professional Filter Pills */}
                            <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
                                {[
                                    { key: "all", label: "Todos", count: stats.total, color: "from-slate-600 to-gray-700", icon: "fa-layer-group" },
                                    { key: "open", label: "Abiertos", count: stats.open, color: "from-blue-500 to-indigo-600", icon: "fa-folder-open" },
                                    { key: "in_progress", label: "En Progreso", count: stats.in_progress, color: "from-amber-500 to-orange-600", icon: "fa-spinner" },
                                    { key: "resolved", label: "Resueltos", count: stats.resolved, color: "from-green-500 to-emerald-600", icon: "fa-check-circle" },
                                    { key: "closed", label: "Cerrados", count: stats.closed, color: "from-gray-500 to-slate-600", icon: "fa-times-circle" }
                                ].map(item => (
                                    <button
                                        key={item.key}
                                        className={`relative overflow-hidden px-6 py-3 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 ${filter === item.key
                                                ? `bg-gradient-to-r ${item.color} shadow-xl scale-105`
                                                : 'bg-white/80 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                                            }`}
                                        onClick={() => setFilter(item.key)}
                                    >
                                        <i className={`fas ${item.icon} ${filter === item.key ? 'text-white' : 'text-gray-600'}`}></i>
                                        <span>{item.label}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${filter === item.key
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                            }`}>
                                            {item.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Ultra Professional Tickets Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {getFilteredTickets().map(ticket => {
                                    const priorityInfo = getPriorityInfo(ticket.priority);
                                    const statusInfo = getStatusInfo(ticket.status);
                                    const priorityColors = {
                                        low: 'from-green-500 to-emerald-500',
                                        medium: 'from-yellow-500 to-amber-500',
                                        high: 'from-orange-500 to-red-500',
                                        urgent: 'from-red-600 to-pink-600'
                                    };
                                    const statusColors = {
                                        open: 'from-blue-500 to-indigo-500',
                                        in_progress: 'from-amber-500 to-orange-500',
                                        resolved: 'from-green-500 to-emerald-500',
                                        closed: 'from-gray-500 to-slate-500'
                                    };

                                    return (
                                        <div key={ticket.id} className="group relative">
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                                            <div className="relative bg-white/90 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:scale-105 overflow-hidden">
                                                {/* Header with Gradient */}
                                                <div className={`bg-gradient-to-r ${statusColors[ticket.status]} p-6 relative overflow-hidden`}>
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                                                    <div className="relative flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                                                {ticket.title}
                                                            </h3>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white flex items-center">
                                                                    <i className={`fas ${statusInfo.icon} mr-2`}></i>
                                                                    {statusInfo.label}
                                                                </span>
                                                                <span className={`px-3 py-1 bg-gradient-to-r ${priorityColors[ticket.priority]} rounded-full text-xs font-semibold text-white flex items-center`}>
                                                                    <i className={`fas ${priorityInfo.icon} mr-2`}></i>
                                                                    {priorityInfo.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-white/80 text-right">
                                                            <p className="text-sm font-semibold">#{ticket.id}</p>
                                                            <p className="text-xs">
                                                                {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6">
                                                    {ticket.description && (
                                                        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                                                            {ticket.description}
                                                        </p>
                                                    )}

                                                    {(ticket.requester_name || ticket.requester_email) && (
                                                        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Solicitante</h4>
                                                            {ticket.requester_name && (
                                                                <p className="text-sm font-semibold text-gray-800 flex items-center">
                                                                    <i className="fas fa-user text-gray-400 mr-2"></i>
                                                                    {ticket.requester_name}
                                                                </p>
                                                            )}
                                                            {ticket.requester_email && (
                                                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                                                    <i className="fas fa-envelope text-gray-400 mr-2"></i>
                                                                    {ticket.requester_email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    {token && (
                                                        <div className="flex gap-3">
                                                            <button
                                                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
                                                                onClick={() => handleEditTicket(ticket)}
                                                            >
                                                                <i className="fas fa-edit text-sm"></i>
                                                                <span>Editar</span>
                                                            </button>
                                                            <button
                                                                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2"
                                                                onClick={() => handleDeleteTicket(ticket.id)}
                                                            >
                                                                <i className="fas fa-trash text-sm"></i>
                                                                <span>Eliminar</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        /* Ultra Professional Empty State */
                        <div className="text-center py-20">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-2xl">
                                    <i className="fas fa-ticket-alt text-gray-400 text-4xl"></i>
                                </div>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                {filter !== 'all'
                                    ? `No hay tickets ${getStatusInfo(filter).label.toLowerCase()}`
                                    : 'No hay tickets disponibles'
                                }
                            </h3>
                            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                {filter !== 'all'
                                    ? `Actualmente no existen tickets con estado "${getStatusInfo(filter).label.toLowerCase()}".`
                                    : 'Comienza creando tu primer ticket para gestionar solicitudes de soporte.'
                                }
                            </p>
                            <button
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto"
                                onClick={() => setShowTicketModal(true)}
                            >
                                <i className="fas fa-plus"></i>
                                <span>Crear Primer Ticket</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Ultra Professional Modal */}
                {showTicketModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="relative w-full max-w-4xl">
                            {/* Background glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>

                            <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                                {/* Header with gradient */}
                                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 py-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                <i className={`fas ${editingTicket ? 'fa-edit' : 'fa-plus'} text-white text-xl`}></i>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">
                                                    {editingTicket ? "Editar Ticket" : "Nuevo Ticket"}
                                                </h2>
                                                <p className="text-blue-200 text-sm">
                                                    {editingTicket ? `Modificando ticket #${editingTicket.id}` : "Crear una nueva solicitud de soporte"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                                            onClick={() => {
                                                setShowTicketModal(false);
                                                setEditingTicket(null);
                                                setNewTicket({
                                                    title: "",
                                                    description: "",
                                                    status: "open",
                                                    priority: "medium",
                                                    requester_name: "",
                                                    requester_email: ""
                                                });
                                            }}
                                        >
                                            <i className="fas fa-times text-lg"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 max-h-[70vh] overflow-y-auto">
                                    <form className="space-y-6">
                                        {/* Title Input */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-800 flex items-center">
                                                <i className="fas fa-heading text-blue-600 mr-2"></i>
                                                Título del Ticket *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400"
                                                placeholder="Describe brevemente el problema o solicitud..."
                                                value={newTicket.title}
                                                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-800 flex items-center">
                                                <i className="fas fa-align-left text-purple-600 mr-2"></i>
                                                Descripción Detallada
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 text-gray-800 resize-none placeholder-gray-400"
                                                rows="4"
                                                placeholder="Proporciona todos los detalles relevantes sobre el ticket..."
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                            ></textarea>
                                        </div>

                                        {/* Status and Priority */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-800 flex items-center">
                                                    <i className="fas fa-flag text-amber-600 mr-2"></i>
                                                    Estado
                                                </label>
                                                <select
                                                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 text-gray-800 font-medium"
                                                    value={newTicket.status}
                                                    onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-800 flex items-center">
                                                    <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                                                    Prioridad
                                                </label>
                                                <select
                                                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 text-gray-800 font-medium"
                                                    value={newTicket.priority}
                                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                >
                                                    {priorityOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Requester Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-800 flex items-center">
                                                    <i className="fas fa-user text-green-600 mr-2"></i>
                                                    Nombre del Solicitante
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400"
                                                    placeholder="Nombre completo..."
                                                    value={newTicket.requester_name}
                                                    onChange={(e) => setNewTicket({ ...newTicket, requester_name: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-800 flex items-center">
                                                    <i className="fas fa-envelope text-indigo-600 mr-2"></i>
                                                    Email del Solicitante
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400"
                                                    placeholder="correo@empresa.com"
                                                    value={newTicket.requester_email}
                                                    onChange={(e) => setNewTicket({ ...newTicket, requester_email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row gap-4 sm:justify-end">
                                    <button
                                        type="button"
                                        className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                                        onClick={() => {
                                            setShowTicketModal(false);
                                            setEditingTicket(null);
                                            setNewTicket({
                                                title: "",
                                                description: "",
                                                status: "open",
                                                priority: "medium",
                                                requester_name: "",
                                                requester_email: ""
                                            });
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                        <span>Cancelar</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-8 py-3 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2 ${!newTicket.title
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'
                                            }`}
                                        onClick={handleSaveTicket}
                                        disabled={!newTicket.title}
                                    >
                                        <i className={`fas ${editingTicket ? 'fa-save' : 'fa-plus'}`}></i>
                                        <span>{editingTicket ? "Actualizar" : "Crear"} Ticket</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default TicketSystem;