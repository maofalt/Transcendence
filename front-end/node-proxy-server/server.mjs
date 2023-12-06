import express from 'express'
import fetch from 'node-fetch'

const app = express();
const PORT = 3001; // Can be any port different from your React app

// Proxy endpoint
app.use('/api/proxy', async (req, res) => {
  try {
    // Replace with the actual API URL you want to proxy
    const apiResponse = await fetch('https://api.intra.42.fr/v2/offers?sort=-salary,-invalid_at&page=41&per_page=100&access_token=a00edc84b8e54aa6da3ce44b5ec764c48d926db2c6bad5a27e41f65c2fb1fb84');
    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
