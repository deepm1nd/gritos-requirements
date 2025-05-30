// requirements_web_frontend/src/components/Modal.jsx
import { h } from 'preact';
import { useEffect } from 'preact/hooks';

const Modal = ({ title, message, type = 'info', onClose, isOpen }) => {
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const baseStyles = "fixed inset-0 z-50 overflow-y-auto";
    const backdropStyles = "fixed inset-0 w-full h-full bg-black opacity-50";

    let typeClasses = {
        header: 'bg-blue-500 text-white',
        icon: <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Info icon
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
    };

    if (type === 'success') {
        typeClasses = {
            header: 'bg-green-500 text-white',
            icon: <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Success icon
            button: 'bg-green-500 hover:bg-green-600 text-white',
        };
    } else if (type === 'error') {
        typeClasses = {
            header: 'bg-red-500 text-white',
            icon: <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Error icon
            button: 'bg-red-500 hover:bg-red-600 text-white',
        };
    } else if (type === 'warning') {
         typeClasses = {
            header: 'bg-yellow-500 text-white',
            icon: <svg className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, // Warning icon
            button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        };
    }


    return (
        <div className={baseStyles} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className={backdropStyles} onClick={onClose} aria-hidden="true"></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className={`px-6 py-3 ${typeClasses.header}`}>
                        <h3 className="text-lg leading-6 font-medium" id="modal-title">
                            {title || 'Notification'}
                        </h3>
                    </div>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                                {typeClasses.icon}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <div className="mt-2">
                                    <p className="text-sm text-gray-700">
                                        {message || 'Something happened.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${typeClasses.button} ${type === 'info' ? 'focus:ring-blue-400' : type === 'success' ? 'focus:ring-green-400' : type === 'error' ? 'focus:ring-red-400' : 'focus:ring-yellow-400'}`}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
