// including libraries :
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // secret key from jisu

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
let gameInterval = 0;

function waitingLoop(data, matchId) {
    render.updateData(data);
    io.to(matchId).emit('render', data);
    // console.log("sending render");
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

function handleConnectionV2(client, playerID, matchID) {

    console.log("CLIENT CONNECTED");

	// - check if match exists;
    let match = matches.get(matchID);
	console.log("matches: ", matches);
	console.log("MATCH: ", match, "MATCHID: ", matchID, "PLAYERID: ", playerID);
	if (!match) {
		// send err 404;
		client.emit('error', 'Match not found');
		client.disconnect();
		return ;
	}

	// - check if player is part of this match;
    if (!match.players.some(player => player.accountID == playerID)) {
        // Player not part of the match, send error message to client
        client.emit('error', 'Player not part of the match');
        client.disconnect();
        return;
    }

    for (let i=0; match.gamemode.nbrOfPlayers; i++) {
        if (match.players[i].accountID == playerID) {
            match.players[i].connected = true;
            match.players[i].socketID = client;
            match.connectedPlayers++;
        }
    }

    client.join(matchID);
    client.emit('generate', match);
    
    if (match.connectedPlayers == 1) {
        match.gameInterval = setInterval(waitingLoop, 20, match, matchId);
        match.ball.dir.y = -1;
    }

    console.log(`Player connected with ID: ${playerID}`);

    // client.emit('generate', data);
    debugDisp.displayData(data);
    return (match);
}

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    let token, decoded, playerId, matchId;
    try {
        // token = client.handshake.headers.cookie.replace('jwt=', ''); // Adjust based on your cookie format
        // decoded = jwt.verify(token, SECRET_KEY);
        // playerId = decoded.username;
        // matchId = decoded.matchId;

        playerId = client.handshake.query.playerId;
        matchId = client.handshake.query.matchId;

        console.log("MATCHID: ", matchId);
        console.log("PLAYERID: ", playerId);
    } catch (error) {
        console.log('JWT validation failed', error);
        // send err 401;
    }
    //handle client connection and match init + players status
    let data = handleConnectionV2(client, playerId, matchId);

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
            data.clearInterval(gameInterval);
            matches.delete(matchId);
            delete data;
        }
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${io.engine.clientsCount})`);
    });
});

// app.use(express.static('./public/remote/'));
app.post('/createMatch', (req, res) => {
	const gameSettings = req.body;
	console.log("gameSettings: ", gameSettings);
	const match = init.initLobby(gameSettings);  // implement match object
	const matchId = "69"; //generateMatchId();
	matches.set(matchId, match);
	res.json({ matchId });
});
