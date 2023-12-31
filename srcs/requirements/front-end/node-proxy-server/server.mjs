
import cors from 'cors'
import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config();

const url = "https://api.intra.42.fr/oauth/token";
const method = 'POST';
const headers = {
	'Content-Type': 'application/x-www-form-urlencoded',
};
const body = `grant_type=client_credentials&client_id=${process.env.CLIENT_UID}&client_secret=${process.env.CLIENT_SECRET}`;

const app = express();
const PORT = 3001;

app.use(cors());

// Proxy endpoint
app.use('/', async (req, res) => {
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
