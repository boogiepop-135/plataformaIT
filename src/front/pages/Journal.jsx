import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BACKEND_URL } from '../config/backend';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

const Journal = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [entries, setEntries] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        date_from: '',
        date_to: ''
    });

    // Form data for new/edit entry
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        entry_date: new Date().toISOString().split('T')[0],
        category: 'work',
        priority: 'medium',
        status: 'pending',
        hours_worked: '',
        location: '',
        tags: []
    });

    const categories = [
        { value: 'work', label: 'Trabajo', icon: 'fas fa-briefcase', color: 'blue' },
        { value: 'meeting', label: 'Reunión', icon: 'fas fa-users', color: 'green' },
        { value: 'maintenance', label: 'Mantenimiento', icon: 'fas fa-tools', color: 'orange' },
        { value: 'issue', label: 'Problema/Incidente', icon: 'fas fa-exclamation-triangle', color: 'red' },
        { value: 'achievement', label: 'Logro', icon: 'fas fa-trophy', color: 'yellow' },
        { value: 'personal', label: 'Personal', icon: 'fas fa-user', color: 'purple' },
        { value: 'note', label: 'Nota', icon: 'fas fa-sticky-note', color: 'gray' }
    ];

    const priorities = [
        { value: 'low', label: 'Baja', color: 'green' },
        { value: 'medium', label: 'Media', color: 'yellow' },
        { value: 'high', label: 'Alta', color: 'orange' },
        { value: 'urgent', label: 'Urgente', color: 'red' }
    ];

    const statuses = [
        { value: 'pending', label: 'Pendiente', color: 'yellow' },
        { value: 'completed', label: 'Completado', color: 'green' },
        { value: 'cancelled', label: 'Cancelado', color: 'red' }
    ];

    useEffect(() => {
        if (isAuthenticated) {
            fetchEntries();
            fetchStats();
        }
    }, [isAuthenticated, filters]);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(
                `${BACKEND_URL}/api/journal?${queryParams.toString()}`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const data = await response.json();
                setEntries(data);
            } else {
                setError('Error al cargar entradas');
            }
        } catch (error) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/journal/stats`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreateEntry = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setError('Debe estar autenticado');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/journal`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...formData,
                    hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : null
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Entrada creada exitosamente');
                setFormData({
                    title: '',
                    content: '',
                    entry_date: new Date().toISOString().split('T')[0],
                    category: 'work',
                    priority: 'medium',
                    status: 'pending',
                    hours_worked: '',
                    location: '',
                    tags: []
                });
                setShowCreateModal(false);
                fetchEntries();
                fetchStats();
            } else {
                setError(data.error || 'Error al crear entrada');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const handleUpdateStatus = async (entryId, newStatus) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/journal/${entryId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setSuccess('Estado actualizado');
                fetchEntries();
                fetchStats();
            } else {
                setError('Error al actualizar estado');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const handleDeleteEntry = async (entryId) => {
        if (!confirm('¿Está seguro de eliminar esta entrada?')) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/journal/${entryId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setSuccess('Entrada eliminada');
                fetchEntries();
                fetchStats();
            } else {
                setError('Error al eliminar entrada');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const getCategoryInfo = (category) => {
        return categories.find(cat => cat.value === category) || categories[0];
    };

    const getPriorityInfo = (priority) => {
        return priorities.find(p => p.value === priority) || priorities[1];
    };

    const getStatusInfo = (status) => {
        return statuses.find(s => s.value === status) || statuses[0];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleExportJournalPDF = async () => {
        try {
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(
                `${BACKEND_URL}/api/journal/export/pdf?${queryParams.toString()}`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `journal_export_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setSuccess('Bitácora exportada exitosamente');
            } else {
                setError('Error al exportar PDF');
            }
        } catch (error) {
            setError('Error de conexión al exportar PDF');
        }
    };

    const handleExportJournalExcel = async () => {
        try {
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(
                `${BACKEND_URL}/api/journal/export/excel?${queryParams.toString()}`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `journal_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setSuccess('Bitácora exportada exitosamente');
            } else {
                setError('Error al exportar Excel');
            }
        } catch (error) {
            setError('Error de conexión al exportar Excel');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-600">Acceso Restringido</h2>
                    <p className="text-gray-500">Debe iniciar sesión para acceder a la bitácora</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <i className="fas fa-book text-2xl text-white"></i>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800">Bitácora Personal</h1>
                                    <p className="text-gray-600">Registro de actividades diarias y seguimiento de tareas</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="relative group">
                                    <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2">
                                        <i className="fas fa-download"></i>
                                        <span>Exportar</span>
                                        <i className="fas fa-chevron-down text-xs"></i>
                                    </button>
                                    <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                                        <button
                                            onClick={handleExportJournalPDF}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 flex items-center space-x-2"
                                        >
                                            <i className="fas fa-file-pdf text-red-500"></i>
                                            <span>Exportar PDF</span>
                                        </button>
                                        <button
                                            onClick={handleExportJournalExcel}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150 flex items-center space-x-2"
                                        >
                                            <i className="fas fa-file-excel text-green-500"></i>
                                            <span>Exportar Excel</span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                                >
                                    <i className="fas fa-plus"></i>
                                    <span>Nueva Entrada</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm">Entradas del Mes</p>
                                            <p className="text-2xl font-bold">{stats.total_entries}</p>
                                        </div>
                                        <i className="fas fa-journal-whills text-2xl text-blue-200"></i>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm">Horas Registradas</p>
                                            <p className="text-2xl font-bold">{stats.total_hours}h</p>
                                        </div>
                                        <i className="fas fa-clock text-2xl text-green-200"></i>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-yellow-100 text-sm">Pendientes</p>
                                            <p className="text-2xl font-bold">{stats.statuses.pending || 0}</p>
                                        </div>
                                        <i className="fas fa-hourglass-half text-2xl text-yellow-200"></i>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm">Completadas</p>
                                            <p className="text-2xl font-bold">{stats.statuses.completed || 0}</p>
                                        </div>
                                        <i className="fas fa-check-circle text-2xl text-purple-200"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los estados</option>
                                    {statuses.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Fecha desde"
                                />
                                <input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Fecha hasta"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="max-w-7xl mx-auto mb-4">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    </div>
                )}
                {success && (
                    <div className="max-w-7xl mx-auto mb-4">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                            {success}
                        </div>
                    </div>
                )}

                {/* Entries List */}
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando entradas...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                            <i className="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay entradas</h3>
                            <p className="text-gray-500 mb-6">Comience creando su primera entrada de bitácora</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                            >
                                Crear Primera Entrada
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {entries.map(entry => {
                                const categoryInfo = getCategoryInfo(entry.category);
                                const priorityInfo = getPriorityInfo(entry.priority);
                                const statusInfo = getStatusInfo(entry.status);

                                return (
                                    <div key={entry.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start space-x-4">
                                                    <div className={`w-12 h-12 bg-${categoryInfo.color}-100 rounded-xl flex items-center justify-center`}>
                                                        <i className={`${categoryInfo.icon} text-${categoryInfo.color}-600`}></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{entry.title}</h3>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            <span><i className="fas fa-calendar mr-1"></i>{formatDate(entry.entry_date)}</span>
                                                            {entry.hours_worked && (
                                                                <span><i className="fas fa-clock mr-1"></i>{entry.hours_worked}h</span>
                                                            )}
                                                            {entry.location && (
                                                                <span><i className="fas fa-map-marker-alt mr-1"></i>{entry.location}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${priorityInfo.color}-100 text-${priorityInfo.color}-700`}>
                                                        {priorityInfo.label}
                                                    </span>
                                                    <select
                                                        value={entry.status}
                                                        onChange={(e) => handleUpdateStatus(entry.id, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700 border-none outline-none cursor-pointer`}
                                                    >
                                                        {statuses.map(status => (
                                                            <option key={status.value} value={status.value}>{status.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-gray-600 line-clamp-3">{entry.content}</p>
                                            </div>

                                            {entry.tags.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {entry.tags.map((tag, index) => (
                                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                                #{tag.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-700`}>
                                                    <i className={`${categoryInfo.icon} mr-1`}></i>
                                                    {categoryInfo.label}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEntry(entry);
                                                            setShowViewModal(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                    >
                                                        <i className="fas fa-eye mr-1"></i>Ver Detalles
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEntry(entry.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        <i className="fas fa-trash mr-1"></i>Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create Entry Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center">
                                    <i className="fas fa-plus mr-3"></i>
                                    Nueva Entrada de Bitácora
                                </h3>
                            </div>
                            <form onSubmit={handleCreateEntry} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                            placeholder="Ej: Reunión con cliente, Mantenimiento servidor, etc."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                                            <input
                                                type="date"
                                                value={formData.entry_date}
                                                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {priorities.map(priority => (
                                                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Horas Trabajadas</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={formData.hours_worked}
                                                onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Ej: 2.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Ej: Oficina Central, Sucursal Norte"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            rows="6"
                                            required
                                            placeholder="Describe detalladamente lo que hiciste, problemas encontrados, soluciones aplicadas, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (separados por coma)</label>
                                        <input
                                            type="text"
                                            value={formData.tags.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Ej: servidor, backup, cliente, urgente"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                    >
                                        Crear Entrada
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Entry Modal */}
                {showViewModal && selectedEntry && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-t-2xl p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center">
                                    <i className={`${getCategoryInfo(selectedEntry.category).icon} mr-3`}></i>
                                    {selectedEntry.title}
                                </h3>
                                <p className="text-slate-300 mt-1">{formatDate(selectedEntry.entry_date)}</p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center">
                                        <div className={`w-12 h-12 bg-${getCategoryInfo(selectedEntry.category).color}-100 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                            <i className={`${getCategoryInfo(selectedEntry.category).icon} text-${getCategoryInfo(selectedEntry.category).color}-600`}></i>
                                        </div>
                                        <p className="text-xs text-gray-500">Categoría</p>
                                        <p className="font-medium">{getCategoryInfo(selectedEntry.category).label}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className={`w-12 h-12 bg-${getPriorityInfo(selectedEntry.priority).color}-100 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                            <i className={`fas fa-flag text-${getPriorityInfo(selectedEntry.priority).color}-600`}></i>
                                        </div>
                                        <p className="text-xs text-gray-500">Prioridad</p>
                                        <p className="font-medium">{getPriorityInfo(selectedEntry.priority).label}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className={`w-12 h-12 bg-${getStatusInfo(selectedEntry.status).color}-100 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                            <i className={`fas fa-circle text-${getStatusInfo(selectedEntry.status).color}-600`}></i>
                                        </div>
                                        <p className="text-xs text-gray-500">Estado</p>
                                        <p className="font-medium">{getStatusInfo(selectedEntry.status).label}</p>
                                    </div>
                                    {selectedEntry.hours_worked && (
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <i className="fas fa-clock text-blue-600"></i>
                                            </div>
                                            <p className="text-xs text-gray-500">Horas</p>
                                            <p className="font-medium">{selectedEntry.hours_worked}h</p>
                                        </div>
                                    )}
                                </div>

                                {selectedEntry.location && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <i className="fas fa-map-marker-alt mr-2 text-gray-600"></i>
                                            Ubicación
                                        </h4>
                                        <p className="text-gray-600">{selectedEntry.location}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <i className="fas fa-align-left mr-2 text-gray-600"></i>
                                        Contenido
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEntry.content}</p>
                                    </div>
                                </div>

                                {selectedEntry.tags.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <i className="fas fa-tags mr-2 text-gray-600"></i>
                                            Tags
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEntry.tags.map((tag, index) => (
                                                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cerrar
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

export default Journal;