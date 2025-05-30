// requirements_web_frontend/src/components/PreviewPane.jsx
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import MarkdownIt from 'markdown-it';

const PreviewPane = ({ markdownContent, title = "Preview" }) => {
    const md = useMemo(() => new MarkdownIt({
        html: true, // Enable HTML tags in source
        linkify: true, // Autoconvert URL-like text to links
        typographer: true, // Enable some language-neutral replacement + quotes beautification
    }), []);

    const renderedHtml = useMemo(() => {
        if (typeof markdownContent !== 'string') {
            return { __html: '<p class="text-gray-500"><em>Invalid content for preview.</em></p>' };
        }
        try {
            return { __html: md.render(markdownContent) };
        } catch (error) {
            console.error("Error rendering Markdown:", error);
            return { __html: '<p class="text-red-500"><em>Error rendering preview.</em></p>' };
        }
    }, [markdownContent, md]);

    return (
        <div className="bg-gray-50 p-4 border border-gray-300 rounded-md shadow-inner">
            {title && <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">{title}</h3>}
            <div
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none" // Tailwind Typography plugin classes
                dangerouslySetInnerHTML={renderedHtml}
            />
        </div>
    );
};

export default PreviewPane;
