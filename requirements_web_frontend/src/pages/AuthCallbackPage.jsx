// requirements_web_frontend/src/pages/AuthCallbackPage.jsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useLocation, Redirect } from 'wouter-preact';
import { githubAuthCallback } from '../api'; // API function to call backend
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
    const { login } = useAuth();
    const [, navigate] = useLocation();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
            console.error(`GitHub OAuth Error: ${errorParam} - ${errorDescription}`);
            setError(`GitHub OAuth Error: ${errorDescription || errorParam}`);
            setIsLoading(false);
            return;
        }

        if (code) {
            githubAuthCallback(code)
                .then(data => {
                    // data should contain { token, user } from our backend
                    if (data.token && data.user) {
                        login(data.token, data.user); // This will also navigate to '/' via AuthContext
                    } else {
                        setError('Failed to log in. Token or user data missing from backend response.');
                    }
                })
                .catch(err => {
                    console.error('Error during backend auth callback:', err);
                    setError(err.response?.data?.message || err.message || 'An unknown error occurred during login.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setError('No OAuth code found in URL.');
            setIsLoading(false);
        }
    }, [login, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">
                    Processing authentication...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
                <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login', { replace: true })}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Retry Login
                    </button>
                </div>
            </div>
        );
    }
    
    // If login was successful, AuthContext's useEffect or login function should handle navigation.
    // A Redirect component can be a fallback if navigation doesn't occur as expected.
    // However, useAuth().login() calls navigate('/'), so this page should effectively disappear.
    return <Redirect to="/" />; // Should be navigated away by AuthContext
};

export default AuthCallbackPage;
