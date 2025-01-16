import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateBlog } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogGeneration() {
    const [searchParams] = useSearchParams();
    const [blogContent, setBlogContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateBlogContent = async () => {
            try {
                const institutionName = searchParams.get('institution');
                const outline = searchParams.get('outline');

                if (!institutionName || !outline) {
                    throw new Error('Missing required parameters');
                }

                const result = await generateBlog({
                    institution_name: institutionName,
                    outline: decodeURIComponent(outline)
                });

                setBlogContent(result.blogContent);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        generateBlogContent();
    }, [searchParams]);

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
                <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {blogContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
