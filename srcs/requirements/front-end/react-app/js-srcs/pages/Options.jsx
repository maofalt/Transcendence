import React, { useState } from 'react';
import apiRequest from '../utils/apiRequest.js';

const Options = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState(null);
	const [inputValue, setInputValue] = useState('');

	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const responseData = await apiRequest({ method: 'POST', url: '/tournament/create-and-list/', data: { tournement_name: inputValue, host_id: 3 } });
			
			setData(responseData);
			console.log("response: ", responseData);
			// console.log("response: ", data);
		} catch (error) {
			if (error.response.status === 400) {
				setData(error.response.data);
			}
			// console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
	<div>
		<input type="text" placeholder="Enter your name" value={inputValue} onChange={handleInputChange}/>
		<button onClick={handleSubmit} disabled={loading}>
		{loading ? 'Loading...' : 'Submit'}
		</button>
		{data && <pre style={{color: "#fff"}}>{JSON.stringify(data, null, 2)}</pre>}
	</div>
	);
};

export default Options;
