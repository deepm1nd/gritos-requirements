// requirements_web_frontend/src/api/index.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('app_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
    const headers = getAuthHeaders();
    if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Requirement Endpoints ---
export const fetchRequirements = async () => {
    const response = await apiClient.get('/requirements');
    return response.data;
};

export const fetchRequirementById = async (id) => {
    const response = await apiClient.get(`/requirements/${id}`);
    return response.data;
};

export const createRequirement = async (requirementData) => {
    const response = await apiClient.post('/requirements', requirementData);
    return response.data;
};

export const updateRequirement = async (id, requirementData) => {
    const response = await apiClient.put(`/requirements/${id}`, requirementData);
    return response.data;
};

// --- Auth Endpoints ---
export const githubAuthCallback = async (code) => {
    // This request goes to our backend, not directly to GitHub
    const response = await apiClient.post('/auth/github/callback', { code });
    return response.data; // Expected to contain { token, user }
};

// --- Relationship Graph Endpoint ---
export const fetchRelationshipsGraph = async () => {
    const response = await apiClient.get('/relationships/graph');
    return response.data;
};

export default apiClient;
