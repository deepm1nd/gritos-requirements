// requirements_web_frontend/src/components/Auth/LoginButton.jsx
import { h } from 'preact';

const LoginButton = () => {
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    // The redirect URI is where GitHub will send the user back to on your frontend
    const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/github/callback';
    
    // Ensure VITE_GITHUB_CLIENT_ID is available
    if (!GITHUB_CLIENT_ID) {
        console.error("VITE_GITHUB_CLIENT_ID is not defined. Please check your .env file.");
        return <p style={{color: 'red'}}>GitHub Client ID not configured. Login unavailable.</p>;
    }
    
    const scope = "read:user user:email"; // Request user's public profile and primary email

    const handleLogin = () => {
        // Construct the GitHub OAuth URL
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
        // Redirect the user to GitHub's authorization page
        window.location.href = githubAuthUrl;
    };

    return (
        <button 
            onClick={handleLogin}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
            Login with GitHub
        </button>
    );
};

export default LoginButton;
