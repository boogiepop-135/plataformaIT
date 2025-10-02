import React, { createContext, useContext, useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is already authenticated
        const savedToken = localStorage.getItem('admin_token');
        if (savedToken) {
            verifyToken(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const verifyToken = async (tokenToVerify) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: tokenToVerify }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.valid && data.user) {
                    setToken(tokenToVerify);
                    setIsAuthenticated(true);
                    setUser(data.user);
                } else {
                    localStorage.removeItem('admin_token');
                    setToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                localStorage.removeItem('admin_token');
                setToken(null);
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('admin_token');
            setToken(null);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setToken(data.token);
                    setIsAuthenticated(true);
                    setUser(data.user);
                    localStorage.setItem('admin_token', data.token);
                    return { success: true };
                } else {
                    return { success: false, error: 'Invalid user data received' };
                }
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error occurred' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${BACKEND_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('admin_token');
        }
    };

    const getAuthHeaders = () => {
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
        }
        return {
            'Content-Type': 'application/json',
        };
    };

    const value = {
        isAuthenticated,
        isLoading,
        token,
        user,
        login,
        logout,
        getAuthHeaders,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};