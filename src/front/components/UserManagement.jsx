import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend.js';
import { useAuth } from '../hooks/useAuth.jsx';

const UserManagement = ({ onClose }) => {
    const { getAuthHeaders } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'viewer'
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const roleTranslations = {
        'admin': 'Administrador',
        'user': 'Usuario',
        'viewer': 'Solo Lectura'
    };

    const roleColors = {
        'admin': 'bg-red-100 text-red-800',
        'user': 'bg-blue-100 text-blue-800',
        'viewer': 'bg-gray-100 text-gray-800'
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/users`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Error al cargar usuarios');
            }
        } catch (error) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newUser.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newUser)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Usuario creado exitosamente');
                setNewUser({ name: '', email: '', password: '', role: 'viewer' });
                setShowCreateModal(false);
                loadUsers();
            } else {
                setError(data.error || 'Error al crear usuario');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                loadUsers();
            } else {
                setError(data.error || 'Error al cambiar estado');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Usuario eliminado exitosamente');
                loadUsers();
            } else {
                setError(data.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.new_password.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    user_id: 1 // Admin user ID
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Contraseña cambiada exitosamente');
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                setShowPasswordModal(false);
                
                // Show success notification
                setTimeout(() => {
                    alert('✅ Contraseña actualizada correctamente. La nueva contraseña ya está activa.');
                }, 500);
            } else {
                setError(data.error || 'Error al cambiar contraseña');
            }
        } catch (error) {
            setError('Error de conexión al servidor');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i className="fas fa-users text-xl"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                                <p className="text-slate-300">Administrar usuarios y permisos del sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                            <i className="fas fa-exclamation-circle text-red-500"></i>
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                            <i className="fas fa-check-circle text-green-500"></i>
                            <span className="text-green-700">{success}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
                        >
                            <i className="fas fa-plus"></i>
                            <span>Crear Usuario</span>
                        </button>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center space-x-2"
                        >
                            <i className="fas fa-key"></i>
                            <span>Cambiar Contraseña Admin</span>
                        </button>
                        <button
                            onClick={loadUsers}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2"
                        >
                            <i className="fas fa-sync-alt"></i>
                            <span>Refrescar</span>
                        </button>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <i className="fas fa-users text-white text-2xl"></i>
                            </div>
                            <h3 className="text-gray-800 font-semibold mb-2">Cargando Usuarios</h3>
                            <p className="text-gray-600">Obteniendo información del sistema...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                            <i className="fas fa-user text-white text-sm"></i>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                                                        {roleTranslations[user.role]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id)}
                                                            disabled={user.id === 1}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${user.is_active
                                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                } ${user.id === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {user.is_active ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={user.id === 1}
                                                            className={`px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors duration-200 ${user.id === 1 ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
                            <h3 className="text-xl font-bold flex items-center">
                                <i className="fas fa-user-plus mr-3"></i>
                                Crear Nuevo Usuario
                            </h3>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="viewer">Solo Lectura</option>
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
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
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                >
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-t-2xl p-6 text-white">
                            <h3 className="text-xl font-bold flex items-center">
                                <i className="fas fa-key mr-3"></i>
                                Cambiar Contraseña Admin
                            </h3>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                                <div className="flex items-start space-x-3">
                                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                                    <div>
                                        <h4 className="text-green-800 font-medium text-sm">Cambio de Contraseña Funcional</h4>
                                        <p className="text-green-700 text-sm">
                                            El sistema ahora permite cambiar la contraseña del administrador.
                                            La nueva contraseña se guardará en la base de datos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                                >
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;