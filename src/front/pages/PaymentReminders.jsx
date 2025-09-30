import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend.js';
import { useAuth } from '../hooks/useAuth.jsx';

const PaymentReminders = () => {
    const { isAuthenticated, getAuthHeaders, user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        due_date: '',
        status: 'pending',
        recurrence: 'one_time',
        reminder_days: 7
    });

    const statusLabels = {
        pending: 'Pendiente',
        paid: 'Pagado',
        overdue: 'Vencido',
        cancelled: 'Cancelado'
    };

    const statusColors = {
        pending: 'warning',
        paid: 'success',
        overdue: 'danger',
        cancelled: 'secondary'
    };

    const recurrenceLabels = {
        one_time: 'Una vez',
        monthly: 'Mensual',
        quarterly: 'Trimestral',
        annually: 'Anual'
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchReminders();
        }
    }, [isAuthenticated]);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/payment-reminders`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setReminders(data);
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingReminder
                ? `${BACKEND_URL}/api/payment-reminders/${editingReminder.id}`
                : `${BACKEND_URL}/api/payment-reminders`;

            const method = editingReminder ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchReminders();
                handleCloseModal();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving reminder:', error);
            alert('Error de conexión');
        }
    };

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setFormData({
            title: reminder.title,
            description: reminder.description || '',
            amount: reminder.amount || '',
            currency: reminder.currency,
            due_date: reminder.due_date ? reminder.due_date.split('T')[0] : '',
            status: reminder.status,
            recurrence: reminder.recurrence,
            reminder_days: reminder.reminder_days
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/payment-reminders/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                await fetchReminders();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error deleting reminder:', error);
            alert('Error de conexión');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReminder(null);
        setFormData({
            title: '',
            description: '',
            amount: '',
            currency: 'USD',
            due_date: '',
            status: 'pending',
            recurrence: 'one_time',
            reminder_days: 7
        });
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">
                    <i className="fas fa-lock me-2"></i>
                    Debes estar autenticado para ver los recordatorios de pagos.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-primary">
                        <i className="fas fa-money-bill-wave me-3"></i>Recordatorios de Pagos
                    </h1>
                    <p className="text-muted">Gestiona tus recordatorios de pagos y vencimientos</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <i className="fas fa-plus me-2"></i>
                    Nuevo Recordatorio
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
                    {reminders.length === 0 ? (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                                    <h4 className="text-muted">No hay recordatorios</h4>
                                    <p className="text-muted">Crea tu primer recordatorio de pago</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        reminders.map(reminder => {
                            const daysUntilDue = getDaysUntilDue(reminder.due_date);
                            const overdue = isOverdue(reminder.due_date);

                            return (
                                <div key={reminder.id} className="col-md-6 col-lg-4 mb-3">
                                    <div className={`card h-100 ${overdue && reminder.status === 'pending' ? 'border-danger' : ''}`}>
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">{reminder.title}</h6>
                                            <div className="dropdown">
                                                <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {(user?.role === 'super_admin' || reminder.user_id === user?.id) && (
                                                        <>
                                                            <li><button className="dropdown-item" onClick={() => handleEdit(reminder)}>
                                                                <i className="fas fa-edit me-2"></i>Editar
                                                            </button></li>
                                                            <li><button className="dropdown-item text-danger" onClick={() => handleDelete(reminder.id)}>
                                                                <i className="fas fa-trash me-2"></i>Eliminar
                                                            </button></li>
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            {reminder.description && (
                                                <p className="text-muted small">{reminder.description}</p>
                                            )}

                                            {reminder.amount && (
                                                <div className="mb-2">
                                                    <strong>{reminder.currency} {reminder.amount}</strong>
                                                </div>
                                            )}

                                            <div className="mb-2">
                                                <small className="text-muted">Vence:</small><br />
                                                <span className={overdue && reminder.status === 'pending' ? 'text-danger fw-bold' : ''}>
                                                    {new Date(reminder.due_date).toLocaleDateString()}
                                                </span>
                                                {reminder.status === 'pending' && (
                                                    <div className="mt-1">
                                                        {overdue ? (
                                                            <span className="badge bg-danger">Vencido</span>
                                                        ) : daysUntilDue <= reminder.reminder_days ? (
                                                            <span className="badge bg-warning text-dark">
                                                                {daysUntilDue === 0 ? 'Vence hoy' : `${daysUntilDue} días`}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className={`badge bg-${statusColors[reminder.status]}`}>
                                                    {statusLabels[reminder.status]}
                                                </span>
                                                <small className="text-muted">
                                                    {recurrenceLabels[reminder.recurrence]}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
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
                                        <div className="col-md-8">
                                            <div className="mb-3">
                                                <label className="form-label">Monto</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Moneda</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.currency}
                                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                >
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                    <option value="MXN">MXN</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Fecha de Vencimiento *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Estado</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="pending">Pendiente</option>
                                                    <option value="paid">Pagado</option>
                                                    <option value="overdue">Vencido</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Recurrencia</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.recurrence}
                                                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                                                >
                                                    <option value="one_time">Una vez</option>
                                                    <option value="monthly">Mensual</option>
                                                    <option value="quarterly">Trimestral</option>
                                                    <option value="annually">Anual</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Días de anticipación para recordatorio</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="30"
                                            className="form-control"
                                            value={formData.reminder_days}
                                            onChange={(e) => setFormData({ ...formData, reminder_days: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingReminder ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentReminders;