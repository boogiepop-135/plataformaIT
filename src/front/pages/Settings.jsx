import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import BACKEND_URL from '../config/backend.js';

const Settings = () => {
    const { isAuthenticated, getAuthHeaders, user } = useAuth();
    const [settings, setSettings] = useState({
        systemName: 'Plataforma IT',
        systemDescription: 'Sistema integral de gestión para equipos de IT',
        enableNotifications: true,
        autoBackup: true,
        maintenanceMode: false,
        sessionTimeout: 60,
        maxFileSize: 10,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/settings`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/settings`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (!isAuthenticated || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-shield-alt text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso solo para administradores</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">Esta sección solo está disponible para usuarios con rol <b>admin</b>.</p>
                </div>
            </div>
        );
    }
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
                    <div className="px-6 py-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl">
                                <i className="fas fa-cogs text-xl"></i>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                    Configuración del Sistema
                                </h1>
                                <p className="text-blue-300 text-sm">Ajustes y configuraciones generales</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="px-4 sm:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                            {/* General Settings */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                    <h3 className="text-xl font-bold flex items-center">
                                        <i className="fas fa-sliders-h mr-3"></i>
                                        Configuración General
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nombre del Sistema
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.systemName}
                                            onChange={(e) => handleChange('systemName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={settings.systemDescription}
                                            onChange={(e) => handleChange('systemDescription', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Formato de Fecha
                                        </label>
                                        <select
                                            value={settings.dateFormat}
                                            onChange={(e) => handleChange('dateFormat', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Formato de Hora
                                        </label>
                                        <select
                                            value={settings.timeFormat}
                                            onChange={(e) => handleChange('timeFormat', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        >
                                            <option value="24h">24 Horas</option>
                                            <option value="12h">12 Horas (AM/PM)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Security & Performance */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                                    <h3 className="text-xl font-bold flex items-center">
                                        <i className="fas fa-shield-alt mr-3"></i>
                                        Seguridad y Rendimiento
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Timeout de Sesión (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="480"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tamaño máximo de archivo (MB)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={settings.maxFileSize}
                                            onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Notificaciones</h4>
                                                <p className="text-sm text-gray-600">Habilitar notificaciones del sistema</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enableNotifications}
                                                    onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Respaldo Automático</h4>
                                                <p className="text-sm text-gray-600">Respaldo automático de datos</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.autoBackup}
                                                    onChange={(e) => handleChange('autoBackup', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <div>
                                                <h4 className="font-semibold text-amber-800">Modo Mantenimiento</h4>
                                                <p className="text-sm text-amber-600">Activar cuando se realizan actualizaciones</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.maintenanceMode}
                                                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-3 text-sm sm:text-base ${saved
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : saved ? (
                                    <>
                                        <i className="fas fa-check"></i>
                                        <span>¡Configuración Guardada!</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        <span>Guardar Configuración</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Settings;