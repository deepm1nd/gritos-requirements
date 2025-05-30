// requirements_web_frontend/src/utils/validation.js

export const REQUIREMENT_TYPES = ['Functional', 'Non-Functional', 'UI/UX', 'CS', 'FS', 'PMP', 'QNR', 'SEC', 'EPIC', 'STORY', 'CON', 'BUS', 'SYS', 'BLK'];
export const REQUIREMENT_PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Optional'];
export const REQUIREMENT_STATUSES = ['Draft', 'Proposed', 'Approved', 'Implemented', 'Verified', 'Archived'];
export const VERIFICATION_METHODS = ['Test', 'Inspection', 'Analysis', 'Demonstration', 'N/A']; // Added N/A as a common default

export const validateRequirement = (formData) => {
    const errors = {};

    // ID validation: Basic check for non-empty and a general format.
    // Example: PRODX-FNC-AUTH-LOGIN-00010. More specific regex might be needed.
    if (!formData.id) {
        errors.id = 'ID is required.';
    } else if (!/^[A-Z0-9]+(-[A-Z0-9]+)*-\d{5}$/i.test(formData.id)) {
        errors.id = 'ID format is invalid. Expected format like PROJECTCODE-TYPE-SUBTYPE-AREA-NNNNN.';
    }

    if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Name is required.';
    }

    if (!formData.type) {
        errors.type = 'Type is required.';
    } else if (!REQUIREMENT_TYPES.includes(formData.type)) {
        errors.type = 'Invalid type selected.';
    }

    if (!formData.priority) {
        errors.priority = 'Priority is required.';
    } else if (!REQUIREMENT_PRIORITIES.includes(formData.priority)) {
        errors.priority = 'Invalid priority selected.';
    }

    if (!formData.status) {
        errors.status = 'Status is required.';
    } else if (!REQUIREMENT_STATUSES.includes(formData.status)) {
        errors.status = 'Invalid status selected.';
    }
    
    if (formData.verification_method && !VERIFICATION_METHODS.includes(formData.verification_method)) {
        errors.verification_method = 'Invalid verification method selected.';
    }


    if (!formData.description_md || formData.description_md.trim() === '') {
        errors.description_md = 'Description (Markdown) is required.';
    }

    // Links validation: if provided, must be a valid JSON string for an array of objects
    if (formData.links && typeof formData.links === 'string' && formData.links.trim() !== '') {
        try {
            const parsedLinks = JSON.parse(formData.links);
            if (!Array.isArray(parsedLinks)) {
                errors.links = 'Links must be a valid JSON array string.';
            } else {
                for (const link of parsedLinks) {
                    if (typeof link !== 'object' || link === null || !link.type || !link.target) {
                        errors.links = 'Each link object must have a "type" and "target" property.';
                        break;
                    }
                    if (typeof link.type !== 'string' || typeof link.target !== 'string') {
                        errors.links = 'Link "type" and "target" must be strings.';
                        break;
                    }
                }
            }
        } catch (e) {
            errors.links = 'Links field contains invalid JSON.';
        }
    } else if (formData.links && !Array.isArray(formData.links) && typeof formData.links !== 'string' ) {
        // If it's not a string (already parsed perhaps) but also not an array
        errors.links = 'Links data is not in a recognized format (should be array or JSON string).';
    }


    // Tags and allocated_to are comma-separated strings, no specific validation other than parsing
    // The actual parsing to array is done in markdownUtils.constructMarkdown or form handling.
    // If they need to be validated as non-empty if the string is non-empty after splitting, add here.
    // For now, just checking they are strings if provided.
    if (formData.tags && typeof formData.tags !== 'string') {
        // This might be too strict if the form pre-parses it to an array.
        // errors.tags = 'Tags should be a comma-separated string.';
    }
    if (formData.allocated_to && typeof formData.allocated_to !== 'string') {
        // errors.allocated_to = 'Allocated To should be a comma-separated string of Block IDs.';
    }
    
    // Other text fields like source, stakeholder
    if (formData.source && typeof formData.source !== 'string') {
        errors.source = 'Source should be a string.';
    }
    if (formData.stakeholder && typeof formData.stakeholder !== 'string') {
        errors.stakeholder = 'Stakeholder should be a string.';
    }


    return errors;
};
