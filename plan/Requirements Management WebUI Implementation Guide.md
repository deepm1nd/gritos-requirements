# **Requirements Management WebUI Implementation Guide (Detailed)**

## **1\. Introduction and Purpose**

This guide provides step-by-step instructions for the detailed development and deployment of the Requirements Management WebUI, expanding upon the blueprint outlined in the \[Requirements Management WebUI Development Plan\](uploaded:Requirements Management WebUI Development Plan.md). It aims to provide a comprehensive, actionable manual for developers, covering project setup, in-depth component implementation, API development, robust Git/GitHub integration, and deployment considerations. This version includes specific guidance and conceptual code to enable the development team to implement the entire WebUI, including the advanced **Relationship Visualization** feature.

This document serves as a practical manual for developers, ensuring seamless integration with the "Docs as Code" framework, Git, GitHub, SQLite, and SysML generation capabilities.

## **2\. Prerequisites**

Before starting development, ensure you have the following installed and configured:

* **Git:** Version control system.  
* **GitHub Account:** For repository hosting, Pull Requests, and GitHub Actions.  
* **Node.js (LTS version recommended):** JavaScript runtime environment.  
* **npm (Node Package Manager):** Comes with Node.js.  
* **Text Editor / IDE:** VS Code with relevant extensions (e.g., Preact, Tailwind CSS, ESLint, Prettier).  
* **Basic understanding of:**  
  * JavaScript (ES6+)  
  * Node.js and Express.js  
  * Preact (or React-like frameworks)  
  * Markdown and YAML  
  * Git and GitHub workflows  
  * RESTful APIs  
  * **Graph visualization concepts (for Relationship Visualization)**  
  * **D3.js (or similar library) fundamentals (for Relationship Visualization)**

## **3\. Repository Setup for WebUI**

We will create two new sub-directories within your main product-requirements repository for the WebUI components:

* requirements\_web\_frontend/: For the Preact application.  
* requirements\_web\_backend/: For the Node.js Express API.

### **3.1. Create Project Directories**

Navigate to your product-requirements root directory in your terminal:

mkdir requirements\_web\_frontend  
mkdir requirements\_web\_backend

### **3.2. Initialize Frontend Project (Preact with Vite)**

Navigate into the frontend directory and initialize a new Preact project using Vite:

cd requirements\_web\_frontend  
npm create vite@latest . \-- \--template preact  
npm install  
npm install tailwindcss postcss autoprefixer  
npx tailwindcss init \-p  
npm install d3 \# NEW: For Relationship Visualization  
npm install react-simplemde-editor \# For Markdown editor

**Configure Tailwind CSS:**

Modify tailwind.config.js:

// tailwind.config.js  
/\*\* @type {import('tailwindcss').Config} \*/  
export default {  
  content: \[  
    "./index.html",  
    "./src/\*\*/\*.{js,ts,jsx,tsx}",  
  \],  
  theme: {  
    extend: {},  
  },  
  plugins: \[\],  
}

Modify src/index.css (or src/style.css if Vite generated it):

/\* src/index.css or src/style.css \*/  
@tailwind base;  
@tailwind components;  
@tailwind utilities;

/\* Add custom fonts, if desired \*/  
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700\&display=swap');  
body {  
  font-family: 'Inter', sans-serif;  
}

/\* Basic styling for graph visualization (can be expanded) \*/  
.node {  
  stroke: \#fff;  
  stroke-width: 1.5px;  
}

.link {  
  stroke: \#999;  
  stroke-opacity: 0.6;  
  stroke-width: 1.5px;  
}

.link-label {  
  font-size: 10px;  
  fill: \#555;  
  pointer-events: none; /\* Make label non-interactive so clicks go through to link/node \*/  
}

/\* Tooltip for nodes/links \*/  
.tooltip {  
  position: absolute;  
  text-align: center;  
  width: auto;  
  height: auto;  
  padding: 8px;  
  font: 12px sans-serif;  
  background: lightsteelblue;  
  border: 0px;  
  border-radius: 8px;  
  pointer-events: none;  
  opacity: 0;  
  transition: opacity 0.2s;  
}

### **3.3. Initialize Backend Project (Node.js Express)**

Navigate into the backend directory and initialize a new Node.js project:

cd ../requirements\_web\_backend \# Go back to root, then into backend  
npm init \-y  
npm install express simple-git @octokit/rest js-yaml markdown-it sqlite3 fs-extra moment dotenv

## **4\. Frontend Development (Preact) \- Detailed Implementation**

This section provides an in-depth guide to implementing the Preact-based web UI, including the **Relationship Visualization** feature.

### **4.1. Core Application Structure (requirements\_web\_frontend/src/)**

* main.jsx: Entry point for the Preact application.  
* App.jsx: Main application component, handles routing and overall layout.  
* index.css: Global styles (Tailwind CSS imports, custom graph styles).  
* components/: Directory for reusable UI components.  
* pages/: Directory for page-level components (e.g., Dashboard, RequirementEditor, RelationshipGraph).  
* api/: Directory for API client functions.  
* hooks/: Directory for custom React hooks.  
* context/: Directory for React Context providers.  
* utils/: Utility functions (e.g., validation, data transformations).

### **4.2. Authentication Components (components/Auth/)**

Implement GitHub OAuth 2.0 flow.

* **LoginButton.jsx**:  
  * **Purpose:** Initiates the GitHub OAuth flow.  
  * **Implementation:** A button that, when clicked, redirects the user to GitHub's OAuth authorization URL.  
  * **Code Snippet:**  
    // requirements\_web\_frontend/src/components/Auth/LoginButton.jsx  
    import { h } from 'preact';

    const GITHUB\_CLIENT\_ID \= import.meta.env.VITE\_GITHUB\_CLIENT\_ID;  
    const GITHUB\_REDIRECT\_URI \= import.meta.env.VITE\_GITHUB\_REDIRECT\_URI;  
    const GITHUB\_SCOPE \= 'repo user:email'; // Permissions needed

    const handleLogin \= () \=\> {  
      window.location.href \= \`https://github.com/login/oauth/authorize?client\_id=${GITHUB\_CLIENT\_ID}\&redirect\_uri=${GITHUB\_REDIRECT\_URI}\&scope=${GITHUB\_SCOPE}\`;  
    };

    export function LoginButton() {  
      return (  
        \<button  
          onClick={handleLogin}  
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition duration-300 ease-in-out"  
        \>  
          Login with GitHub  
        \</button\>  
      );  
    }

* **AuthCallbackPage.jsx (Page Component):**  
  * **Purpose:** Handles the redirect from GitHub after OAuth authorization.  
  * **Implementation:** This page extracts the code from the URL query parameters, sends it to your Node.js backend's authentication endpoint (POST /api/auth/github/callback), stores the received session token securely, and redirects the user to the application dashboard.  
  * **Code Snippet:**  
    // requirements\_web\_frontend/src/pages/AuthCallbackPage.jsx  
    import { h } from 'preact';  
    import { useEffect } from 'preact/hooks';  
    import { useLocation, useWouter, navigate } from 'wouter';  
    import { githubAuthCallback } from '../api';  
    import { useAuth } from '../context/AuthContext';

    export function AuthCallbackPage() {  
      const \[location, setLocation\] \= useLocation();  
      const { login } \= useAuth(); // Get login function from AuthContext

      useEffect(() \=\> {  
        const urlParams \= new URLSearchParams(location.search);  
        const code \= urlParams.get('code');

        if (code) {  
          githubAuthCallback(code)  
            .then(data \=\> {  
              localStorage.setItem('authToken', data.token); // Store token  
              login(data.user); // Update auth context  
              navigate('/'); // Redirect to dashboard  
            })  
            .catch(error \=\> {  
              console.error('Authentication error:', error);  
              // Display error message to user (e.g., using a toast/modal)  
              navigate('/login?error=auth\_failed'); // Redirect to login with error  
            });  
        } else {  
          navigate('/login?error=no\_code'); // No code received  
        }  
      }, \[location, login\]);

      return (  
        \<div className="flex items-center justify-center min-h-screen bg-gray-100"\>  
          \<div className="p-8 bg-white rounded-lg shadow-md"\>  
            \<p className="text-lg font-semibold"\>Authenticating...\</p\>  
            \<p className="text-sm text-gray-600 mt-2"\>Please wait while we log you in.\</p\>  
          \</div\>  
        \</div\>  
      );  
    }

* **AuthContext.jsx**:  
  * **Purpose:** Manages global authentication state.  
  * **Implementation:** A Preact Context provider to manage isAuthenticated, user, and token. Provides login and logout functions. Checks for existing token on app load.  
  * **Code Snippet:**  
    // requirements\_web\_frontend/src/context/AuthContext.jsx  
    import { h, createContext } from 'preact';  
    import { useState, useContext, useEffect } from 'preact/hooks';  
    import { navigate } from 'wouter';  
    import jwt\_decode from 'jwt-decode'; // npm install jwt-decode

    const AuthContext \= createContext(null);

    export function AuthProvider({ children }) {  
      const \[isAuthenticated, setIsAuthenticated\] \= useState(false);  
      const \[user, setUser\] \= useState(null);

      useEffect(() \=\> {  
        const token \= localStorage.getItem('authToken');  
        if (token) {  
          try {  
            const decoded \= jwt\_decode(token);  
            // Check token expiry  
            if (decoded.exp \* 1000 \> Date.now()) {  
              setIsAuthenticated(true);  
              setUser(decoded);  
            } else {  
              localStorage.removeItem('authToken');  
              setIsAuthenticated(false);  
              setUser(null);  
              navigate('/login');  
            }  
          } catch (e) {  
            console.error('Invalid token:', e);  
            localStorage.removeItem('authToken');  
            setIsAuthenticated(false);  
            setUser(null);  
            navigate('/login');  
          }  
        }  
      }, \[\]);

      const login \= (userData) \=\> {  
        setIsAuthenticated(true);  
        setUser(userData);  
      };

      const logout \= () \=\> {  
        localStorage.removeItem('authToken');  
        setIsAuthenticated(false);  
        setUser(null);  
        navigate('/login');  
      };

      return (  
        \<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}\>  
          {children}  
        \</AuthContext.Provider\>  
      );  
    }

    export const useAuth \= () \=\> useContext(AuthContext);

* **PrivateRoute.jsx**:  
  * **Purpose:** Protects routes, redirecting unauthenticated users.  
  * **Implementation:** A routing component that checks isAuthenticated from AuthContext and renders children or redirects.  
  * **Code Snippet:**  
    // requirements\_web\_frontend/src/components/Auth/PrivateRoute.jsx  
    import { h } from 'preact';  
    import { useAuth } from '../../context/AuthContext';  
    import { Redirect } from 'wouter';

    export default function PrivateRoute({ children }) {  
      const { isAuthenticated } \= useAuth();  
      return isAuthenticated ? children : \<Redirect to="/login" /\>;  
    }

### **4.3. API Client (api/index.js)**

Create functions to interact with your Node.js backend. Add a new function for fetching relationship graph data.

// requirements\_web\_frontend/src/api/index.js  
const API\_BASE\_URL \= import.meta.env.VITE\_API\_BASE\_URL || 'http://localhost:3000/api';

const getAuthHeaders \= () \=\> {  
  const token \= localStorage.getItem('authToken'); // Or from AuthContext  
  return token ? { 'Authorization': \`Bearer ${token}\` } : {};  
};

export const fetchRequirements \= async () \=\> {  
  const response \= await fetch(\`${API\_BASE\_URL}/requirements\`, { headers: getAuthHeaders() });  
  if (\!response.ok) throw new Error('Failed to fetch requirements');  
  return response.json();  
};

export const fetchRequirementById \= async (id) \=\> {  
  const response \= await fetch(\`${API\_BASE\_URL}/requirements/${id}\`, { headers: getAuthHeaders() });  
  if (\!response.ok) throw new Error('Failed to fetch requirement');  
  return response.json();  
};

export const createRequirement \= async (data) \=\> {  
  const response \= await fetch(\`${API\_BASE\_URL}/requirements\`, {  
    method: 'POST',  
    headers: {  
      'Content-Type': 'application/json',  
      ...getAuthHeaders(),  
    },  
    body: JSON.stringify(data),  
  });  
  if (\!response.ok) throw new Error('Failed to create requirement');  
  return response.json();  
};

export const updateRequirement \= async (id, data) \=\> {  
  const response \= await fetch(\`${API\_BASE\_URL}/requirements/${id}\`, {  
    method: 'PUT',  
    headers: {  
      'Content-Type': 'application/json',  
      ...getAuthHeaders(),  
    },  
    body: JSON.stringify(data),  
  });  
  if (\!response.ok) throw new Error('Failed to update requirement');  
  return response.json();  
};

// Add authentication API calls  
export const githubAuthCallback \= async (code) \=\> {  
  const response \= await fetch(\`${API\_BASE\_URL}/auth/github/callback\`, {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify({ code }),  
  });  
  if (\!response.ok) throw new Error('GitHub auth failed');  
  return response.json();  
};

// NEW: Fetch relationship graph data  
export const fetchRelationshipsGraph \= async () \=\> {  
  const response \= await fetch(\`${API\_BASE\_URL}/relationships/graph\`, { headers: getAuthHeaders() });  
  if (\!response.ok) throw new Error('Failed to fetch relationship graph');  
  return response.json();  
};

### **4.4. UI Components Implementation (components/ and pages/) \- Detailed**

* **App.jsx (Main Layout & Routing):**  
  * **Purpose:** Defines the main application layout and routes.  
  * **Implementation:** Uses wouter for routing. Adds a new route for the Relationship Graph.  
  * **Code Snippet:**  
    // requirements\_web\_frontend/src/App.jsx  
    import { h } from 'preact';  
    import { useRoutes } from 'wouter';  
    import { AuthProvider } from './context/AuthContext';  
    import PrivateRoute from './components/Auth/PrivateRoute';  
    import LoginPage from './pages/LoginPage';  
    import DashboardPage from './pages/DashboardPage';  
    import RequirementEditorPage from './pages/RequirementEditorPage';  
    import AuthCallbackPage from './pages/AuthCallbackPage';  
    import RelationshipGraphPage from './pages/RelationshipGraphPage'; // NEW

    const routes \= {  
      '/': \<PrivateRoute\>\<DashboardPage /\>\</PrivateRoute\>,  
      '/login': \<LoginPage /\>,  
      '/auth/github/callback': \<AuthCallbackPage /\>,  
      '/requirements/new': \<PrivateRoute\>\<RequirementEditorPage /\>\</PrivateRoute\>,  
      '/requirements/edit/:id': \<PrivateRoute\>\<RequirementEditorPage /\>\</PrivateRoute\>,  
      '/relationships/graph': \<PrivateRoute\>\<RelationshipGraphPage /\>\</PrivateRoute\>, // NEW  
    };

    export function App() {  
      const routeResult \= useRoutes(routes);  
      return (  
        \<AuthProvider\>  
          \<div className="min-h-screen bg-gray-100 flex flex-col"\>  
            {routeResult}  
          \</div\>  
        \</AuthProvider\>  
      );  
    }

* **DashboardPage.jsx (pages/DashboardPage.jsx):**  
  * **Purpose:** Displays a list of requirements.  
  * **Implementation:** Fetches requirements, displays them, and provides navigation to editor and graph view.  
  * **Key Features:**  
    * Fetches requirements using fetchRequirements.  
    * Displays them using RequirementCard components (a simple component showing ID, name, status).  
    * Includes SearchFilter and Pagination components (to be implemented).  
    * Button to navigate to /requirements/new.  
    * **NEW:** Button to navigate to /relationships/graph.  
  * **Conceptual Code:**  
    // requirements\_web\_frontend/src/pages/DashboardPage.jsx  
    import { h } from 'preact';  
    import { useEffect, useState } from 'preact/hooks';  
    import { navigate } from 'wouter';  
    import { fetchRequirements } from '../api';  
    import { RequirementCard } from '../components/RequirementCard'; // Create this component

    export function DashboardPage() {  
      const \[requirements, setRequirements\] \= useState(\[\]);  
      const \[loading, setLoading\] \= useState(true);  
      const \[error, setError\] \= useState(null);

      useEffect(() \=\> {  
        fetchRequirements()  
          .then(data \=\> {  
            setRequirements(data);  
            setLoading(false);  
          })  
          .catch(err \=\> {  
            setError(err);  
            setLoading(false);  
          });  
      }, \[\]);

      if (loading) return \<div className="flex justify-center items-center h-screen"\>Loading requirements...\</div\>;  
      if (error) return \<div className="flex justify-center items-center h-screen text-red-600"\>Error: {error.message}\</div\>;

      return (  
        \<div className="container mx-auto p-4"\>  
          \<h1 className="text-3xl font-bold text-gray-800 mb-6"\>Requirements Dashboard\</h1\>  
          \<div className="flex justify-between items-center mb-4"\>  
            \<button  
              onClick={() \=\> navigate('/requirements/new')}  
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"  
            \>  
              Create New Requirement  
            \</button\>  
            \<button  
              onClick={() \=\> navigate('/relationships/graph')}  
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"  
            \>  
              View Relationships Graph  
            \</button\>  
          \</div\>  
          {/\* SearchFilter and Pagination components would go here \*/}  
          \<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"\>  
            {requirements.map(req \=\> (  
              \<RequirementCard key={req.id} requirement={req} onClick={() \=\> navigate(\`/requirements/edit/${req.id}\`)} /\>  
            ))}  
          \</div\>  
        \</div\>  
      );  
    }

    * **RequirementCard.jsx (Example Component):**  
      // requirements\_web\_frontend/src/components/RequirementCard.jsx  
      import { h } from 'preact';

      export function RequirementCard({ requirement, onClick }) {  
        return (  
          \<div  
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"  
            onClick={onClick}  
          \>  
            \<h2 className="text-xl font-semibold text-gray-900 mb-2"\>{requirement.name}\</h2\>  
            \<p className="text-sm text-gray-600"\>ID: {requirement.id}\</p\>  
            \<p className="text-sm text-gray-600"\>Type: {requirement.type}\</p\>  
            \<p className="text-sm text-gray-600"\>Status: {requirement.status}\</p\>  
          \</div\>  
        );  
      }

* **RequirementEditorPage.jsx (pages/RequirementEditorPage.jsx):**  
  * **Purpose:** Provides the interface for creating and editing requirements.  
  * **Implementation:**  
    * Uses wouter's useRoute hook to get id for edit mode.  
    * If id exists, fetches existing requirement data using fetchRequirementById and populates the form.  
    * **MetadataForm.jsx (Sub-component):**  
      * **Purpose:** Handles all YAML front matter fields.  
      * **Implementation:** Uses useState for form fields. Includes inputs for id, name, type, priority, status, tags, links, and **SysML-specific fields (source, stakeholder, verification\_method, allocated\_to)**.  
      * **SysML Fields Integration Details:**  
        * source, stakeholder: Simple text inputs.  
        * verification\_method: Dropdown (\<select\>) with options: "Test", "Inspection", "Analysis", "Demonstration".  
        * allocated\_to: This is an array of strings. Can be implemented as a multi-select dropdown if block IDs are predefined, or a comma-separated text input that gets parsed into an array. For now, a text input that takes comma-separated IDs is simpler.  
      * **Code Snippet (Partial MetadataForm.jsx):**  
        // requirements\_web\_frontend/src/components/MetadataForm.jsx  
        import { h } from 'preact';  
        import { useState, useEffect } from 'preact/hooks';

        export function MetadataForm({ data, onChange, errors }) {  
          const \[formData, setFormData\] \= useState(data);

          useEffect(() \=\> {  
            setFormData(data); // Update form data when parent 'data' prop changes (e.g., on edit load)  
          }, \[data\]);

          const handleChange \= (e) \=\> {  
            const { name, value, type, checked } \= e.target;  
            let newValue \= value;

            if (type \=== 'checkbox') {  
              newValue \= checked;  
            } else if (name \=== 'tags' || name \=== 'allocated\_to') {  
              newValue \= value.split(',').map(s \=\> s.trim()).filter(s \=\> s \!== '');  
            } else if (name \=== 'links') {  
                // Complex logic for links: requires dynamic add/remove rows  
                // For simplicity, let's assume a JSON string input for now, or a dedicated sub-component  
                try {  
                    newValue \= JSON.parse(value);  
                } catch (e) {  
                    // Handle invalid JSON input  
                    newValue \= value;  
                }  
            }

            setFormData(prev \=\> ({ ...prev, \[name\]: newValue }));  
            onChange({ ...formData, \[name\]: newValue }); // Propagate changes up  
          };

          const renderError \= (field) \=\> errors\[field\] && \<p className="text-red-500 text-xs mt-1"\>{errors\[field\]}\</p\>;

          return (  
            \<div className="p-4 bg-white rounded-lg shadow-md mb-4"\>  
              \<h2 className="text-xl font-semibold mb-4"\>Requirement Metadata\</h2\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id"\>  
                  ID \<span className="text-red-500"\>\*\</span\>  
                \</label\>  
                \<input  
                  type="text"  
                  id="id"  
                  name="id"  
                  value={formData.id || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                  placeholder="PRODX-FNC-AUTH-LOGIN-00010"  
                /\>  
                {renderError('id')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name"\>  
                  Name \<span className="text-red-500"\>\*\</span\>  
                \</label\>  
                \<input  
                  type="text"  
                  id="name"  
                  name="name"  
                  value={formData.name || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                  placeholder="User Login Capability"  
                /\>  
                {renderError('name')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type"\>  
                  Type \<span className="text-red-500"\>\*\</span\>  
                \</label\>  
                \<select  
                  id="type"  
                  name="type"  
                  value={formData.type || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                \>  
                  \<option value=""\>Select Type\</option\>  
                  \<option value="Functional"\>Functional\</option\>  
                  \<option value="Non-Functional"\>Non-Functional\</option\>  
                  \<option value="UI/UX"\>UI/UX\</option\>  
                  \<option value="CS"\>CyberSecurity\</option\>  
                  \<option value="FS"\>Functional Safety\</option\>  
                  \<option value="PMP"\>Product Management\</option\>  
                  \<option value="QNR"\>Quality and Reliability\</option\>  
                  \<option value="SEC"\>Physical Security\</option\>  
                  \<option value="EPIC"\>Epic\</option\>  
                  \<option value="STORY"\>User Story\</option\>  
                  \<option value="CON"\>Constraint\</option\>  
                  \<option value="BUS"\>Business\</option\>  
                  \<option value="SYS"\>System\</option\>  
                  \<option value="BLK"\>SysML Block\</option\> {/\* NEW SysML Type \*/}  
                \</select\>  
                {renderError('type')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority"\>  
                  Priority \<span className="text-red-500"\>\*\</span\>  
                \</label\>  
                \<select  
                  id="priority"  
                  name="priority"  
                  value={formData.priority || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                \>  
                  \<option value=""\>Select Priority\</option\>  
                  \<option value="Critical"\>Critical\</option\>  
                  \<option value="High"\>High\</option\>  
                  \<option value="Medium"\>Medium\</option\>  
                  \<option value="Low"\>Low\</option\>  
                  \<option value="Optional"\>Optional\</option\>  
                \</select\>  
                {renderError('priority')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status"\>  
                  Status \<span className="text-red-500"\>\*\</span\>  
                \</label\>  
                \<select  
                  id="status"  
                  name="status"  
                  value={formData.status || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                \>  
                  \<option value=""\>Select Status\</option\>  
                  \<option value="Draft"\>Draft\</option\>  
                  \<option value="Proposed"\>Proposed\</option\>  
                  \<option value="Approved"\>Approved\</option\>  
                  \<option value="Implemented"\>Implemented\</option\>  
                  \<option value="Verified"\>Verified\</option\>  
                  \<option value="Archived"\>Archived\</option\>  
                \</select\>  
                {renderError('status')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags"\>  
                  Tags (comma-separated)  
                \</label\>  
                \<input  
                  type="text"  
                  id="tags"  
                  name="tags"  
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                  placeholder="authentication, UI, core"  
                /\>  
                {renderError('tags')}  
              \</div\>

              {/\* NEW: SysML-specific attributes \*/}  
              \<h3 className="text-lg font-semibold mt-6 mb-3"\>SysML & Custom Attributes\</h3\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="source"\>  
                  Source  
                \</label\>  
                \<input  
                  type="text"  
                  id="source"  
                  name="source"  
                  value={formData.source || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                  placeholder="Customer Interview Log \#2025-03-15"  
                /\>  
                {renderError('source')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stakeholder"\>  
                  Stakeholder  
                \</label\>  
                \<input  
                  type="text"  
                  id="stakeholder"  
                  name="stakeholder"  
                  value={formData.stakeholder || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                  placeholder="Product Marketing Lead"  
                /\>  
                {renderError('stakeholder')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="verification\_method"\>  
                  Verification Method  
                \</label\>  
                \<select  
                  id="verification\_method"  
                  name="verification\_method"  
                  value={formData.verification\_method || ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                \>  
                  \<option value=""\>Select Method\</option\>  
                  \<option value="Test"\>Test\</option\>  
                  \<option value="Inspection"\>Inspection\</option\>  
                  \<option value="Analysis"\>Analysis\</option\>  
                  \<option value="Demonstration"\>Demonstration\</option\>  
                \</select\>  
                {renderError('verification\_method')}  
              \</div\>

              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="allocated\_to"\>  
                  Allocated To (SysML Block IDs, comma-separated)  
                \</label\>  
                \<input  
                  type="text"  
                  id="allocated\_to"  
                  name="allocated\_to"  
                  value={Array.isArray(formData.allocated\_to) ? formData.allocated\_to.join(', ') : ''}  
                  onChange={handleChange}  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
                  placeholder="BLOCK-SYS-POWERMGMT-00001, BLOCK-SW-COMM-00002"  
                /\>  
                {renderError('allocated\_to')}  
              \</div\>

              {/\* Links input \- more complex, might need a dedicated component or JSON string input \*/}  
              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="links"\>  
                  Links (JSON Array of Objects: \[{"type": "implements", "target": "EPIC-001"}\])  
                \</label\>  
                \<textarea  
                  id="links"  
                  name="links"  
                  value={JSON.stringify(formData.links || \[\], null, 2)}  
                  onChange={handleChange}  
                  rows="5"  
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-xs"  
                  placeholder='\[{"type": "implements", "target": "EPIC-001"}, {"type": "traces\_to\_test", "target": "TEST-005"}\]'  
                \>\</textarea\>  
                {renderError('links')}  
                {typeof formData.links \=== 'string' && \<p className="text-red-500 text-xs mt-1"\>Invalid JSON for links.\</p\>}  
              \</div\>

              {/\* Add other custom attributes here dynamically if needed \*/}  
              {/\* Example:  
              \<div className="mb-4"\>  
                \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="owner"\>Owner\</label\>  
                \<input type="text" id="owner" name="owner" value={formData.owner || ''} onChange={handleChange} className="..." /\>  
              \</div\>  
              \*/}  
            \</div\>  
          );  
        }

    * **MarkdownEditor.jsx (Sub-component):**  
      * **Purpose:** Provides a rich Markdown editing experience.  
      * **Implementation:** Wraps react-simplemde-editor (or similar). Manages the Markdown content state.  
      * **Code Snippet:**  
        // requirements\_web\_frontend/src/components/MarkdownEditor.jsx  
        import { h } from 'preact';  
        import SimpleMDE from 'react-simplemde-editor';  
        import 'easymde/dist/easymde.min.css'; // Import editor styles

        export function MarkdownEditor({ value, onChange }) {  
          return (  
            \<div className="mb-4"\>  
              \<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description\_md"\>  
                Description (Markdown)  
              \</label\>  
              \<SimpleMDE  
                value={value}  
                onChange={onChange}  
                options={{  
                  spellChecker: false,  
                  hideIcons: \["guide", "fullscreen", "side-by-side"\],  
                  showIcons: \["code", "table"\],  
                  autofocus: true,  
                  placeholder: "Write your requirement description here...",  
                  status: false, // Hide status bar  
                }}  
              /\>  
            \</div\>  
          );  
        }

    * **PreviewPane.jsx (Sub-component):**  
      * **Purpose:** Renders Markdown content as HTML for live preview.  
      * **Implementation:** Uses markdown-it on the client-side.  
      * **Code Snippet:**  
        // requirements\_web\_frontend/src/components/PreviewPane.jsx  
        import { h } from 'preact';  
        import MarkdownIt from 'markdown-it';

        const md \= new MarkdownIt();

        export function PreviewPane({ markdownContent }) {  
          const htmlContent \= md.render(markdownContent);  
          return (  
            \<div className="p-4 bg-white rounded-lg shadow-md overflow-auto" dangerouslySetInnerHTML={{ \_\_html: htmlContent }} /\>  
          );  
        }

    * **ActionButtonGroup.jsx (Sub-component):**  
      * **Purpose:** Contains "Submit for Review" and "Cancel" buttons.  
      * **Implementation:** Handles loading states and displays success/error messages using a modal/toast component.  
    * **RequirementEditorPage.jsx (Putting it together):**  
      // requirements\_web\_frontend/src/pages/RequirementEditorPage.jsx  
      import { h } from 'preact';  
      import { useState, useEffect } from 'preact/hooks';  
      import { useRoute, navigate } from 'wouter';  
      import { fetchRequirementById, createRequirement, updateRequirement } from '../api';  
      import { validateRequirement } from '../utils/validation';  
      import { MetadataForm } from '../components/MetadataForm';  
      import { MarkdownEditor } from '../components/MarkdownEditor';  
      import { PreviewPane } from '../components/PreviewPane';  
      import { Modal } from '../components/Modal'; // Create a generic Modal component

      export function RequirementEditorPage() {  
        const \[match, params\] \= useRoute('/requirements/edit/:id');  
        const isEditMode \= match;  
        const requirementId \= params ? params.id : null;

        const \[formData, setFormData\] \= useState({  
          id: '',  
          name: '',  
          type: '',  
          priority: '',  
          status: '',  
          tags: \[\],  
          links: \[\],  
          description\_md: '',  
          source: '', // SysML  
          stakeholder: '', // SysML  
          verification\_method: '', // SysML  
          allocated\_to: \[\], // SysML  
        });  
        const \[loading, setLoading\] \= useState(false);  
        const \[errors, setErrors\] \= useState({});  
        const \[showModal, setShowModal\] \= useState(false);  
        const \[modalContent, setModalContent\] \= useState({ title: '', message: '', type: '' });

        useEffect(() \=\> {  
          if (isEditMode && requirementId) {  
            setLoading(true);  
            fetchRequirementById(requirementId)  
              .then(data \=\> {  
                // Ensure arrays are parsed if stored as JSON strings in DB (e.g., links, tags, allocated\_to)  
                setFormData({  
                  ...data,  
                  tags: data.tags ? data.tags.split(',') : \[\], // Assuming comma-separated for simple storage  
                  links: data.links ? JSON.parse(data.links) : \[\],  
                  allocated\_to: data.allocated\_to ? JSON.parse(data.allocated\_to) : \[\],  
                  // Parse other custom attributes if needed  
                });  
                setLoading(false);  
              })  
              .catch(err \=\> {  
                console.error('Error fetching requirement for edit:', err);  
                setLoading(false);  
                setModalContent({ title: 'Error', message: 'Failed to load requirement for editing.', type: 'error' });  
                setShowModal(true);  
              });  
          } else {  
              // For new requirement, generate a temporary ID  
              setFormData(prev \=\> ({ ...prev, id: \`NEW-REQ-${Date.now().toString().slice(-5)}\` }));  
          }  
        }, \[isEditMode, requirementId\]);

        const handleMetadataChange \= (newMetadata) \=\> {  
          setFormData(prev \=\> ({ ...prev, ...newMetadata }));  
        };

        const handleMarkdownChange \= (newMarkdown) \=\> {  
          setFormData(prev \=\> ({ ...prev, description\_md: newMarkdown }));  
        };

        const handleSubmit \= async () \=\> {  
          const validationErrors \= validateRequirement(formData);  
          setErrors(validationErrors);

          if (Object.keys(validationErrors).length \> 0\) {  
            setModalContent({ title: 'Validation Error', message: 'Please fix the errors in the form.', type: 'error' });  
            setShowModal(true);  
            return;  
          }

          setLoading(true);  
          try {  
            let response;  
            if (isEditMode) {  
              response \= await updateRequirement(requirementId, formData);  
            } else {  
              response \= await createRequirement(formData);  
            }  
            setLoading(false);  
            setModalContent({ title: 'Success', message: response.message || 'Requirement submitted successfully\!', type: 'success' });  
            setShowModal(true);  
            // Optionally redirect after a short delay  
            setTimeout(() \=\> navigate('/'), 2000);  
          } catch (err) {  
            setLoading(false);  
            setModalContent({ title: 'Error', message: err.message || 'Failed to submit requirement.', type: 'error' });  
            setShowModal(true);  
          }  
        };

        const handleCancel \= () \=\> {  
          navigate('/'); // Go back to dashboard  
        };

        if (loading && isEditMode) return \<div className="flex justify-center items-center h-screen"\>Loading requirement data...\</div\>;

        return (  
          \<div className="container mx-auto p-4"\>  
            \<h1 className="text-3xl font-bold text-gray-800 mb-6"\>{isEditMode ? \`Edit Requirement: ${requirementId}\` : 'Create New Requirement'}\</h1\>

            \<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"\>  
              \<div\>  
                \<MetadataForm  
                  data={formData}  
                  onChange={handleMetadataChange}  
                  errors={errors}  
                /\>  
                \<MarkdownEditor  
                  value={formData.description\_md}  
                  onChange={handleMarkdownChange}  
                /\>  
                \<div className="flex justify-end gap-4 mt-4"\>  
                  \<button  
                    onClick={handleCancel}  
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md shadow-md transition duration-300"  
                  \>  
                    Cancel  
                  \</button\>  
                  \<button  
                    onClick={handleSubmit}  
                    disabled={loading}  
                    className={\`font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}\`}  
                  \>  
                    {loading ? 'Submitting...' : 'Submit for Review'}  
                  \</button\>  
                \</div\>  
              \</div\>  
              \<div\>  
                \<h2 className="text-xl font-semibold mb-4"\>Markdown Preview\</h2\>  
                \<PreviewPane markdownContent={formData.description\_md} /\>  
              \</div\>  
            \</div\>

            {showModal && (  
              \<Modal  
                title={modalContent.title}  
                message={modalContent.message}  
                type={modalContent.type}  
                onClose={() \=\> setShowModal(false)}  
              /\>  
            )}  
          \</div\>  
        );  
      }

* **Modal.jsx (Generic Modal Component):**  
  // requirements\_web\_frontend/src/components/Modal.jsx  
  import { h } from 'preact';

  export function Modal({ title, message, type, onClose }) {  
    const bgColor \= type \=== 'success' ? 'bg-green-100' : 'bg-red-100';  
    const textColor \= type \=== 'success' ? 'text-green-800' : 'text-red-800';  
    const borderColor \= type \=== 'success' ? 'border-green-500' : 'border-red-500';

    return (  
      \<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"\>  
        \<div className={\`p-6 rounded-lg shadow-xl border-t-4 ${borderColor} ${bgColor} max-w-sm w-full\`}\>  
          \<h2 className={\`text-xl font-bold mb-3 ${textColor}\`}\>{title}\</h2\>  
          \<p className={\`text-gray-700 mb-4 ${textColor}\`}\>{message}\</p\>  
          \<div className="flex justify-end"\>  
            \<button  
              onClick={onClose}  
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"  
            \>  
              Close  
            \</button\>  
          \</div\>  
        \</div\>  
      \</div\>  
    );  
  }

### **4.6. Relationship Visualization Feature Implementation**

This feature will display the traceability relationships in an interactive graph.

* 4.6.1. Data Structure for Graph Visualization:  
  The frontend will expect data in a "nodes" and "links" format, suitable for graph libraries.  
  // Example graph data structure  
  {  
    nodes: \[  
      { id: "REQ-001", name: "User Login", type: "Functional", status: "Approved" },  
      { id: "TEST-005", name: "Login Test Case", type: "Test Case", status: "Passed" },  
      { id: "EPIC-001", name: "Authentication Epic", type: "Epic", status: "In Progress" },  
      { id: "BLOCK-AUTH", name: "Authentication Service", type: "SysML Block", status: "Designed" }  
    \],  
    links: \[  
      { source: "REQ-001", target: "TEST-005", type: "verifies" },  
      { source: "REQ-001", target: "EPIC-001", type: "implements" },  
      { source: "REQ-001", target: "BLOCK-AUTH", type: "allocates" }  
    \]  
  }

  * **Nodes:** Represent requirements, test cases, epics, SysML blocks, etc. Each node needs a unique id, a name for display, and potentially other metadata (e.g., type, status) for styling or tooltips.  
  * **Links (Edges):** Represent relationships between nodes. Each link needs a source ID, a target ID, and a type (e.g., implements, verifies, allocates).  
* 4.6.2. Backend API Endpoint for Graph Data (routes/relationships.js and db/database.js)  
  The Node.js backend needs a new endpoint to query the SQLite database and transform the data into the graph format.  
  * **db/database.js (Add new query function):**  
    // requirements\_web\_backend/db/database.js (add to existing file)  
    // ... (existing code) ...

    const getRelationshipsGraphData \= () \=\> {  
        return new Promise((resolve, reject) \=\> {  
            getDb().all(\`  
                SELECT  
                    r.id AS source\_id,  
                    r.name AS source\_name,  
                    r.type AS source\_type,  
                    r.status AS source\_status,  
                    rel.relationship\_type,  
                    rel.target\_id,  
                    tr.name AS target\_name,  
                    tr.type AS target\_type,  
                    tr.status AS target\_status  
                FROM  
                    relationships rel  
                JOIN  
                    requirements r ON rel.source\_req\_id \= r.id  
                LEFT JOIN  
                    requirements tr ON rel.target\_id \= tr.id \-- Join again for target requirement details  
            \`, (err, rows) \=\> {  
                if (err) {  
                    reject(err);  
                    return;  
                }

                const nodes \= new Map();  
                const links \= \[\];

                rows.forEach(row \=\> {  
                    // Add source node  
                    if (\!nodes.has(row.source\_id)) {  
                        nodes.set(row.source\_id, {  
                            id: row.source\_id,  
                            name: row.source\_name,  
                            type: row.source\_type,  
                            status: row.source\_status  
                        });  
                    }

                    // Add target node (could be a requirement or an external ID like a test case/SysML block)  
                    if (\!nodes.has(row.target\_id)) {  
                        // If target\_name is null, it's likely an external ID not in our requirements table  
                        nodes.set(row.target\_id, {  
                            id: row.target\_id,  
                            name: row.target\_name || row.target\_id, // Use target\_id as name if not found in requirements  
                            type: row.target\_type || 'External/Block', // Default type for external IDs  
                            status: row.target\_status || 'N/A'  
                        });  
                    }

                    // Add link  
                    links.push({  
                        source: row.source\_id,  
                        target: row.target\_id,  
                        type: row.relationship\_type  
                    });  
                });

                resolve({ nodes: Array.from(nodes.values()), links });  
            });  
        });  
    };

    module.exports \= { initDb, getDb, getAllRequirements, getRequirementById, getRelationshipsGraphData };

  * **routes/relationships.js (NEW FILE):**  
    // requirements\_web\_backend/routes/relationships.js  
    const express \= require('express');  
    const router \= express.Router();  
    const { getRelationshipsGraphData } \= require('../db/database');  
    const jwt \= require('jsonwebtoken'); // For token verification

    const JWT\_SECRET \= process.env.JWT\_SECRET || 'supersecretjwtkey';

    // Middleware to verify JWT  
    const authenticateToken \= (req, res, next) \=\> {  
        const authHeader \= req.headers\['authorization'\];  
        const token \= authHeader && authHeader.split(' ')\[1\];

        if (\!token) return res.sendStatus(401);

        jwt.verify(token, JWT\_SECRET, (err, user) \=\> {  
            if (err) return res.sendStatus(403);  
            req.user \= user;  
            next();  
        });  
    };

    // GET relationship graph data  
    router.get('/graph', authenticateToken, async (req, res) \=\> {  
        try {  
            const graphData \= await getRelationshipsGraphData();  
            res.json(graphData);  
        } catch (error) {  
            console.error('Error fetching relationship graph data:', error);  
            res.status(500).json({ message: 'Error fetching relationship graph data.' });  
        }  
    });

    module.exports \= router;

  * **server.js (Add new route):**  
    // requirements\_web\_backend/server.js (add to existing file)  
    // ... (existing code) ...  
    const relationshipsRoutes \= require('./routes/relationships'); // NEW

    // ... (existing middleware) ...

    // API Routes  
    app.use('/api/requirements', requirementsRoutes);  
    app.use('/api/auth', authRoutes);  
    app.use('/api/relationships', relationshipsRoutes); // NEW

    // ... (existing error handling and listen) ...

* 4.6.3. Frontend Graph Visualization Component (components/RelationshipGraph.jsx)  
  This component will use D3.js to render an interactive force-directed graph.  
  // requirements\_web\_frontend/src/components/RelationshipGraph.jsx  
  import { h } from 'preact';  
  import { useRef, useEffect, useState } from 'preact/hooks';  
  import \* as d3 from 'd3'; // npm install d3

  export function RelationshipGraph({ graphData }) {  
    const svgRef \= useRef();  
    const tooltipRef \= useRef();  
    const \[dimensions, setDimensions\] \= useState({ width: 0, height: 0 });

    useEffect(() \=\> {  
      // Set dimensions dynamically based on parent container  
      const updateDimensions \= () \=\> {  
        if (svgRef.current && svgRef.current.parentElement) {  
          setDimensions({  
            width: svgRef.current.parentElement.clientWidth,  
            height: svgRef.current.parentElement.clientHeight,  
          });  
        }  
      };

      updateDimensions();  
      window.addEventListener('resize', updateDimensions);  
      return () \=\> window.removeEventListener('resize', updateDimensions);  
    }, \[\]);

    useEffect(() \=\> {  
      if (\!graphData || \!graphData.nodes || \!graphData.links || dimensions.width \=== 0 || dimensions.height \=== 0\) {  
        return;  
      }

      const svg \= d3.select(svgRef.current);  
      svg.selectAll('\*').remove(); // Clear previous render

      const width \= dimensions.width;  
      const height \= dimensions.height;

      // Create a group for the graph elements to enable zooming/panning  
      const g \= svg.append('g');

      // Setup zoom and pan behavior  
      const zoom \= d3.zoom()  
        .scaleExtent(\[0.1, 10\]) // Allow zooming from 10% to 1000%  
        .on('zoom', (event) \=\> {  
          g.attr('transform', event.transform);  
        });  
      svg.call(zoom);

      const simulation \= d3.forceSimulation(graphData.nodes)  
        .force('link', d3.forceLink(graphData.links).id(d \=\> d.id).distance(100))  
        .force('charge', d3.forceManyBody().strength(-300)) // Node repulsion  
        .force('center', d3.forceCenter(width / 2, height / 2))  
        .force('collide', d3.forceCollide(20)); // Prevent nodes from overlapping

      // Define arrow markers for directed links  
      svg.append('defs').selectAll('marker')  
        .data(\['end'\])  
        .enter().append('marker')  
          .attr('id', String)  
          .attr('viewBox', '0 \-5 10 10')  
          .attr('refX', 25\) // Position marker at the end of the line  
          .attr('refY', 0\)  
          .attr('markerWidth', 6\)  
          .attr('markerHeight', 6\)  
          .attr('orient', 'auto')  
          .append('path')  
          .attr('d', 'M0,-5L10,0L0,5')  
          .attr('fill', '\#999');

      // Links  
      const link \= g.append('g')  
        .attr('class', 'links')  
        .selectAll('line')  
        .data(graphData.links)  
        .enter().append('line')  
          .attr('class', 'link')  
          .attr('marker-end', 'url(\#end)'); // Apply arrow marker

      // Link Labels (text paths for curved links, or simple text for straight)  
      const linkLabel \= g.append('g')  
        .attr('class', 'link-labels')  
        .selectAll('text')  
        .data(graphData.links)  
        .enter().append('text')  
          .attr('class', 'link-label')  
          .text(d \=\> d.type);

      // Nodes  
      const node \= g.append('g')  
        .attr('class', 'nodes')  
        .selectAll('circle')  
        .data(graphData.nodes)  
        .enter().append('circle')  
          .attr('class', 'node')  
          .attr('r', 15\)  
          .attr('fill', d \=\> {  
              // Color nodes based on type for better visualization  
              switch (d.type) {  
                  case 'Functional': return '\#6366f1'; // Indigo  
                  case 'Non-Functional': return '\#ef4444'; // Red  
                  case 'UI/UX': return '\#f97316'; // Orange  
                  case 'Epic': return '\#8b5cf6'; // Violet  
                  case 'Test Case': return '\#22c55e'; // Green  
                  case 'SysML Block': return '\#0ea5e9'; // Sky Blue  
                  default: return '\#6b7280'; // Gray  
              }  
          })  
          .call(d3.drag()  
            .on('start', dragstarted)  
            .on('drag', dragged)  
            .on('end', dragended));

      // Node Labels  
      const label \= g.append('g')  
        .attr('class', 'node-labels')  
        .selectAll('text')  
        .data(graphData.nodes)  
        .enter().append('text')  
          .attr('x', 20\)  
          .attr('y', 5\)  
          .text(d \=\> d.name)  
          .style('font-size', '12px')  
          .style('fill', '\#333')  
          .style('pointer-events', 'none'); // Make label non-interactive

      // Tooltip  
      const tooltip \= d3.select(tooltipRef.current);

      node.on('mouseover', function(event, d) {  
          tooltip.style('opacity', 1\)  
                 .html(\`\<strong\>${d.name}\</strong\>\<br/\>ID: ${d.id}\<br/\>Type: ${d.type}\<br/\>Status: ${d.status || 'N/A'}\`)  
                 .style('left', (event.pageX \+ 10\) \+ 'px')  
                 .style('top', (event.pageY \- 28\) \+ 'px');  
      })  
      .on('mouseout', function() {  
          tooltip.style('opacity', 0);  
      });

      link.on('mouseover', function(event, d) {  
          tooltip.style('opacity', 1\)  
                 .html(\`\<strong\>${d.type}\</strong\>\<br/\>${d.source.id} → ${d.target.id}\`)  
                 .style('left', (event.pageX \+ 10\) \+ 'px')  
                 .style('top', (event.pageY \- 28\) \+ 'px');  
      })  
      .on('mouseout', function() {  
          tooltip.style('opacity', 0);  
      });

      // Update positions on each tick of the simulation  
      simulation.on('tick', () \=\> {  
        link  
          .attr('x1', d \=\> d.source.x)  
          .attr('y1', d \=\> d.source.y)  
          .attr('x2', d \=\> d.target.x)  
          .attr('y2', d \=\> d.target.y);

        node  
          .attr('cx', d \=\> d.x)  
          .attr('cy', d \=\> d.y);

        label  
          .attr('x', d \=\> d.x \+ 20\)  
          .attr('y', d \=\> d.y \+ 5);

        // Position link labels in the middle of the link  
        linkLabel  
          .attr('x', d \=\> (d.source.x \+ d.target.x) / 2\)  
          .attr('y', d \=\> (d.source.y \+ d.target.y) / 2);  
      });

      // Drag functions  
      function dragstarted(event, d) {  
        if (\!event.active) simulation.alphaTarget(0.3).restart();  
        d.fx \= d.x;  
        d.fy \= d.y;  
      }

      function dragged(event, d) {  
        d.fx \= event.x;  
        d.fy \= event.y;  
      }

      function dragended(event, d) {  
        if (\!event.active) simulation.alphaTarget(0);  
        d.fx \= null;  
        d.fy \= null;  
      }

    }, \[graphData, dimensions\]); // Re-run effect if data or dimensions change

    return (  
      \<div className="relative w-full h-full min-h-\[600px\] bg-white rounded-lg shadow-md overflow-hidden"\>  
        \<svg ref={svgRef} className="w-full h-full"\>\</svg\>  
        \<div ref={tooltipRef} className="tooltip"\>\</div\>  
      \</div\>  
    );  
  }

* 4.6.4. Relationship Graph Page (pages/RelationshipGraphPage.jsx)  
  This page will fetch the graph data and render the RelationshipGraph component.  
  // requirements\_web\_frontend/src/pages/RelationshipGraphPage.jsx  
  import { h } from 'preact';  
  import { useEffect, useState } from 'preact/hooks';  
  import { fetchRelationshipsGraph } from '../api';  
  import { RelationshipGraph } from '../components/RelationshipGraph';

  export function RelationshipGraphPage() {  
    const \[graphData, setGraphData\] \= useState(null);  
    const \[loading, setLoading\] \= useState(true);  
    const \[error, setError\] \= useState(null);

    useEffect(() \=\> {  
      fetchRelationshipsGraph()  
        .then(data \=\> {  
          setGraphData(data);  
          setLoading(false);  
        })  
        .catch(err \=\> {  
          setError(err);  
          setLoading(false);  
        });  
    }, \[\]);

    if (loading) return \<div className="flex justify-center items-center h-screen"\>Loading relationship graph...\</div\>;  
    if (error) return \<div className="flex justify-center items-center h-screen text-red-600"\>Error: {error.message}\</div\>;  
    if (\!graphData || graphData.nodes.length \=== 0\) return \<div className="flex justify-center items-center h-screen text-gray-600"\>No relationships to display.\</div\>;

    return (  
      \<div className="container mx-auto p-4 flex flex-col h-screen"\>  
        \<h1 className="text-3xl font-bold text-gray-800 mb-6"\>Requirements Relationships\</h1\>  
        \<div className="flex-grow"\> {/\* This div needs to have a defined height for the SVG to fill \*/}  
          \<RelationshipGraph graphData={graphData} /\>  
        \</div\>  
      \</div\>  
    );  
  }

### **4.7. Client-side Validation Logic (utils/validation.js)**

Ensure this file is updated to include SysML-specific validations as described in the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md\#55-custom-attributes). The code snippet from the previous Requirements Management WebUI Implementation Guide already includes these.

## **5\. Backend Development (Node.js Express) \- Detailed Implementation**

This section details the implementation of the Node.js Express API, including the new endpoint for graph visualization data.

### **5.1. Project Structure (requirements\_web\_backend/)**

* server.js: Main Express application setup.  
* .env: Environment variables (e.g., GitHub OAuth credentials, PAT).  
* routes/: API route definitions (requirements.js, auth.js, relationships.js).  
* services/: Business logic, Git interaction, GitHub API interaction (gitService.js, githubService.js).  
* utils/: Utility functions (e.g., validation, Markdown construction (markdownUtils.js, validationUtils.js)).  
* db/: SQLite database initialization and query functions (database.js).  
* requirements\_parser/: (Copy the existing parser project here, or symlink it if managing separately, ensuring it's accessible to the backend).

### **5.2. Server Setup (server.js)**

This file sets up the Express application and routes. It now includes the relationshipsRoutes.

// requirements\_web\_backend/server.js  
require('dotenv').config(); // Load environment variables  
const express \= require('express');  
const cors \= require('cors'); // For cross-origin requests from frontend  
const path \= require('path');  
const requirementsRoutes \= require('./routes/requirements');  
const authRoutes \= require('./routes/auth');  
const relationshipsRoutes \= require('./routes/relationships'); // NEW: Import relationships route  
const { initDb } \= require('./db/database');

const app \= express();  
const PORT \= process.env.PORT || 3000;

// Middleware  
app.use(cors()); // Configure CORS as needed for production  
app.use(express.json()); // Body parser for JSON requests

// Initialize SQLite Database (read-only for listing, but write for parser)  
// Ensure the database file is accessible by the Node.js backend process  
initDb(path.join(\_\_dirname, '../docs\_build/requirements.sqlite'));

// API Routes  
app.use('/api/requirements', requirementsRoutes);  
app.use('/api/auth', authRoutes);  
app.use('/api/relationships', relationshipsRoutes); // NEW: Use relationships route

// Basic error handling middleware  
app.use((err, req, res, next) \=\> {  
  console.error(err.stack);  
  res.status(500).send('Something broke\!');  
});

app.listen(PORT, () \=\> {  
  console.log(\`Backend server listening on port ${PORT}\`);  
});

### **5.3. Database Interaction (db/database.js)**

This module provides functions to interact with the SQLite database. It now includes getRelationshipsGraphData.

// requirements\_web\_backend/db/database.js  
const sqlite3 \= require('sqlite3').verbose();  
let db;

function initDb(dbFilePath) {  
    db \= new sqlite3.Database(dbFilePath, sqlite3.OPEN\_READWRITE, (err) \=\> {  
        if (err) {  
            console.error('Error opening database:', err.message);  
        } else {  
            console.log('Connected to the SQLite database.');  
        }  
    });  
}

function getDb() {  
    if (\!db) {  
        throw new Error('Database not initialized. Call initDb() first.');  
    }  
    return db;  
}

// Example query functions  
const getAllRequirements \= () \=\> {  
    return new Promise((resolve, reject) \=\> {  
        getDb().all("SELECT id, name, type, priority, status FROM requirements", (err, rows) \=\> {  
            if (err) reject(err);  
            else resolve(rows);  
        });  
    });  
};

const getRequirementById \= (id) \=\> {  
    return new Promise((resolve, reject) \=\> {  
        getDb().get("SELECT \* FROM requirements WHERE id \= ?", \[id\], (err, row) \=\> {  
            if (err) reject(err);  
            else resolve(row);  
        });  
    });  
};

// NEW: Function to get data for relationship graph  
const getRelationshipsGraphData \= () \=\> {  
    return new Promise((resolve, reject) \=\> {  
        getDb().all(\`  
            SELECT  
                r.id AS source\_id,  
                r.name AS source\_name,  
                r.type AS source\_type,  
                r.status AS source\_status,  
                rel.relationship\_type,  
                rel.target\_id,  
                tr.name AS target\_name,  
                tr.type AS target\_type,  
                tr.status AS target\_status  
            FROM  
                relationships rel  
            JOIN  
                requirements r ON rel.source\_req\_id \= r.id  
            LEFT JOIN  
                requirements tr ON rel.target\_id \= tr.id \-- Join again for target requirement details if it's also a requirement  
        \`, (err, rows) \=\> {  
            if (err) {  
                reject(err);  
                return;  
            }

            const nodes \= new Map();  
            const links \= \[\];

            rows.forEach(row \=\> {  
                // Add source node  
                if (\!nodes.has(row.source\_id)) {  
                    nodes.set(row.source\_id, {  
                        id: row.source\_id,  
                        name: row.source\_name,  
                        type: row.source\_type,  
                        status: row.source\_status  
                    });  
                }

                // Add target node (could be a requirement or an external ID like a test case/SysML block)  
                if (\!nodes.has(row.target\_id)) {  
                    // If target\_name is null, it's likely an external ID not in our requirements table  
                    nodes.set(row.target\_id, {  
                        id: row.target\_id,  
                        name: row.target\_name || row.target\_id, // Use target\_id as name if not found in requirements  
                        type: row.target\_type || 'External/Block', // Default type for external IDs  
                        status: row.target\_status || 'N/A'  
                    });  
                }

                // Add link  
                links.push({  
                    source: row.source\_id,  
                    target: row.target\_id,  
                    type: row.relationship\_type  
                });  
            });

            resolve({ nodes: Array.from(nodes.values()), links });  
        });  
    });  
};

module.exports \= { initDb, getDb, getAllRequirements, getRequirementById, getRelationshipsGraphData };

### **5.4. Git Service Module (services/gitService.js)**

This module encapsulates all simple-git operations. Its content remains as provided in the previous Requirements Management WebUI Implementation Guide.

### **5.5. GitHub API Service Module (services/githubService.js)**

This module encapsulates @octokit/rest calls for PR creation. Its content remains as provided in the previous Requirements Management WebUI Implementation Guide.

### **5.6. Authentication Routes (routes/auth.js)**

This module handles GitHub OAuth callback. Its content remains as provided in the previous Requirements Management WebUI Implementation Guide.

### **5.7. Requirements Routes (routes/requirements.js)**

This will be the main API for requirement management. Its content remains as provided in the previous Requirements Management WebUI Implementation Guide.

### **5.8. Utility Modules (utils/)**

* **utils/markdownUtils.js:** Its content remains as provided in the previous Requirements Management WebUI Implementation Guide.  
* **utils/validationUtils.js:** Its content remains as provided in the previous Requirements Management WebUI Implementation Guide.

### **5.9. Environment Variables (requirements\_web\_backend/.env)**

Create this file in your backend root. **DO NOT commit this file to Git.**

\# .env  
PORT=3000  
GITHUB\_CLIENT\_ID=YOUR\_GITHUB\_APP\_CLIENT\_ID  
GITHUB\_CLIENT\_SECRET=YOUR\_GITHUB\_APP\_CLIENT\_SECRET  
GITHUB\_TOKEN\_PAT=YOUR\_GITHUB\_PERSONAL\_ACCESS\_TOKEN \# Needs 'repo' scope  
GITHUB\_OWNER=your-github-username-or-org  
GITHUB\_REPO=product-requirements  
JWT\_SECRET=a\_very\_strong\_and\_random\_secret\_key\_for\_jwt  
WEBUI\_BASE\_URL=http://localhost:5173 \# Or your deployed frontend URL

## **6\. Deployment**

### **6.1. Frontend Deployment (Preact)**

* **Build:**  
  cd requirements\_web\_frontend  
  npm run build

  This will create a dist/ directory with static assets.  
* **GitHub Pages (Example):**  
  * Ensure your requirements\_web\_frontend/package.json has a homepage field pointing to your GitHub Pages URL (e.g., "https://\<username\>.github.io/\<repo-name\>/frontend").  
  * Configure GitHub Pages in your repository settings to serve from the gh-pages branch or docs folder.  
  * **GitHub Actions Workflow (.github/workflows/deploy-frontend.yml):** (No changes from previous guide)  
    name: Deploy Frontend to GitHub Pages

    on:  
      push:  
        branches:  
          \- main \# Or a specific branch for frontend changes

    jobs:  
      build-and-deploy:  
        runs-on: ubuntu-latest  
        steps:  
          \- name: Checkout repository  
            uses: actions/checkout@v4  
            with:  
              submodules: true \# If your frontend is a submodule  
              fetch-depth: 0

          \- name: Setup Node.js  
            uses: actions/setup-node@v4  
            with:  
              node-version: '20'

          \- name: Install Frontend Dependencies  
            run: npm install \--prefix requirements\_web\_frontend

          \- name: Build Frontend  
            run: npm run build \--prefix requirements\_web\_frontend

          \- name: Deploy to GitHub Pages  
            uses: peaceiris/actions-gh-pages@v4  
            with:  
              github\_token: ${{ secrets.GITHUB\_TOKEN }}  
              publish\_dir: ./requirements\_web\_frontend/dist \# Path to your built frontend assets  
              \# Keep .nojekyll to ensure GitHub Pages serves all files correctly  
              keep\_files: true

### **6.2. Backend Deployment (Node.js Express)**

* **Options:** PaaS (Heroku, Render), VPS, Containerization (Docker).  
* **Environment Variables:** Crucial for security. Configure all sensitive data from your .env file in the deployment platform's environment variables.  
* **Repository Access:** Ensure your deployed Node.js backend has a way to authenticate with GitHub to perform Git operations (e.g., using the GITHUB\_TOKEN\_PAT environment variable).  
* **CI/CD (Example for PaaS like Render):** (No changes from previous guide)  
  name: Deploy Backend to Render

  on:  
    push:  
      branches:  
        \- main \# Or a specific branch for backend changes

  jobs:  
    deploy:  
      runs-on: ubuntu-latest  
      steps:  
        \- name: Checkout repository  
          uses: actions/checkout@v4

        \- name: Deploy to Render  
          \# This is a conceptual step. Render typically integrates directly with GitHub  
          \# or requires a specific API call/CLI command.  
          \# You would configure Render to build and deploy from the requirements\_web\_backend directory.  
          run: |  
            echo "Triggering Render deployment for backend..."  
            \# Example: curl \-X POST https://api.render.com/deploy/srv-YOURSERVICEID?key=YOURAPIKEY  
            \# Or use a Render specific GitHub Action if available  
          env:  
            \# Pass necessary environment variables to Render  
            GITHUB\_CLIENT\_ID: ${{ secrets.GITHUB\_CLIENT\_ID }}  
            GITHUB\_CLIENT\_SECRET: ${{ secrets.GITHUB\_CLIENT\_SECRET }}  
            GITHUB\_TOKEN\_PAT: ${{ secrets.GITHUB\_TOKEN\_PAT }}  
            GITHUB\_OWNER: ${{ secrets.GITHUB\_OWNER }}  
            GITHUB\_REPO: ${{ secrets.GITHUB\_REPO }}  
            JWT\_SECRET: ${{ secrets.JWT\_SECRET }}  
            WEBUI\_BASE\_URL: ${{ secrets.WEBUI\_BASE\_URL }}

## **7\. Testing**

Implement a comprehensive testing strategy for both frontend and backend.

* **7.1. Unit Tests:**  
  * **Frontend:** Test individual Preact components (e.g., form validation logic, API client functions) using libraries like Vitest and @testing-library/preact.  
  * **Backend:** Test individual Node.js modules (e.g., markdownUtils, validationUtils, gitService functions) using Jest or Mocha/Chai. Mock external dependencies like simple-git and @octokit/rest.  
* **7.2. Integration Tests:**  
  * Test the interaction between frontend components and backend API endpoints.  
  * Test the interaction between backend API and Git/GitHub services.  
  * Use tools like Supertest for API testing.  
* **7.3. End-to-End (E2E) Tests:**  
  * Simulate full user flows (e.g., login, create requirement, submit for review, verify PR on GitHub, **view relationship graph**) using tools like Cypress or Playwright.  
  * These tests will interact with the deployed frontend and backend.  
* **7.4. Manual Testing:**  
  * Perform thorough manual testing across different browsers and devices.  
  * Involve product owners and QA in user acceptance testing (UAT).

## **8\. Monitoring & Logging**

Establish robust monitoring and logging to ensure the stability and performance of the WebUI.

* **8.1. Backend Logging:**  
  * Use a logging library (e.g., Winston, Pino) in the Node.js backend to log API requests, Git operations, errors, and authentication events.  
  * Configure log levels (debug, info, warn, error).  
  * Integrate with a centralized logging service (e.g., ELK Stack, Splunk, Datadog) for easier analysis.  
* **8.2. Frontend Error Reporting:**  
  * Implement an error boundary in the Preact application to catch UI errors.  
  * Use an error reporting service (e.g., Sentry, Bugsnag) to automatically capture and report client-side errors.  
* **8.3. Performance Monitoring:**  
  * Use APM (Application Performance Monitoring) tools (e.g., New Relic, Datadog, Prometheus \+ Grafana) to monitor backend performance (response times, CPU/memory usage).  
  * Use browser performance tools (Lighthouse, WebPageTest) to monitor frontend performance.  
* **8.4. Alerting:**  
  * Configure alerts for critical errors (e.g., backend API failures, GitHub API rate limit errors, deployment failures) to notify the development team via email, Slack, or PagerDuty.  
  * Set up alerts for GitHub Actions workflow failures.

This detailed implementation guide provides a solid foundation for building the Requirements Management WebUI, including the advanced Relationship Visualization feature. Remember to iterate, test thoroughly, and gather feedback throughout the development process.