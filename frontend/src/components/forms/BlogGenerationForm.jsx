import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateBlog } from '../../services/api';

export default function BlogGenerationForm() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [blogContent, setBlogContent] = useState(null);
    const [error, setError] = useState(null);
    const [outlineData, setOutlineData] = useState(null);

    useEffect(() => {
        // Get outline data from localStorage
        const storedOutline = localStorage.getItem('blogOutline');
        if (storedOutline) {
            setOutlineData(JSON.parse(storedOutline));
            // Clean up localStorage
            localStorage.removeItem('blogOutline');
            // Start generation automatically
            handleGenerate(JSON.parse(storedOutline));
        }
    }, []);

    const simulateProgress = () => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 3000);
        return interval;
    };

    const handleGenerate = async (outline) => {
        setIsGenerating(true);
        setError(null);
        const progressInterval = simulateProgress();

        try {
            const result = await generateBlog(outline.content);

            if (result.status === 'success' && result.blogContent) {
                setBlogContent(result.blogContent);
                clearInterval(progressInterval);
                setProgress(100);
            } else {
                throw new Error(result.message || 'Failed to generate blog content');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Failed to generate blog content');
            clearInterval(progressInterval);
            setProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (blogContent) {
            // Use the docx file from the response
            window.location.href = `${API_URL}/download/blog_post.docx`;
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Generating Blog</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        {isGenerating ? 'Generating Blog Post...' : 'Blog Post Generated!'}
                    </h2>

                    {isGenerating ? (
                        <div className="space-y-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className="text-center text-gray-600">
                                Please wait while we generate your blog post...
                            </p>
                        </div>
                    ) : blogContent ? (
                        <div className="space-y-8">
                            <div className="prose max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {blogContent}
                                </ReactMarkdown>
                            </div>

                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleDownload}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                                             hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                                >
                                    <span>Download Blog Post</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
}
