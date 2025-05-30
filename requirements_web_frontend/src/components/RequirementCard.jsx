// requirements_web_frontend/src/components/RequirementCard.jsx
import { h } from 'preact';
import { useLocation } from 'wouter-preact';

const RequirementCard = ({ requirement, onClick }) => {
    const [, navigate] = useLocation();

    const handleCardClick = () => {
        if (onClick) {
            onClick(requirement.id);
        } else {
            // Default action if no onClick is provided, e.g., navigate to detail page
            // For this iteration, detail page is not fully implemented, so logging or specific action.
            // The guide suggests DashboardPage handles navigation to edit, so this might be for future use.
            console.log(`Card clicked for requirement: ${requirement.id}`);
            // Example: navigate(`/requirements/${requirement.id}`); // If a detail view page existed
        }
    };
    
    // Basic styling, can be expanded
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-yellow-100 text-yellow-700';
            case 'in review': return 'bg-blue-100 text-blue-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'border-red-500';
            case 'medium': return 'border-yellow-500';
            case 'low': return 'border-green-500';
            default: return 'border-gray-300';
        }
    };

    return (
        <div
            className={`bg-white shadow-lg rounded-lg p-5 border-l-4 ${getPriorityColor(requirement.priority)} hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleCardClick()}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-indigo-700 hover:text-indigo-900 transition-colors">
                    {requirement.id}: {requirement.name}
                </h3>
                {requirement.status && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(requirement.status)}`}>
                        {requirement.status}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Type:</span> {requirement.type || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
                <span className="font-medium">Priority:</span> {requirement.priority || 'N/A'}
            </p>
            {/* Add more details as needed, e.g., tags, short description snippet */}
        </div>
    );
};

export default RequirementCard;
