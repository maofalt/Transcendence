const express = require('express');
const app = express();
const PORT = 3001;
const path = require('path');
const server = require("http").createServer(app);
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server:server });

app.use(express.json());
// const { Pool } = require('pg');
app.use(express.static(path.join(__dirname, '../public/local/')));

// const pool = new Pool({
	//     connectionString: process.env.DATABASE_URL
	// });
	
app.get("/", (req, res) => res.send("Welcome to the BEST pong game ever!"));

app.listen(PORT, () => {
console.log('Server listening on port ' + PORT) });
