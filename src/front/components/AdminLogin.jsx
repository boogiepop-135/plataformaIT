import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const AdminLogin = ({ onClose, onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(credentials.username, credentials.password);
            if (result.success) {
                onLoginSuccess && onLoginSuccess();
                onClose && onClose();
            } else {
                setError(result.error || 'Error de autenticación');
            }
        } catch (error) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-primary text-white border-0">
                        <h5 className="modal-title d-flex align-items-center">
                            <i className="fas fa-shield-alt me-2"></i>
                            Acceso Administrativo
                        </h5>
                        {onClose && (
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            ></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="text-center mb-4">
                                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '80px', height: '80px' }}>
                                    <i className="fas fa-lock text-primary" style={{ fontSize: '2rem' }}></i>
                                </div>
                                <p className="text-muted mt-3 mb-4">
                                    Ingresa tus credenciales para acceder a las funciones administrativas
                                </p>
                            </div>

                            {error && (
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <div>{error}</div>
                                </div>
                            )}

                            <div className="mb-3">
                                <label htmlFor="username" className="form-label fw-semibold">
                                    <i className="fas fa-user me-2 text-primary"></i>
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="username"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    placeholder="Ingresa tu usuario"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label fw-semibold">
                                    <i className="fas fa-key me-2 text-primary"></i>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    id="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="Ingresa tu contraseña"
                                    required
                                />
                            </div>

                            <div className="alert alert-info d-flex align-items-start" role="alert">
                                <i className="fas fa-info-circle me-2 mt-1"></i>
                                <div>
                                    <strong>Credenciales por defecto:</strong><br />
                                    Usuario: <code>admin</code><br />
                                    Contraseña: <code>admin123</code>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4">
                            {onClose && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary me-2"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Verificando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Iniciar Sesión
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;