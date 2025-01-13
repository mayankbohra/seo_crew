import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ExternalLink from '../common/ExternalLink';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const tabVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
};

// Add this custom link renderer component
const CustomLink = ({ href, children }) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
        >
            {children}
        </a>
    );
};

export default function DownloadPage() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const [activeMainTab, setActiveMainTab] = useState('analysis');
    const [activeOutlineTab, setActiveOutlineTab] = useState(1);
    const [markdownContent, setMarkdownContent] = useState({
        analysis: '',
        outlines: [],
        ad: ''
    });

    // Parse blog outlines into separate items
    useEffect(() => {
        if (location.state?.markdownContent) {
            const { analysis, outlines, ad } = location.state.markdownContent;

            // Split outlines by "---" and filter out empty ones
            const blogOutlines = outlines
                .split('---')
                .filter(outline => outline.trim())
                .map((outline, index) => ({
                    id: index + 1,
                    title: `Blog Outline ${index + 1}`,
                    content: outline.trim()
                }));

            setMarkdownContent({
                analysis,
                outlines: blogOutlines,
                ad
            });

            // Set the first outline as active if available
            if (blogOutlines.length > 0) {
                setActiveOutlineTab(1);
            }
        } else {
            navigate('/');
        }
    }, [location.state, navigate]);

    const downloadFiles = location.state?.downloadFiles || {
        analysis: 'analysis.docx',
        outlines: 'blog_post_outlines.docx',
        ad: 'ad_copies.docx'
    };

    const handleDownload = (fileType) => {
        const filename = downloadFiles[fileType];
        const downloadUrl = `${API_URL}/download/${filename}`;
        window.open(downloadUrl, '_blank');
    };

    const handleGenerateBlog = (outline) => {
        // Open in new tab with outline data
        const blogGenUrl = `/generate-blog?outline=${encodeURIComponent(outline.id)}`;
        window.open(blogGenUrl, '_blank');

        // Store the outline in localStorage for access in the new tab
        localStorage.setItem('blogOutline', JSON.stringify({
            id: outline.id,
            content: outline.content
        }));
    };

    const handleBackToHome = () => {
        // Clear any stored data
        localStorage.removeItem('blogOutline');

        // Force a clean navigation to home
        window.location.href = '/';

        // Alternative approach using navigate if window.location doesn't work:
        // navigate('/', {
        //     replace: true,
        //     state: {} // Clear any state
        // });
    };

    if (!location.state?.markdownContent) {
        return null;
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Back to Home Button */}
                <motion.button
                    onClick={handleBackToHome}
                    className="mb-8 px-4 py-2 flex items-center space-x-2 text-gray-600
                             hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Back to Home</span>
                </motion.button>

                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {/* Header with animation */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Your Content is Ready!
                        </h2>
                        <p className="text-lg text-gray-600">
                            View and download your SEO analysis and blog outlines below.
                        </p>
                    </motion.div>

                    {/* Main Tabs with animation */}
                    <div className="flex justify-center mb-8">
                        <motion.nav
                            className="flex space-x-4 p-1 bg-gray-100 rounded-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {['analysis', 'outlines', 'ad'].map((tab) => (
                                <motion.button
                                    key={tab}
                                    onClick={() => setActiveMainTab(tab)}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200
                                              ${activeMainTab === tab
                                                ? 'bg-white text-indigo-600 shadow-md'
                                                : 'text-gray-600 hover:text-gray-900'}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {tab === 'analysis' ? 'SEO Analysis' : tab === 'outlines' ? 'Blog Outlines' : 'Ad Copies'}
                                </motion.button>
                            ))}
                        </motion.nav>
                    </div>

                    {/* Content Section with AnimatePresence */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeMainTab}
                            variants={tabVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="mt-8"
                        >
                            {activeMainTab === 'analysis' ? (
                                // Analysis Content with custom link renderer
                                <div className="prose max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: CustomLink
                                        }}
                                    >
                                        {markdownContent.analysis}
                                    </ReactMarkdown>
                                </div>
                            ) : activeMainTab === 'outlines' ? (
                                // Blog Outlines Content
                                <div>
                                    {/* Blog Outline Tabs */}
                                    <div className="flex justify-center space-x-2 mb-6 overflow-x-auto pb-2">
                                        <div className="inline-flex space-x-2 p-1 bg-gray-100 rounded-xl">
                                            {markdownContent.outlines.map((outline) => (
                                                <motion.button
                                                    key={outline.id}
                                                    onClick={() => setActiveOutlineTab(outline.id)}
                                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200
                                                              ${activeOutlineTab === outline.id
                                                                ? 'bg-white text-indigo-600 shadow-md'
                                                                : 'bg-transparent text-gray-700 hover:bg-gray-200'}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Blog Outline {outline.id}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Blog Outline Content */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeOutlineTab}
                                            variants={fadeIn}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="prose max-w-none"
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: CustomLink
                                                }}
                                            >
                                                {markdownContent.outlines.find(o => o.id === activeOutlineTab)?.content || ''}
                                            </ReactMarkdown>

                                            {/* Generate Blog Button */}
                                            <motion.div
                                                className="mt-8 flex justify-center"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <motion.button
                                                    onClick={() => handleGenerateBlog(markdownContent.outlines.find(o => o.id === activeOutlineTab))}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-lg
                                                             hover:bg-green-700 transition-colors flex items-center space-x-2"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <span>Generate Blog Post</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </motion.button>
                                            </motion.div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // Ad Copies Content
                                <div className="prose max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: CustomLink
                                        }}
                                    >
                                        {markdownContent.ad}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Download Button */}
                    <motion.div
                        className="mt-8 flex justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.button
                            onClick={() => handleDownload(activeMainTab)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                                     hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Download {activeMainTab === 'analysis' ? 'Analysis' : activeMainTab === 'outlines' ? 'Outlines' : 'Ad Copies'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l-3 3a1 1 0 00-1.414 0l-3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
