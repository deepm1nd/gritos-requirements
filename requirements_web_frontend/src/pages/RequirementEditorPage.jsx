// requirements_web_frontend/src/pages/RequirementEditorPage.jsx
import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useRoute, useLocation } from 'wouter-preact';

import { fetchRequirementById, createRequirement, updateRequirement } from '../api';
import { validateRequirement } from '../utils/validation';
import MetadataForm from '../components/MetadataForm';
import MarkdownEditor from '../components/MarkdownEditor';
import PreviewPane from '../components/PreviewPane';
import Modal from '../components/Modal'; // Import Modal component

const initialFormData = {
    id: '',
    name: '',
    type: '',
    priority: '',
    status: 'Draft', // Default status
    description_md: '',
    tags: '', // Comma-separated string
    links: '[]', // JSON string for array of objects
    source: '',
    stakeholder: '',
    verification_method: 'N/A', // Default verification method
    allocated_to: '', // Comma-separated string
};

const RequirementEditorPage = () => {
    const [match, params] = useRoute("/requirements/edit/:id");
    const isEditMode = match;
    const requirementIdToEdit = isEditMode ? params.id : null;

    const [, navigate] = useLocation();
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (isEditMode && requirementIdToEdit) {
            setIsLoading(true);
            fetchRequirementById(requirementIdToEdit)
                .then(data => {
                    const populatedData = { ...initialFormData, ...data };
                    populatedData.tags = Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '');
                    populatedData.allocated_to = Array.isArray(data.allocated_to) ? data.allocated_to.join(', ') : (data.allocated_to || '');
                    populatedData.links = Array.isArray(data.links) ? JSON.stringify(data.links, null, 2) : (typeof data.links === 'string' ? data.links : '[]');

                    setFormData(populatedData);
                    setErrors({});
                })
                .catch(err => {
                    console.error(`Error fetching requirement ${requirementIdToEdit}:`, err);
                    setModalState({
                        isOpen: true,
                        title: 'Error Loading Requirement',
                        message: `Failed to load requirement ${requirementIdToEdit}: ${err.message}`,
                        type: 'error'
                    });
                    // Optional: navigate away if critical load fails, or allow retry
                    // navigate('/');
                })
                .finally(() => setIsLoading(false));
        } else {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [isEditMode, requirementIdToEdit]); // Removed navigate from deps as it's stable

    const handleFormChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    const handleDescriptionChange = useCallback((value) => {
        setFormData(prev => ({ ...prev, description_md: value }));
        if (errors.description_md) {
            setErrors(prev => ({ ...prev, description_md: null }));
        }
    }, [errors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const validationErrors = validateRequirement(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setModalState({
                isOpen: true,
                title: 'Validation Error',
                message: 'Please correct the errors highlighted in the form before submitting.',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);
        try {
            let responseMessage = '';
            let responseTitle = 'Success';
            if (isEditMode) {
                await updateRequirement(requirementIdToEdit, formData);
                responseMessage = `Requirement ${requirementIdToEdit} updated successfully. A Pull Request has been created for review.`;
            } else {
                await createRequirement(formData);
                responseMessage = `Requirement ${formData.id} created successfully. A Pull Request has been created for review.`;
            }
            setModalState({ isOpen: true, title: responseTitle, message: responseMessage, type: 'success' });
            // Delay navigation to allow user to see success modal, or navigate on modal close
            // For now, direct navigation after modal confirmation.
        } catch (err) {
            console.error('Error submitting requirement:', err);
            const apiErrorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
            setModalState({
                isOpen: true,
                title: 'Submission Failed',
                message: `Error: ${apiErrorMessage}`,
                type: 'error'
            });
            if (err.response?.data?.errors) {
                 setErrors(prev => ({ ...prev, ...err.response.data.errors }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const closeModalAndRedirect = () => {
        setModalState({ isOpen: false, title: '', message: '', type: 'info' });
        if (modalState.type === 'success') {
            navigate('/');
        }
    };

    if (isLoading && isEditMode && !formData.id && !modalState.isOpen) {
        return <div className="p-6 text-center text-lg">Loading requirement details...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Modal
                isOpen={modalState.isOpen}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                onClose={closeModalAndRedirect}
            />
            <form onSubmit={handleSubmit} className="space-y-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                    {isEditMode ? `Edit Requirement: ${requirementIdToEdit}` : 'Create New Requirement'}
                </h1>

                <MetadataForm data={formData} onChange={handleFormChange} errors={errors} isEditMode={isEditMode} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MarkdownEditor value={formData.description_md} onChange={handleDescriptionChange} />
                    <PreviewPane markdownContent={formData.description_md} />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        disabled={isLoading}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Submit Update for Review' : 'Submit for Review')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequirementEditorPage;
