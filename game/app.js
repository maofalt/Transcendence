const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const expressPort = process.env.PORT || 3000;
// const socketIoPort = 3001;

const io = socketIo(server);


// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
let gameState = false;

// objects : paddles and ball
const ball = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	r: 8,
	sp: 4,
	color: "#FFFFFF"
};

const paddle1 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 15,
	height: 70,
	sp: 4,
	color: "#0000FF"
}

const paddle2 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 15,
	height: 70,
	sp: 4,
	color: "#FF0000"
}

paddle1.x = paddle1.width;
paddle1.y = (canvas.height - paddle1.height) / 2;

paddle2.x = canvas.width - (paddle2.width * 2);
paddle2.y = (canvas.height - paddle2.height) / 2;

// players + score
const score = {
	color: "#FFFFFF",
	fontsize: 50,
	font: "",
}
score.font = `${score.fontsize}px \'Lilita One\', sans-serif`;

const player1 = {
	id: 0,
    clientId: 0,
	login: "Player 1",
	paddle: paddle1,
	score: 0,
}

const player2 = {
	id: 0,
    clientId: 0,
	login: "Player 2",
	paddle: paddle2,
	score: 0
}

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
        if (client.id == player1) {
            console.log(`player 1 moving up !`);
            player1.sp = -4;
        }
        else if (client.id == player2) {
            console.log(`player 2 moving up !`);
            player2.sp = -4;
        }
    });

    client.on('moveDown', () => {
        if (client.id == player1) {
            console.log(`player 1 moving down !`);
            player1.sp = 4;
        }
        else if (client.id == player2) {
            console.log(`player 2 moving down !`);
            player2.sp = 4;
        }
    });

    client.on('stop', () => {
        if (client.id == player1) {
            console.log(`player 1 stopping !`);
            player1.sp = 0;
        }
        else if (client.id == player2) {
            console.log(`player 2 stopping !`);
            player2.sp = 0;
        }
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
