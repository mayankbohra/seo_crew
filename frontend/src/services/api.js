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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Failed to process request. Please try again.');
    }
};

export const generateBlog = async (blogOutline) => {
    try {
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
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Failed to generate blog post. Please try again.');
    }
};
