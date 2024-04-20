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
const { match } = require('assert');
// const objects = require('./gameLogic/gameObjects');
// const game = require('./gameLogic/gameLogic');
// const objectsClasses = require('./gameLogic/gameObjectsClasses');

// const data = init.initLobby(lobbySettings.lobbyData);
// let data = 0;
let matches = new Map();

let clients = new Map();

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

const game = io.of('/game');
const notify = io.of('/notify');

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

function gameLoop(matchID) {
	let match = matches.get(matchID);
	let gameState = render.updateData(match.gameState);
	if (gameState == 1) {
		game.to(matchID).emit('destroy', match.gameState);
		game.to(matchID).emit('refresh', match.gameState);
	} else if (gameState == -1) {
		clearInterval(match.gameInterval); // stop the loop
		// match.gameState.ball.dir = match.gameState.camera.pos.sub(match.gameState.ball.pos);
		game.to(matchID).emit('end-game', match.gameState);
		postMatchResult(matchID, match.gameState.winner.accountID); // send the result of the match back;
		matches.delete(matchID); // then delete the match;
		return ;
	}
	// else if (gameState == 0) {
	game.to(matchID).emit('render', match.gameState);
}

function countDown(match, mins, secs) {
	if (!match.gameState.timeLimit) {
		match.gameState.timeLimit = Date.now() + ((mins * 60) + secs) * 1000;
		// console.log(`TIMER ENDS IN ${mins}:${secs}`);
	}

	// calculate the remaining time
	match.gameState.waitingRemainingTime = match.gameState.timeLimit - Date.now();
	let minutes = Math.floor(match.gameState.waitingRemainingTime / 60000);
	let seconds = Math.floor((match.gameState.waitingRemainingTime % 60000) / 1000);
	match.gameState.countDownDisplay = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	// // console.log(match.gameState.waitingRemainingTime);
	// // console.log(`MATCH ${matchID} STARTS IN ${minutes}:${seconds}`);

	// if the countdown has finished, reset
	if (match.gameState.waitingRemainingTime <= 0) {
		// // console.log("Countdown finished");
		match.gameState.timeLimit = null;
		match.gameState.waitingRemainingTime = null;
		return 1;
	}
	return 0;
}

function waitingRoom(matchID) {
	let match = matches.get(matchID);
	if (!match) {
		// console.log("Match not found");
		// client.emit('error', 'Match not found'); 
		// client.disconnect();
		return ;
	}

	if (!match.gameState.imminent && !match.gameState.ongoing) {
		// this is called during the waiting of other players
		// if the game is still waiting for players we count down from a chosen amount
		// game status = !ongoing && !imminent;
		if (countDown(match, 0, 10) || match.gameState.connectedPlayers == match.gameState.gamemode.nbrOfPlayers) {
			// in here = timer has run out or enough players have joined
			// we set the ball at the center and keep it there
			// and put the game status to imminent;
			match.gameState.ball.pos.x = 0;
			match.gameState.ball.pos.y = 0;
			match.gameState.ball.dir.x = 0;
			match.gameState.ball.dir.y = 0;
			match.gameState.imminent = true;
		}
	}
	else if (match.gameState.imminent) {
		// this is called when the game status is imminent;
		// it is just going to count down 3 seconds for players to get ready.
		// game status = imminent but !ongoing;
		if (countDown(match, 0, 4)) {
			// in here = game is starting
			// we get rid of the timer, send the ball and put the
			// game status to ongoing, !imminent;
			// and we call the loop for the game physics and scoring;
			clearInterval(match.gameInterval);
			render.getBallDir(match.gameState);
			match.gameState.ongoing = true;
			match.gameState.imminent = false;
			match.gameInterval = setInterval(gameLoop, 20, matchID);
		}
	}

	let gameState = render.updateData(match.gameState);
	game.to(matchID).emit('render', match.gameState);
}

function handleConnectionV2(client) {

	// console.log("\nCLIENT CONNECTED\n");

	let match = client.match;

	// - check if player is part of this match;
	// console.log("client.playerID: ", client.playerID);
	let playerFound = false;
	Object.values(match.gameState.players).forEach(player => {
		// console.log("player.accountID: ", player.accountID);
		if (player.accountID == client.playerID) {
			// console.log("player.accountID validated: ", player.accountID);
			player.connected = true;
			player.socketID = client.id;
			match.gameState.connectedPlayers++;
			playerFound = true;
		}
	});

	if (!playerFound) {
        // Player not part of the match, send error message to client
		// console.log(match.gameState.players);
		throw new Error(`Player ${client.playerID} not part of the match`);
    }

    client.join(client.matchID);
    // // console.log('match: ', util.inspect(match, {depth: null}));
    // client.emit('generate', JSON.stringify(match));
	// console.log('---DATA---\n', match.gameState, '\n---END---\n');
	// console.log("before disaster");
    client.emit('generate', match.gameState);
    // console.log("after disaster");

    // if (match.gameState.connectedPlayers == 1 && match.gameState.ongoing == false) {
	// 	// console.log("SETTING INTERVAL");
    //     match.gameInterval = setInterval(waitingRoom, 20, client.matchID);
    //     render.getBallDir(match.gameState);
    // }

    // console.log(`Player connected with ID: ${client.playerID}`);

    // client.emit('generate', data);
    // debugDisp.displayData(match.gameState);
    return (match);
}

function getMatch(client) {
	client.matchID = parseInt(client.handshake.auth.matchID);
	if (!client.matchID) {
		console.error('Authentication error: Missing matchID');
		throw new Error('Authentication error: Missing matchID.');
	}
	client.match = matches.get(client.matchID);
	if (!client.match) {
		// console.log("matchid: ", client.matchID);
		// console.log("ALL MATCHES:\n", matches);
		throw new Error('Match not found');
	}
}

function verifyAuthentication(client) {
	return new Promise((resolve, reject) => {
		if (client.handshake.headers && client.handshake.auth) {
			const token = client.handshake.auth.accessToken;
			jwt.verify(token, SECRET_KEY, function(err, decoded) {
				if (err) {
					console.error('Authentication error: Could not verify token.', err);
					reject(new Error('Authentication error: Could not verify token.'));
				} else {
					client.decoded = decoded;
					client.playerID = decoded.username;
					resolve(); // Successfully verified
				}
			});
		} else {
			console.error('Authentication error: No token provided.');
			reject(new Error('Authentication error: No token provided.'));
		}
	});
}

notify.use((client, next) => {
	try {
		verifyAuthentication(client).then(() => {
			next();
		}).catch(error => {
			console.error('Error authenticating websocket: ', error);
			next(error);
		});
	} catch (error) {
		console.error('Error connecting websocket: ', error);
		next(error);
	}
});

notify.on('connection', (client) => {
	clients.set(client.playerID, client);
});

// authenticate user before establishing websocket connection
game.use((client, next) => {
	try {
		getMatch(client); // get the matchID and match from the client handshake

		// verify the token and set the playerID
		verifyAuthentication(client).then(() => {
			next(); // proceed to game connection if authentication is successful
		}).catch(error => {
			console.error('Error authenticating websocket: ', error);
			next(error); // disconnect the client if there's an error
		});
	} catch (error) {
		console.error('Error connecting websocket: ', error);
		next(error); // disconnect the client if there's an error
	}
});

// Set up Socket.IO event handlers
game.on('connection', (client) => {
	try {
		//handle client connection and match init + players status
		// console.log("\nclient:\n", client.decoded);

		let match = handleConnectionV2(client);
		let data = match.gameState;
		
		// player controls
		client.on('moveUp', () => {
			// console.log(`client ${client.id} moving up`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashSp) {
				player.paddle.currSp = player.paddle.sp;
			}
		});
		
		client.on('moveDown', () => {
			// console.log(`client ${client.id} moving down`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashSp) {
				player.paddle.currSp = -player.paddle.sp;
			}
		});
		
		client.on('dash', () => {
			// console.log(`client ${client.id} dashing`);
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
			// console.log(`client ${client.id} stopping`);
			let player = data.players[client.playerID];
			if (player && player.paddle && !player.paddle.dashing) {
				player.paddle.currSp = 0;
			}
		});

		client.on('delete-match', (matchID) => {
			// // console.log("FROM BACKEND : DELETE MATCH",client.matchID);
			// // Print the keys in the matches map
			// // console.log("Keys in matches map:", Array.from(matches.keys()))
			// if (matches.has(client.matchID)) {
			// 	// console.log("INSIDE MATCH HAS MATCHID");
			// 	if (matches.get(client.matchID).gameState.gameInterval)
			// 		clearInterval(this.matches.get(client.matchID).gameState.gameInterval);
			// 	// console.log("DELETING MATCH");
			// 	matches.delete(client.matchID);
			// } else if (matches.has(matchID)) {
			// 	// console.log("INSIDE MATCH HAS MATCHID");
			// 	if (matches.get(matchID).gameState.gameInterval)
			// 		clearInterval(this.matches.get(matchID).gameState.gameInterval);
			// 	// console.log("DELETING MATCH");
			// 	matches.delete(matchID);
			// }
		});

		client.on("connection_error", (err) => {
			// console.log("CONNECTION ERROR LOG :")
			// console.log(err.req);      // the request object
			// console.log(err.code);     // the error code, for example 1
			// console.log(err.message);  // the error message, for example "Session ID unknown"
			// console.log(err.context);  // some additional error context
		});
		
		// disconnect event
		client.on('disconnect', () => {
			client.leave("gameRoom");
			data.connectedPlayers--;
			let player = data.players[client.playerID];
			if (player)
				player.connected = false;
			if (data.connectedPlayers < 1 && client.matchID < 0) {
				// console.log("CLEARING INTERVAL");
				// clearInterval(match.gameInterval);
				let match = matches.get(client.matchID);
				// if (data.ongoing) {
				// 	data.winner = player;
				// 	if (client.matchID >= 0) {
				// 		postMatchResult(client.matchID, match.gameState.winner.accountID);
				// 	}
				// }
				// data = null;
				// match.gameState = null;
				if (match) {
					clearInterval(match.gameInterval);
					matches.delete(client.matchID);
				}
				// console.log("SENDING CLEAN MSG");
				// client.emit("clean-all");
			}
			// // console.log(`Client disconnected with ID: ${client.id} (num clients: ${game.engine.clientsCount})`);
		});

		// setInterval(() => {
		// 	const big = Buffer.alloc(1024 * 1024);
		// 	client.emit('ping', [Date.now(), latency]);
		// }, 1000);

		// client.on('pong', timestamp => {
		// 	latency = Date.now() - timestamp;

		// 	// process.stdout.clearLine(0);  // Clear current text
		// 	// process.stdout.cursorTo(0);   // Move cursor to beginning of line
		// 	// process.stdout.write(`${client.id} latency: ${latency}ms`); // Write new text
		// 	// // console.log(`${client.id} latency: ${latency}ms`);
		// });

	} catch (error) {
		console.error('Error: ', error);
		client.emit('error', error.message);
		client.disconnect();
	}
});

function generateMatchID() {
	let matchID = -1;
	const keys = Array.from(matches.keys());
	if (keys.length > 0) {
		const minKey = Math.min(...keys);
		if (minKey > 0)
			matchID = -1;
		else
			matchID = minKey - 1;
		if (!matchID || matchID == NaN)
			matchID = -1;
	}
	return matchID;
}

// // Convert request content to a string representation
// const string = JSON.stringify(gameSettings);
// // Use SHA-256 to hash the string
// return crypto.createHash('sha256').update(string).digest('hex');

function verifyMatchSettings(settings) {
	// console.log("MATCH SETTINGS VERIFICATION :");
	// console.log(settings);

	const expectedCategories = ['gamemodeData', 'fieldData', 'paddlesData', 'ballData'];
	for (const category of expectedCategories) {
		if (!settings.hasOwnProperty(category)) {
			return `Settings is missing ${category}`;
		}
	}

	if (settings && settings.paddlesData && settings.paddlesData.speed && settings.ballData && settings.ballData.speed && settings.ballData.radius) {
		settings.paddlesData.speed = parseFloat(settings.paddlesData.speed);
		settings.ballData.speed = parseFloat(settings.ballData.speed);
		settings.ballData.radius = parseFloat(settings.ballData.radius);
	}

	const checks = {
		gamemodeData: {
			nbrOfPlayers: value => (value >= 1 && value <= 8) ? null : "Nbr of players should be between 2 and 8",
			nbrOfRounds: value => (value >= 1 && value <= 10) ? null : "Nbr of Rounds should be between 1 and 10",
		},
		fieldData: {
			sizeOfGoals: value => (value >= 15 && value <= 30) ? null : "Size of goals should be between 15 and 30",
			wallsFactor: value => (value >= 0 && value <= 2) ? null : "Walls Factor should be between 0 and 2",
		},
		paddlesData: {
			width: value => (value === 1) ? null : "Paddles width should be 1",
			height: value => (value >= 1 && value <= 12) ? null : "Paddles height should be between 1 and 10",
		},
		ballData: {
			radius: value => (value >= 0.5 && value <= 7) ? null : "Ball radius should be between 0.5 and 7",
		},
	};

	for (const category in checks) {
		if (!settings.hasOwnProperty(category))
			return `Game Settings are missing ${category} property`;
		for (const setting in checks[category]) {
			if (checks[category].hasOwnProperty(setting) && !settings[category].hasOwnProperty(setting))
				return `Game Settings are missing ${setting} property in ${category} object`;
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
	// console.log("playerNames: ", playerNames, "uniquePlayerNames: ", uniquePlayerNames)
    if (playerNames.length !== uniquePlayerNames.length) {
        return "Multiple identical player IDs";
    }

    if (playerNames.some(name => name.trim() === "")) {
        return "Player names should not be empty";
    }

	if(settings.paddlesData.height + settings.ballData.radius * 2 >= settings.sizeOfGoals) {
		return "Scoring is impossible. Reduce paddles height or ball radius."
	}

    // check that the current user is actually part of those users :
    // this part will be handled by the user management API

	return null;
}

function createHashedCode(id) {
    const data = `${id}:${SECRET_KEY}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
}

function verifyHashedCode(data, hashedCode) {
    const expectedHash = createHashedCode(data);
    return hashedCode === expectedHash;
}

function postMatchResult(matchId, winnerId) {
	const url = `http://tournament:8001/matches/${matchId}/${winnerId}/`;
	const hashedCode  = createHashedCode(matchId.toString());
	const payload = {
        hashed_code: hashedCode
    };

	axios.post(url, payload)
		.then(response => {
			// console.log('Match result posted successfully');
		})
		.catch(error => {
			console.error('Error posting match result:', error);
		});
}

app.post('/createMatch', (req, res) => {
	
	let matchID = setupMatch(req.body, res);
	if (!matchID)
		return ;

	res.json({ matchID });
});

app.post('/createMultipleMatches', (req, res) => {
	const allGameSettings = req.body;
	const matchIDs = [];

	const { matches, hashed_code } = allGameSettings;

	const tournamentId = matches[0].tournament_id.toString();
    if (!verifyHashedCode(tournamentId, hashed_code)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

	// console.log("\nCREATE MULTIPLE MATCHES\n");
	// console.log(allGameSettings);

	for (settings of allGameSettings.matches) {

		let matchID = setupMatch(settings, res);
		if (!matchID)
			return ;

		matchIDs.push(matchID);
	}

	res.json({ matchIDs });
});


function setupMatch(settings, res) {

	let { tournament_id, matchID, ...gameSettings } = settings;

	// console.log("CREATING MATCH : ", gameSettings);

	if (!matchID) {
		matchID = generateMatchID();
	}

	if (matches.has(matchID)) {
		// console.log("Match already exists");
		res.json({ matchID });
		return null;
	}

	let error = verifyMatchSettings(gameSettings);
	if (error) {
		// console.log(error);
		res.status(400).json({ error });
		return null;
	}

	// extract the players IDs from the players data
	const players = gameSettings.playersData.map(player => player.accountID);

	if (players.length == 1) {
		// postMatchResult(matchID, players[0]);
		res.json({ "error": "Not enough players to start a match" });
		return null;
	}

	// Convert game settings to game state
	const gameState = init.initLobby(gameSettings);
	
	matches.set(matchID, { gameState: gameState, gameInterval: 0 });

	// Emit the new match notification to all players (if it isn't a preview match; < 0)
	if (matchID >= 0) {
		// console.log("\n\nPLAYERS :\n\n", players);
		players.forEach(player => {
			let client = clients.get(player);
			if (client) {
				// console.log("EMITTING TO: ", player);
				client.emit('new-match', matchID);
			}
		});
	}

	matches.get(matchID).gameInterval = setInterval(waitingRoom, 20, matchID);
	render.getBallDir(gameState);
	// // console.log("All matches:");
	// for (const [matchID, match] of matches) {
	// 	// console.log("Match ID:", matchID);
	// 	// console.log("Match Data:", match);
	// }
	return matchID;
}

// module.exports = { io };
