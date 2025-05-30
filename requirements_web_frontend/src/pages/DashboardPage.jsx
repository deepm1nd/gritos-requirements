// requirements_web_frontend/src/pages/DashboardPage.jsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'wouter-preact';
import { fetchRequirements } from '../api';
import RequirementCard from '../components/RequirementCard';
import { useAuth } from '../context/AuthContext'; // To check auth status if needed, or for user info

const DashboardPage = () => {
    const [requirements, setRequirements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [, navigate] = useLocation();
    const { user } = useAuth(); // Get user info if needed for display

    useEffect(() => {
        setIsLoading(true);
        fetchRequirements()
            .then(data => {
                setRequirements(data || []); // Ensure data is an array
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching requirements:", err);
                setError(err.response?.data?.message || err.message || "Failed to fetch requirements.");
                setRequirements([]); // Clear previous data on error
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleCreateNew = () => {
        navigate('/requirements/new');
    };

    const handleViewGraph = () => {
        navigate('/relationships/graph');
    };

    // Example: When a card is clicked, navigate to its edit page
    const handleRequirementClick = (requirementId) => {
        navigate(`/requirements/edit/${requirementId}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                <p className="ml-4 text-lg text-gray-700">Loading requirements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md" role="alert">
                <p className="font-bold mb-2">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                    Requirements Dashboard
                </h1>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                        onClick={handleCreateNew}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                        Create New Requirement
                    </button>
                    <button
                        onClick={handleViewGraph}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                    >
                        View Relationships Graph
                    </button>
                </div>
            </div>

            {requirements.length === 0 && !isLoading ? (
                <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-4 text-lg text-gray-500">No requirements found.</p>
                    <p className="text-sm text-gray-400">Get started by creating a new requirement.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requirements.map(req => (
                        <RequirementCard
                            key={req.id}
                            requirement={req}
                            onClick={() => handleRequirementClick(req.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
