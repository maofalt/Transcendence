// including libraries :
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const crypto = require('crypto');
const SECRET_KEY = process.env.DJANGO_SECRET_KEY; // secret key from jisu

const util = require('util');

// const fs = require('fs');

// importing personal code :
const lobbySettings = require('./gameLogic/lobbySettings');
const init = require('./gameLogic/init');
const debugDisp = require('./gameLogic/debugDisplay');
const render = require('./gameLogic/rendering');
const axios = require('axios');
// const objects = require('./gameLogic/gameObjects');
// const game = require('./gameLogic/gameLogic');
// const objectsClasses = require('./gameLogic/gameObjectsClasses');

// const data = init.initLobby(lobbySettings.lobbyData);
// let data = 0;
let matches = new Map();

let latency = 0;

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
		// client.emit('error', 'Match not found');
		// client.disconnect();
		return ;
	}
	let string = JSON.stringify(match.gameState);
	let gameState = render.updateData(match.gameState);
	if (gameState == 1) {
		io.to(matchID).emit('destroy', match.gameState);
		io.to(matchID).emit('refresh', match.gameState);
	} else if (gameState == -1) {
		clearInterval(match.gameInterval); // stop the loop
		// render.endGame(match.gameState); // call end game animation
		match.gameState.ball.dir = match.gameState.camera.pos.sub(match.gameState.ball.pos);
		io.to(matchID).emit('end-game', match.gameState);
		// something like a post of the gameState idk // send the result of the match back;
		matches.delete(matchID); // then delete the match;
		return ;
	}
	// else if (gameState == 0) {
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
//     }
//     setPlayerStatus(client);


//     console.log(`Client connected with ID: ${client.id}`);
//     console.log(`Number of connected clients: ${io.engine.clientsCount}`);

//     client.emit('generate', data);
//     debugDisp.displayData(data);
// }

function handleConnectionV2(client) {

    console.log("\nCLIENT CONNECTED\n");

    let match = matches.get(client.matchID);
	if (!match) {
		throw new Error('Match not found');
	}

	// - check if player is part of this match;
	console.log("client.playerID: ", client.playerID);
	let playerFound = false;
	Object.values(match.gameState.players).forEach(player => {
		console.log("player.accountID: ", player.accountID);
		if (player.accountID == client.playerID) {
			console.log("player.accountID validated: ", player.accountID);
			player.connected = true;
			player.socketID = client.id;
			match.gameState.connectedPlayers++;
			playerFound = true;
		}
	});

	if (!playerFound) {
        // Player not part of the match, send error message to client
		throw new Error(`Player ${client.playerID} not part of the match`);
    }

    client.join(client.matchID);
    // console.log('match: ', util.inspect(match, {depth: null}));
    // client.emit('generate', JSON.stringify(match));
	console.log('---DATA---\n', match.gameState, '\n---END---\n');
    client.emit('generate', match.gameState);
    
    if (match.gameState.connectedPlayers == 1) {
        match.gameInterval = setInterval(waitingLoop, 10, client.matchID);
        match.gameState.ball.dir.y = -1;
		match.gameState.ball.dir.x = 0.01;
    }

    console.log(`Player connected with ID: ${client.playerID}`);

    // client.emit('generate', data);
    // debugDisp.displayData(match.gameState);
    return (match);
}

// authenticate user before establishing websocket connection
io.use((client, next) => {
	try {
		//console.log("\nclient.handshake.query:\n", client.handshake);
		client.matchID = client.handshake.query.matchID;
		if (!client.matchID) {
			console.error('Authentication error: Missing matchID');
			next(new Error('Authentication error: Missing matchID.'));
		}
		if (client.handshake.headers && client.handshake.auth) {
			// Parse the auth from the handshake
			const token = client.handshake.auth.accessToken;
			console.log("\ntoken:\n", token);
	
			// Verify the token
			jwt.verify(token, SECRET_KEY, function(err, decoded) {
			// jwt.verify(token, SECRET_KEY, function(err, decoded) {
				if (err) {
					console.error('HEHE Authentication error: Could not verify token.', err);
					return next(new Error('WAWA Authentication error: Could not verify token.'));
				}
				client.decoded = decoded;
				// get the playerID from the decoded token
				client.playerID = decoded.username;
				console.log("NIQUE TA MERDE DECODED!!!",decoded);
				console.log("\nclient.playerID:\n", client.playerID);
				// console.log("\ndecoded:\n", decoded);
				next();
			});
		} else {
			console.error('Authentication error: No token provided.');
			next(new Error('Authentication error: No token provided.'));
		}
	} catch (error) {
		console.error('Error connecting websocket: ', error);
		next(new Error('BLABLA Authentication error: ' + error));
	}
});

// Set up Socket.IO event handlers
io.on('connection', (client) => {
	try {
		//handle client connection and match init + players status
		console.log("\nclient:\n", client.decoded);
		let match = handleConnectionV2(client);
		let data = match.gameState;
		
		// player controls
		client.on('moveUp', () => {
			console.log(`client ${client.id} moving up`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashSp) {
				player.paddle.currSp = player.paddle.sp;
			}
		});
		
		client.on('moveDown', () => {
			console.log(`client ${client.id} moving down`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashSp) {
				player.paddle.currSp = -player.paddle.sp;
			}
		});
		
		client.on('dash', () => {
			console.log(`client ${client.id} dashing`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashSp) {
				if (player.paddle.currSp == 0) {
					// do something for this err case
					return ;
				}
				player.paddle.dashSp = player.paddle.currSp > 0 ? player.paddle.w * 1.5 : player.paddle.w * -1.5;
				// player.paddle.dashSp = player.paddle.w * 1.5 * (player.paddle.currSp > 0);
			}
		});
		
		client.on('stop', () => {
			console.log(`client ${client.id} stopping`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashing) {
				player.paddle.currSp = 0;
			}
		});
		
		// disconnect event
		client.on('disconnect', () => {
			client.leave("gameRoom");
			data.connectedPlayers--;
			let player = data.players[client.playerID];
			if (player)
				player.connected = false;
			if (data.connectedPlayers < 1) {
				console.log("CLEARING INTERVAL");
				clearInterval(match.gameInterval);
				// matches.delete(client.matchID);
				// delete data;
			}
			console.log(`Client disconnected with ID: ${client.id} (num clients: ${io.engine.clientsCount})`);
		});

		setInterval(() => {
			const big = Buffer.alloc(1024 * 1024);
			client.emit('ping', [Date.now(), latency]);
		}, 1000);

		client.on('pong', timestamp => {
			latency = Date.now() - timestamp;

			// process.stdout.clearLine(0);  // Clear current text
			// process.stdout.cursorTo(0);   // Move cursor to beginning of line
			// process.stdout.write(`${client.id} latency: ${latency}ms`); // Write new text
			// console.log(`${client.id} latency: ${latency}ms`);
		});

	} catch (error) {
		console.error('Error: ', error);
		client.emit('error', error.message);
		client.disconnect();
	}
});

function generateMatchID(gameSettings) {
	// Convert request content to a string representation
	const string = JSON.stringify(gameSettings);
	// Use SHA-256 to hash the string
	return crypto.createHash('sha256').update(string).digest('hex');
}

function verifyMatchSettings(settings) {
	console.log("MATCH SETTINGS VERIFICATION :");
	console.log(settings);

	const checks = {
		gamemodeData: {
			gameType: value => (value === 0 || value === 1) ? null : "This Game Type is not recognized.",
			nbrOfPlayers: value => (value >= 2 && value <= 8) ? null : "Nbr of players should be between 2 and 8",
			nbrOfRounds: value => (value >= 1 && value <= 10) ? null : "Nbr of Rounds should be between 1 and 10",
		},
		fieldData: {
			sizeOfGoals: value => (value >= 15 && value <= 30) ? null : "Size of goals should be between 15 and 30",
			wallsFactor: value => (value >= 0 && value <= 2) ? null : "Walls Factor should be between 0 and 2",
		},
		paddlesData: {
			width: value => (value === 1) ? null : "Paddles width should be 1",
			height: value => (value >= 1 && value <= 10) ? null : "Paddles height should be between 1 and 10",
		},
		ballData: {
			radius: value => (value >= 0.5 && value <= 7) ? null : "Ball radius should be between 0.5 and 7",
		},
	};

	for (const category in checks) {
		for (const setting in checks[category]) {
			const check = checks[category][setting];
			const value = settings[category][setting];
			const error = check(value);
			if (error) {
				return error;
			}
		}
	}

	// check if nbr of players matches nbr of actual player objects;
	if (settings.playersData.length !== settings.gamemodeData.nbrOfPlayers) {
		return "\'Number of players\' doesn't match number of <player> objects";
	}

	// check if all players have different names, that they dont have an empty name
    let playerNames = settings.playersData.map(player => player.accountID);
    let uniquePlayerNames = [...new Set(playerNames)];

    if (playerNames.length !== uniquePlayerNames.length) {
        return "Multiple identical player IDs";
    }

    if (playerNames.some(name => name.trim() === "")) {
        return "Player names should not be empty";
    }

    // check that the current user is actually part of those users :
    // this part will be handled by the user management API

	return null;
}

function postMatchResult(matchId, winnerId) {
	const url = `http://tournament/matches/${matchId}/${winnerId}/`;
	
	axios.post(url)
		.then(response => {
			console.log('Match result posted successfully');
		})
		.catch(error => {
			console.error('Error posting match result:', error);
		});
}

// app.use(express.static('./public/remote/'));
app.post('/createMatch', (req, res) => {
	const gameSettings = req.body;

	console.log("\nWAAAAA\n", gameSettings);
	// check post comes from verified source;

	const matchID = generateMatchID(gameSettings);
	
	if (matches.has(matchID)) {
		console.log("Match already exists");
		res.json({ matchID });
		return ;
	}

	const matchValidity = verifyMatchSettings(gameSettings);
	if (matchValidity) {
		console.log("Error: ",matchValidity);
		res.json({ matchID });
		return ;
	}
	
	// Convert game settings to game state
	const gameState = init.initLobby(gameSettings);
	
	console.log("\nMATCH CREATED\n");
	matches.set(matchID, { gameState: gameState, gameInterval: 0 });

	res.json({ matchID });
});

app.post('/createMultipleMatches', (req, res) => {
	const gameSettings = req.body;

	const matchIDs = [];
	console.log("\nCREATE MULTIPLE MATCHES\n");
	console.log("gameSettings", gameSettings);
	// check post comes from verified source;
	gameSettings.matches.forEach(settings => {
		const { tournament_id, match_id, ...rest } = settings;

		const matchID = generateMatchID(rest);
		
		matchIDs.push(matchID);
		
		if (matches.has(matchID)) {
			console.log("Match already exists");
			return ;
		}

		const matchValidity = verifyMatchSettings(settings);
		if (matchValidity) {
			console.log("Error: ",matchValidity);
			return ;
		}
		
		// Convert game settings to game state
		const gameState = init.initLobby(settings);
		
		console.log("\nMATCH CREATED\n");
		matches.set(matchID, { gameState: gameState, gameInterval: 0 });
	});

	res.json({ matchIDs });
});

// module.exports = { io };
