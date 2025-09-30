import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import BACKEND_URL from '../config/backend.js';

const HRManagement = () => {
    const { user, getAuthHeaders } = useAuth();
    const [users, setUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'usuario',
        password: ''
    });

    useEffect(() => {
        if (user && ['admin-rh-financiero', 'super_admin'].includes(user.role)) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            setError(null);
            const response = await fetch(`${BACKEND_URL}/api/users`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Users data:', data);
                setUsers(Array.isArray(data) ? data : []);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Error al cargar usuarios');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error de conexión al servidor');
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

        if (!formData.password) {
            formData.password = generateRandomPassword();
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Usuario creado exitosamente.`);
                setShowCreateForm(false);
                setFormData({ name: '', email: '', role: 'usuario', password: '' });
                fetchUsers();
            } else {
                alert(data.error || 'Error al crear usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const generateRandomPassword = () => {
        return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    };

    const handleToggleUserStatus = async (userId, isActive) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchUsers();
            } else {
                alert(data.error || 'Error al cambiar estado del usuario');
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
            const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
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

    const handleUpdateUser = async (userId, updateData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuario actualizado exitosamente');
                fetchUsers();
            } else {
                alert(data.error || 'Error al actualizar usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    if (!user || !['admin-rh-financiero', 'super_admin'].includes(user.role)) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    No tienes permisos para acceder a esta sección. Se requiere rol de RH-Financiero o Super Admin.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    Cargando usuarios...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                    <button
                        onClick={fetchUsers}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Gestión de Usuarios {user.role === 'admin-rh-financiero' ? '(RH-Financiero)' : '(Super Admin)'}
                </h1>
                {user.role === 'super_admin' && (
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
                                    <option value="usuario">Usuario</option>
                                    <option value="admin-rh-financiero">Admin RH-Financiero</option>
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
                            {users.map((user_item) => (
                                <tr key={user_item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {user_item.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user_item.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user_item.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                            user_item.role === 'admin-rh-financiero' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user_item.role === 'super_admin' ? 'Super Admin' :
                                                user_item.role === 'admin-rh-financiero' ? 'RH-Financiero' :
                                                    'Usuario'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {!user_item.is_active ? (
                                            <div>
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    Inactivo
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {user_item.role !== 'super_admin' && user.role === 'super_admin' && (
                                            <>
                                                <button
                                                    onClick={() => handleToggleUserStatus(user_item.id, user_item.is_active)}
                                                    className={`${user_item.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                                >
                                                    {user_item.is_active ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user_item.id, user_item.name)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                        {user_item.role !== 'super_admin' && user.role === 'admin-rh-financiero' && (
                                            <span className="text-gray-500 text-sm">Solo consulta</span>
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