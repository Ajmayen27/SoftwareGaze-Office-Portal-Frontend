import React, { createContext, useContext, useState, useEffect } from 'react';
// Robust local JWT payload decoder (small, dependency-free) — avoids bundler import issues
function decodeToken(token) {
    if (!token || typeof token !== 'string') throw new Error('Invalid token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    try {
        const json = decodeURIComponent(atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(json);
    } catch (err) {
        // Fallback: try simple atob parse for tokens that are plain base64
        try {
            return JSON.parse(atob(payload));
        } catch (err2) {
            throw new Error('Failed to decode token payload');
        }
    }
}

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = decodeToken(token);
                // Debug: log non-sensitive claims to help confirm role/exp
                console.debug('Decoded token payload (claims):', { sub: decodedToken.sub, role: decodedToken.role, exp: decodedToken.exp });
                const currentTime = Date.now() / 1000;
                
                if (decodedToken.exp > currentTime) {
                    const roleValue = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;
                    setUser({
                        username: decodedToken.sub,
                        role: roleValue,
                        token: token
                    });
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        try {
            const decodedToken = decodeToken(token);            // Debug: log non-sensitive claims to help confirm role/exp
            console.debug('Decoded token payload (claims):', { sub: decodedToken.sub, role: decodedToken.role, exp: decodedToken.exp });            const roleValue = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;
            setUser({
                username: decodedToken.sub,
                role: roleValue,
                token: token
            });
        } catch (error) {
            console.error('Invalid token:', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: !!user?.role && user.role.toString().toUpperCase().includes('ADMIN')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
