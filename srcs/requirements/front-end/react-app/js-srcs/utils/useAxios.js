import axios from 'axios';
import { useState, useEffect } from 'react';

const useAxios = (serverUrl) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
		const aborter = new AbortController();

        axios.get('/api-proxy')
            .then(response => {
                setData(response.data);
                setIsLoading(false);
				console.log("BANANA: ", response);
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
