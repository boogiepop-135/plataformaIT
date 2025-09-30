import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import BACKEND_URL from '../config/backend.js';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

const Profile = () => {
    const { user, getAuthHeaders } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!user) return null;

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/change-password`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            if (response.ok) {
                setSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                setError(data.error || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center py-12">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-8">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-user text-white text-2xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mi Perfil</h2>
                        <p className="text-gray-600">Información de usuario y cambio de contraseña</p>
                    </div>
                    <div className="mb-6">
                        <div className="mb-2"><span className="font-semibold text-gray-700">Nombre:</span> {user.name || 'Sin nombre'}</div>
                        <div className="mb-2"><span className="font-semibold text-gray-700">Email:</span> {user.email}</div>
                        <div className="mb-2"><span className="font-semibold text-gray-700">Rol:</span> {user.role}</div>
                    </div>
                    <hr className="my-6" />
                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cambiar Contraseña</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña Actual</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                required
                            />
                        </div>
                        {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
                        {success && <div className="text-green-600 text-sm font-semibold">¡Contraseña cambiada exitosamente!</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Profile;
