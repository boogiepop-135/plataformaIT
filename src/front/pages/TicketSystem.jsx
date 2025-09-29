import React, { useState, useEffect } from "react";
import BACKEND_URL from "../config/backend.js";
import { useAuth } from "../hooks/useAuth.jsx";
import AuthProtectedAction from "../components/AuthProtectedAction.jsx";

export const TicketSystem = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [filter, setFilter] = useState("all");
    const [newTicket, setNewTicket] = useState({
        title: "",
        description: "",
        status: "open",
        priority: "medium",
        requester_name: "",
        requester_email: ""
    });

    const statusOptions = [
        { value: "open", label: "Abierto", className: "bg-primary" },
        { value: "in_progress", label: "En Progreso", className: "bg-warning" },
        { value: "resolved", label: "Resuelto", className: "bg-success" },
        { value: "closed", label: "Cerrado", className: "bg-secondary" }
    ];

    const priorityOptions = [
        { value: "low", label: "Baja", className: "bg-success" },
        { value: "medium", label: "Media", className: "bg-warning" },
        { value: "high", label: "Alta", className: "bg-danger" },
        { value: "urgent", label: "Urgente", className: "bg-dark" }
    ];

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
            const headers = editingTicket
                ? getAuthHeaders()
                : { "Content-Type": "application/json" };

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(newTicket),
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
            }
        } catch (error) {
            console.error("Error saving ticket:", error);
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

    return (
        <div className="container-fluid mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="h2">Sistema de Tickets</h1>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowTicketModal(true)}
                        >
                            <i className="fas fa-plus me-2"></i>Nuevo Ticket
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4">
                        <div className="col-md-2">
                            <div className="card bg-info text-white">
                                <div className="card-body text-center">
                                    <h4>{stats.total}</h4>
                                    <small>Total</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="card bg-primary text-white">
                                <div className="card-body text-center">
                                    <h4>{stats.open}</h4>
                                    <small>Abiertos</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="card bg-warning text-white">
                                <div className="card-body text-center">
                                    <h4>{stats.inProgress}</h4>
                                    <small>En Progreso</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="card bg-success text-white">
                                <div className="card-body text-center">
                                    <h4>{stats.resolved}</h4>
                                    <small>Resueltos</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="card bg-secondary text-white">
                                <div className="card-body text-center">
                                    <h4>{stats.closed}</h4>
                                    <small>Cerrados</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="mb-4">
                        <div className="btn-group" role="group">
                            <button
                                className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
                                onClick={() => setFilter('all')}
                            >
                                Todos
                            </button>
                            {statusOptions.map(status => (
                                <button
                                    key={status.value}
                                    className={`btn ${filter === status.value ? 'btn-dark' : 'btn-outline-dark'}`}
                                    onClick={() => setFilter(status.value)}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="row">
                {getFilteredTickets().map(ticket => (
                    <div key={ticket.id} className="col-lg-6 col-xl-4 mb-4">
                        <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span className="fw-bold">#{ticket.id}</span>
                                <div>
                                    <span className={`badge ${getPriorityInfo(ticket.priority).className} me-2`}>
                                        {getPriorityInfo(ticket.priority).label}
                                    </span>
                                    <span className={`badge ${getStatusInfo(ticket.status).className}`}>
                                        {getStatusInfo(ticket.status).label}
                                    </span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">{ticket.title}</h5>
                                {ticket.description && (
                                    <p className="card-text text-muted">
                                        {ticket.description.length > 100
                                            ? ticket.description.substring(0, 100) + "..."
                                            : ticket.description
                                        }
                                    </p>
                                )}
                                {ticket.requester_name && (
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            <i className="fas fa-user me-1"></i>
                                            {ticket.requester_name}
                                        </small>
                                    </div>
                                )}
                                {ticket.requester_email && (
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            <i className="fas fa-envelope me-1"></i>
                                            {ticket.requester_email}
                                        </small>
                                    </div>
                                )}
                                <div className="mb-2">
                                    <small className="text-muted">
                                        <i className="fas fa-calendar me-1"></i>
                                        Creado: {new Date(ticket.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center">
                                <div>
                                    <AuthProtectedAction
                                        loginButtonText="Editar"
                                        loginButtonClass="btn btn-sm btn-outline-primary me-2"
                                    >
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEditTicket(ticket)}
                                        >
                                            <i className="fas fa-edit me-1"></i>Editar
                                        </button>
                                    </AuthProtectedAction>

                                    <AuthProtectedAction
                                        loginButtonText="Eliminar"
                                        loginButtonClass="btn btn-sm btn-outline-danger"
                                    >
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteTicket(ticket.id)}
                                        >
                                            <i className="fas fa-trash me-1"></i>Eliminar
                                        </button>
                                    </AuthProtectedAction>
                                </div>

                                {!isAuthenticated && (
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Se requiere acceso admin para editar/eliminar
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {getFilteredTickets().length === 0 && (
                <div className="text-center py-5">
                    <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No hay tickets {filter !== 'all' ? getStatusInfo(filter).label.toLowerCase() : ''}</h4>
                    <p className="text-muted">Crea un nuevo ticket para comenzar</p>
                </div>
            )}

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingTicket ? "Editar Ticket" : "Nuevo Ticket"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
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
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Título *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newTicket.title}
                                            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Estado</label>
                                                <select
                                                    className="form-select"
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
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Prioridad</label>
                                                <select
                                                    className="form-select"
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
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Nombre del solicitante</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newTicket.requester_name}
                                                    onChange={(e) => setNewTicket({ ...newTicket, requester_name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Email del solicitante</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={newTicket.requester_email}
                                                    onChange={(e) => setNewTicket({ ...newTicket, requester_email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
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
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveTicket}
                                    disabled={!newTicket.title}
                                >
                                    {editingTicket ? "Actualizar" : "Crear"} Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
