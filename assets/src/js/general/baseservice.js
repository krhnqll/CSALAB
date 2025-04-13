const API_URL = 'http://192.168.2.45:8089/api/';

export const baseService = {
    get: async (url) => {
        try {
            const response = await fetch(API_URL + url, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Sunucu hatası! Durum kodu: ' + response.status);
            }

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

            if (!response.ok) {
                throw new Error('Sunucu hatası! Durum kodu: ' + response.status);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },
};
