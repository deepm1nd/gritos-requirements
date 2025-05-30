// requirements_web_frontend/src/components/MetadataForm.jsx
import { h } from 'preact';
import { 
    REQUIREMENT_TYPES, 
    REQUIREMENT_PRIORITIES, 
    REQUIREMENT_STATUSES, 
    VERIFICATION_METHODS 
} from '../utils/validation'; // Import constants for dropdowns

const MetadataForm = ({ data, onChange, errors, isEditMode = false }) => {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange(name, type === 'checkbox' ? checked : value);
    };

    const renderInput = (name, label, type = 'text', options = {}) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {options.required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={data[name] || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full py-2 px-3 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    disabled={options.disabled}
                >
                    <option value="">Select {label.toLowerCase()}...</option>
                    {options.selectOptions?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : type === 'textarea' ? (
                 <textarea
                    id={name}
                    name={name}
                    value={data[name] || ''}
                    onChange={handleChange}
                    rows={options.rows || 3}
                    className={`mt-1 block w-full py-2 px-3 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder={options.placeholder}
                    disabled={options.disabled}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={data[name] || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full py-2 px-3 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder={options.placeholder}
                    disabled={options.disabled}
                />
            )}
            {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
            {options.helpText && <p className="mt-1 text-xs text-gray-500">{options.helpText}</p>}
        </div>
    );

    return (
        <div className="space-y-6 bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {renderInput('id', 'ID', 'text', { required: true, disabled: isEditMode, placeholder: "PROJECT-TYPE-AREA-NNNNN" })}
                {renderInput('name', 'Name', 'text', { required: true, placeholder: "Concise requirement name" })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                {renderInput('type', 'Type', 'select', { required: true, selectOptions: REQUIREMENT_TYPES })}
                {renderInput('priority', 'Priority', 'select', { required: true, selectOptions: REQUIREMENT_PRIORITIES })}
                {renderInput('status', 'Status', 'select', { required: true, selectOptions: REQUIREMENT_STATUSES })}
            </div>
            
            {renderInput('tags', 'Tags', 'text', { placeholder: "Comma-separated tags, e.g., backend, api" })}

            <h3 className="text-lg font-medium text-gray-700 pt-4 border-t mt-6">SysML & Contextual Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {renderInput('source', 'Source', 'text', { placeholder: "Origin of the requirement, e.g., Stakeholder X" })}
                {renderInput('stakeholder', 'Stakeholder', 'text', { placeholder: "Primary interested party" })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {renderInput('verification_method', 'Verification Method', 'select', { selectOptions: VERIFICATION_METHODS })}
                {renderInput('allocated_to', 'Allocated To (SysML Block IDs)', 'text', { placeholder: "Comma-separated Block IDs, e.g., BLK-SYS-SUBSYS1, BLK-SYS-SUBSYS2" })}
            </div>
            
            {renderInput('links', 'Links (JSON Array)', 'textarea', { 
                rows: 4, 
                placeholder: '[{"type": "related", "target": "REQ-002"}, {"type": "implements", "target": "EPIC-001"}]',
                helpText: "Enter as a JSON array of objects, each with 'type' and 'target' keys."
            })}
        </div>
    );
};

export default MetadataForm;
