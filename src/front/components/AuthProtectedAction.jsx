import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import AdminLogin from './AdminLogin.jsx';

const AuthProtectedAction = ({
    children,
    fallbackComponent = null,
    showLoginButton = true,
    loginButtonText = "Acceso Administrativo",
    loginButtonClass = "btn btn-outline-primary",
    requireAuth = true
}) => {
    const { isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    // Si no requiere autenticación, mostrar siempre
    if (!requireAuth) {
        return children;
    }

    // Si está autenticado, mostrar el contenido
    if (isAuthenticated) {
        return children;
    }

    // Si no está autenticado, mostrar el fallback o botón de login
    return (
        <>
            {fallbackComponent || (
                showLoginButton && (
                    <button
                        className={loginButtonClass}
                        onClick={() => setShowLogin(true)}
                        title="Se requiere autenticación administrativa"
                    >
                        <i className="fas fa-lock me-2"></i>
                        {loginButtonText}
                    </button>
                )
            )}

            {showLogin && (
                <AdminLogin
                    onClose={() => setShowLogin(false)}
                    onLoginSuccess={() => setShowLogin(false)}
                />
            )}
        </>
    );
};

export default AuthProtectedAction;