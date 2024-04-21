export async function makeApiRequest(url, method = 'GET', body = null, headers = {}, jwt = null) {
    let response;

    try {
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'; // Default to JSON unless specified
        }

        const accessToken = sessionStorage.getItem('accessToken');
        const tokenType = sessionStorage.getItem('tokenType');
        headers['Authorization'] = `${tokenType} ${accessToken}`;

        const defaultHeaders = {
            'Accept': 'application/json',
            ...headers,
        };

        const options = {
            method,
            headers: defaultHeaders,
        };

        if (body && ['POST', 'PUT', 'DELETE'].includes(method)) {
            options.body = headers['Content-Type'] === 'application/x-www-form-urlencoded'
                ? new URLSearchParams(body).toString()
                : JSON.stringify(body);
        }

        response = await fetch(url, options);

        // Always try to parse the response as JSON
        let responseBody;
        try {
            responseBody = await response.json();
        } catch (e) {
            // If JSON parsing fails, set responseBody to null
            responseBody = null;
        }

        if (response.status >= 400) {
            // If the status is an error code and responseBody is not null, use the error message
            // If responseBody is null, default to a generic error message
            const errorMessage = responseBody ? (responseBody.message  || responseBody.error): 'Unknown error occurred';
            return {
                status: response.status,
                body: null,
                errorMessage: errorMessage
            };
        }

        if (response.headers.get("content-length") === "0" || !responseBody) {
            return {
                status: response.status,
                body: null
            };
        }

        return {
            status: response.status,
            body: responseBody
        };

    } catch (error) {
        console.error("Fetch Error:", error.message);

        if (response && response.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        return {
            status: response ? response.status : 'No Response',
            body: null,
            errorMessage: error.message || 'No error message'
        };
    }
}


// Example usage:
/*

try {
	const response = await makeApiRequest('https://api.example.com/data', 'POST', { key: 'value' });
	// console.log('Status Code:', response.status);
	// console.log('Response Body:', response.body);
} catch (error) {
	console.error('Request Failed:', error);
}

or:

makeApiRequest('https://api.example.com/data', 'POST', { key: 'value' })
	.then(response => {
		// console.log('Status Code:', response.status);
		// console.log('Response Body:', response.body);
	})
	.catch(error => {
		console.error('Request Failed:', error);
	});
*/