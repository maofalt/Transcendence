// Import express libin the code and "app" will init the obj express
const express = require('express');
const app = express();
app.use(express.json());
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.get("/", (req, res) => res.send("Welcome to the BEST pong game ever!"));

// GET request handler to fetch player statistics by user ID
app.get('/player_stats/:user_id', async (req, res) => {
    try {
        // Parse user ID from the request parameters
        const user_id = parseInt(req.params.user_id);

        // Query the database for player statistics for the given user ID
        const result = await pool.query('SELECT * FROM player_stats WHERE user_id = $1', [user_id]);

        // If no records are found, return a 404 response
        if (result.rows.length === 0) {
            return res.status(404).send('Player statistics not found');
        }

        // Return the player statistics in the response
        res.status(200).json(result.rows[0]);
    } catch (err) {
        // Log and send server error response in case of an exception
        console.error(err);
        res.status(500).send('Server error');
    }
});

// GET request handler to fetch all player statistics
app.get('/player_stats', async (req, res) => {
    try {
        // Query the database for all player statistics
        const result = await pool.query('SELECT * FROM player_stats');

        // Return the player statistics in the response
        res.status(200).json(result.rows);
    } catch (err) {
        // Log and send server error response in case of an exception
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST request handler to create new player statistics
app.post('/player_stats', async (req, res) => {
    // Extract player statistics data from request body
    const { user_id, wins, losses, games_played } = req.body;

    try {
        // Insert new player statistics into the database and return the inserted record
        const result = await pool.query('INSERT INTO player_stats (user_id, wins, losses, games_played) VALUES ($1, $2, $3, $4) RETURNING *', [user_id, wins, losses, games_played]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        // Log and send server error response in case of an exception
        console.error(err);
        res.status(500).send('Server error');
    }
});

// GET request handler to fetch a game session by ID
app.get('/game_sessions/:id', async (req, res) => {
    try {
        // Parse game session ID from the request parameters
        const id = parseInt(req.params.id);

        // Query the database for a game session with the given ID
        const result = await pool.query('SELECT * FROM game_sessions WHERE id = $1', [id]);

        // If no records are found, return a 404 response
        if (result.rows.length === 0) {
            return res.status(404).send('Game session not found');
        }

        // Return the game session details in the response
        res.status(200).json(result.rows[0]);
    } catch (err) {
        // Log and send server error response in case of an exception
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST request handler to create a new game session
app.post('/game_sessions', async (req, res) => {
    // Extract game session data from request body
    const { player1_id, player2_id, winner_id, player1_score, player2_score, game_duration } = req.body; // Adaptez les champs selon le besoin
    
    try {   
        // Insert new game session into the database and return the inserted record
        const result = await pool.query('INSERT INTO game_sessions (player1_id, player2_id, winner_id, player1_score, player2_score, game_duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [player1_id, player2_id, winner_id, player1_score, player2_score, game_duration]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        // Log and send server error response in case of an exception
        console.error(err);
        res.status(500).send('Server error');
    }
});

// The server can listen the choosed port
const PORT = 3001;
app.listen(PORT, () => { 
    console.log('Server is listen') });

//======================== Zach testing =======================//

// const express = require("express");
// const app = express();
// const server = require("http").createServer(app);
// const WebSocket = require("ws");

// const wss = new WebSocket.Server({ server:server });

// wss.on("connection", function connection(ws) {
//     console.log("A new client connected!");
//     ws.send("Welcome new Client!");

//     //for one client
//     ws.on("message", function incoming(message) {
//         console.log("Recieved: %s", message);
//         ws.send("Got your message : \"" + message + "\"");
//     });

//     // for several clients : loop through all of them
//     // ws.on("message", function incoming(message) {
//     //     console.log("Recieved: %s", message);

//     //     wss.clients.forEach(function each(client) {
//     //         if (client !== ws && client.readyState === WebSocket.OPEN) {
//     //             client.send(message);
//     //         }
//     //     })
//     // });
// });

// app.get("/", (req, res) => res.send("Hello World!"));

// server.listen(3001, () => console.log("Listening on port :3001"));