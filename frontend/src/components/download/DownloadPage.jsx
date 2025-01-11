import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DownloadPage() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('analysis');
    const [markdownContent, setMarkdownContent] = useState({
        analysis: '',
        outlines: ''
    });

    // Get data from navigation state
    useEffect(() => {
        if (location.state?.markdownContent) {
            setMarkdownContent(location.state.markdownContent);
        } else {
            navigate('/'); // Redirect to home if no content
        }
    }, [location.state, navigate]);

    const downloadFiles = location.state?.downloadFiles || {
        analysis: 'analysis.docx',
        outlines: 'blog_post_outlines.docx'
    };

    const handleDownload = (fileType) => {
        const filename = downloadFiles[fileType];
        window.location.href = `${API_URL}/download/${filename}`;
    };

    if (!location.state?.markdownContent) {
        return null; // Don't render anything while redirecting
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Your Content is Ready!
                        </h2>
                        <p className="text-lg text-gray-600">
                            View and download your SEO analysis and blog outlines below.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <nav className="flex space-x-4 p-1 bg-gray-100 rounded-xl">
                            {['analysis', 'outlines'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200
                                              ${activeTab === tab
                                                ? 'bg-white text-indigo-600 shadow-md'
                                                : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    {tab === 'analysis' ? 'SEO Analysis' : 'Blog Outlines'}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="mb-8">
                        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 overflow-x-auto">
                            <div className="prose prose-indigo max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Custom table styling
                                        table: ({node, ...props}) => (
                                            <table className="min-w-full divide-y divide-gray-300 my-8" {...props} />
                                        ),
                                        thead: ({node, ...props}) => (
                                            <thead className="bg-gray-50" {...props} />
                                        ),
                                        th: ({node, ...props}) => (
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900" {...props} />
                                        ),
                                        td: ({node, ...props}) => (
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" {...props} />
                                        ),
                                        tr: ({node, isHeader, ...props}) => (
                                            <tr className={`${isHeader ? '' : 'hover:bg-gray-50'}`} {...props} />
                                        ),
                                    }}
                                >
                                    {markdownContent[activeTab] || 'No content available'}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg
                                     hover:bg-gray-700 transition-colors"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => handleDownload(activeTab)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                                     hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
                        >
                            <span>Download {activeTab === 'analysis' ? 'Analysis' : 'Outlines'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
