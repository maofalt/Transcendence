import { useEffect, useState } from 'react';

const useFetch = (serverUrl) => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const aborter = new AbortController();

		setTimeout(() => {
			fetch(serverUrl, { 
				signal: aborter.signal,
				// headers: {
				// 	'Authorization': 'Bearer 6485540f8b1c7442672c6c3719e4bbf19086016fcb5f1334452aabe3061f5848'
				// }
			})
			.then(res => {
				if (!res.ok)
					throw Error('smelly man: ' + res.status + ' ' + res.statusText);
				return res.json();
			})
			.then(json => {
				// console.log("json stuff: ", json);
				setData(json);
				setIsLoading(false);
			})
			.catch(err => {
				if (err.name == "AbortError")
				{
					let str = JSON.stringify(err, null, 4);
					console.log(str);
				}
				else
				{
					setIsLoading(false);
					setError(err);
				}
			})
		}, 1000);

		return () => aborter.abort();
	}, [data]);
	
	// console.log("in Fetch:", "data: " + data + ", error: " + error + ", loading: " + isLoading);
	return { data, isLoading, error };
}

export default useFetch;