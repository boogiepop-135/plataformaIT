import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const HRManagement = () => {
    const { auth } = useAuth();
    const [users, setUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            alert('Nombre y email son requeridos');
            return;
        }

        try {
            const response = await fetch('/api/hr/users/create-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Usuario creado exitosamente. Contraseña temporal: ${data.temporary_password}`);
                setShowCreateForm(false);
                setFormData({ name: '', email: '', role: 'user', password: '' });
                fetchUsers();
            } else {
                alert(data.error || 'Error al crear usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const handleSuspendUser = async (userId, reason = '') => {
        if (!reason.trim()) {
            reason = prompt('Razón de la suspensión:');
            if (!reason) return;
        }

        try {
            const response = await fetch('/api/hr/users/suspend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    reason: reason
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuario suspendido exitosamente. Se ha notificado al super administrador.');
                fetchUsers();
            } else {
                alert(data.error || 'Error al suspender usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/superadmin/users/${userId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuario eliminado exitosamente');
                fetchUsers();
            } else {
                alert(data.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const handleUnsuspendUser = async (userId) => {
        try {
            const response = await fetch(`/api/superadmin/users/${userId}/unsuspend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuario reactivado exitosamente');
                fetchUsers();
            } else {
                alert(data.error || 'Error al reactivar usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    if (!auth.user || !['hr', 'super_admin'].includes(auth.user.role)) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    No tienes permisos para acceder a esta sección.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Gestión de Usuarios {auth.user.role === 'hr' ? '(RH)' : '(Super Admin)'}
                </h1>
                {auth.user.role === 'hr' && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Crear Usuario
                    </button>
                )}
            </div>

            {/* Formulario de creación */}
            {showCreateForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Crear Nuevo Usuario</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rol
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña (opcional)
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Se generará automáticamente si está vacío"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                            >
                                Crear Usuario
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de usuarios */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Usuarios del Sistema</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                    user.role === 'hr' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_suspended ? (
                                            <div>
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    Suspendido
                                                </span>
                                                {user.suspension_reason && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {user.suspension_reason}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {user.role !== 'super_admin' && (
                                            <>
                                                {auth.user.role === 'hr' && !user.is_suspended && (
                                                    <button
                                                        onClick={() => handleSuspendUser(user.id)}
                                                        className="text-orange-600 hover:text-orange-900"
                                                    >
                                                        Suspender
                                                    </button>
                                                )}
                                                {auth.user.role === 'super_admin' && (
                                                    <>
                                                        {user.is_suspended ? (
                                                            <button
                                                                onClick={() => handleUnsuspendUser(user.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Reactivar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleSuspendUser(user.id)}
                                                                className="text-orange-600 hover:text-orange-900"
                                                            >
                                                                Suspender
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRManagement;