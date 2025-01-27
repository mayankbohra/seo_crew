const API_URL = import.meta.env.VITE_API_URL;
import { supabase } from '../lib/supabase';

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

export const runAnalysis = async (data) => {
    try {
        const response = await fetch(`${API_URL}/run/analysis`, {
            method: 'POST',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Store user ID for subsequent requests
            localStorage.setItem('userId', result.userId);
            return result;
        } else {
            throw new Error(result.message || 'Analysis failed');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getKeywords = async () => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/keywords?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch keywords');
        }

        console.log("API Keywords:", data.keywords);
        return data;
    } catch (error) {
        console.error('Error fetching keywords:', error);
        throw error;
    }
};

export const saveKeywords = async (keywords) => {
    try {
        const response = await fetch(`${API_URL}/keywords/save/${localStorage.getItem('userId')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keywords }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save keywords');
        }

        return data;
    } catch (error) {
        console.error('Error saving keywords:', error);
        throw error;
    }
};

export const runSeo = async (data) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/run/seo/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                userId
            })
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
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/generate-blog/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                outline: blogOutline.outline
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            // Then fetch the markdown content
            const markdownResponse = await fetch(`${API_URL}/markdown/blog_post.md/${userId}`, {
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

export const cleanupUserData = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/cleanup/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cleanup user data');
        }

        return await response.json();
    } catch (error) {
        console.error('Cleanup error:', error);
        throw error;
    }
};
