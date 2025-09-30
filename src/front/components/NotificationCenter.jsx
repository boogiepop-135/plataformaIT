import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend.js';
import { useAuth } from '../hooks/useAuth.jsx';

const NotificationCenter = ({ onClose }) => {
    const { getAuthHeaders } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/notifications`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setNotifications(notifications.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                ));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            info: 'fas fa-info-circle text-blue-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500',
            error: 'fas fa-times-circle text-red-500',
            success: 'fas fa-check-circle text-green-500'
        };
        return icons[type] || icons.info;
    };

    const getNotificationBg = (type) => {
        const backgrounds = {
            info: 'bg-blue-50 border-blue-200',
            warning: 'bg-yellow-50 border-yellow-200',
            error: 'bg-red-50 border-red-200',
            success: 'bg-green-50 border-green-200'
        };
        return backgrounds[type] || backgrounds.info;
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i className="fas fa-bell text-xl"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Centro de Notificaciones</h3>
                                <p className="text-blue-100">
                                    {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todas las notificaciones leídas'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Marcar todas como leídas
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Cargando notificaciones...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
                            <h4 className="text-lg font-semibold text-gray-600 mb-2">No hay notificaciones</h4>
                            <p className="text-gray-500">Cuando tengas nuevas notificaciones aparecerán aquí</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${notification.is_read
                                            ? 'bg-gray-50 border-gray-200 opacity-75'
                                            : getNotificationBg(notification.notification_type)
                                        } hover:shadow-md cursor-pointer`}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <i className={getNotificationIcon(notification.notification_type)}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                    {notification.title}
                                                </h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(notification.created_at).toLocaleDateString('es-ES')}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;