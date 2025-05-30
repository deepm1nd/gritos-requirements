// requirements_web_backend/services/githubService.js
const { Octokit } = require('@octokit/rest');
require('dotenv').config(); // To load GITHUB_TOKEN_PAT, GITHUB_OWNER, GITHUB_REPO

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN_PAT,
});

const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

const createPullRequest = async (branchName, title, body, baseBranch = 'main') => {
    if (!GITHUB_OWNER || !GITHUB_REPO) {
        throw new Error("GITHUB_OWNER and GITHUB_REPO environment variables must be set.");
    }
    try {
        const response = await octokit.pulls.create({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            title: title,
            head: branchName, 
            base: baseBranch,
            body: body,
            maintainer_can_modify: true, // Optional: Allow maintainers to modify the PR
        });
        return response.data; // Contains PR details, like URL (html_url)
    } catch (error) {
        console.error(`Error creating pull request for branch ${branchName}: ${error.response ? error.response.data.message : error.message}`);
        // Check for specific error: PR already exists for this branch
        if (error.response && error.response.data && error.response.data.errors) {
            const messages = error.response.data.errors.map(err => err.message).join('; ');
            if (messages.includes(`A pull request already exists for ${GITHUB_OWNER}:${branchName}`)) {
                console.warn(`Pull request for branch ${branchName} already exists.`);
                // Optionally, try to find the existing PR
                const existingPrs = await octokit.pulls.list({
                    owner: GITHUB_OWNER,
                    repo: GITHUB_REPO,
                    head: `${GITHUB_OWNER}:${branchName}`, // Correct format for head filter
                    base: baseBranch,
                    state: 'open',
                });
                if (existingPrs.data.length > 0) {
                    console.log(`Found existing PR: ${existingPrs.data[0].html_url}`);
                    return existingPrs.data[0]; // Return the first existing PR
                }
            }
             throw new Error(`GitHub API Error: ${messages}`);
        }
        throw error;
    }
};

module.exports = {
    createPullRequest,
};
