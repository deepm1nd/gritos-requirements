// requirements_web_backend/server.js
require('dotenv').config(); // Load environment variables from .env file in the backend root
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDb, closeDb } = require('./db/database'); // Database initialization
const authRoutes = require('./routes/auth').router; // Note: .router if module exports { router, authenticateToken }
const requirementsRoutes = require('./routes/requirements');
const relationshipsRoutes = require('./routes/relationships');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Enable CORS - configure origins as needed for production
app.use(cors());
// Body parser for JSON requests
app.use(express.json());

// --- Database Initialization ---
// Initialize SQLite Database. Callback logs success or error.
initDb((err) => {
    if (err) {
        console.error("FATAL: Failed to initialize database. Server cannot start properly.", err);
        // Optionally exit if DB is critical: process.exit(1);
    } else {
        console.log("Database initialized successfully.");
    }
});

// --- API Routes ---
// Mount authentication routes
app.use('/api/auth', authRoutes);
// Mount requirements routes
app.use('/api/requirements', requirementsRoutes);
// Mount relationships routes
app.use('/api/relationships', relationshipsRoutes);

// --- Basic Error Handling Middleware (example) ---
// This should be defined after all routes
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ message: 'Something broke on the server!' });
});

// --- Not Found Handler (example) ---
// If no route matched
app.use((req, res, next) => {
    res.status(404).json({ message: "Resource not found." });
});


// --- Server Startup ---
const server = app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
    console.log(`GitHub Client ID configured: ${process.env.GITHUB_CLIENT_ID ? 'Yes' : 'No'}`);
    console.log(`GitHub Owner/Repo configured: ${process.env.GITHUB_OWNER && process.env.GITHUB_REPO ? 'Yes' : 'No'}`);
    console.log(`Database path: ${process.env.DATABASE_PATH || path.join(__dirname, '../docs_build/requirements.sqlite')}`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
    console.log('Received shutdown signal, closing server and database connection...');
    server.close(() => {
        console.log('HTTP server closed.');
        closeDb((err) => {
            if (err) {
                console.error('Error closing database connection:', err);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(err ? 1 : 0);
        });
    });
}
