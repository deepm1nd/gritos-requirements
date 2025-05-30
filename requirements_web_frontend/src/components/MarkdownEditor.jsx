// requirements_web_frontend/src/components/MarkdownEditor.jsx
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const MarkdownEditor = ({ value, onChange, label = "Description (Markdown)" }) => {
    const onValueChange = (val) => {
        if (onChange) {
            onChange(val);
        }
    };

    const editorOptions = useMemo(() => {
        return {
            spellChecker: false,
            autofocus: false,
            autosave: {
                enabled: false,
            },
            status: false, 
        };
    }, []);

    return (
        <div className="mb-6">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <SimpleMDE
                value={value}
                onChange={onValueChange}
                options={editorOptions}
                // Removed className="prose max-w-none" from here
            />
             <p className="mt-1 text-xs text-gray-500">
                Use Markdown for formatting. Preview is available in the editor.
            </p>
        </div>
    );
};

export default MarkdownEditor;
