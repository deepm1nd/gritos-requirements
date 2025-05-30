// requirements_web_backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Using axios to make HTTP requests to GitHub
require('dotenv').config({ path: '../.env' }); // Ensure .env variables from backend root are loaded

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const WEBUI_BASE_URL = process.env.WEBUI_BASE_URL || 'http://localhost:5173'; // Fallback for frontend URL

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !JWT_SECRET) {
    console.error("FATAL ERROR: GitHub OAuth credentials or JWT secret not found in .env file.");
    // Optionally, exit the process or prevent the routes from being used
    // For now, we'll let it run but log the error. It will fail at runtime.
}

// Route to initiate GitHub OAuth flow
// The frontend will redirect the user to this URL effectively, or construct it directly.
// For a pure backend, this endpoint might not be directly hit by user's browser,
// but the frontend will use these details.
// Let's assume frontend constructs the auth URL. This backend is for the callback.

// Callback route for GitHub OAuth
router.post('/github/callback', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'GitHub OAuth code is required.' });
    }

    try {
        // 1. Exchange the code for an access token from GitHub
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: code,
        }, {
            headers: {
                'Accept': 'application/json', // Request JSON response for token
            },
        });

        const { access_token, error, error_description } = tokenResponse.data;

        if (error) {
            console.error('GitHub OAuth token exchange error:', error_description);
            return res.status(400).json({ message: `GitHub OAuth error: ${error_description}` });
        }

        if (!access_token) {
             console.error('GitHub OAuth token exchange failed to return access_token.');
             return res.status(500).json({ message: 'Failed to retrieve GitHub access token.' });
        }

        // 2. Use the access token to get user information from GitHub API
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`,
            },
        });

        const { login: githubUsername, id: githubId, email, name, avatar_url } = userResponse.data;

        // 3. Create a JWT for your application
        const userPayload = {
            githubId: githubId,
            username: githubUsername,
            email: email, // Email might be null if not public
            name: name,
            avatarUrl: avatar_url,
            // Add any other relevant user details
        };

        const appToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        // 4. Send the JWT and user info back to the client
        // The client (frontend) will store this token for subsequent authenticated requests.
        res.json({
            message: 'Authentication successful!',
            token: appToken,
            user: userPayload, // Send user info for frontend display
        });

    } catch (err) {
        console.error('Error during GitHub OAuth callback processing:', err.message);
        if (err.response && err.response.data) {
            console.error('GitHub API Error Data:', err.response.data);
            return res.status(500).json({ message: 'Authentication failed due to GitHub API error.', details: err.response.data });
        }
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
});

// Middleware to verify JWT for protected routes (can be defined here or in a separate middleware file)
 const authenticateToken = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

     if (token == null) {
         return res.sendStatus(401); // Unauthorized if no token
     }

     jwt.verify(token, JWT_SECRET, (err, user) => {
         if (err) {
             console.error('JWT Verification Error:', err.message);
             return res.sendStatus(403); // Forbidden if token is invalid
         }
         req.user = user; // Add user payload to request object
         next();
     });
 };


module.exports = {
    router,
    authenticateToken // Exporting middleware for use in other route files
 };
