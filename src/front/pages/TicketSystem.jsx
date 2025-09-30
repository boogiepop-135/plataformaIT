import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../config/backend.js";
import { useAuth } from "../hooks/useGlobalReducer.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

export const TicketSystem = () => {
    const { auth, user } = useAuth();
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

            if (auth.token && editingTicket) {
                headers['Authorization'] = `Bearer ${auth.token}`;
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
        setEditingTicket(ticket);
        setNewTicket({
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            requester_name: ticket.requester_name || "",
            requester_email: ticket.requester_email || ""
        });
        setShowTicketModal(true);
    };

    const handleDeleteTicket = async (ticketId) => {
        if (confirm("¿Estás seguro de que quieres eliminar este ticket?")) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}`, {
                    method: "DELETE",
                    headers: getAuthHeaders(), // Requiere autenticación para eliminar
                });

                if (response.ok) {
                    loadTickets();
                } else if (response.status === 401) {
                    alert("Se requiere autenticación administrativa para eliminar tickets.");
                }
            } catch (error) {
                console.error("Error deleting ticket:", error);
            }
        }
    };

    const getFilteredTickets = () => {
        if (filter === "all") return tickets;
        return tickets.filter(ticket => ticket.status === filter);
    };

    const getStatusInfo = (status) => {
        return statusOptions.find(option => option.value === status) || statusOptions[0];
    };

    const getPriorityInfo = (priority) => {
        return priorityOptions.find(option => option.value === priority) || priorityOptions[1];
    };

    const getTicketStats = () => {
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in_progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length
        };
    };

    const stats = getTicketStats();

    const handleExportPDF = async () => {
        if (!isAuthenticated) {
            alert('Debe estar autenticado para exportar');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/tickets/export/pdf`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tickets_export_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Error al exportar PDF');
            }
        } catch (error) {
            alert('Error de conexión al exportar PDF');
        }
    };

    const handleExportExcel = async () => {
        if (!isAuthenticated) {
            alert('Debe estar autenticado para exportar');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/tickets/export/excel`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tickets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Error al exportar Excel');
            }
        } catch (error) {
            alert('Error de conexión al exportar Excel');
        }
    };

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
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
                                            Sistema de Tickets
                                        </h1>
                                        <p className="text-blue-200 text-lg font-medium mt-2 flex items-center">
                                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                                            Centro de gestión empresarial avanzado
                                        </p>
                                        <div className="flex items-center space-x-4 mt-4">
                                            <div className="flex items-center text-blue-300 text-sm">
                                                <i className="fas fa-clock mr-2"></i>
                                                Actualizado: {new Date().toLocaleTimeString()}
                                            </div>
                                            <div className="flex items-center text-blue-300 text-sm">
                                                <i className="fas fa-chart-line mr-2"></i>
                                                {tickets.length} tickets registrados
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    {isAuthenticated && (
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="fas fa-download text-lg"></i>
                                                <span>Exportar</span>
                                                <i className="fas fa-chevron-down text-xs ml-2 transition-transform group-hover:rotate-180"></i>
                                            </button>
                                            <ul className="dropdown-menu mt-2 border-0 shadow-2xl bg-white/95 backdrop-blur-lg rounded-2xl p-2 min-w-[200px]">
                                                <li>
                                                    <button
                                                        className="dropdown-item rounded-xl p-3 hover:bg-red-50 transition-colors duration-200 flex items-center w-full"
                                                        onClick={handleExportPDF}
                                                    >
                                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                            <i className="fas fa-file-pdf text-red-600"></i>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">Exportar PDF</div>
                                                            <div className="text-xs text-gray-500">Reporte completo</div>
                                                        </div>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        className="dropdown-item rounded-xl p-3 hover:bg-green-50 transition-colors duration-200 flex items-center w-full"
                                                        onClick={handleExportExcel}
                                                    >
                                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                            <i className="fas fa-file-excel text-green-600"></i>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">Exportar Excel</div>
                                                            <div className="text-xs text-gray-500">Hoja de cálculo</div>
                                                        </div>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    <button
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                                        onClick={() => setShowTicketModal(true)}
                                    >
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                            <i className="fas fa-plus text-sm"></i>
                                        </div>
                                        <span>Nuevo Ticket</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-8">
                    <div className="max-w-7xl mx-auto">

                        {/* Ultra Professional Stats Dashboard */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                                            <i className="fas fa-chart-bar text-white text-xl"></i>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-800">{stats.total}</div>
                                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                            <i className="fas fa-folder-open text-white text-xl"></i>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-800">{stats.open}</div>
                                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Abiertos</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                                            <i className="fas fa-clock text-white text-xl"></i>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-800">{stats.inProgress}</div>
                                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">En Progreso</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                                            <i className="fas fa-check-circle text-white text-xl"></i>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-800">{stats.resolved}</div>
                                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Resueltos</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl shadow-lg">
                                            <i className="fas fa-archive text-white text-xl"></i>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-800">{stats.closed}</div>
                                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Cerrados</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-gray-500 to-slate-600 rounded-full" style={{ width: `${stats.total > 0 ? (stats.closed / stats.total) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filter Pills */}
                        <div className="mb-8">
                            <div className="flex flex-wrap gap-3 p-2 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
                                <button
                                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${filter === 'all'
                                            ? 'bg-slate-800 text-white shadow-xl shadow-slate-800/25'
                                            : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-lg'
                                        }`}
                                    onClick={() => setFilter('all')}
                                >
                                    <i className="fas fa-list-ul"></i>
                                    <span>Todos</span>
                                    <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full ml-2">{stats.total}</span>
                                </button>

                                <button
                                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${filter === 'open'
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/25'
                                            : 'bg-white/80 text-gray-700 hover:bg-blue-50 hover:shadow-lg'
                                        }`}
                                    onClick={() => setFilter('open')}
                                >
                                    <i className="fas fa-folder-open"></i>
                                    <span>Abiertos</span>
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">{stats.open}</span>
                                </button>

                                <button
                                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${filter === 'in_progress'
                                            ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/25'
                                            : 'bg-white/80 text-gray-700 hover:bg-amber-50 hover:shadow-lg'
                                        }`}
                                    onClick={() => setFilter('in_progress')}
                                >
                                    <i className="fas fa-clock"></i>
                                    <span>En Progreso</span>
                                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full ml-2">{stats.inProgress}</span>
                                </button>

                                <button
                                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${filter === 'resolved'
                                            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/25'
                                            : 'bg-white/80 text-gray-700 hover:bg-emerald-50 hover:shadow-lg'
                                        }`}
                                    onClick={() => setFilter('resolved')}
                                >
                                    <i className="fas fa-check-circle"></i>
                                    <span>Resueltos</span>
                                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full ml-2">{stats.resolved}</span>
                                </button>

                                <button
                                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${filter === 'closed'
                                            ? 'bg-gray-600 text-white shadow-xl shadow-gray-600/25'
                                            : 'bg-white/80 text-gray-700 hover:bg-gray-50 hover:shadow-lg'
                                        }`}
                                    onClick={() => setFilter('closed')}
                                >
                                    <i className="fas fa-archive"></i>
                                    <span>Cerrados</span>
                                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full ml-2">{stats.closed}</span>
                                </button>
                            </div>
                        </div>
                    </div>
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
                                {/* Background glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${priorityColors[ticket.priority]} rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>

                                <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                                    {/* Header with gradient */}
                                    <div className={`bg-gradient-to-r ${statusColors[ticket.status]} p-6 text-white relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                                        <div className="relative flex justify-between items-start">
                                            <div>
                                                <div className="text-white/80 text-sm font-medium mb-1">Ticket</div>
                                                <div className="text-2xl font-black">#{ticket.id}</div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className={`bg-gradient-to-r ${priorityColors[ticket.priority]} px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg`}>
                                                    {priorityInfo.label}
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                                                    {statusInfo.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 leading-tight">
                                            {ticket.title}
                                        </h3>

                                        {ticket.description && (
                                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {ticket.description}
                                            </p>
                                        )}

                                        {/* Info cards */}
                                        <div className="space-y-3 mb-6">
                                            {ticket.requester_name && (
                                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <i className="fas fa-user text-blue-600 text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500">Solicitante</div>
                                                        <div className="text-sm font-semibold text-gray-800">{ticket.requester_name}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {ticket.requester_email && (
                                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <i className="fas fa-envelope text-purple-600 text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500">Email</div>
                                                        <div className="text-sm font-semibold text-gray-800 truncate">{ticket.requester_email}</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <i className="fas fa-calendar text-green-600 text-xs"></i>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-500">Creado</div>
                                                    <div className="text-sm font-semibold text-gray-800">
                                                        {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="px-6 pb-6">
                                        <div className="flex gap-3">
                                            <AuthProtectedAction
                                                loginButtonText="Editar"
                                                loginButtonClass="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
                                            >
                                                <button
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
                                                    onClick={() => handleEditTicket(ticket)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    <span>Editar</span>
                                                </button>
                                            </AuthProtectedAction>

                                            <AuthProtectedAction
                                                loginButtonText="Eliminar"
                                                loginButtonClass="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2"
                                            >
                                                <button
                                                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2"
                                                    onClick={() => handleDeleteTicket(ticket.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    <span>Eliminar</span>
                                                </button>
                                            </AuthProtectedAction>
                                        </div>

                                        {!isAuthenticated && (
                                            <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                                                <div className="flex items-center space-x-2">
                                                    <i className="fas fa-info-circle text-amber-600"></i>
                                                    <span className="text-xs font-medium text-amber-800">
                                                        Requiere acceso administrativo
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {getFilteredTickets().length === 0 && (
                    <div className="col-span-full">
                        <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-16 text-center shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/25">
                                    <i className="fas fa-ticket-alt text-white text-4xl"></i>
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
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                                    onClick={() => setShowTicketModal(true)}
                                >
                                    <i className="fas fa-plus mr-3"></i>
                                    Crear Primer Ticket
                                </button>
                            </div>
                        </div>
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
                                    className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
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
                                    <i className="fas fa-times mr-2"></i>
                                    Cancelar
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
            </div >
        </ProtectedRoute >
    );
};

export default TicketSystem;
