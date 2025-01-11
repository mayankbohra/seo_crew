const API_URL = import.meta.env.VITE_API_URL;

export const startCrewExecution = async (data) => {
    try {
        const response = await fetch(`${API_URL}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
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
        // First generate the blog
        const response = await fetch(`${API_URL}/generate-blog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
