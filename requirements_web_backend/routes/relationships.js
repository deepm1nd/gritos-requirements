// requirements_web_backend/routes/relationships.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth'); // JWT authentication middleware
const { getRelationshipsGraphData } = require('../db/database');

// GET relationship graph data
// This endpoint will fetch all requirements and their relationships
// and format them into a structure suitable for graph visualization (e.g., D3.js).
router.get('/graph', authenticateToken, async (req, res) => {
    try {
        const graphData = await getRelationshipsGraphData();
        // The getRelationshipsGraphData function in database.js should already format
        // the data as { nodes: [], links: [] }
        res.json(graphData);
    } catch (error) {
        console.error('Error fetching relationship graph data:', error);
        res.status(500).json({ message: 'Failed to retrieve relationship graph data.' });
    }
});

module.exports = router;
