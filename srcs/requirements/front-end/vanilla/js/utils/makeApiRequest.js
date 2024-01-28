export async function makeApiRequest(url, method = 'GET', body = null, headers = {}) {
    try {
        // Setting up default headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers,
        };

        // Configuring the fetch options
        const options = {
            method,
            headers: defaultHeaders,
        };

        // Adding body for relevant methods
        if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(body);
        }

        // Making the fetch call
        const response = await fetch(url, options);

        // Parsing JSON response
        const data = await response.json();

        // Returning status code and data
        return {
            status: response.status,
            body: data
        };

    } catch (error) {
        // Returning error details
        return {
            status: 'Network Error',
            body: error
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
