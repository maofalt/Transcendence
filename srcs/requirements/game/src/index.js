// Import express libin the code and "app" will init the obj express
const express = require('express');
const https = require('https');
const socketIo = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = https.createServer(app);
const io = socketIo(server);
// // console.log("server io: ", io);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(express.static('gameLogic'));

// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;

let ball, paddle1, paddle2, scene, controls;
let lastRenderTime = 0;

const gameSettings = {
	paddleSpeed: 0.1,
	distWall1: 1.5,
	distWall2: -1.5,
	wallWidth: 5,
	wallHeight: 0.05,
	maxPoints: 5
};
		
const paddleSettings = {
	width: 1,
	height: 0.3,
	thickness: 0.05
};
		
const score = {
	player1: 0,
	player2: 0
};
		
const ballSettings = {
	speed: { x: 2, y: 0, z: 2 },
	initialPosition: { x: 0, y: 0.1, z: 0 }
};

// Limits for paddle movement along the z-axis
const paddleBounds = {
	minZ: gameSettings.distWall2 + (paddleSettings.width / 2), // Minimum z position
	maxZ: gameSettings.distWall1 - (paddleSettings.width / 2)   // Maximum z position
};

const player1 = {
	id: 0,
    clientId: 0,
	login: "Player 1",
	paddle: paddle1,
	score: 0,
    gameState: false,
}

const player2 = {
	id: 0,
    clientId: 0,
	login: "Player 2",
	paddle: paddle2,
	score: 0,
    gameState: false,
}

const data = {
    ball: ball,
    player1: player1,
    player2: player2,
    paddle1: paddle1,
    paddle2: paddle2,
}

io.on('connection', (client) => {
    // console.log('A client is connected');
    numClients = io.engine.clientsCount;
    if (numClients < 2)
        player1.clientId = client.id;
    else if (numClients == 2)
        player2.clientId = client.id;

    client.emit('clientId', client.id, numClients);
    // console.log(`Client connected with ID: ${client.id}`);
    // console.log(`Number of connected clients: ${numClients}`);
    
    // Handle other events or messages from the client
    client.on('ping', () => {
        // console.log("ping received ! emitting pong...");
        client.emit('pong');
    });

    client.on('clickedStart', () => {
        // console.log(`clicked start ! (from client ${client.id})`);
    });



    // Gérez ici les différents événements WebSocket
    // Exemple : Réception d'un message de la part du client
    socket.on('eventName', (data) => {
        // Logique à exécuter quand cet événement est reçu
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        // console.log('Client disconnected');
    });
});

// app.get("/", (req, res) => res.send("Welcome to the BEST pong game ever!"));

// // GET request handler to fetch player statistics by user ID
// app.get('/player_stats/:user_id', async (req, res) => {
//     try {
//         // Parse user ID from the request parameters
//         const user_id = parseInt(req.params.user_id);

//         // Query the database for player statistics for the given user ID
//         const result = await pool.query('SELECT * FROM player_stats WHERE user_id = $1', [user_id]);

//         // If no records are found, return a 404 response
//         if (result.rows.length === 0) {
//             return res.status(404).send('Player statistics not found');
//         }

//         // Return the player statistics in the response
//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         // Log and send server error response in case of an exception
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

// // GET request handler to fetch all player statistics
// app.get('/player_stats', async (req, res) => {
//     try {
//         // Query the database for all player statistics
//         const result = await pool.query('SELECT * FROM player_stats');

//         // Return the player statistics in the response
//         res.status(200).json(result.rows);
//     } catch (err) {
//         // Log and send server error response in case of an exception
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

// // POST request handler to create new player statistics
// app.post('/player_stats', async (req, res) => {
//     // Extract player statistics data from request body
//     const { user_id, wins, losses, games_played } = req.body;

//     try {
//         // Insert new player statistics into the database and return the inserted record
//         const result = await pool.query('INSERT INTO player_stats (user_id, wins, losses, games_played) VALUES ($1, $2, $3, $4) RETURNING *', [user_id, wins, losses, games_played]);
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         // Log and send server error response in case of an exception
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

// // GET request handler to fetch a game session by ID
// app.get('/game_sessions/:id', async (req, res) => {
//     try {
//         // Parse game session ID from the request parameters
//         const id = parseInt(req.params.id);

//         // Query the database for a game session with the given ID
//         const result = await pool.query('SELECT * FROM game_sessions WHERE id = $1', [id]);

//         // If no records are found, return a 404 response
//         if (result.rows.length === 0) {
//             return res.status(404).send('Game session not found');
//         }

//         // Return the game session details in the response
//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         // Log and send server error response in case of an exception
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

// // POST request handler to create a new game session
// app.post('/game_sessions', async (req, res) => {
//     // Extract game session data from request body
//     const { player1_id, player2_id, winner_id, player1_score, player2_score, game_duration } = req.body; // Adaptez les champs selon le besoin
    
//     try {   
//         // Insert new game session into the database and return the inserted record
//         const result = await pool.query('INSERT INTO game_sessions (player1_id, player2_id, winner_id, player1_score, player2_score, game_duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [player1_id, player2_id, winner_id, player1_score, player2_score, game_duration]);
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         // Log and send server error response in case of an exception
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

// The server can listen the choosed port
const PORT = 3001;
app.listen(PORT, () => { 
    // console.log('Server listening on port 3001') });