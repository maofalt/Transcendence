
export async function makeApiRequest(url, method = 'GET', body = null, headers = {}) {
	try {
		// Setting up headers dynamically based on Content-Type
		if (headers['Content-Type'] != 'application/x-www-form-urlencoded')
			headers['Content-Type'] = 'application/json';
		const defaultHeaders = {
			'Accept': 'application/json',
			...headers,
		};

		// Configuring the fetch options
		const options = {
			method,
			headers: defaultHeaders,
		};

		// Adding body for relevant methods
		if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
			if (headers['Content-Type'] == 'application/x-www-form-urlencoded') {
				const encodedBody = new URLSearchParams(body).toString();
				options.body = encodedBody;
			} else {
				// Assuming JSON content type
				options.body = JSON.stringify(body);
			}
		}

		// Making the fetch call
		const response = await fetch(url, options);

		// Check if response is OK
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		// Check if response is JSON
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			const data = await response.json();
			return {
				status: response.status,
				body: data
			};
		} else {
			return {
				status: response.status,
				body: "Response not JSON"
			};
		}

	} catch (error) {
		// Returning error details
		// Note: response might not be defined if the error occurs before fetching, so check if response exists
		if (response && response.status === 401) {
			// Redirect to the login page
			window.location.href = '/login';
			return Promise.reject('Unauthorized');
		}
	
		return {
			status: 'Network Error',
			body: error.message || error
		};
	}
}


// Example usage:
/*

try {
	const response = await makeApiRequest('https://api.example.com/data', 'POST', { key: 'value' });
	console.log('Status Code:', response.status);
	console.log('Response Body:', response.body);
} catch (error) {
	console.error('Request Failed:', error);
}

or:

makeApiRequest('https://api.example.com/data', 'POST', { key: 'value' })
	.then(response => {
		console.log('Status Code:', response.status);
		console.log('Response Body:', response.body);
	})
	.catch(error => {
		console.error('Request Failed:', error);
	});
*/