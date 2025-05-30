// requirements_web_frontend/src/pages/LoginPage.jsx
import { h } from 'preact';
import LoginButton from '../components/Auth/LoginButton';

const LoginPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-12 text-center max-w-md w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Welcome!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Please log in with your GitHub account to continue.
                </p>
                <LoginButton />
            </div>
            <footer className="mt-12 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Product Requirements Management. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LoginPage;
