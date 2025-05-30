// requirements_web_frontend/src/pages/RelationshipGraphPage.jsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fetchRelationshipsGraph } from '../api';
import RelationshipGraph from '../components/RelationshipGraph';

const RelationshipGraphPage = () => {
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        fetchRelationshipsGraph()
            .then(data => {
                if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
                    setGraphData(data);
                } else {
                    // Handle cases where data might be missing or not in expected format
                    console.warn("Received graph data is not in the expected format:", data);
                    setGraphData({ nodes: [], links: [] }); // Default to empty graph
                }
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching relationship graph data:", err);
                setError(err.response?.data?.message || err.message || "Failed to fetch graph data.");
                setGraphData(null); // Clear data on error
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-6 h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                Requirements Relationship Graph
            </h1>

            {isLoading && (
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                    <p className="ml-4 text-lg text-gray-700">Loading graph data...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md m-auto" role="alert">
                    <p className="font-bold mb-2">Error Loading Graph</p>
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && graphData && (
                <div className="flex-grow border border-gray-300 rounded-lg shadow-lg overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
                    {/* Ensure container has a specific height for SVG to render into */}
                    <RelationshipGraph graphData={graphData} />
                </div>
            )}

            {!isLoading && !error && (!graphData || graphData.nodes.length === 0) && (
                 <div className="flex-grow flex flex-col justify-center items-center text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3-1 7-6.657 7.343A7.975 7.975 0 0120 16v-2h-4.862" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3-1 7-6.657 7.343A7.975 7.975 0 0120 16v-2h-4.862" /> {/* Placeholder icon, change as needed */}
                    </svg>
                    <p className="mt-4 text-lg text-gray-500">No graph data available to display.</p>
                    <p className="text-sm text-gray-400">Ensure requirements and relationships exist in the database.</p>
                </div>
            )}
        </div>
    );
};

export default RelationshipGraphPage;
