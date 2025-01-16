const API_URL = import.meta.env.VITE_API_URL;
import { supabase } from '../lib/supabase';

export const runAnalysis = async (data) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(`${API_URL}/run/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Analysis failed');
        }

        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(error.message || 'Failed to run analysis');
    }
};

export const getKeywords = async () => {
    try {
        const response = await fetch(`${API_URL}/keywords`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const saveKeywords = async (keywords) => {
    try {
        const response = await fetch(`${API_URL}/keywords/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ keywords })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const runSeo = async (data) => {
    try {
        const response = await fetch(`${API_URL}/run/seo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const generateBlog = async (blogOutline) => {
    try {
        const response = await fetch(`${API_URL}/generate-blog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ blogOutline })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            // Then fetch the markdown content
            const markdownResponse = await fetch(`${API_URL}/markdown/blog_post.md`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/markdown',
                }
            });

            if (!markdownResponse.ok) {
                throw new Error('Failed to fetch blog content');
            }

            const blogContent = await markdownResponse.text();

            return {
                status: 'success',
                blogContent,
                docxFile: result.docxFile
            };
        } else {
            throw new Error(result.message || 'Failed to generate blog post');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
