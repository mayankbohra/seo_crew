import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateBlog } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogGeneration() {
    const [searchParams] = useSearchParams();
    const [blogContent, setBlogContent] = useState('');
    const [docxFile, setDocxFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateBlogContent = async () => {
            try {
                const outline = searchParams.get('outline');
                const userId = searchParams.get('userId');

                if (!outline || !userId) {
                    throw new Error('Missing required parameters');
                }

                const result = await generateBlog({
                    outline: decodeURIComponent(outline),
                    userId: userId
                });

                setBlogContent(result.blogContent);
                setDocxFile(result.docxFile);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        generateBlogContent();
    }, [searchParams]);

    const handleDownload = () => {
        if (docxFile) {
            const userId = searchParams.get('userId');
            window.open(`${import.meta.env.VITE_API_URL}/download/${userId}/${docxFile}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generating blog post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <div className="text-red-600">
                        <h1 className="text-2xl font-bold mb-4">Error</h1>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                {docxFile && (
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md
                                     hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Download DOCX
                        </button>
                    </div>
                )}
                <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {blogContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
