const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const expressPort = process.env.PORT || 3000;
// const socketIoPort = 3001;

const io = socketIo(server);

let player1 = 0;
let player2 = 0;

let numClients = 0;

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    numClients = io.engine.clientsCount;
    if (numClients < 2)
        player1 = client.id;
    else if (numClients == 2)
        player2 = client.id;

    client.emit('clientId', client.id, numClients);
    // client.emit('pong');
    console.log(`Client connected with ID: ${client.id}`);
    console.log(`Number of connected clients: ${numClients}`);

    // Handle other events or messages from the client
    client.on('ping', () => {
        console.log("ping received ! emitting pong...");
        client.emit('pong');
    });

    // player controls
    client.on('clickedCanvas', () => {
        console.log(`clicked canvas ! (from client ${client.id})`);
    });

    client.on('moveUp', () => {
        if (client.id == player1)
            console.log(`player 1 moving up !`);
        else if (client.id == player2)
            console.log(`player 2 moving up !`);
    });

    client.on('moveDown', () => {
        if (client.id == player1)
            console.log(`player 1 moving down !`);
        else if (client.id == player2)
            console.log(`player 2 moving down !`);
    });

    client.on('stop', () => {
        if (client.id == player1)
            console.log(`player 1 stopping !`);
        else if (client.id == player2)
            console.log(`player 2 stopping !`);
    });

    // disconnect event
    client.on('disconnect', () => {
        numClients = io.engine.clientsCount;
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${numClients})`);
    });
});

app.use(express.static('./public/remote/'));

// Start the server
server.listen(expressPort, () => {
    console.log(`Express server running on port ${expressPort}`);
});
