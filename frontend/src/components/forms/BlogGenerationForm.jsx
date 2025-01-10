import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateBlog } from '../../services/api';
import ProgressBar from '../progress/ProgressBar';

export default function BlogGenerationForm() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [blogOutline, setBlogOutline] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        const progressInterval = simulateProgress();

        try {
            const result = await generateBlog(blogOutline);
            if (result.status === 'success' && result.docxFile) {
                setDownloadUrl(`${API_URL}/download/${result.docxFile}`);
            }
            clearInterval(progressInterval);
            setProgress(100);
        } catch (error) {
            console.error('Error:', error);
            clearInterval(progressInterval);
            setProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" },
        tap: { scale: 0.95 }
    };

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="max-w-4xl mx-auto">
                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                    variants={itemVariants}
                >
                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Generate Blog Posts
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Transform your blog outline into engaging, SEO-optimized content.
                            Simply paste your outline below and let AI do the magic.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <motion.div
                            variants={itemVariants}
                            className="bg-gray-50 p-6 rounded-xl border border-gray-200"
                        >
                            <label
                                htmlFor="blogOutline"
                                className="block text-lg font-semibold text-gray-700 mb-3"
                            >
                                Your Blog Outline
                            </label>
                            <motion.textarea
                                id="blogOutline"
                                value={blogOutline}
                                onChange={(e) => setBlogOutline(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                         transition-all duration-200 text-base"
                                placeholder="Paste your blog outline here..."
                                required
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Tip: Make sure to include all the sections and key points from your outline
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex justify-center space-x-6"
                            variants={itemVariants}
                        >
                            <motion.button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-8 py-4 bg-gray-600 text-white rounded-xl
                                         hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                <span>Back to Home</span>
                            </motion.button>
                            <motion.button
                                type="submit"
                                className="px-8 py-4 bg-indigo-600 text-white rounded-xl
                                         hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <span>Generate Blog Posts</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>

                {isGenerating && (
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <ProgressBar progress={progress} />
                        <p className="text-center text-gray-600 mt-4">
                            Generating your blog post... ({progress}%)
                        </p>
                    </motion.div>
                )}

                {downloadUrl && !isGenerating && (
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <a
                            href={downloadUrl}
                            className="px-8 py-4 bg-green-600 text-white rounded-xl
                                     hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                        >
                            <span>Download Blog Post</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
