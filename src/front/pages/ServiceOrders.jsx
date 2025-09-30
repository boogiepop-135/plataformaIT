import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend.js';
import { useAuth } from '../hooks/useAuth.jsx';

const ServiceOrders = () => {
    const { isAuthenticated, getAuthHeaders, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showMonthlyModal, setShowMonthlyModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        service_type: '',
        status: 'pending',
        priority: 'medium',
        estimated_hours: '',
        hourly_rate: '',
        assigned_to: ''
    });

    const statusLabels = {
        pending: 'Pendiente',
        in_progress: 'En Progreso',
        completed: 'Completado',
        cancelled: 'Cancelado'
    };

    const statusColors = {
        pending: 'warning',
        in_progress: 'info',
        completed: 'success',
        cancelled: 'secondary'
    };

    const priorityLabels = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente'
    };

    const priorityColors = {
        low: 'success',
        medium: 'warning',
        high: 'danger',
        urgent: 'dark'
    };

    const serviceTypes = [
        'Mantenimiento',
        'Instalación',
        'Soporte Técnico',
        'Consultoría',
        'Desarrollo',
        'Capacitación',
        'Otro'
    ];

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/service-orders`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingOrder
                ? `${BACKEND_URL}/api/service-orders/${editingOrder.id}`
                : `${BACKEND_URL}/api/service-orders`;

            const method = editingOrder ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchOrders();
                handleCloseModal();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error de conexión');
        }
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData({
            title: order.title,
            description: order.description || '',
            client_name: order.client_name,
            client_email: order.client_email || '',
            client_phone: order.client_phone || '',
            service_type: order.service_type,
            status: order.status,
            priority: order.priority,
            estimated_hours: order.estimated_hours || '',
            hourly_rate: order.hourly_rate || '',
            assigned_to: order.assigned_to || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingOrder(null);
        setFormData({
            title: '',
            description: '',
            client_name: '',
            client_email: '',
            client_phone: '',
            service_type: '',
            status: 'pending',
            priority: 'medium',
            estimated_hours: '',
            hourly_rate: '',
            assigned_to: ''
        });
    };

    const handleMonthlyStatus = (order) => {
        setSelectedOrder(order);
        setShowMonthlyModal(true);
    };

    const updateMonthlyStatus = async (monthYear, completed) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/service-orders/${selectedOrder.id}/monthly-status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    month_year: monthYear,
                    completed: completed
                })
            });

            if (response.ok) {
                await fetchOrders();
                // Actualizar la orden seleccionada
                const updatedOrder = await response.json();
                setSelectedOrder(updatedOrder);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error updating monthly status:', error);
            alert('Error de conexión');
        }
    };

    const generateMonthsGrid = () => {
        const currentYear = new Date().getFullYear();
        const months = [];

        for (let year = currentYear - 1; year <= currentYear + 1; year++) {
            for (let month = 1; month <= 12; month++) {
                const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
                const monthName = new Date(year, month - 1).toLocaleDateString('es-ES', {
                    month: 'short',
                    year: 'numeric'
                });

                const status = selectedOrder?.monthly_status?.[monthYear];
                months.push({
                    key: monthYear,
                    name: monthName,
                    completed: status?.completed || false,
                    completedDate: status?.completed_date
                });
            }
        }

        return months;
    };

    const canEdit = (order) => {
        return user?.role === 'super_admin' ||
            order.created_by === user?.id ||
            order.assigned_to === user?.id;
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">
                    <i className="fas fa-lock me-2"></i>
                    Debes estar autenticado para ver las órdenes de servicio.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-primary">
                        <i className="fas fa-clipboard-list me-3"></i>Órdenes de Servicio
                    </h1>
                    <p className="text-muted">Gestiona las órdenes de servicio y su seguimiento mensual</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <i className="fas fa-plus me-2"></i>
                    Nueva Orden
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {orders.length === 0 ? (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-clipboard fa-4x text-muted mb-3"></i>
                                    <h4 className="text-muted">No hay órdenes de servicio</h4>
                                    <p className="text-muted">Crea tu primera orden de servicio</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="col-md-6 col-lg-4 mb-3">
                                <div className="card h-100">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">{order.title}</h6>
                                        <div className="dropdown">
                                            <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li><button className="dropdown-item" onClick={() => handleMonthlyStatus(order)}>
                                                    <i className="fas fa-calendar-check me-2"></i>Seguimiento Mensual
                                                </button></li>
                                                {canEdit(order) && (
                                                    <>
                                                        <li><button className="dropdown-item" onClick={() => handleEdit(order)}>
                                                            <i className="fas fa-edit me-2"></i>Editar
                                                        </button></li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-2">
                                            <strong>Cliente:</strong> {order.client_name}
                                        </div>

                                        {order.description && (
                                            <p className="text-muted small">{order.description}</p>
                                        )}

                                        <div className="mb-2">
                                            <small className="text-muted">Servicio:</small><br />
                                            <span>{order.service_type}</span>
                                        </div>

                                        {order.estimated_hours && (
                                            <div className="mb-2">
                                                <small className="text-muted">
                                                    Estimado: {order.estimated_hours}h
                                                    {order.hourly_rate && ` @ $${order.hourly_rate}/h`}
                                                </small>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className={`badge bg-${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                            <span className={`badge bg-${priorityColors[order.priority]}`}>
                                                {priorityLabels[order.priority]}
                                            </span>
                                        </div>

                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Creado: {new Date(order.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal Orden */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingOrder ? 'Editar Orden' : 'Nueva Orden de Servicio'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="mb-3">
                                                <label className="form-label">Título *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Tipo de Servicio *</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.service_type}
                                                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {serviceTypes.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Cliente *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.client_name}
                                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Email del Cliente</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.client_email}
                                                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Teléfono</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={formData.client_phone}
                                                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Estado</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="pending">Pendiente</option>
                                                    <option value="in_progress">En Progreso</option>
                                                    <option value="completed">Completado</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Prioridad</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                >
                                                    <option value="low">Baja</option>
                                                    <option value="medium">Media</option>
                                                    <option value="high">Alta</option>
                                                    <option value="urgent">Urgente</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Horas Estimadas</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="form-control"
                                                    value={formData.estimated_hours}
                                                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Tarifa por Hora</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.hourly_rate}
                                                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingOrder ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Seguimiento Mensual */}
            {showMonthlyModal && selectedOrder && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Seguimiento Mensual - {selectedOrder.title}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowMonthlyModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {generateMonthsGrid().map(month => (
                                        <div key={month.key} className="col-md-3 col-sm-4 col-6 mb-3">
                                            <div
                                                className={`card border-2 ${month.completed ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}
                                                style={{ cursor: canEdit(selectedOrder) ? 'pointer' : 'default' }}
                                                onClick={() => canEdit(selectedOrder) && updateMonthlyStatus(month.key, !month.completed)}
                                            >
                                                <div className="card-body text-center p-2">
                                                    <div className="mb-2">
                                                        {month.completed ? (
                                                            <i className="fas fa-check-circle text-success fa-2x"></i>
                                                        ) : (
                                                            <i className="far fa-circle text-muted fa-2x"></i>
                                                        )}
                                                    </div>
                                                    <small className="fw-bold">{month.name}</small>
                                                    {month.completed && month.completedDate && (
                                                        <div className="mt-1">
                                                            <small className="text-muted">
                                                                {new Date(month.completedDate).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {canEdit(selectedOrder) && (
                                    <div className="alert alert-info mt-3">
                                        <i className="fas fa-info-circle me-2"></i>
                                        Haz clic en cualquier mes para marcar/desmarcar como completado
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceOrders;