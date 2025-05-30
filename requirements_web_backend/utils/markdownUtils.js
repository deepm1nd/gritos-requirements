// requirements_web_backend/utils/markdownUtils.js

// Placeholder for constructMarkdown
// Actual implementation will take metadata object and description string
// and return a full Markdown string with YAML frontmatter.
const constructMarkdown = (requirementData) => {
    console.log('[markdownUtils.constructMarkdown] Called with data:', requirementData);
    const { description_md, ...metadata } = requirementData;
    let frontmatter = '---\n';
    for (const key in metadata) {
        frontmatter += `${key}: ${metadata[key]}\n`;
    }
    frontmatter += '---\n\n';
    return frontmatter + description_md;
};

// Placeholder for parseMarkdownFileContent
// Actual implementation will take full Markdown string, parse YAML frontmatter
// and separate it from the main Markdown description.
const parseMarkdownFileContent = (markdownContent) => {
    console.log('[markdownUtils.parseMarkdownFileContent] Called with content snippet:', markdownContent.substring(0, 100));
    // Simplified parsing logic for placeholder:
    const parts = markdownContent.split(/---\s*([\s\S]*?)\s*---/);
    let metadata = {};
    let description_md = parts[2] || parts[0] || ''; // Handle cases with/without frontmatter

    if (parts.length > 1 && parts[1]) { // Has frontmatter
        parts[1].trim().split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });
    }
    return { metadata, description_md: description_md.trim() };
};

// Placeholder for extractMetadataFromString (might be redundant if parseMarkdownFileContent does it all)
// Or this could be specifically for extracting metadata from *only* the frontmatter section.
const extractMetadataFromString = (frontmatterString) => {
    console.log('[markdownUtils.extractMetadataFromString] Called with string:', frontmatterString);
    let metadata = {};
    frontmatterString.trim().split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            metadata[key.trim()] = valueParts.join(':').trim();
        }
    });
    return metadata;
};

module.exports = {
    constructMarkdown,
    parseMarkdownFileContent,
    extractMetadataFromString,
};
