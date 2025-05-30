// requirements_web_backend/services/gitService.js
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises; // For file existence check

// Assuming the script is in requirements_web_backend/services,
// and the main git repository is two levels up.
const repoRootPath = path.join(__dirname, '../../');
const requirementsPath = path.join(repoRootPath, 'requirements'); // Path to the requirements folder

const git = simpleGit({
    baseDir: repoRootPath,
    binary: 'git',
    maxConcurrentProcesses: 6,
});

const ensureBranchExists = async (branchName) => {
    try {
        await git.fetch();
        const branchSummary = await git.branch(['-a']);
        if (branchSummary.all.some(branch => branch.endsWith(branchName))) {
            // Branch exists locally or remotely
            await git.checkout(branchName);
            // Try to pull to ensure it's up-to-date with remote, if it exists there
            if (branchSummary.branches[branchName] && branchSummary.branches[branchName].remote) {
                 await git.pull('origin', branchName).catch(err => console.warn(`Warn: Pulling existing branch ${branchName} failed. It might be a local-only branch or other issue: ${err.message}`));
            }
        } else {
            await git.checkoutLocalBranch(branchName);
        }
        return true;
    } catch (error) {
        console.error(`Error ensuring branch ${branchName} exists: ${error.message}`);
        // If checkoutLocalBranch failed because it already exists (race condition or local only)
        if (error.message.includes('already exists')) {
             try {
                 await git.checkout(branchName); // Just try to checkout
                 return true;
             } catch (checkoutError) {
                 console.error(`Error switching to existing branch ${branchName}: ${checkoutError.message}`);
                 throw checkoutError;
             }
        }
        throw error;
    }
};

const commitChanges = async (branchName, filePathInRepo, commitMessage, fileContent, requirementId) => {
    try {
        await ensureBranchExists(branchName);

        const fullFilePath = path.join(repoRootPath, filePathInRepo);
        const dirPath = path.dirname(fullFilePath);

        // Ensure directory exists
        await fs.mkdir(dirPath, { recursive: true });

        await fs.writeFile(fullFilePath, fileContent);
        await git.add(fullFilePath);

        const status = await git.status();
        const isModified = status.files.some(file => file.path === filePathInRepo && (file.working_dir !== ' ' || file.index !== ' '));

        if (!isModified && !status.staged.includes(filePathInRepo)) {
             // If the file content is identical, git might not stage it.
             // We check if it was staged or if its content means it's identical to HEAD.
             // For simplicity, we'll proceed to commit if no error,
             // Git itself will prevent an empty commit if nothing changed.
             console.log(`No changes detected for ${filePathInRepo} to commit.`);
        }

        await git.commit(commitMessage);
        return true;
    } catch (error) {
        console.error(`Error committing changes for ${requirementId} to branch ${branchName}: ${error.message}`);
        throw error;
    }
};

const pushChanges = async (branchName) => {
    try {
        await git.push('origin', branchName, ['--set-upstream']); // Use --set-upstream to track remote branch
        return true;
    } catch (error) {
        console.error(`Error pushing branch ${branchName} to origin: ${error.message}`);
        throw error;
    }
};

// Helper to switch back to main and pull
 const switchToMainAndPull = async () => {
     try {
         await git.checkout('main'); // Or your default branch
         await git.pull('origin', 'main');
         return true;
     } catch (error) {
         console.error(`Error switching to main and pulling: ${error.message}`);
         throw error;
     }
 };


module.exports = {
    ensureBranchExists,
    commitChanges,
    pushChanges,
    switchToMainAndPull,
    requirementsPath // Exporting for use in routes if needed
};
