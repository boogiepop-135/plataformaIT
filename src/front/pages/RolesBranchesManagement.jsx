import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import BACKEND_URL from '../config/backend.js';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

const emptyBranch = { name: '', code: '', location: '' };
const emptyRole = { name: '', display_name: '', description: '', permissions: {} };

const RolesBranchesManagement = () => {
    const { user, getAuthHeaders } = useAuth();
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('branches');

    // Branch form state
    const [showBranchForm, setShowBranchForm] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [branchForm, setBranchForm] = useState(emptyBranch);

    // Role form state
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState(emptyRole);

    useEffect(() => {
        if (user && user.role === 'super_admin') {
            fetchBranches();
            fetchRoles();
        }
    }, [user]);

    const fetchBranches = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/branches`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setBranches(data);
            } else {
                setError('No se pudo cargar las sucursales');
            }
        } catch (err) {
            setError('Error de red al cargar sucursales');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/roles`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            } else {
                setError('No se pudo cargar los roles');
            }
        } catch (err) {
            setError('Error de red al cargar roles');
        } finally {
            setLoading(false);
        }
    };

    // Branch handlers
    const handleBranchInput = (e) => {
        setBranchForm({ ...branchForm, [e.target.name]: e.target.value });
    };

    const handleCreateBranch = () => {
        setBranchForm(emptyBranch);
        setEditingBranch(null);
        setShowBranchForm(true);
        setSuccess('');
        setError('');
    };

    const handleEditBranch = (branch) => {
        setBranchForm({ ...branch });
        setEditingBranch(branch.id);
        setShowBranchForm(true);
        setSuccess('');
        setError('');
    };

    const handleDeleteBranch = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta sucursal?')) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/branches/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setBranches(branches.filter(b => b.id !== id));
                setSuccess('Sucursal eliminada');
            } else {
                setError('No se pudo eliminar la sucursal');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitBranch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const method = editingBranch ? 'PUT' : 'POST';
            const url = editingBranch ? `${BACKEND_URL}/api/branches/${editingBranch}` : `${BACKEND_URL}/api/branches`;
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(branchForm),
            });
            if (res.ok) {
                setShowBranchForm(false);
                setSuccess(editingBranch ? 'Sucursal actualizada' : 'Sucursal creada');
                fetchBranches();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al guardar sucursal');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    // Role handlers
    const handleRoleInput = (e) => {
        setRoleForm({ ...roleForm, [e.target.name]: e.target.value });
    };

    const handleCreateRole = () => {
        setRoleForm(emptyRole);
        setEditingRole(null);
        setShowRoleForm(true);
        setSuccess('');
        setError('');
    };

    const handleEditRole = (role) => {
        setRoleForm({ ...role });
        setEditingRole(role.id);
        setShowRoleForm(true);
        setSuccess('');
        setError('');
    };

    const handleDeleteRole = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este rol?')) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/roles/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setRoles(roles.filter(r => r.id !== id));
                setSuccess('Rol eliminado');
            } else {
                setError('No se pudo eliminar el rol');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRole = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const method = editingRole ? 'PUT' : 'POST';
            const url = editingRole ? `${BACKEND_URL}/api/roles/${editingRole}` : `${BACKEND_URL}/api/roles`;
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(roleForm),
            });
            if (res.ok) {
                setShowRoleForm(false);
                setSuccess(editingRole ? 'Rol actualizado' : 'Rol creado');
                fetchRoles();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al guardar rol');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-shield-alt text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Solo Super Administradores</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">Esta sección solo está disponible para usuarios con rol <b>super administrador</b>.</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Gestión de Roles y Sucursales</h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
                        <button
                            onClick={() => setActiveTab('branches')}
                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all ${activeTab === 'branches'
                                    ? 'bg-white text-blue-700 shadow'
                                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                                }`}
                        >
                            Sucursales
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all ${activeTab === 'roles'
                                    ? 'bg-white text-blue-700 shadow'
                                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                                }`}
                        >
                            Roles
                        </button>
                    </div>

                    {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}
                    {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg">{success}</div>}
                    {loading && <div className="text-blue-600 mb-4">Cargando...</div>}

                    {/* Branches Tab */}
                    {activeTab === 'branches' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Sucursales</h3>
                                <button
                                    onClick={handleCreateBranch}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                                >
                                    + Nueva Sucursal
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-gray-700">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                                            <th className="py-3 px-4 text-left">Código</th>
                                            <th className="py-3 px-4 text-left">Nombre</th>
                                            <th className="py-3 px-4 text-left">Ubicación</th>
                                            <th className="py-3 px-4 text-left">Usuarios</th>
                                            <th className="py-3 px-4 text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branches.map(branch => (
                                            <tr key={branch.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-mono">{branch.code}</td>
                                                <td className="py-3 px-4 font-semibold">{branch.name}</td>
                                                <td className="py-3 px-4">{branch.location || 'Sin especificar'}</td>
                                                <td className="py-3 px-4">{branch.users_count || 0}</td>
                                                <td className="py-3 px-4 space-x-2">
                                                    <button onClick={() => handleEditBranch(branch)} className="text-blue-600 hover:underline">Editar</button>
                                                    <button onClick={() => handleDeleteBranch(branch.id)} className="text-red-600 hover:underline">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Roles Tab */}
                    {activeTab === 'roles' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Roles</h3>
                                <button
                                    onClick={handleCreateRole}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                                >
                                    + Nuevo Rol
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-gray-700">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                                            <th className="py-3 px-4 text-left">Nombre</th>
                                            <th className="py-3 px-4 text-left">Nombre Mostrar</th>
                                            <th className="py-3 px-4 text-left">Descripción</th>
                                            <th className="py-3 px-4 text-left">Usuarios</th>
                                            <th className="py-3 px-4 text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map(role => (
                                            <tr key={role.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-mono">{role.name}</td>
                                                <td className="py-3 px-4 font-semibold">{role.display_name}</td>
                                                <td className="py-3 px-4">{role.description || 'Sin descripción'}</td>
                                                <td className="py-3 px-4">{role.users_count || 0}</td>
                                                <td className="py-3 px-4 space-x-2">
                                                    <button onClick={() => handleEditRole(role)} className="text-blue-600 hover:underline">Editar</button>
                                                    <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:underline">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Branch Form Modal */}
                    {showBranchForm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                                <button onClick={() => setShowBranchForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                                    <i className="fas fa-times"></i>
                                </button>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">{editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}</h3>
                                <form onSubmit={handleSubmitBranch} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Código</label>
                                        <input type="text" name="code" value={branchForm.code} onChange={handleBranchInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                                        <input type="text" name="name" value={branchForm.name} onChange={handleBranchInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
                                        <input type="text" name="location" value={branchForm.location} onChange={handleBranchInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50">
                                        {loading ? 'Guardando...' : (editingBranch ? 'Actualizar' : 'Crear')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Role Form Modal */}
                    {showRoleForm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                                <button onClick={() => setShowRoleForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                                    <i className="fas fa-times"></i>
                                </button>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                                <form onSubmit={handleSubmitRole} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre (clave)</label>
                                        <input type="text" name="name" value={roleForm.name} onChange={handleRoleInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre a mostrar</label>
                                        <input type="text" name="display_name" value={roleForm.display_name} onChange={handleRoleInput} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                        <textarea name="description" value={roleForm.description} onChange={handleRoleInput} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900" />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50">
                                        {loading ? 'Guardando...' : (editingRole ? 'Actualizar' : 'Crear')}
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

export default RolesBranchesManagement;