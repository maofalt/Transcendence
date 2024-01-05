const express = require('express');
const http = require('http');
// const fs = require('fs');
const socketIo = require('socket.io');
const objects = require('./gameLogic/gameObjects');
const game = require('./gameLogic/gameLogic');

let data = objects.data;

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

//====================================== SOCKET IO ======================================//

// global vars
let numClients = 0;
let gameInterval = 0;
let lobbyInterval = 0;
let roundState = false;

function setPlayersStatus(client) {
    if (numClients < 2) {
        // data.player1.socket = client;
        data.player1.clientId = client.id;
        data.player1.connected = true;
    }
    else if (numClients == 2) {
        // data.player2.socket = client;
        data.player2.clientId = client.id;
        data.player2.connected = true;
    }
}

function handleConnection(client) {

    console.log("CLIENT CONNECTED");
    numClients = io.engine.clientsCount;
    client.join("gameRoom");

    setPlayersStatus(client);

    client.emit("generate", data);
    client.emit("render", data);
    client.emit('clientId', client.id, numClients);
    // client.emit('pong');
    console.log(`Client connected with ID: ${client.id}`);
    console.log(`Number of connected clients: ${numClients}`);
}

function calculateFrame() {
    // console.log(`player 1 game state : ${player1.gameState}`);
    if (data.player1.score == 10 || data.player2.score == 10)
        return (console.log('GAME OVER'), clearInterval(gameInterval));
    if (game.updateData()) {
        data.player1.gameState = false;
        data.player2.gameState = false;
        game.initData();
    }
    // console.log("calculating frame...");
    io.to("gameRoom").emit('render', data);
}

function startRound() {
    console.log("startRound");
    game.initData();
    game.getRandomDir();
}

function manageLobby() {
    game.initData();
    // game.updateData;
    // io.to("gameRoom").emit('render', data);
    if (!data.player1.connected || !data.player2.connected)
        return;
    clearInterval(lobbyInterval);
    gameInterval = setInterval(calculateFrame, 10);
}

// game.initData();
lobbyInterval = setInterval(manageLobby, 20);

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    handleConnection(client);
    // Handle other events or messages from the client
    client.on('ping', () => {
        console.log("ping received ! emitting pong...");
        client.emit('pong');
    });

    // player controls
    client.on('moveUp', () => {
        if (client.id == data.player1.clientId) {
            // console.log(`player 1 moving up !`);
            if (data.player1.gameState == false && data.player2.gameState)
                return (data.player1.gameState = true, startRound());
            data.player1.gameState = true;
            data.paddle1.vY = data.paddle1.sp;
        }
        else if (client.id == data.player2.clientId) {
            // console.log(`player 2 moving up !`);
            if (data.player2.gameState == false && data.player1.gameState)
                return (data.player2.gameState = true, startRound());
            data.player2.gameState = true;
            data.paddle2.vY = data.paddle2.sp;
        }
    });

    client.on('moveDown', () => {
        if (client.id == data.player1.clientId) {
            // console.log(`player 1 moving down !`);
            if (data.player1.gameState == false && data.player2.gameState)
                return (data.player1.gameState = true, startRound());
            data.player1.gameState = true;
            data.paddle1.vY = -data.paddle1.sp;
        }
        else if (client.id == data.player2.clientId) {
            // console.log(`player 2 moving down !`);
            if (data.player2.gameState == false && data.player1.gameState)
                return (data.player2.gameState = true, startRound());
            data.player2.gameState = true;
            data.paddle2.vY = -data.paddle2.sp;
        }
    });

    client.on('stop', () => {
        if (client.id == data.player1.clientId) {
            // console.log(`player 1 stopping !`);
            data.paddle1.vY = 0;
        }
        else if (client.id == data.player2.clientId) {
            // console.log(`player 2 stopping !`);
            data.paddle2.vY = 0;
        }
    });

    // disconnect event
    client.on('disconnect', () => {
        numClients = io.engine.clientsCount;
        client.leave("gameRoom");
        // game.initData();
        if (gameInterval)
            clearInterval(gameInterval);
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${numClients})`);
    });
});

// app.use(express.static('./public/remote/'));
