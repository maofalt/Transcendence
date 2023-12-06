import axios from 'axios';
import { useState, useEffect } from 'react';

const useAxios = (serverUrl) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
		const aborter = new AbortController();

        axios.get(serverUrl)
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
