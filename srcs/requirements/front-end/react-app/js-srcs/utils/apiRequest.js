import axios from 'axios';

const hostname = window.location.hostname;
const protocol = 'https';
const url = hostname.includes("github.dev") ? `${protocol}://${hostname}` : `${protocol}://${hostname}:9443`;

const apiClient = axios.create({
  baseURL: url + '/api',
  // We can add default headers as well if needed
});

const apiRequest = async ({ method, url, data, params }) => {
	try {
		const response = await apiClient({
			method,
			url,
			data,
			params,
		});
		return response.data;
	} catch (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			// console.error(error.response.data);
			// console.error(error.response.status);
			// console.error(error.response.headers);
		} else if (error.request) {
			// The request was made but no response was received
			console.error(error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			console.error('Error', error.message);
		}
		throw error;
	}
};

export default apiRequest

// Usage example for GET, POST, DELETE, and PUT:

// // GET request
// apiRequest({ method: 'GET', url: '/api/service' })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// // POST request
// apiRequest({ method: 'POST', url: '/api/service', data: { key: 'value' } })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// // DELETE request
// apiRequest({ method: 'DELETE', url: '/api/service', params: { id: '123' } })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// // PUT request
// apiRequest({ method: 'PUT', url: '/api/service', data: { key: 'new value' } })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));
