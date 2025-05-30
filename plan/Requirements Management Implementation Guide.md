# **Requirements Management Implementation Guide: Docs as Code, Markdown, GitHub, SQLite (Node.js Edition with SysML)**

## **1\. Introduction**

This guide provides step-by-step instructions for implementing a "Docs as Code" requirements management system. It details the setup of your GitHub repository, the structure for Markdown requirements files, the automation workflow using GitHub Actions, and how to build and leverage a SQLite database for querying, reporting, and managing baselines. The core logic for parsing and database interaction, as well as the **SysML model generation**, will be implemented in **Node.js (JavaScript)**. This guide serves as the practical companion to the strategic \[Requirements Management Plan\](uploaded:Requirements Management Plan.md).

## **2\. Prerequisites**

* Basic understanding of **Git and GitHub**.  
* A **GitHub account**.  
* **Node.js runtime** (LTS version recommended) and **npm** (Node Package Manager) installed on your local machine.  
* A **text editor or IDE** (e.g., VS Code) with Markdown support.  
* **Python 3.x** and pip (for MkDocs and Datasette).

## **3\. Repository Setup**

### **3.1. Create a New GitHub Repository**

1. Navigate to GitHub and create a new repository (e.g., product-requirements).  
2. Choose to initialize it with a README.md file and select a license (e.g., MIT License).  
3. Clone the repository to your local machine:  
   git clone https://github.com/your-username/product-requirements.git  
   cd product-requirements

### **3.2. Define Folder Structure**

Create a logical and organized folder structure for your requirements and Node.js project. This structure supports the "Single Source of Truth" principle outlined in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#2-guiding-principles).

mkdir \-p requirements/features  
mkdir \-p requirements/non-functional  
mkdir \-p attachments \# For any images, diagrams, etc., linked in requirements  
mkdir \-p docs\_build  
mkdir \-p docs\_build/sysml\_models \# New directory for generated SysML models  
mkdir \-p .github/workflows  
mkdir \-p requirements\_parser \# Create a directory for your Node.js parser project  
cd requirements\_parser && npm init \-y && cd .. \# Initialize Node.js parser project

* requirements/: This will be the root directory for all your Markdown requirement files. Subfolders (features, non-functional) help categorize.  
* attachments/: A place to store images, diagrams, or other files directly referenced by your requirements.  
* docs\_build/: Output directory for generated documentation and the SQLite database.  
* docs\_build/sysml\_models/: **New directory** where the generated SysML models (XMI/ReqIF files) will be stored.  
* .github/workflows/: This standard GitHub directory will hold your GitHub Actions workflow definition files.  
* requirements\_parser/: This is your Node.js project directory for the parser and SysML generator, containing package.json, index.js, and sysml\_generator.js.

## **4\. Requirements Authoring (Markdown)**

### **4.1. Markdown File Structure**

Each requirement should reside in its own .md file. The file must begin with **YAML front matter** (delimited by \---) to define structured metadata, followed by the requirement's detailed content in Markdown. The conventions for this structure, including mandatory fields, SysML-specific fields, and their usage, are detailed in the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md\#3-structure-of-a-requirement-file).

**Example: requirements/features/PRODX-REQ-FNC-AUTH-LOGIN-00010.md**

\---  
id: PRODX-REQ-FNC-AUTH-LOGIN-00010  
name: User Login Capability  
type: Functional  
priority: High  
status: Draft  
tags: authentication, UI, core  
links:  
  \- type: implements  
    target: EPIC-AUTH-001 \# Links to an Epic or higher-level feature ID  
  \- type: traces\_to\_test  
    target: TEST-SYS-LOGIN-005 \# Links to a test case ID (from your test management system or custom ID)  
  \- type: related\_to  
    target: UI-LOGIN-001 \# Links to a UI/UX requirement or design spec ID  
  \- type: allocates \# NEW: For SysML, allocates this requirement to a system block  
    target: BLOCK-SYS-POWERMGMT-001 \# ID of the SysML Block (as defined in SysML Integration Guide)  
\# NEW: SysML-specific attributes  
source: "Customer Interview Log \#2025-03-15"  
stakeholder: "Product Marketing Lead"  
verification\_method: "Test" \# Recommended values: Test, Inspection, Analysis, Demonstration  
\---

\# PRODX-REQ-FNC-AUTH-LOGIN-00010: User Login Capability

As a registered user, I want to be able to securely log into the system  
using my provided credentials (email/username and password) so that  
I can access my personalized content and features.

\#\# Acceptance Criteria:  
\* Given a user has valid credentials, when they submit the login form, then they shall be successfully authenticated and redirected to their dashboard.  
\* Given a user has invalid credentials, when they submit the login form, then an appropriate error message shall be displayed, and they shall remain on the login page.  
\* The system shall encrypt user passwords at rest.  
\* The system shall implement rate limiting on login attempts to prevent brute-force attacks.

* **id**: This is the **most crucial field**. It must be unique across all requirements. The format for this ID is defined in the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md\#7-id-naming-convention).  
* **name**: A concise, human-readable title for the requirement.  
* **type, priority, status, tags**: These fields populate the requirements and tags tables. Customize their values (Functional, High, Draft, etc.) to fit your project.  
* **links**: This is a YAML list of objects, each containing a type (describing the relationship, e.g., implements, traces\_to\_test, allocates) and a target (the ID of the linked item). This populates the relationships table and is key for traceability, as outlined in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#44-traceability-management). **New SysML-specific link types like allocates are supported.**  
* **source, stakeholder, verification\_method**: **New optional fields** for SysML integration. These will be stored in the attributes table and used by the SysML generator.

### **4.2. Git Workflow for Authoring**

The workflow mirrors standard software development practices, supporting the "Collaboration" and "Version Control" principles from the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#2-guiding-principles):

1. Pull Latest Changes: Always start by ensuring your local main branch is up-to-date.  
   git checkout main  
   git pull origin main  
2. Create a Feature Branch: For any new requirement or significant change, create a dedicated branch.  
   git checkout \-b feat/add-login-req  
3. **Create/Edit Markdown Files:** Use your text editor to create new .md files in the requirements/ directory or modify existing ones. Remember to follow the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md) diligently, including the new SysML-related fields.  
4. Add and Commit Changes: Stage your changes and commit them with a descriptive message.  
   git add requirements/features/PRODX-REQ-FNC-AUTH-LOGIN-00010.md  
   git commit \-m "feat(auth): Add PRODX-REQ-FNC-AUTH-LOGIN-00010 for user login capability with SysML attributes"  
5. Push Your Branch: Push your local branch to GitHub.  
   git push origin feat/add-login-req  
6. **Create a Pull Request (PR):** Go to your GitHub repository and create a Pull Request from your feature branch to the main branch.  
7. **Review and Merge:** Team members review the PR, provide feedback, and approve. Once approved, merge the PR into main. This merge event will trigger the automation workflow to update the *current state* in the SQLite database and generate SysML models. The review process is further detailed in the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md\#6-review-process).

## **5\. Automation with GitHub Actions and Node.js (Including SysML Generation)**

This is where the "Code" part of "Docs as Code" truly shines. GitHub Actions will automate parsing your Markdown files, extracting data, populating the SQLite database, and **generating SysML models** for both current state and baselines. This directly supports the "Automation" and "Versioning" principles discussed in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#2-guiding-principles).

### **5.1. Node.js Project Setup**

Navigate into your requirements\_parser directory and modify package.json.

1. requirements\_parser/package.json:  
   Add the necessary Node.js packages (libraries) for YAML parsing, Markdown rendering, SQLite interaction, Git interaction, and potentially new libraries for SysML generation (e.g., XML builders if generating XMI directly, or a custom library for ReqIF).  
   {  
     "name": "requirements\_parser",  
     "version": "1.0.0",  
     "description": "Parses Markdown requirements, populates SQLite database, and generates SysML models.",  
     "main": "index.js",  
     "scripts": {  
       "start": "node index.js"  
     },  
     "keywords": \[\],  
     "author": "",  
     "license": "MIT",  
     "dependencies": {  
       "js-yaml": "^4.1.0",           // For parsing YAML front matter  
       "markdown-it": "^13.0.1",      // For Markdown to HTML rendering  
       "sqlite3": "^5.1.6",           // For SQLite database interaction  
       "simple-git": "^3.19.0",       // For Git repository interaction  
       "yargs": "^17.7.2",            // For command-line argument parsing  
       "fs-extra": "^11.1.1",         // For file system operations (e.g., ensureDir)  
       "moment": "^2.29.4",           // For timestamp handling  
       "xmlbuilder2": "^3.1.1"        // NEW: For building XML (e.g., XMI for SysML)  
       // Add other SysML-specific dependencies here if needed  
     }  
   }

2. requirements\_parser/index.js:  
   This is the core Node.js application. It will implement the logic to:  
   * Parse command-line arguments for baseline creation.  
   * Connect to the SQLite database and create tables. The database schema is detailed in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#5-database-schema-design-for-sqlite).  
   * Iterate through Markdown files.  
   * Extract YAML front matter (including new SysML-specific fields) and Markdown content.  
   * Render Markdown to HTML.  
   * Interact with Git to get file commit information.  
   * Insert data into the SQLite database for current requirements and baselines.  
   * **Crucially, it will now also trigger the sysml\_generator.js script.**

const fs \= require('fs-extra');  
const path \= require('path');  
const yaml \= require('js-yaml');  
const MarkdownIt \= require('markdown-it');  
const sqlite3 \= require('sqlite3').verbose();  
const simpleGit \= require('simple-git');  
const yargs \= require('yargs/yargs');  
const { hideBin } \= require('yargs/helpers');  
const moment \= require('moment'); // For handling timestamps

// Import the SysML generator script  
const sysmlGenerator \= require('./sysml\_generator'); // NEW

const md \= new MarkdownIt();  
const git \= simpleGit();

// \--- Command Line Arguments \---  
const argv \= yargs(hideBin(process.argv))  
    .option('requirements-dir', {  
        alias: 'r',  
        description: 'Directory containing Markdown requirement files',  
        type: 'string',  
        default: 'requirements'  
    })  
    .option('db-file', {  
        alias: 'd',  
        description: 'Path to the output SQLite database file',  
        type: 'string',  
        default: 'docs\_build/requirements.sqlite'  
    })  
    .option('baseline-name', {  
        alias: 'n',  
        description: 'Optional: Name for the baseline to create',  
        type: 'string'  
    })  
    .option('baseline-tag', {  
        alias: 't',  
        description: 'Optional: Git tag for the baseline (e.g., v1.0.0)',  
        type: 'string'  
    })  
    .option('sysml-output-dir', { // NEW: Argument for SysML output directory  
        description: 'Directory for generated SysML models',  
        type: 'string',  
        default: 'docs\_build/sysml\_models'  
    })  
    .help()  
    .alias('help', 'h')  
    .argv;

// \--- Database Schema Setup \---  
async function createTables(db) {  
    return new Promise((resolve, reject) \=\> {  
        db.exec(\`  
            CREATE TABLE IF NOT EXISTS requirements (  
                id TEXT PRIMARY KEY NOT NULL,  
                name TEXT NOT NULL,  
                description\_md TEXT,  
                description\_html TEXT,  
                type TEXT,  
                priority TEXT,  
                status TEXT,  
                git\_commit\_hash\_latest TEXT,  
                last\_modified\_git\_timestamp INTEGER,  
                file\_path TEXT  
            );  
            CREATE TABLE IF NOT EXISTS attributes (  
                req\_id TEXT NOT NULL,  
                attribute\_key TEXT NOT NULL,  
                attribute\_value TEXT,  
                PRIMARY KEY (req\_id, attribute\_key),  
                FOREIGN KEY (req\_id) REFERENCES requirements(id) ON DELETE CASCADE  
            );  
            CREATE TABLE IF NOT EXISTS relationships (  
                source\_req\_id TEXT NOT NULL,  
                target\_id TEXT NOT NULL,  
                relationship\_type TEXT NOT NULL,  
                PRIMARY KEY (source\_req\_id, target\_id, relationship\_type),  
                FOREIGN KEY (source\_req\_id) REFERENCES requirements(id) ON DELETE CASCADE  
            );  
            CREATE TABLE IF NOT EXISTS tags (  
                req\_id TEXT NOT NULL,  
                tag\_name TEXT NOT NULL,  
                PRIMARY KEY (req\_id, tag\_name),  
                FOREIGN KEY (req\_id) REFERENCES requirements(id) ON DELETE CASCADE  
            );  
            CREATE TABLE IF NOT EXISTS attachments (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                req\_id TEXT NOT NULL,  
                file\_name TEXT NOT NULL,  
                file\_path\_in\_repo TEXT NOT NULL,  
                description TEXT,  
                uploaded\_by TEXT,  
                uploaded\_timestamp INTEGER,  
                FOREIGN KEY (req\_id) REFERENCES requirements(id) ON DELETE CASCADE  
            );  
            CREATE TABLE IF NOT EXISTS baselines (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT UNIQUE NOT NULL,  
                description TEXT,  
                created\_timestamp INTEGER NOT NULL,  
                git\_tag TEXT UNIQUE NOT NULL,  
                created\_by\_user TEXT  
            );  
            CREATE TABLE IF NOT EXISTS baseline\_contents (  
                baseline\_id INTEGER NOT NULL,  
                req\_id TEXT NOT NULL,  
                req\_git\_commit\_hash\_at\_baseline TEXT NOT NULL,  
                PRIMARY KEY (baseline\_id, req\_id),  
                FOREIGN KEY (baseline\_id) REFERENCES baselines(id) ON DELETE CASCADE,  
                FOREIGN KEY (req\_id) REFERENCES requirements(id) ON DELETE NO ACTION  
            );  
        \`, (err) \=\> {  
            if (err) reject(err);  
            else resolve();  
        });  
    });  
}

// \--- Markdown Parsing Logic \---  
function parseMarkdownFile(filepath) {  
    const content \= fs.readFileSync(filepath, 'utf8');  
    const parts \= content.split('---');

    if (parts.length \>= 3 && parts\[0\].trim() \=== '') {  
        const yamlStr \= parts\[1\];  
        const mdContent \= parts.slice(2).join('---').trim(); // Join remaining parts in case of '---' in content  
        const metadata \= yaml.load(yamlStr);  
        return { metadata, mdContent };  
    } else {  
        throw new Error(\`File ${filepath} does not have valid YAML front matter.\`);  
    }  
}

// \--- Git Interaction Logic \---  
async function getGitFileInfo(filepath, commitHash \= null) {  
    try {  
        const logOptions \= commitHash ? \[\`--before=${commitHash}\`, '-1'\] : \['-1'\];  
        const log \= await git.log(logOptions, filepath);

        if (log.latest) {  
            return {  
                commitHash: log.latest.hash,  
                timestamp: moment(log.latest.date).unix()  
            };  
        }  
        // Fallback for files that might not have a direct log entry at a specific commit,  
        // or if log is empty for some reason.  
        // For a baseline, we'd typically use the commit hash of the tag itself if the file  
        // didn't explicitly change at that point but was part of the tree.  
        if (commitHash) {  
            return {  
                commitHash: commitHash, // Use the provided commit hash for baseline context  
                timestamp: moment().unix() // Fallback timestamp  
            };  
        }  
        throw new Error(\`No git log found for ${filepath}\`);  
    } catch (error) {  
        console.error(\`Error getting git info for ${filepath}:\`, error.message);  
        return {  
            commitHash: 'unknown',  
            timestamp: moment().unix() // Current timestamp as fallback  
        };  
    }  
}

// \--- Main Logic \---  
async function main() {  
    const { requirementsDir, dbFile, baselineName, baselineTag, sysmlOutputDir } \= argv; // NEW: sysmlOutputDir

    // Ensure output directories exist  
    await fs.ensureDir(path.dirname(dbFile));  
    await fs.ensureDir(sysmlOutputDir); // NEW: Ensure SysML output directory exists

    const db \= new sqlite3.Database(dbFile);

    try {  
        await createTables(db);

        // \--- Populating Current Requirements \---  
        console.log('--- Populating Current Requirements Data \---');

        // Clear existing data (except baselines) before re-populating current state  
        await new Promise((resolve, reject) \=\> {  
            db.exec(\`  
                DELETE FROM relationships;  
                DELETE FROM attributes;  
                DELETE FROM tags;  
                DELETE FROM attachments;  
                DELETE FROM requirements;  
            \`, (err) \=\> {  
                if (err) reject(err);  
                else resolve();  
            });  
        });

        const currentRequirementsData \= \[\]; // To store (req\_id, git\_commit\_hash\_latest, file\_path) for baselining

        const files \= await fs.readdir(requirementsDir, { recursive: true });  
        for (const file of files) {  
            if (file.endsWith('.md')) {  
                const filepath \= path.join(requirementsDir, file);  
                try {  
                    const { metadata, mdContent } \= parseMarkdownFile(filepath);

                    const reqId \= metadata.id;  
                    const name \= metadata.name || reqId;  
                    const reqType \= metadata.type;  
                    const priority \= metadata.priority;  
                    const status \= metadata.status;  
                    const tags \= metadata.tags || \[\];  
                    const links \= metadata.links || \[\];  
                    const attachments \= metadata.attachments || \[\];

                    const descriptionHtml \= md.render(mdContent);

                    const { commitHash: gitCommitHashLatest, timestamp: lastModifiedGitTimestamp } \= await getGitFileInfo(filepath);

                    // Store for baseline processing  
                    currentRequirementsData.push({ reqId, gitCommitHashLatest, filepath });

                    // Insert into requirements table  
                    await new Promise((resolve, reject) \=\> {  
                        db.run(\`INSERT INTO requirements (id, name, description\_md, description\_html, type, priority, status, git\_commit\_hash\_latest, last\_modified\_git\_timestamp, file\_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,  
                            \[reqId, name, mdContent, descriptionHtml, reqType, priority, status, gitCommitHashLatest, lastModifiedGitTimestamp, filepath\],  
                            function(err) {  
                                if (err) reject(err);  
                                else reject(err); // Reject on error  
                            }  
                        );  
                        resolve(); // Resolve immediately after db.run is called  
                    });

                    // Insert into attributes table (including new SysML-specific attributes)  
                    for (const key in metadata) {  
                        if (\!\['id', 'name', 'type', 'priority', 'status', 'tags', 'links', 'attachments'\].includes(key)) {  
                            const attributeValue \= JSON.stringify(metadata\[key\]); // Store as JSON string for complex types  
                            await new Promise((resolve, reject) \=\> {  
                                db.run(\`INSERT INTO attributes (req\_id, attribute\_key, attribute\_value) VALUES (?, ?, ?)\`,  
                                    \[reqId, key, attributeValue\],  
                                    function(err) {  
                                        if (err) reject(err);  
                                        else resolve();  
                                    }  
                                );  
                            });  
                        }  
                    }

                    // Insert into relationships table  
                    for (const link of links) {  
                        await new Promise((resolve, reject) \=\> {  
                            db.run(\`INSERT INTO relationships (source\_req\_id, target\_id, relationship\_type) VALUES (?, ?, ?)\`,  
                                \[reqId, link.target, link.type\],  
                                function(err) {  
                                    if (err) reject(err);  
                                    else resolve();  
                                }  
                            );  
                        });  
                    }

                    // Insert into tags table  
                    for (const tag of tags) {  
                        await new Promise((resolve, reject) \=\> {  
                            db.run(\`INSERT INTO tags (req\_id, tag\_name) VALUES (?, ?)\`,  
                                \[reqId, tag\],  
                                function(err) {  
                                    if (err) reject(err);  
                                    else resolve();  
                                }  
                            );  
                        });  
                    }

                    // Insert into attachments table  
                    for (const attachment of attachments) {  
                        await new Promise((resolve, reject) \=\> {  
                            db.run(\`INSERT INTO attachments (req\_id, file\_name, file\_path\_in\_repo, description, uploaded\_by, uploaded\_timestamp) VALUES (?, ?, ?, ?, ?, ?)\`,  
                                \[reqId, attachment.file\_name, attachment.file\_path\_in\_repo, attachment.description, attachment.uploaded\_by, attachment.uploaded\_timestamp\],  
                                function(err) {  
                                    if (err) reject(err);  
                                    else resolve();  
                                }  
                            );  
                        });  
                    }

                } catch (error) {  
                    console.error(\`Error processing file ${filepath}:\`, error.message);  
                }  
            }  
        }

        // \--- Baseline Creation Logic \---  
        if (baselineName && baselineTag) {  
            console.log(\`--- Creating Baseline: ${baselineName} (${baselineTag}) \---\`);

            // Get the commit hash for the given tag  
            let taggedCommitHash;  
            try {  
                const tagInfo \= await git.show(\['-s', '--format=%H', baselineTag\]);  
                taggedCommitHash \= tagInfo.trim();  
            } catch (error) {  
                console.error(\`Error: Git tag ${baselineTag} not found or invalid:\`, error.message);  
                return; // Exit if tag is invalid  
            }

            // Insert into baselines table  
            const baselineId \= await new Promise((resolve, reject) \=\> {  
                db.run(\`INSERT INTO baselines (name, description, created\_timestamp, git\_tag, created\_by\_user) VALUES (?, ?, ?, ?, ?)\`,  
                    \[baselineName, \`Baseline created from Git tag ${baselineTag}\`, moment().unix(), baselineTag, "automated\_system"\],  
                    function(err) {  
                        if (err) reject(err);  
                        else resolve(this.lastID);  
                    }  
                );  
            });

            // Populate baseline\_contents table  
            for (const { reqId, filepath } of currentRequirementsData) {  
                // For baselines, we need the commit hash of the file \*at the time of the tag\*.  
                // This is more complex than just the latest commit. \`git blame\` is one way,  
                // or \`git log \--before=\<tag\_commit\_date\> \-1 \<filepath\>\`  
                let reqGitCommitHashAtBaseline;  
                try {  
                    const logAtTag \= await git.log({ file: filepath, maxCount: 1, '--before': taggedCommitHash });  
                    reqGitCommitHashAtBaseline \= logAtTag.latest ? logAtTag.latest.hash : taggedCommitHash; // Fallback to tag commit if no specific file change before it  
                } catch (error) {  
                    console.warn(\`Could not get specific commit for ${filepath} at tag ${baselineTag}. Using tag commit hash. Error: ${error.message}\`);  
                    reqGitCommitHashAtBaseline \= taggedCommitHash;  
                }

                await new Promise((resolve, reject) \=\> {  
                    db.run(\`INSERT INTO baseline\_contents (baseline\_id, req\_id, req\_git\_commit\_hash\_at\_baseline) VALUES (?, ?, ?)\`,  
                        \[baselineId, reqId, reqGitCommitHashAtBaseline\],  
                        function(err) {  
                            if (err) reject(err);  
                            else resolve();  
                        }  
                    );  
                });  
            }  
            console.log('Baseline created successfully.');  
        } else if (baselineName || baselineTag) {  
            console.error("Error: Both \--baseline-name and \--baseline-tag must be provided for baseline creation.");  
        }

        console.log(\`Requirements data processing complete. Database updated at: ${dbFile}\`);

        // \--- SysML Model Generation \--- // NEW  
        console.log('--- Generating SysML Models \---');  
        await sysmlGenerator.generateSysML(dbFile, sysmlOutputDir);  
        console.log('SysML models generated successfully.');

    } catch (error) {  
        console.error('An error occurred during processing:', error);  
    } finally {  
        db.close((err) \=\> {  
            if (err) {  
                console.error('Error closing database:', err.message);  
            } else {  
                console.log('Database connection closed.');  
            }  
        });  
    }  
}

main();

3. requirements\_parser/sysml\_generator.js (NEW FILE):  
   This new script will contain the logic for generating SysML models from the SQLite database. For simplicity, this example will generate a basic XML structure (representing XMI/ReqIF conceptually). A real-world implementation would require a dedicated library for full XMI generation.  
   // requirements\_parser/sysml\_generator.js  
   const fs \= require('fs-extra');  
   const path \= require('path');  
   const sqlite3 \= require('sqlite3').verbose();  
   const { create } \= require('xmlbuilder2'); // For building XML

   async function generateSysML(dbFile, outputDir) {  
       const db \= new sqlite3.Database(dbFile, sqlite3.OPEN\_READONLY);

       try {  
           await fs.ensureDir(outputDir); // Ensure output directory exists

           // Fetch all requirements with their attributes and relationships  
           const requirements \= await new Promise((resolve, reject) \=\> {  
               db.all(\`  
                   SELECT  
                       r.id,  
                       r.name,  
                       r.description\_md,  
                       r.type,  
                       r.priority,  
                       r.status,  
                       GROUP\_CONCAT(DISTINCT t.tag\_name) AS tags,  
                       GROUP\_CONCAT(DISTINCT json\_group\_array(json\_object('type', rel.relationship\_type, 'target', rel.target\_id))) FILTER (WHERE rel.source\_req\_id IS NOT NULL) AS relationships\_json,  
                       GROUP\_CONCAT(DISTINCT json\_group\_array(json\_object('key', attr.attribute\_key, 'value', attr.attribute\_value))) FILTER (WHERE attr.req\_id IS NOT NULL) AS attributes\_json  
                   FROM  
                       requirements r  
                   LEFT JOIN  
                       tags t ON r.id \= t.req\_id  
                   LEFT JOIN  
                       relationships rel ON r.id \= rel.source\_req\_id  
                   LEFT JOIN  
                       attributes attr ON r.id \= attr.req\_id  
                   GROUP BY  
                       r.id  
               \`, (err, rows) \=\> {  
                   if (err) reject(err);  
                   else {  
                       // Parse JSON strings back to objects/arrays  
                       const parsedRows \= rows.map(row \=\> ({  
                           ...row,  
                           relationships: row.relationships\_json ? JSON.parse(row.relationships\_json) : \[\],  
                           attributes: row.attributes\_json ? JSON.parse(row.attributes\_json) : \[\]  
                       }));  
                       resolve(parsedRows);  
                   }  
               });  
           });

           // Start building the SysML XML (conceptual XMI/ReqIF structure)  
           const root \= create({ version: '1.0', encoding: 'UTF-8' })  
               .ele('sysml:Model', {  
                   'xmlns:sysml': 'http://www.omg.org/spec/SysML/20150901/SysML',  
                   'xmlns:uml': 'http://www.omg.org/spec/UML/20150901/UML',  
                   'xmi:version': '2.5.1',  
                   'xmlns:xmi': 'http://www.omg.org/spec/XMI/20131001'  
               })  
               .ele('ownedMember', { 'xmi:type': 'uml:Package', 'name': 'RequirementsPackage' });

           const requirementsContainer \= root.ele('ownedMember', { 'xmi:type': 'sysml:Requirement', 'name': 'AllRequirements' });

           requirements.forEach(req \=\> {  
               const reqElement \= requirementsContainer.ele('ownedMember', {  
                   'xmi:type': 'sysml:Requirement',  
                   'xmi:id': req.id,  
                   'name': req.name,  
                   'text': req.description\_md // Map Markdown content to SysML text  
               });

               // Map standard properties  
               reqElement.ele('ownedProperty', { 'xmi:type': 'sysml:Property', 'name': 'type', 'value': req.type });  
               reqElement.ele('ownedProperty', { 'xmi:type': 'sysml:Property', 'name': 'priority', 'value': req.priority });  
               reqElement.ele('ownedProperty', { 'xmi:type': 'sysml:Property', 'name': 'status', 'value': req.status });

               // Map custom attributes (including SysML-specific ones)  
               req.attributes.forEach(attr \=\> {  
                   reqElement.ele('ownedProperty', {  
                       'xmi:type': 'sysml:Property',  
                       'name': attr.key,  
                       'value': JSON.parse(attr.value) // Parse back if stored as JSON string  
                   });  
               });

               // Map relationships  
               req.relationships.forEach(rel \=\> {  
                   let sysmlRelType;  
                   switch (rel.type) {  
                       case 'implements': sysmlRelType \= 'sysml:Satisfy'; break; // SysML Satisfy for implements  
                       case 'traces\_to\_test': sysmlRelType \= 'sysml:Verify'; break; // SysML Verify for traces\_to\_test  
                       case 'refines': sysmlRelType \= 'sysml:Refine'; break; // SysML Refine  
                       case 'deriveReqt': sysmlRelType \= 'sysml:DeriveReqt'; break; // SysML DeriveReqt  
                       case 'allocates': sysmlRelType \= 'sysml:Allocate'; break; // SysML Allocate  
                       case 'satisfies': sysmlRelType \= 'sysml:Satisfy'; break; // Explicit SysML Satisfy  
                       default: sysmlRelType \= 'sysml:Trace'; // Generic trace for others  
                   }

                   const relationshipElement \= reqElement.ele('ownedRelationship', { 'xmi:type': sysmlRelType });  
                   relationshipElement.ele('source', { 'xmi:idref': req.id });  
                   relationshipElement.ele('target', { 'xmi:idref': rel.target });

                   // Add verification\_method to Verify relationships  
                   if (rel.type \=== 'traces\_to\_test' || sysmlRelType \=== 'sysml:Verify') {  
                       const verificationMethodAttr \= req.attributes.find(a \=\> a.key \=== 'verification\_method');  
                       if (verificationMethodAttr) {  
                           relationshipElement.ele('method', { 'value': JSON.parse(verificationMethodAttr.value) });  
                       }  
                   }  
               });  
           });

           const xmlString \= root.end({ prettyPrint: true });  
           const outputPath \= path.join(outputDir, 'requirements\_model.xmi');  
           await fs.writeFile(outputPath, xmlString);  
           console.log(\`Generated SysML model at: ${outputPath}\`);

       } catch (error) {  
           console.error('Error generating SysML models:', error);  
           throw error;  
       } finally {  
           db.close();  
       }  
   }

   module.exports \= { generateSysML };

4. .github/workflows/main.yml:  
   Update the GitHub Actions workflow to include the SysML generation step.  
   name: Requirements Data & Docs Automation

   on:  
     push:  
       branches:  
         \- main  
     create:  
       tags:  
         \- 'v\*' \# Trigger on tags like v1.0.0, v2.0.0, etc.  
         \- 'release-\*' \# Trigger on tags like release-2025-Q1

   jobs:  
     build-and-process-requirements:  
       runs-on: ubuntu-latest  
       steps:  
         \- uses: actions/checkout@v4  
           with:  
             fetch-depth: 0 \# Needed to get full Git history for blame/baselining

         \- name: Set up Node.js  
           uses: actions/setup-node@v4  
           with:  
             node-version: '20' \# Use an LTS version

         \- name: Install Node.js requirements parser dependencies  
           run: npm install \--prefix requirements\_parser

         \- name: Run requirements parser (Update Current State)  
           \# Pass the SysML output directory to the parser  
           run: node requirements\_parser/index.js \--requirements-dir requirements \--db-file docs\_build/requirements.sqlite \--sysml-output-dir docs\_build/sysml\_models

         \- name: Create Baseline (if tag event)  
           if: startsWith(github.ref, 'refs/tags/')  
           run: |  
             TAG\_NAME="${{ github.ref\_name }}"  
             \# Extract a clean baseline name from the tag (e.g., "v1.0.0" \-\> "Release v1.0.0")  
             BASELINE\_NAME="Release ${TAG\_NAME}"  
             \# Pass the SysML output directory to the parser for baseline generation  
             node requirements\_parser/index.js \--requirements-dir requirements \--db-file docs\_build/requirements.sqlite \--baseline-name "${BASELINE\_NAME}" \--baseline-tag "${TAG\_NAME}" \--sysml-output-dir docs\_build/sysml\_models

         \- name: Upload SQLite Database Artifact  
           uses: actions/upload-artifact@v4  
           with:  
             name: requirements-database  
             path: docs\_build/requirements.sqlite

         \- name: Upload SysML Models Artifact \# NEW: Upload SysML models  
           uses: actions/upload-artifact@v4  
           with:  
             name: sysml-models  
             path: docs\_build/sysml\_models/

     build-and-deploy-documentation:  
       needs: build-and-process-requirements  
       runs-on: ubuntu-latest  
       steps:  
         \- uses: actions/checkout@v4

         \- name: Download SQLite Database Artifact  
           uses: actions/download-artifact@v4  
           with:  
             name: requirements-database  
             path: docs\_build/

         \- name: Set up Python  
           uses: actions/setup-python@v5  
           with:  
             python-version: '3.x'

         \- name: Install MkDocs and other dependencies  
           run: |  
             pip install mkdocs mkdocs-material pymdown-extensions  
             pip install datasette

         \- name: Create MkDocs Configuration (if not already present)  
           run: |  
             if \[ \! \-f mkdocs.yml \]; then  
               echo "site\_name: Product Requirements" \> mkdocs.yml  
               echo "nav:" \>\> mkdocs.yml  
               echo "  \- Home: index.md" \>\> mkdocs.yml  
               echo "  \- Requirements:" \>\> mkdocs.yml  
               find requirements \-name '\*.md' | sort | sed 's/^/-    /' | sed 's/\\.md//' \>\> mkdocs.yml  
               echo "  \- SysML Models: sysml\_models/requirements\_model.xmi" \>\> mkdocs.yml \# NEW: Link to SysML model  
               echo "theme: material" \>\> mkdocs.yml  
               echo "extra\_css:" \>\> mkdocs.yml  
               echo "  \- stylesheets/extra.css" \>\> mkdocs.yml  
             fi  
             \# Copy requirements into docs for MkDocs  
             mkdir \-p docs/requirements  
             cp \-r requirements/\* docs/requirements/  
             cp \-r attachments docs/  
             \# NEW: Copy generated SysML models into docs for MkDocs (if you want them served by GitHub Pages)  
             mkdir \-p docs/sysml\_models  
             cp \-r docs\_build/sysml\_models/\* docs/sysml\_models/

         \- name: Build MkDocs Documentation  
           run: mkdocs build \--site-dir docs\_build/site

         \- name: Deploy MkDocs to GitHub Pages  
           uses: peaceiris/actions-gh-pages@v4  
           if: github.ref \== 'refs/heads/main'  
           with:  
             github\_token: ${{ secrets.GITHUB\_TOKEN }}  
             publish\_dir: docs\_build/site  
             keep\_files: true

### **5.3. Datasette and MkDocs Setup and Integration (Practical Steps)**

### **5.3.1. Datasette Setup (Local & Deployment)**

* **Local Setup:**  
  1. Ensure Python is installed.  
  2. Install Datasette: pip install datasette  
  3. After the Node.js parser generates docs\_build/requirements.sqlite, you can explore it locally:  
     datasette docs\_build/requirements.sqlite  
  4. This will typically open a web interface in your browser (e.g., http://127.0.0.1:8001/) where you can browse tables, run SQL queries, and view relationships. This tool helps with the "Reporting and Analysis" aspect discussed in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#46-reporting-and-analysis).  
* Deployment for Collaboration (Conceptual):  
  To make your SQLite database accessible to the team, you'd typically deploy Datasette to a web server. Common options include:  
  * **Heroku/Render:** Datasette has built-in publish commands for some platforms.  
  * **Docker:** Create a Dockerfile for Datasette and your database, then deploy the container.  
  * **Cloud Hosting (AWS, GCP, Azure):** Host Datasette on a VM or serverless function.

  Integration with GitHub Actions for Deployment:The deploy-datasette job in the GitHub Actions example above is conceptual. You would replace the placeholder run command with specific deployment logic for your chosen platform. This usually involves:

  1. Downloading the requirements.sqlite artifact.  
  2. Using a CLI tool (e.g., Heroku CLI) or git push to a platform-specific remote.  
  3. Configuring environment variables or secrets for the deployment.

### **5.3.2. MkDocs Setup (Local & Deployment)**

* **Local Setup:**  
  1. Ensure Python is installed.  
  2. Install MkDocs and a theme (e.g., Material for MkDocs):  
     pip install mkdocs mkdocs-material  
  3. Create an mkdocs.yml file in your repository root. A basic one was generated in the GitHub Actions step, but you'll likely customize it.  
  4. Create your main documentation entry point, e.g., docs/index.md.  
  5. Copy your requirements/ and attachments/ folders into the docs/ directory so MkDocs can find them:  
     cp \-r requirements/ docs/requirements/  
     cp \-r attachments/ docs/attachments/  
  6. NEW: Copy generated SysML models into docs/sysml\_models for MkDocs to include:  
     mkdir \-p docs/sysml\_models  
     cp \-r docs\_build/sysml\_models/\* docs/sysml\_models/  
  7. Build your documentation: mkdocs build (output goes to site/ by default).  
  8. Serve it locally for preview: mkdocs serve (e.g., http://127.0.0.1:8000/)  
* Deployment to GitHub Pages:  
  The deploy-documentation job in the GitHub Actions workflow automates this.  
  1. The mkdocs build command compiles your Markdown into static HTML.  
  2. The peaceiris/actions-gh-pages@v4 action then pushes this built site content to the gh-pages branch of your repository.  
  3. Once pushed, GitHub Pages will automatically serve the content from https://your-username.github.io/your-repository-name/.

  **Important Considerations for MkDocs:**

  * **mkdocs.yml structure:** Configure the nav section to properly link to your requirement Markdown files and the **new SysML model files**. You might need to use \!include statements for large numbers of requirements or structure them carefully.  
  * **Relative Paths:** Ensure internal links within your Markdown requirements (e.g., to attachments) are relative to the docs/ directory or configured correctly in mkdocs.yml for rendering.  
  * **Themes and Plugins:** Explore MkDocs themes (like Material for MkDocs) and plugins to enhance your documentation (e.g., search, diagrams, admonitions).

## **6\. Continuous Improvement**

This section outlines ongoing efforts to refine the process, contributing to the overall goals of the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md).

* **Refine Markdown Structure:** Continuously evaluate and refine your Markdown file structure, YAML front matter fields, and linking conventions to best suit your team's evolving needs. Refer to the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md) for updates to writing conventions.  
* **Automate Checks:** Enhance your **Node.js application** or add new GitHub Actions to perform automated checks on your requirements (e.g., validate id format, check for broken internal links, identify requirements missing crucial fields like priority or status).  
* **Integrate with Other Tools:** Explore deeper integrations with external tools like Jira, Trello, or dedicated test management systems. You could use their APIs to push/pull data, using your SQLite database as a structured intermediate layer.  
* **Advanced Reporting:** Develop more complex SQL queries for advanced reporting needs, or connect the SQLite database to external Business Intelligence (BI) tools for interactive dashboards and visualizations.  
* **User Management (if building a custom UI):** If you eventually build a custom web interface on top of this (e.g., with a Node.js web framework like Express and connecting to this SQLite DB), you'd implement user authentication and permissions there.