// including libraries :
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const SECRET_KEY = 'secret_key'; // secret key from jisu

const util = require('util');

// const fs = require('fs');

// importing personal code :
const lobbySettings = require('./gameLogic/lobbySettings');
const init = require('./gameLogic/init');
const debugDisp = require('./gameLogic/debugDisplay');
const render = require('./gameLogic/rendering');
// const objects = require('./gameLogic/gameObjects');
// const game = require('./gameLogic/gameLogic');
// const objectsClasses = require('./gameLogic/gameObjectsClasses');

// const data = init.initLobby(lobbySettings.lobbyData);
// let data = 0;
let matches = new Map();

const app = express();
app.use(express.json());
// const server = http.createServer(app);

const expressPort = process.env.PORT || 3000;
// const socketIoPort = 3000;

// Load your SSL certificates
// const privateKey = fs.readFileSync('/etc/game/ssl/game.key', 'utf8');
// const certificate = fs.readFileSync('/etc/game/ssl/game.crt', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate,
// };

// Create HTTPS server with the SSL certificates
// const server = https.createServer(credentials, app);

// create http server (no credentials)
const server = http.createServer(app);

// create socket
const io = socketIo(server, {
    cors: {
        origin: ["*"], // "wss://game.localhost:9443"], // You can specify the client's URL here for production
        methods: ["GET", "POST"]
    }
});

// express cors properties
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // You can replace '*' with your specific domain.
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Start the server
server.listen(expressPort, () => {
    console.log(`APP Express server running on port ${expressPort}`);
});

//======================================== LOBBY LOOPS ========================================//

// global vars
// let gameInterval = 0;

function waitingLoop(matchID) {
	let match = matches.get(matchID);
	if (!match) {
		console.log("Match not found");
		client.emit('error', 'Match not found');
		client.disconnect();
		return ;
	}
	render.updateData(match.gameState);
    io.to(matchID).emit('render', match.gameState);
}

// gameInterval = setInterval(waitingLoop, 20);

//====================================== SOCKET HANDLING ======================================//

// function setPlayerStatus(client) {
//     if (io.engine.clientsCount <= data.gamemode.nbrOfPlayers) {
//         data.players[io.engine.clientsCount - 1].socketID = client.id;
//         data.players[io.engine.clientsCount - 1].connected = true;
//     }
// }

// function handleConnection(client) {

//     console.log("CLIENT CONNECTED");
//     client.join("gameRoom");
    
//     if (io.engine.clientsCount == 1) {
//         data = init.initLobby(lobbySettings.lobbyData);
//         gameInterval = setInterval(waitingLoop, 20);
//         data.ball.dir.y = -1;
//     }
//     setPlayerStatus(client);


//     console.log(`Client connected with ID: ${client.id}`);
//     console.log(`Number of connected clients: ${io.engine.clientsCount}`);

//     client.emit('generate', data);
//     debugDisp.displayData(data);
// }

function handleConnectionV2(client) {

    console.log("CLIENT CONNECTED");

	// - check if match exists;
    let match = matches.get(client.matchID);
	// console.log("matches: ", matches);
	// console.log("MATCH: ", match, "MATCHID: ", matchID, "PLAYERID: ", playerID);
	if (!match) {
		// send err 404;
		client.emit('error', 'Match not found');
		client.disconnect();
		return ;
	}

	// - check if player is part of this match;
    if (!match.gameState.players.some(player => player.accountID == client.playerID)) {
        // Player not part of the match, send error message to client
        client.emit('error', 'Player not part of the match');
        client.disconnect();
        return;
    }

    for (let i=0; i<match.gameState.gamemode.nbrOfPlayers; i++) {
        if (match.gameState.players[i].accountID == client.playerID) {
            match.gameState.players[i].connected = true;
            match.gameState.players[i].socketID = client.id;
            match.gameState.connectedPlayers++;
        }
    }

    client.join(client.matchID);
    // console.log('match: ', util.inspect(match, {depth: null}));
    // client.emit('generate', JSON.stringify(match));
    client.emit('generate', match.gameState);
    
    if (match.gameState.connectedPlayers == 1) {
        match.gameInterval = setInterval(waitingLoop, 20, client.matchID);
        match.gameState.ball.dir.y = -1;
    }

    console.log(`Player connected with ID: ${playerID}`);

    // client.emit('generate', data);
    debugDisp.displayData(match.gameState);
    return (match);
}

// authenticate user before establishing websocket connection
io.use((client, next) => {
	try {
		console.log("query: ", client.handshake.query);
		client.matchID = client.handshake.query.matchID;
		client.playerID = client.handshake.query.playerid;
		if (!client.matchID) {
			console.error('Authentication error: Missing matchID');
			next(new Error('Authentication error: Missing matchID.'));
		}
		if (client.handshake.headers && client.handshake.headers.cookie) {
			// Parse the cookies from the handshake headers
			const cookies = cookie.parse(client.handshake.headers.cookie);
			const token = cookies.jwtToken;
	
			// Verify the token
			jwt.verify(token, SECRET_KEY, function(err, decoded) {
				if (err) {
					console.error('Authentication error: Could not verify token.', err);
					return next(new Error('Authentication error: Could not verify token.'));
				}
				client.decoded = decoded;
				console.log("JWT: ", decoded);
				// client.username = decoded.replace('jwtToken=', '')
				next();
			});
		} else {
			next(new Error('Authentication error: No token provided.'));
		}
	} catch (error) {
		console.error('Error connecting websocket: ', error);
		next(new Error('Authentication error: ' + error));
	}
});

// Set up Socket.IO event handlers
io.on('connection', (client) => {
	try {
		//handle client connection and match init + players status
		let match = handleConnectionV2(client);
		let data = match.gameState;
		
		// player controls
		client.on('moveUp', () => {
			console.log(`client ${client.id} moving up`);
			for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
				if (data.players[i].socketID == client.id && !data.players[i].paddle.dashSp) {
					data.players[i].paddle.currSp = data.players[i].paddle.sp;
				}
			}
		});
		
		client.on('moveDown', () => {
			console.log(`client ${client.id} moving down`);
			for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
				if (data.players[i].socketID == client.id && !data.players[i].paddle.dashSp) {
					data.players[i].paddle.currSp = -data.players[i].paddle.sp;
				}
			}
		});
		
		client.on('dash', () => {
			console.log(`client ${client.id} dashing`);
			for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
				if (data.players[i].socketID == client.id && !data.players[i].paddle.dashSp) {
					if (data.players[i].paddle.currSp == 0) {
						// do something for this err case
						return ;
					}
					data.players[i].paddle.dashSp = data.players[i].paddle.currSp > 0 ? data.players[i].paddle.w * 1.5 : data.players[i].paddle.w * -1.5;
					// data.players[i].paddle.dashSp = data.players[i].paddle.w * 1.5 * (data.players[i].paddle.currSp > 0);
				}
			}
		});
		
		client.on('stop', () => {
			console.log(`client ${client.id} stopping`);
			for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
				if (data.players[i].socketID == client.id && !data.players[i].paddle.dashing) {
					data.players[i].paddle.currSp = 0;
				}
			}
		});
		
		// disconnect event
		client.on('disconnect', () => {
			client.leave("gameRoom");
			data.connectedPlayers--;
			for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
				if (data.players[i].socketID == client.id)
					data.players[i].connected = false;
			}
			if (data.connectedPlayers < 1) {
				data.clearInterval(match.gameInterval);
				matches.delete(client.matchID);
				delete data;
			}
			console.log(`Client disconnected with ID: ${client.id} (num clients: ${io.engine.clientsCount})`);
		});

	} catch (error) {
		console.error('Error handling websocket connection: ', error);
		client.emit('error', 'Error handling websocket connection: ' + error);
		client.disconnect();
	}
});

// app.use(express.static('./public/remote/'));
app.post('/createMatch', (req, res) => {
	const gameSettings = req.body;
	console.log("gameSettings: ", gameSettings);
	const gameState = init.initLobby(gameSettings);  // implement match object
    // console.log('match: ', util.inspect(match, {depth: null}));
    // console.log('is recursive: ', findRecursive(match));
	const matchID = req.headers.matchID //generateMatchID();
	console.log("headers: ", req.headers);
	matches.set(matchID, { gameState: gameState, gameInterval: 0 });
	res.json({ matchID });
});

io.use((socket, next) => {
    console.log(socket.handshake.headers);
});
