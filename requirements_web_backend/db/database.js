// requirements_web_backend/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

// Get the database path from environment variable or use default
const dbFilePath = process.env.DATABASE_PATH || path.join(__dirname, '../../docs_build/requirements.sqlite');

function initDb(callback) {
    // Ensure the directory for the database file exists if it's not in memory
    // For this project, we assume docs_build already exists or will be created by other processes.
    // We are connecting to an existing DB.
    db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            if (callback) callback(err);
        } else {
            console.log('Connected to the SQLite database at', dbFilePath);
            if (callback) callback(null);
        }
    });
}

function getDb() {
    if (!db) {
        // Attempt to initialize if not already connected.
        // This is a fallback, ideally initDb is called at application start.
        console.warn('Database not explicitly initialized. Attempting to connect...');
        initDb((err) => {
            if (err) {
                throw new Error('Database not initialized and automatic connection failed. Call initDb() at application startup.');
            }
        });
        // Note: This immediate call might not be fully initialized yet due to async nature.
        // It's better to ensure initDb is called and completed at startup.
        // However, for robustness in case of direct calls, we try.
        if (!db) { // Check again after attempt
             throw new Error('Database not initialized. Call initDb() first.');
        }
    }
    return db;
}

const getAllRequirements = () => {
    return new Promise((resolve, reject) => {
        getDb().all("SELECT id, name, type, priority, status FROM requirements ORDER BY id ASC", [], (err, rows) => {
            if (err) {
                console.error('Error fetching all requirements:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const getRequirementById = (id) => {
    return new Promise((resolve, reject) => {
        getDb().get("SELECT * FROM requirements WHERE id = ?", [id], (err, row) => {
            if (err) {
                console.error(`Error fetching requirement by ID ${id}:`, err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const getRelationshipsGraphData = () => {
    return new Promise((resolve, reject) => {
        // This query aims to get all requirements as potential nodes
        // and all relationships as links.
        const sql = `
            SELECT
                r.id as id,
                r.name as name,
                r.type as type,
                r.status as status
            FROM requirements r
        `;

        const linksSql = `
            SELECT
                rel.source_req_id,
                rel.target_id,
                rel.relationship_type
            FROM relationships rel
        `;

        const dbInstance = getDb();
        let nodesMap = new Map();
        let links = [];

        dbInstance.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error fetching nodes for graph:', err.message);
                return reject(err);
            }
            rows.forEach(row => {
                nodesMap.set(row.id, {
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    status: row.status
                });
            });

            dbInstance.all(linksSql, [], (err, linkRows) => {
                if (err) {
                    console.error('Error fetching links for graph:', err.message);
                    return reject(err);
                }
                links = linkRows.map(lr => ({
                    source: lr.source_req_id,
                    target: lr.target_id,
                    type: lr.relationship_type
                }));

                // Add any target_ids from links that aren't already in nodesMap
                // These could be external entities or SysML blocks not detailed as full requirements.
                links.forEach(link => {
                    if (!nodesMap.has(link.target)) {
                        nodesMap.set(link.target, {
                            id: link.target,
                            name: link.target, // Default name to ID if not in requirements table
                            type: 'External/Block', // Assign a default type
                            status: 'N/A'
                        });
                    }
                    // Also ensure all sources are in nodesMap (should be, if DB is consistent)
                     if (!nodesMap.has(link.source)) {
                        nodesMap.set(link.source, {
                            id: link.source,
                            name: link.source, 
                            type: 'Requirement', // Assuming source is always a requirement
                            status: 'N/A'
                        });
                    }
                });
                resolve({ nodes: Array.from(nodesMap.values()), links });
            });
        });
    });
};

// Function to close the database connection
const closeDb = (callback) => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
                if (callback) callback(err);
            } else {
                console.log('Database connection closed.');
                db = null; // Clear the db variable
                if (callback) callback(null);
            }
        });
    } else {
        if (callback) callback(null); // No db to close
    }
};


module.exports = {
    initDb,
    getDb,
    getAllRequirements,
    getRequirementById,
    getRelationshipsGraphData,
    closeDb
};
