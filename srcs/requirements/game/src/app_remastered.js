const express = require('express');
const http = require('http');
// const fs = require('fs');
const socketIo = require('socket.io');
// const objects = require('./gameLogic/gameObjects');
const objectsClasses = require('./gameLogic/gameObjectsClasses');
// const game = require('./gameLogic/gameLogic');
const lobbySettings = require('./gameLogic/lobbySettings');

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

/* 
    we are going to recieve a struct with all the lobby infos :
        - game mode data:
            - nbr of players;
            - nbr of rounds;
            - time limit;
        - field data :
            - size of walls (ratio wall size over goal size);
            - size of goals;
        - paddles info :
            - speed;
            - size;
        - ball infos :
            - speed;
            - radius;
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

// global vars
let gameInterval = 0;

// const lobbyData = lobbySettings.lobbyData;

function setPlayerStatus(client) {
    lobbyData.players[io.engine.clientsCount - 1] = client.id;
}

function handleConnection(client) {

    console.log("CLIENT CONNECTED");
    client.join("gameRoom");

    setPlayerStatus(client);

    console.log(`Client connected with ID: ${client.id}`);
    console.log(`Number of connected clients: ${io.engine.clientsCount}`);
}

function displayData(data) {
    console.log(`
    data.field :
        ${data.field.goalsSize},
        ${data.field.wallsSize},
    `);
}

function manageLobby(lobbyData) {
    let data = new objects.Data(lobbyData);

    displayData(data);
}

manageLobby(lobbySettings.lobbyData);

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    handleConnection(client);

    // player controls
    client.on('moveUp', () => {
        console.log(`client ${client.id} moving up`);
    });

    client.on('moveDown', () => {
        console.log(`client ${client.id} moving down`);
    });

    client.on('stop', () => {
        console.log(`client ${client.id} stopping`);
    });

    // disconnect event
    client.on('disconnect', () => {
        client.leave("gameRoom");
        if (gameInterval)
            clearInterval(gameInterval);
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${io.engine.clientsCount})`);
    });
});

// app.use(express.static('./public/remote/'));
