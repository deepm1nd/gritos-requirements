// requirements_web_frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'preact/compat';
import jwtDecode from 'jwt-decode'; // Corrected import name
import { useLocation } from 'wouter-preact'; // For navigation

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('app_token'));
    const [, navigate] = useLocation(); // Wouter's navigation

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp > currentTime) {
                    setIsAuthenticated(true);
                    setUser(decodedToken); // The payload is the user object
                    localStorage.setItem('app_token', token); // Refresh storage (though already there)
                } else {
                    // Token expired
                    logout();
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout(); // Clear invalid token
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData); // userData from backend can be used directly or merged with token payload
        setIsAuthenticated(true);
        localStorage.setItem('app_token', newToken);
        navigate('/'); // Navigate to dashboard or home page after login
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('app_token');
        navigate('/login'); // Navigate to login page after logout
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
