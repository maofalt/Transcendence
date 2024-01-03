import axios from 'axios';
import { useState, useEffect } from 'react';
import axios from 'axios';

const postData = async (url, dataToSend) => {
    try {
        const response = await axios.post(url, dataToSend);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error during the Axios POST request', error);
        throw error;
    }
};

// Example usage
// const url = 'https://example.com/api/data';
// const dataToSend = { key: 'value', anotherKey: 'anotherValue' };
// postData(url, dataToSend);

const useAxios = (serverUrl) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
		const aborter = new AbortController();
		let bearer_token = "banana";
        
		const config = {
            headers: {
                'Authorization': 'Bearer ' + bearer_token,
                'Content-Type': 'application/json',
            }
        };

        axios.get(serverUrl, config)
            .then(response => {
                setData(response.data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });

        // Cleanup function
		return () => aborter.abort();
    }, [data]);

    return { data, isLoading, error };
};

export default useAxios
