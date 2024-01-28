// including libraries :
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
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
let data = 0;

const app = express();
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

function waitingLoop() {
    render.updateData(data);
    io.to("gameRoom").emit('render', data);
    // console.log("sending render");
}

// gameInterval = setInterval(waitingLoop, 20);

//====================================== SOCKET HANDLING ======================================//

function setPlayerStatus(client) {
    if (io.engine.clientsCount <= data.gamemode.nbrOfPlayers) {
        data.players[io.engine.clientsCount - 1].socketID = client.id;
        data.players[io.engine.clientsCount - 1].connected = true;
    }
}

function handleConnection(client) {

    console.log("CLIENT CONNECTED");
    client.join("gameRoom");
    
    if (io.engine.clientsCount == 1) {
        data = init.initLobby(lobbySettings.lobbyData);
        gameInterval = setInterval(waitingLoop, 20);
        data.ball.dir.y = -1;
    }
    setPlayerStatus(client);

    console.log(`Client connected with ID: ${client.id}`);
    console.log(`Number of connected clients: ${io.engine.clientsCount}`);

    client.emit('generate', data);
    debugDisp.displayData(data);
}

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    handleConnection(client);

    // player controls
    client.on('moveUp', () => {
        console.log(`client ${client.id} moving up`);
        for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
            if (data.players[i].socketID == client.id) {
                data.players[i].paddle.dir = data.players[i].paddle.dirToTop.copy();
            }
        }
    });

    client.on('moveDown', () => {
        console.log(`client ${client.id} moving down`);
        for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
            if (data.players[i].socketID == client.id) {
                data.players[i].paddle.dir = data.players[i].paddle.dirToTop.scale(-1);
            }
        }
    });

    client.on('stop', () => {
        console.log(`client ${client.id} stopping`);
        for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
            if (data.players[i].socketID == client.id) {
                data.players[i].paddle.dir.x = 0;
                data.players[i].paddle.dir.y = 0;
            }
        }
    });

    // disconnect event
    client.on('disconnect', () => {
        client.leave("gameRoom");
        for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
            if (data.players[i].socketID == client.id)
                data.players[i].connected = false;
        }
        // data.gamemode.nbrOfPlayers--; ?
        // if (gameInterval)
        //     clearInterval(gameInterval);
        if (io.engine.clientsCount <= 1) {
            clearInterval(gameInterval);
            delete data;
        }
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${io.engine.clientsCount})`);
    });
});

// app.use(express.static('./public/remote/'));
