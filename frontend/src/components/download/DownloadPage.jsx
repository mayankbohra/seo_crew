import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DownloadPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const downloadFiles = location.state?.downloadFiles || {
        analysis: 'analysis.docx',
        outlines: 'blog_post_outlines.docx'
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
                            Your Documents Are Ready!
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Download your SEO analysis and blog outlines. Use these documents to create optimized content for your website.
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div
                            className="p-6 bg-green-50 rounded-xl border border-green-100"
                            variants={itemVariants}
                        >
                            <h3 className="text-xl font-semibold text-green-800 mb-2">
                                SEO Analysis Document
                            </h3>
                            <p className="text-green-600 mb-4">
                                Comprehensive analysis of your competitors and SEO strategy recommendations.
                            </p>
                            <a
                                href={`http://localhost:5000/download/${downloadFiles.analysis}`}
                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg
                                         hover:bg-green-700 transition-colors space-x-2"
                            >
                                <span>Download Analysis</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </motion.div>

                        <motion.div
                            className="p-6 bg-blue-50 rounded-xl border border-blue-100"
                            variants={itemVariants}
                        >
                            <h3 className="text-xl font-semibold text-blue-800 mb-2">
                                Blog Post Outlines
                            </h3>
                            <p className="text-blue-600 mb-4">
                                Structured outlines for your upcoming blog posts with SEO optimization guidelines.
                            </p>
                            <a
                                href={`http://localhost:5000/download/${downloadFiles.outlines}`}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg
                                         hover:bg-blue-700 transition-colors space-x-2"
                            >
                                <span>Download Outlines</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </motion.div>
                    </div>

                    <motion.div
                        className="mt-8 flex justify-center space-x-4"
                        variants={itemVariants}
                    >
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg
                                     hover:bg-gray-700 transition-colors"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => navigate('/generate-blog')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                                     hover:bg-indigo-700 transition-colors"
                        >
                            Generate Blog Posts
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
