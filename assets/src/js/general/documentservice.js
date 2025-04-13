const API_URL = 'http://192.168.2.45:8091/api/';

export const documentService = {
    get: async (url) => {
        try {
            const response = await fetch(API_URL + url, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },

    post: async (url, obj) => {
        try {
            const response = await fetch(API_URL + url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },

    postWithFile: async (url, formData) => {
        try {
            const response = await fetch(API_URL + url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData, // FormData içerik olarak
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('POST with file Error:', error);
            throw error;
        }
    },
};
