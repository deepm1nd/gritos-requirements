// requirements_web_backend/utils/markdownUtils.js
const yaml = require('js-yaml');

/**
 * Constructs a Markdown string from requirement data.
 * @param {object} data - The requirement data object.
 *                         Expected to have metadata fields (id, name, type, etc.)
 *                         and a description_md field for the main content.
 * @returns {string} - The full Markdown content as a string.
 */
const constructMarkdown = (data) => {
    const { description_md, ...metadata } = data;

    // Ensure essential metadata fields are present, provide defaults or handle errors as needed
    const metaToDump = {
        id: metadata.id || '',
        name: metadata.name || '',
        type: metadata.type || '',
        priority: metadata.priority || '',
        status: metadata.status || '',
        tags: metadata.tags || [],
        links: metadata.links || [],
        // SysML and other custom attributes
        source: metadata.source, // Optional
        stakeholder: metadata.stakeholder, // Optional
        verification_method: metadata.verification_method, // Optional
        allocated_to: metadata.allocated_to, // Optional (ensure it's an array if present)
        // Add any other custom attributes passed in metadata that should be in YAML
    };

    // Filter out undefined optional fields from YAML to keep it clean
    Object.keys(metaToDump).forEach(key => {
        if (metaToDump[key] === undefined) {
            delete metaToDump[key];
        }
        // Ensure arrays are properly formatted if they are strings (e.g. from form inputs)
        if (key === 'tags' && typeof metaToDump[key] === 'string') {
            metaToDump[key] = metaToDump[key].split(',').map(s => s.trim()).filter(s => s !== '');
        }
        if (key === 'allocated_to' && typeof metaToDump[key] === 'string') {
             metaToDump[key] = metaToDump[key].split(',').map(s => s.trim()).filter(s => s !== '');
        }
         if (key === 'links' && typeof metaToDump[key] === 'string') {
            try {
                // Attempt to parse if it's a JSON string representation of an array
                const parsedLinks = JSON.parse(metaToDump[key]);
                if (Array.isArray(parsedLinks)) {
                    metaToDump[key] = parsedLinks;
                } else {
                     // If not an array, treat as a single link string in a list, or handle error
                    console.warn(`Links field for ${metaToDump.id} was a string but not a JSON array. Treating as single link or check format: ${metaToDump[key]}`);
                    // Depending on desired behavior, you might wrap it in an array:
                    // metaToDump[key] = [{ type: 'related', target: metaToDump[key] }]; // Example structure
                    // For now, if not a JSON array, and it's a string, try to split by comma as a fallback
                     metaToDump[key] = metaToDump[key].split(',').map(s => ({ type: 'related', target: s.trim() })).filter(s => s.target !== '');
                }
            } catch (e) {
                // If JSON.parse fails, it's not a JSON string. Treat as comma-separated string of targets.
                console.warn(`Could not parse links string as JSON for requirement ${metaToDump.id}. Treating as comma-separated list of targets: ${metaToDump[key]}`);
                metaToDump[key] = metaToDump[key].split(',').map(s => ({ type: 'related', target: s.trim() })).filter(s => s.target !== '');
            }
        } else if (key === 'links' && !Array.isArray(metaToDump[key])) {
            // If links is not an array and not a string (e.g. object), wrap in array or error
            if (typeof metaToDump[key] === 'object' && metaToDump[key] !== null) {
                metaToDump[key] = [metaToDump[key]]; // Assume it's a single link object
            } else {
                 console.warn(`Links field for ${metaToDump.id} is not an array or parsable string. Defaulting to empty array.`);
                metaToDump[key] = [];
            }
        }
    });


    let yamlFrontMatter;
    try {
        yamlFrontMatter = yaml.dump(metaToDump);
    } catch (e) {
        console.error("Error dumping YAML:", e);
        throw new Error("Failed to construct YAML front matter.");
    }

    // The H1 heading should match the 'id' and 'name' from front matter, as per style guide
    const h1Title = `# ${metadata.id}: ${metadata.name}`;

    return `---
${yamlFrontMatter}---

${h1Title}

${description_md}
`;
};

/**
 * Parses Markdown file content into metadata and Markdown body.
 * (Primarily for reference or if backend needs to re-parse uploaded/read files,
 *  though the main parser in the GitHub Action handles the canonical parsing).
 * @param {string} fileContent - The full Markdown file content.
 * @returns {object} - { metadata: object, mdContent: string }
 */
const parseMarkdownFileContent = (fileContent) => {
    try {
        const parts = fileContent.split('---');
        if (parts.length >= 3 && parts[0].trim() === '') { // parts[0] should be empty string before first ---
            const yamlStr = parts[1];
            const mdContent = parts.slice(2).join('---').trim(); // Join remaining parts for md content
            const metadata = yaml.load(yamlStr);
            return { metadata, mdContent };
        } else {
            // Fallback for content that might not have valid YAML front matter
            // or is just plain markdown.
            console.warn("File content does not have standard YAML front matter. Treating all as mdContent.");
            return { metadata: {}, mdContent: fileContent.trim() };
        }
    } catch (error) {
        console.error("Error parsing Markdown file content:", error);
        throw new Error("Failed to parse Markdown file content.");
    }
};

/**
 * Extracts YAML metadata from a Markdown string.
 * @param {string} markdownString - The Markdown string.
 * @returns {object} - The extracted metadata object.
 */
const extractMetadataFromString = (markdownString) => {
    const match = markdownString.match(/^---([\s\S]+?)---/);
    if (match && match[1]) {
        try {
            return yaml.load(match[1]);
        } catch (e) {
            console.error("Error parsing YAML from string:", e);
            return {}; // Return empty object on error
        }
    }
    return {}; // No YAML front matter found
};


module.exports = {
    constructMarkdown,
    parseMarkdownFileContent,
    extractMetadataFromString,
};
