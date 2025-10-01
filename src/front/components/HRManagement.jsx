import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import BACKEND_URL from '../config/backend.js';

const emptyEmployee = {
    name: '',
    email: '',
    role: 'operativo',
    password: '',
    employee_id: '',
    department: '',
    position: '',
    phone: '',
    hire_date: '',
    salary: '',
    branch_id: ''
};

const HRManagement = () => {
    const { user, getAuthHeaders } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState(emptyEmployee);

    useEffect(() => {
        if (user && ['rh', 'super_admin', 'admin'].includes(user.role)) {
            fetchEmployees();
            fetchBranches();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchEmployees = async () => {
        try {
            setError('');
            const endpoint = user.role === 'rh' ? '/api/hr/employees' : '/api/users?role=operativo';
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Employees data:', data);
                setEmployees(Array.isArray(data) ? data : []);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Error al cargar empleados');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Error de conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/branches`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setBranches(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const generateRandomPassword = () => {
        return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            setError('Nombre y email son requeridos');
            return;
        }

        if (!formData.password) {
            formData.password = generateRandomPassword();
        }

        try {
            const endpoint = editingEmployee ?
                `${BACKEND_URL}/api/users/${editingEmployee}` :
                `${BACKEND_URL}/api/hr/employees`;

            const method = editingEmployee ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(editingEmployee ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente');
                setShowCreateForm(false);
                setEditingEmployee(null);
                setFormData(emptyEmployee);
                fetchEmployees();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Error al guardar empleado');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión');
        }
    };

    const handleEditEmployee = (employee) => {
        setFormData({ ...employee, password: '' });
        setEditingEmployee(employee.id);
        setShowCreateForm(true);
        setError('');
        setSuccess('');
    };

    const handleDeleteEmployee = async (employeeId, employeeName) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar al empleado "${employeeName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${employeeId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setSuccess('Empleado eliminado exitosamente');
                fetchEmployees();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.error || 'Error al eliminar empleado');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión');
        }
    };

    const handleToggleEmployeeStatus = async (employeeId, isActive) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${employeeId}/toggle-status`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                fetchEmployees();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Error al cambiar estado del empleado');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión');
        }
    };

    if (!user || !['rh', 'super_admin', 'admin'].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-shield-alt text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">Esta sección está disponible para <b>RH</b>, <b>administradores</b> y <b>super administradores</b>.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando personal operativo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}
                {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg">{success}</div>}

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Personal Operativo
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {user.role === 'rh' ? 'Gestión de empleados operativos de tu sucursal' :
                                user.role === 'admin' ? 'Vista administrativa del personal operativo' :
                                    'Vista completa del personal operativo'}
                        </p>
                    </div>
                    {user.role === 'rh' && (
                        <button
                            onClick={() => {
                                setFormData(emptyEmployee);
                                setEditingEmployee(null);
                                setShowCreateForm(true);
                                setError('');
                                setSuccess('');
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                            + Nuevo Empleado
                        </button>
                    )}
                </div>

                {/* Formulario de creación/edición */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-screen overflow-y-auto">
                            <button onClick={() => setShowCreateForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                                <i className="fas fa-times"></i>
                            </button>
                            <h3 className="text-xl font-bold mb-6 text-gray-800">
                                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                            </h3>
                            <form onSubmit={handleCreateEmployee} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">ID Empleado</label>
                                        <input
                                            type="text"
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Departamento</label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                                        <input
                                            type="text"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Contratación</label>
                                        <input
                                            type="date"
                                            value={formData.hire_date}
                                            onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sucursal</label>
                                        <select
                                            value={formData.branch_id}
                                            onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        >
                                            <option value="">Seleccionar sucursal</option>
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {user.role === 'super_admin' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Salario</label>
                                            <input
                                                type="number"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Contraseña {editingEmployee ? '(dejar en blanco para no cambiar)' : '(opcional)'}
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            placeholder="Se generará automáticamente si está vacío"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : (editingEmployee ? 'Actualizar' : 'Crear')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Lista de empleados */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                                <th className="py-3 px-4 text-left">Empleado</th>
                                <th className="py-3 px-4 text-left">ID</th>
                                <th className="py-3 px-4 text-left">Departamento</th>
                                <th className="py-3 px-4 text-left">Cargo</th>
                                <th className="py-3 px-4 text-left">Sucursal</th>
                                <th className="py-3 px-4 text-left">Estado</th>
                                <th className="py-3 px-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{employee.name}</div>
                                            <div className="text-gray-600 text-sm">{employee.email}</div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-sm">{employee.employee_id || 'N/A'}</td>
                                    <td className="py-3 px-4">{employee.department || 'Sin asignar'}</td>
                                    <td className="py-3 px-4">{employee.position || 'Sin asignar'}</td>
                                    <td className="py-3 px-4">{employee.branch?.name || 'Sin asignar'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {employee.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 space-x-2">
                                        {user.role === 'rh' && (
                                            <>
                                                <button
                                                    onClick={() => handleEditEmployee(employee)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleToggleEmployeeStatus(employee.id, employee.is_active)}
                                                    className={`${employee.is_active ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                                                >
                                                    {employee.is_active ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </>
                                        )}
                                        {user.role === 'super_admin' && (
                                            <>
                                                <button
                                                    onClick={() => handleEditEmployee(employee)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleToggleEmployeeStatus(employee.id, employee.is_active)}
                                                    className={`${employee.is_active ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                                                >
                                                    {employee.is_active ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                        {user.role === 'admin' && (
                                            <span className="text-gray-500 text-sm">Solo consulta</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                                        No hay empleados registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRManagement;