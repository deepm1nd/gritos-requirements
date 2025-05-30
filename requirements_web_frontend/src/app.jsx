// requirements_web_frontend/src/app.jsx
import { h } from 'preact';
import { Router, Route, Switch } from "wouter-preact";
import { AuthProvider, useAuth } from './context/AuthContext';

import PrivateRoute from './components/Auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import RequirementEditorPage from './pages/RequirementEditorPage';
import RelationshipGraphPage from './pages/RelationshipGraphPage'; // Import the actual graph page

// Global navigation/header
const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    return (
        <header className="bg-indigo-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/" className="text-xl font-semibold hover:text-indigo-200">Requirements UI</a>
                <nav>
                    {isAuthenticated && user && (
                        <span className="mr-4">Welcome, {user.username || user.name}!</span>
                    )}
                    {isAuthenticated ? (
                        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium">Logout</button>
                    ) : (
                        <a href="/login" className="hover:text-indigo-200">Login</a>
                    )}
                </nav>
            </div>
        </header>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <main className="container mx-auto mt-4 p-4">
                    <Switch>
                        <Route path="/login" component={LoginPage} />
                        <Route path="/auth/github/callback" component={AuthCallbackPage} />
                        
                        {/* Protected Routes */}
                        <PrivateRoute path="/">
                            <DashboardPage />
                        </PrivateRoute>
                        <PrivateRoute path="/requirements/new">
                            <RequirementEditorPage />
                        </PrivateRoute>
                        <PrivateRoute path="/requirements/edit/:id">
                            <RequirementEditorPage /> 
                        </PrivateRoute>
                        <PrivateRoute path="/relationships/graph">
                            <RelationshipGraphPage /> {/* Now uses the imported graph page */}
                        </PrivateRoute>

                        {/* Fallback for unknown routes */}
                        <Route>
                            <div className="text-center mt-10">
                                <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
                                <p className="mt-2">Sorry, the page you are looking for does not exist.</p>
                                <a href="/" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">Go to Homepage</a>
                            </div>
                        </Route>
                    </Switch>
                </main>
            </Router>
        </AuthProvider>
    );
}

export default App;
