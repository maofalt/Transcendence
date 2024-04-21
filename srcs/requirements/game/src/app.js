const express = require('express');
const http = require('http');
// const fs = require('fs');
const socketIo = require('socket.io');
const objects = require('./gameLogic/DEPREC_gameObjects');
const game = require('./gameLogic/DEPREC_gameLogic');

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
    // console.log(`APP Express server running on port ${expressPort}`);
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

    // console.log("CLIENT CONNECTED");
    numClients = io.engine.clientsCount;
    client.join("gameRoom");

    setPlayersStatus(client);

    client.emit("generate", data);
    client.emit("render", data);
    client.emit('clientId', client.id, numClients);
    // client.emit('pong');
    // console.log(`Client connected with ID: ${client.id}`);
    // console.log(`Number of connected clients: ${numClients}`);
}

function calculateFrame() {
    // // console.log(`player 1 game state : ${player1.gameState}`);
    if (data.player1.score == 10 || data.player2.score == 10)
        return (// console.log('GAME OVER'), clearInterval(gameInterval));
    if (game.updateData()) {
        // data.player1.gameState = false;
        // data.player2.gameState = false;
        // game.initData();
    }
    // // console.log("calculating frame...");
    io.to("gameRoom").emit('render', data);
}

function startRound() {
    // console.log("startRound");
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

/* 
    we are going to recieve a struct with all the lobby infos :
        - game mode data:
            - nbr of players;
            - nbr of rounds;
            - time limit;
        - size of walls (ratio wall size over goal size);
        - size of goals;
        - paddles info :
            - speed;
            - size;
        - ball infos :
            - speed;
            - size;
        - for each player :
            - lobby ID (its position in the array of players);
            - login;
            - unique account ID;
            - color;
            
    at the start of the game we will have to :
        - create all the objects and
        - setup the whole game data according to the lobby info;
        - fill the remaining variables with default ones;
    at the start of each round we will have to :
        - if (gamemode == battleroyale) set up each player position  :
            - calculate each position according to the size of goals/walls + nbr of remaining players;
            - set their positions to the calculated ones;
        - put the ball back to the center;
        - put the speeds back to default ones;

    when a point gets scored :
        - if (gamemode == battleroyale)
            - nbr of players--;
            - the one who got scored on gets eliminated;
            - get rid of the eliminated player objects (player and paddle);
            - OR : switch him to spectator mode = keep the player object but delete paddle;
            - important : send info to client to delete meshes etc.
        - else
            - score++ for the player who scored (for this to work no matter the number of players,
            it is necessary to store somewhere who hit the ball last);
            - if score max reached = end of the game, the player who has the max score wins !
    
    if there is a time limit :
        - if the limit is reached
            - if there is a draw : start overtime (normal round except the ball speeds up I guess);
            - the player who has the highest score wins;
*/

function manageLobbies() {
    
}

// game.initData();
lobbyInterval = setInterval(manageLobby, 20);

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    handleConnection(client);
    // Handle other events or messages from the client
    client.on('ping', () => {
        // console.log("ping received ! emitting pong...");
        client.emit('pong');
    });

    // player controls
    client.on('moveUp', () => {
        if (client.id == data.player1.clientId) {
            // // console.log(`player 1 moving up !`);
            if (data.player1.gameState == false && data.player2.gameState)
                return (data.player1.gameState = true, startRound());
            data.player1.gameState = true;
            data.paddle1.vY = data.paddle1.sp;
        }
        else if (client.id == data.player2.clientId) {
            // // console.log(`player 2 moving up !`);
            if (data.player2.gameState == false && data.player1.gameState)
                return (data.player2.gameState = true, startRound());
            data.player2.gameState = true;
            data.paddle2.vY = data.paddle2.sp;
        }
    });

    client.on('moveDown', () => {
        if (client.id == data.player1.clientId) {
            // // console.log(`player 1 moving down !`);
            if (data.player1.gameState == false && data.player2.gameState)
                return (data.player1.gameState = true, startRound());
            data.player1.gameState = true;
            data.paddle1.vY = -data.paddle1.sp;
        }
        else if (client.id == data.player2.clientId) {
            // // console.log(`player 2 moving down !`);
            if (data.player2.gameState == false && data.player1.gameState)
                return (data.player2.gameState = true, startRound());
            data.player2.gameState = true;
            data.paddle2.vY = -data.paddle2.sp;
        }
    });

    client.on('stop', () => {
        if (client.id == data.player1.clientId) {
            // // console.log(`player 1 stopping !`);
            data.paddle1.vY = 0;
        }
        else if (client.id == data.player2.clientId) {
            // // console.log(`player 2 stopping !`);
            data.paddle2.vY = 0;
        }
    });

    // disconnect event
    client.on('disconnect', () => {
        numClients = io.engine.clientsCount;
        client.leave("gameRoom");
        game.initData();
        if (gameInterval)
            clearInterval(gameInterval);
        // console.log(`Client disconnected with ID: ${client.id} (num clients: ${numClients})`);
    });
});

// app.use(express.static('./public/remote/'));
