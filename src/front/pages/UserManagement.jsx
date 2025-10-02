import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import BACKEND_URL from '../config/backend.js';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

const emptyUser = { username: '', full_name: '', email: '', role: 'usuario', password: '' };

const UserManagement = () => {
    const { user, getAuthHeaders } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyUser);
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('username');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        if (user?.role && ['super_admin', 'admin', 'admin_rh', 'admin_finanzas'].includes(user.role)) {
            fetchUsers();
        }
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
            setError('Error de conexión');
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
        setForm({
            username: user.username || '',
            full_name: user.full_name || user.name || '',
            email: user.email || '',
            role: user.role,
            password: ''
        });
        setEditingUser(user.id);
        setShowForm(true);
        setSuccess('');
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
        
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                setSuccess('Usuario eliminado correctamente');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'No se pudo eliminar el usuario');
            }
        } catch (err) {
            setError('Error de conexión');
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
            
            // Solo incluir password si se proporcionó
            if (!body.password) delete body.password;
            
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            
            if (res.ok) {
                const savedUser = await res.json();
                if (editingUser) {
                    setUsers(users.map(u => u.id === editingUser ? { ...u, ...savedUser.user } : u));
                    setSuccess('Usuario actualizado correctamente');
                } else {
                    setUsers([...users, savedUser.user]);
                    setSuccess('Usuario creado correctamente');
                }
                setShowForm(false);
                setForm(emptyUser);
                setEditingUser(null);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Error al guardar el usuario');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar y ordenar usuarios
    const filteredUsers = users
        .filter(u => {
            const matchesSearch = u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            const comparison = aVal.toString().localeCompare(bVal.toString());
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const getRoleBadgeColor = (role) => {
        const colors = {
            'super_admin': 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
            'admin': 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
            'admin_rh': 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
            'admin_finanzas': 'bg-gradient-to-r from-orange-600 to-amber-600 text-white',
            'usuario': 'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
        };
        return colors[role] || 'bg-gray-500 text-white';
    };

    const getRoleDisplayName = (role) => {
        const names = {
            'super_admin': 'Super Admin',
            'admin': 'Administrador',
            'admin_rh': 'Admin RH',
            'admin_finanzas': 'Admin Finanzas',
            'usuario': 'Usuario'
        };
        return names[role] || role;
    };

    if (!user?.role || !['super_admin', 'admin', 'admin_rh', 'admin_finanzas'].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-lock text-red-600 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                    <p className="text-gray-600">No tienes permisos para gestionar usuarios</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-6 py-8">
                {/* Professional Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <i className="fas fa-users text-white text-xl"></i>
                                </div>
                                Gestión de Usuarios
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Administra usuarios del sistema de manera profesional</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <i className="fas fa-plus"></i>
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="alert alert-danger mb-6 animate-slideInUp">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-exclamation-circle text-lg"></i>
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                
                {success && (
                    <div className="alert alert-success mb-6 animate-slideInUp">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-check-circle text-lg"></i>
                            <span>{success}</span>
                        </div>
                    </div>
                )}

                {/* Professional Filters */}
                <div className="card mb-8 animate-fadeIn">
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="form-label">Buscar</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="form-control pl-10"
                                        placeholder="Nombre, usuario o email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Filtrar por Rol</label>
                                <select
                                    className="form-select"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">Todos los roles</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="admin">Administrador</option>
                                    <option value="admin_rh">Admin RH</option>
                                    <option value="admin_finanzas">Admin Finanzas</option>
                                    <option value="usuario">Usuario</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Ordenar por</label>
                                <select
                                    className="form-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="username">Usuario</option>
                                    <option value="full_name">Nombre</option>
                                    <option value="email">Email</option>
                                    <option value="role">Rol</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Orden</label>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="btn btn-outline-primary w-full flex items-center justify-center gap-2"
                                >
                                    <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                                    {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-600">Cargando usuarios...</span>
                    </div>
                ) : (
                    <div className="card animate-fadeIn">
                        <div className="card-header">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Lista de Usuarios ({filteredUsers.length})
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-white/80">
                                    <i className="fas fa-filter"></i>
                                    {searchTerm && <span>Filtrado</span>}
                                    {roleFilter !== 'all' && <span>• {getRoleDisplayName(roleFilter)}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left">Usuario</th>
                                            <th className="text-left">Nombre Completo</th>
                                            <th className="text-left">Email</th>
                                            <th className="text-left">Rol</th>
                                            <th className="text-left">Estado</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, index) => (
                                            <tr key={u.id} className="animate-slideInUp" style={{animationDelay: `${index * 50}ms`}}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                                            <span className="text-white font-semibold text-sm">
                                                                {(u.username || u.email || 'U').charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{u.username || u.email}</div>
                                                            <div className="text-sm text-gray-500">ID: {u.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="font-medium text-gray-900">{u.full_name || u.name || 'Sin nombre'}</div>
                                                </td>
                                                <td>
                                                    <div className="text-gray-700">{u.email || 'Sin email'}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getRoleBadgeColor(u.role)} px-3 py-1 text-sm font-semibold rounded-full shadow-sm`}>
                                                        {getRoleDisplayName(u.role)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${u.is_active ? 'bg-success' : 'bg-danger'} text-white px-3 py-1 text-sm font-semibold rounded-full shadow-sm`}>
                                                        {u.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {user?.role === 'super_admin' && (
                                                            <button
                                                                onClick={() => handleEdit(u)}
                                                                className="btn btn-outline-primary btn-sm px-3 py-1.5 text-xs hover:shadow-md"
                                                                title="Editar usuario"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        )}
                                                        {['admin', 'admin_rh', 'admin_finanzas'].includes(user?.role) && (
                                                            <button
                                                                onClick={() => handleEdit(u)}
                                                                className="btn btn-outline-primary btn-sm px-3 py-1.5 text-xs hover:shadow-md"
                                                                title="Ver detalles"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                        )}
                                                        {user?.role === 'super_admin' && (
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="btn btn-danger btn-sm px-3 py-1.5 text-xs hover:shadow-md"
                                                                title="Eliminar usuario"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-users text-gray-400 text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
                                        <p className="text-gray-600">
                                            {searchTerm || roleFilter !== 'all' 
                                                ? 'Intenta ajustar los filtros de búsqueda'
                                                : 'Comienza creando el primer usuario'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Professional Modal Form */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <i className={`fas ${editingUser ? 'fa-edit' : 'fa-plus'}`}></i>
                                    {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                                </h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="form-label">Nombre de Usuario *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleInput}
                                        className="form-control"
                                        required
                                        placeholder="Ingresa el nombre de usuario"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleInput}
                                        className="form-control"
                                        required
                                        placeholder="Ingresa el nombre completo"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email (Opcional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleInput}
                                        className="form-control"
                                        placeholder="email@ejemplo.com"
                                    />
                                </div>
                                {user?.role === 'super_admin' && (
                                    <div>
                                        <label className="form-label">Rol *</label>
                                        <select
                                            name="role"
                                            value={form.role}
                                            onChange={handleInput}
                                            className="form-select"
                                            required
                                        >
                                            <option value="usuario">Usuario</option>
                                            <option value="admin_rh">Admin RH</option>
                                            <option value="admin_finanzas">Admin Finanzas</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="form-label">
                                        {editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleInput}
                                        className="form-control"
                                        required={!editingUser}
                                        placeholder={editingUser ? 'Dejar vacío para no cambiar' : 'Ingresa una contraseña segura'}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="btn btn-secondary flex-1"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner animate-spin mr-2"></i>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <i className={`fas ${editingUser ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                                                {editingUser ? 'Actualizar' : 'Crear'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;