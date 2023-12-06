import axios from 'axios';
import { useState, useEffect } from 'react';

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
