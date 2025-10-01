import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import BACKEND_URL from '../config/backend.js';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

const emptyUser = { name: '', email: '', role: 'usuario', password: '' };

const UserManagement = () => {
    const { user, getAuthHeaders } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyUser);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user && ['super_admin', 'admin', 'admin_rh', 'admin_finanzas'].includes(user.role)) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/users`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                setError('No se pudo cargar la lista de usuarios');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = () => {
        setForm(emptyUser);
        setEditingUser(null);
        setShowForm(true);
        setSuccess('');
        setError('');
    };

    const handleEdit = (user) => {
        setForm({ ...user, password: '' });
        setEditingUser(user.id);
        setShowForm(true);
        setSuccess('');
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                setSuccess('Usuario eliminado');
            } else {
                setError('No se pudo eliminar el usuario');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const method = editingUser ? 'PUT' : 'POST';
            const url = editingUser ? `${BACKEND_URL}/api/users/${editingUser}` : `${BACKEND_URL}/api/users`;
            const body = { ...form };
            if (!body.password) delete body.password;
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setShowForm(false);
                setSuccess(editingUser ? 'Usuario actualizado' : 'Usuario creado');
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al guardar usuario');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (id) => {
        const newPass = prompt('Nueva contraseña para el usuario:');
        if (!newPass) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/${id}/change-password`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ new_password: newPass })
            });
            if (res.ok) {
                setSuccess('Contraseña cambiada');
            } else {
                setError('No se pudo cambiar la contraseña');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    if (!user || !['super_admin', 'admin', 'admin_rh', 'admin_finanzas'].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-shield-alt text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">Esta sección está disponible para <b>administradores</b>.</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                        {user.role === 'super_admin' && (
                            <button onClick={handleCreate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                                + Nuevo Usuario
                            </button>
                        )}
                    </div>
                    {error && <div className="text-red-600 mb-4">{error}</div>}
                    {success && <div className="text-green-600 mb-4">{success}</div>}
                    {loading && <div className="text-blue-600 mb-4">Cargando...</div>}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                                    <th className="py-2 px-4">Nombre</th>
                                    <th className="py-2 px-4">Email</th>
                                    <th className="py-2 px-4">Rol</th>
                                    <th className="py-2 px-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b">
                                        <td className="py-2 px-4">{u.name}</td>
                                        <td className="py-2 px-4">{u.email}</td>
                                        <td className="py-2 px-4">{u.role}</td>
                                        <td className="py-2 px-4 space-x-2">
                                            {user.role === 'super_admin' && (
                                                <>
                                                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline">Editar</button>
                                                    <button onClick={() => handlePasswordChange(u.id)} className="text-amber-600 hover:underline">Contraseña</button>
                                                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Eliminar</button>
                                                </>
                                            )}
                                            {['admin', 'admin_rh', 'admin_finanzas'].includes(user.role) && (
                                                <>
                                                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline">Editar</button>
                                                    <button onClick={() => handlePasswordChange(u.id)} className="text-amber-600 hover:underline">Contraseña</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {showForm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                                <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                                    <i className="fas fa-times"></i>
                                </button>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                                        <input type="text" name="name" value={form.name} onChange={handleInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" value={form.email} onChange={handleInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                                        <select name="role" value={form.role} onChange={handleInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                                            <option value="usuario">Usuario</option>
                                            {user.role === 'super_admin' && (
                                                <>
                                                    <option value="admin">Administrador</option>
                                                    <option value="admin_rh">Administrador RH</option>
                                                    <option value="admin_finanzas">Administrador Finanzas</option>
                                                    <option value="super_admin">Super Administrador</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña {editingUser ? '(dejar en blanco para no cambiar)' : ''}</label>
                                        <input type="password" name="password" value={form.password} onChange={handleInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" autoComplete="new-password" />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50">
                                        {loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default UserManagement;
