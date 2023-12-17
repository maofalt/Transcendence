const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const expressPort = process.env.PORT || 3000;
// const socketIoPort = 3001;

const io = socketIo(server);

let numClients = 0;

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    numClients = io.engine.clientsCount;

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
        console.log(`move up ! (from client ${client.id})`);
    });

    client.on('moveDown', () => {
        console.log(`move down ! (from client ${client.id})`);
    });

    client.on('stop', () => {
        console.log(`stop ! (from client ${client.id})`);
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
