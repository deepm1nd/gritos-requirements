// requirements_web_backend/routes/requirements.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const { authenticateToken } = require('./auth'); // JWT authentication middleware
const { getAllRequirements, getRequirementById } = require('../db/database');
const { ensureBranchExists, commitChanges, pushChanges, switchToMainAndPull, requirementsPath } = require('../services/gitService');
const { createPullRequest } = require('../services/githubService');
const { constructMarkdown, parseMarkdownFileContent, extractMetadataFromString } = require('../utils/markdownUtils'); // Assuming markdownUtils.js exists in ../utils/

// GET all requirements (summary view from database)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const requirements = await getAllRequirements();
        res.json(requirements);
    } catch (error) {
        console.error('Error fetching all requirements:', error);
        res.status(500).json({ message: 'Failed to retrieve requirements.' });
    }
});

// GET a single requirement by ID (detailed view from database)
// This reads from the DB, which is populated by the parser after a merge.
// For "live" editing view, the frontend might construct from a file if it's on a feature branch.
// However, this API endpoint as per guide primarily serves data from the DB.
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const requirement = await getRequirementById(req.params.id);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found in database.' });
        }
        // The database stores description_md and other fields directly.
        // If we needed to parse the .md file content from a specific commit for this view,
        // it would be a more complex Git operation. Sticking to DB for now.
        res.json(requirement);
    } catch (error) {
        console.error(`Error fetching requirement ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to retrieve requirement details.' });
    }
});

// Helper function to generate a filename from requirement ID
const getFilenameFromId = (id) => {
    // Convert ID to a safe filename, e.g., replace special chars, ensure .md extension
    // Example: PRODX-FNC-AUTH-LOGIN-00010.md
    // This needs to align with how parser expects filenames if it's strict
    return `${id.replace(/[^a-zA-Z0-9-_]/g, '_')}.md`;
};


// POST - Create a new requirement
router.post('/', authenticateToken, async (req, res) => {
    const requirementData = req.body; // Includes metadata and description_md
    const { id: requirementId, name: requirementName } = requirementData; // Assuming 'name' is part of metadata for PR title

    if (!requirementId || !requirementName || !requirementData.type || !requirementData.priority || !requirementData.status || !requirementData.description_md) {
        return res.status(400).json({ message: 'Missing required fields for new requirement (id, name, type, priority, status, description_md).' });
    }

    // Filename and path construction
    // The requirements are stored in subdirectories based on type (e.g., features, non-functional)
    // The guide mentions: requirements/features/, requirements/non-functional/
    // For simplicity, we might need a way to determine the subfolder, or use a default
    // Let's assume for now the client might provide a 'category' or we derive from 'type'
    // Or, store all in a flat structure within `requirementsPath` for this API,
    // and let users/parser organize them later if needed.
    // The `Requirements Style Guide` ID Naming Convention implies structure like PRODX-FNC-AUTH-LOGIN-00010
    // Let's try to derive a subfolder from the `type` field (e.g., 'Functional' -> 'functional')
    // Or use a fixed subfolder like 'new_requirements' if type mapping is too complex here.
    // The `Requirements Implementation Guide` shows `requirements/features/` and `requirements/non-functional/`
    // The `id` itself (e.g., PRODX-FNC-...) could inform the path.
    
    // Let's use a simple structure for now: `requirements/[type]/[id].md`
    // And ensure type is a safe directory name.
    const safeTypeFolder = requirementData.type.toLowerCase().replace(/[^a-z0-9-_]/g, '') || 'general';
    const requirementFilename = getFilenameFromId(requirementId);
    // filePathInRepo is relative to the git repo root
    const filePathInRepo = path.join('requirements', safeTypeFolder, requirementFilename);


    const branchName = `feat/req-${requirementId}-${Date.now()}`;
    const commitMessage = `feat(req): Create requirement ${requirementId} - ${requirementName}`;
    const prTitle = `Draft Requirement: ${requirementId} - ${requirementName}`;
    const prBody = `This Pull Request proposes the new requirement: **${requirementId} - ${requirementName}**. Please review.`;

    try {
        // 0. Ensure we are on main and up-to-date before creating a new branch
        // This is important to avoid basing new work on a stale main.
        // Note: gitService.switchToMainAndPull() is not used here to prevent side effects
        // on concurrent operations. Branching should ideally happen from a known good state of main.
        // For a web server, this might be complex. Assuming 'main' is relatively stable.
        // A safer approach for a busy system might involve a dedicated workspace per request or a queue.

        const markdownContent = constructMarkdown(requirementData);
        
        // 1. Create branch, commit, push
        // ensureBranchExists is called within commitChanges
        await commitChanges(branchName, filePathInRepo, commitMessage, markdownContent, requirementId);
        await pushChanges(branchName);

        // 2. Create Pull Request
        const pullRequest = await createPullRequest(branchName, prTitle, prBody);
        
        // 3. Switch back to main (optional, depending on server strategy)
        // await switchToMainAndPull(); // Or handle this out of band

        res.status(201).json({
            message: 'Requirement submitted for review. Pull request created.',
            branch: branchName,
            pullRequestUrl: pullRequest.html_url,
            filePath: filePathInRepo,
        });

    } catch (error) {
        console.error(`Error processing POST for requirement ${requirementId}:`, error);
        // Attempt to clean up branch if PR creation failed or other steps? Complex.
        // For now, just report error.
        res.status(500).json({ message: `Failed to create requirement and PR: ${error.message}` });
    }
});

// PUT - Update an existing requirement
router.put('/:id', authenticateToken, async (req, res) => {
    const existingRequirementId = req.params.id;
    const requirementData = req.body; // Includes metadata and description_md
    const { name: requirementName } = requirementData;

    if (!requirementName || !requirementData.type || !requirementData.priority || !requirementData.status || !requirementData.description_md) {
        return res.status(400).json({ message: 'Missing required fields for updating requirement (name, type, priority, status, description_md).' });
    }
    
    // Determine file path. This is tricky if the ID or type (which might define folder) can change.
    // For this example, assume ID does not change and type folder logic is same as POST.
    // If ID *can* change, the old file needs to be found and potentially renamed/moved (a git move).
    // Let's assume ID is immutable for updates via this endpoint.
    const safeTypeFolder = requirementData.type.toLowerCase().replace(/[^a-z0-9-_]/g, '') || 'general';
    const requirementFilename = getFilenameFromId(existingRequirementId);
    const filePathInRepo = path.join('requirements', safeTypeFolder, requirementFilename);

    // Check if the file exists at this path. If not, this should be a POST or there's an inconsistency.
    // This check is against the local file system state of the repo, which should be recently pulled.
    // This is a simplified check. A robust solution would query git for the file in the main branch.
    try {
        await fs.access(path.join(requirementsPath, safeTypeFolder, requirementFilename));
    } catch (e) {
        // console.warn(`Warning: Requirement file not found for update at ${filePathInRepo}. This might be an issue if it's not a new file being introduced in this branch.`);
        // Allowing it to proceed; commitChanges will create it if it doesn't exist in the branch.
    }

    const branchName = `fix/req-${existingRequirementId}-${Date.now()}`; // Or feat/ if it's a significant update
    const commitMessage = `fix(req): Update requirement ${existingRequirementId} - ${requirementName}`;
    const prTitle = `Update Requirement: ${existingRequirementId} - ${requirementName}`;
    const prBody = `This Pull Request proposes updates to requirement: **${existingRequirementId} - ${requirementName}**. Please review.`;

    try {
        const markdownContent = constructMarkdown(requirementData);
        
        await commitChanges(branchName, filePathInRepo, commitMessage, markdownContent, existingRequirementId);
        await pushChanges(branchName);
        const pullRequest = await createPullRequest(branchName, prTitle, prBody);
        // await switchToMainAndPull(); // Optional

        res.json({
            message: 'Requirement update submitted for review. Pull request created.',
            branch: branchName,
            pullRequestUrl: pullRequest.html_url,
            filePath: filePathInRepo,
        });

    } catch (error) {
        console.error(`Error processing PUT for requirement ${existingRequirementId}:`, error);
        res.status(500).json({ message: `Failed to update requirement and PR: ${error.message}` });
    }
});

module.exports = router;
