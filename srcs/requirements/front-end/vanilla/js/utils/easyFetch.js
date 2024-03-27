
export default async function easyFetch(url, options = { method: 'GET', body: null, headers: {} }) {

	let response;

	try {
		// Setting up headers dynamically based on Content-Type
		if (options.headers['Content-Type'] != 'application/x-www-form-urlencoded')
			options.headers['Content-Type'] = 'application/json';

		const defaultHeaders = {
			'Accept': 'application/json',
			...options.headers,
		};

		options.headers = defaultHeaders;

		// Adding body for relevant methods
		if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
			if (options.headers['Content-Type'] == 'application/x-www-form-urlencoded') {
				const encodedBody = new URLSearchParams(options.body).toString();
				options.body = encodedBody;
			} else if (options.headers['Content-Type'] == 'application/json') {
				// Assuming JSON content type
				options.body = JSON.stringify(options.body);
			} else {
				throw new Error('Invalid Content-Type');
			}
		}

		// Making the fetch call
		response = await fetch(url, options);

		if (!response) {
			throw new Error('No response received');
		}

		if (response && response.status === 401) {
			// Redirect to the login page
			// window.location.href = '/login';
			return Promise.reject('Unauthorized');
		}

		if (response.headers.get("content-length") === "0") {
			return {
				response,
				body: null
			};
		}

		// Check if response is JSON
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			
			const data = await response.json();

			return {
				response,
				body: data
			};

		} else {
			throw new Error('Invalid Response Content-Type');
		}

	} catch (error) {
		console.error('Request Failed:', error);
		return {
			response: null,
			body: error.message || error
		};
	}
}


// Example usage:
/*

try {
	const { response, body } = await makeApiRequest('/api/user_management/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams(formData)
	});
	console.log('Status Code:', response.status);
	console.log('Response Body:', response.body);
} catch (error) {
	console.error('Request Failed:', error);
}

or:

makeApiRequest('/api/user_management/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams(formData)
})
	.then({ response, body } => {
		console.log('Status Code:', response.status);
		console.log('Response Body:', response.body);
	})
	.catch(error => {
		console.error('Request Failed:', error);
	});
*/