
export async function makeApiRequest(url, method = 'GET', body = null, headers = {}, jwt = null) {
	let response;
	
	try {
		// Setting up headers dynamically based on Content-Type
		if (headers['Content-Type'] != 'application/x-www-form-urlencoded')
			headers['Content-Type'] = 'application/json';

		//add bearer token
		const accessToken =  sessionStorage.getItem('accessToken');
		const tokenType = sessionStorage.getItem('tokenType');
		headers['Authorization'] =  `${tokenType} ${accessToken}`;

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
		response = await fetch(url, options);

		// Check if response is OK
		if (response.status >=  400) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		if (response.headers.get("content-length") === "0") {
			return {
				status: response.status,
				body: null
			};
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
		//const body = await response.json();
		console.log("ERROR", error.message, response.body);
		if (response && response.status === 401) {
			// Redirect to the login page
			window.location.href = '/login';
			return Promise.reject('Unauthorized');
		}
	
		if (response) {
			return {
				status: response.status,
				body: body
			}
		}

		return {
			status: 'No Response',
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