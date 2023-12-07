
import cors from 'cors'
import express from 'express'
import fetch from 'node-fetch'

const url = "https://api.intra.42.fr/oauth/token";
const method = 'POST';
const headers = {
	'Content-Type': 'application/x-www-form-urlencoded',
};
const body = 'grant_type=client_credentials&client_id=u-s4t2ud-92a820ed289cca7b0885c581d6c3ad3116d92ba4714e4bf4b2de1040f9755df8&client_secret=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';

const app = express();
const PORT = 3001;

app.use(cors());

// Proxy endpoint
app.use('/api-proxy', async (req, res) => {
  try {
    const getToken = await fetch(url, { method, headers, body });
    // console.log("AUTH POST RESPONSE: ", getToken);
	if (!getToken.ok) {
		throw new Error(`HTTP error: ${getToken.status}`);
	}
	
	const currentToken = await getToken.json();
	console.log("TOKEN: ", currentToken);
	
    const apiResponse = await fetch('https://api.intra.42.fr/v2/offers?sort=-salary,-invalid_at&page=41&per_page=100&access_token=' + currentToken.access_token);
    const data = await apiResponse.json();
    res.json(data);
	// console.log("YOY: ", data);
  } catch (error) {
    console.error('BIG Error:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
