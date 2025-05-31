// requirements_web_frontend/src/components/Auth/PrivateRoute.jsx
import { h } from 'preact';
import { Redirect } from 'wouter'; // Changed to wouter for v2
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'preact/hooks'; // Corrected import

const PrivateRoute = ({ children, ...rest }) => {
    const { isAuthenticated, token } = useAuth(); // Get token to ensure re-check on load
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This effect helps manage the initial loading state.
        // We wait for AuthContext to process the token.
        // A simple way is to check if `token` (from AuthContext) has stabilized
        // with what's in localStorage, or if AuthContext provides an isLoading flag.
        // For now, assume AuthContext's own useEffect is quick.
        // A minimal delay or a check if token processing is done.

        // If token is null (logout or initial) or if token is set (login or initial load from storage),
        // AuthContext's useEffect would have run or is running.
        // We give a very brief moment for that to complete.
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 50); // Small delay for AuthContext to initialize

        return () => clearTimeout(timer);
    }, [token]); // Re-evaluate if token changes (e.g. login/logout)

    if (isLoading && !isAuthenticated) {
        // This state is when AuthContext might not have finished its initial check
        // and we don't have an isAuthenticated status yet.
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Authenticating...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
};
export default PrivateRoute;
