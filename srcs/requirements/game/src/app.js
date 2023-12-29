const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const settings = require('./gameLogic/gameSettings');
const objects = require('./gameLogic/gameObjects');
const collisions = require('./gameLogic/gameCollisions');

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

//=========================================== GAME LOGIC ===========================================//

// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
// let gameState = false;

// // board :
// const field = {
//     height: 30,
//     width: 50,
// }

// // objects : paddles and ball
// const ball = {
// 	x: 0,
// 	y: 0,
// 	vX: 0,
// 	vY: 0,
// 	r: 2,
// 	sp: 0.2,
//     originalSp: 0.2,
// 	color: "#FFFFFF"
// };

// const paddle1 = {
// 	x: 10,
// 	y: 0,
// 	vX: 0,
// 	vY: 0,
// 	width: 2,
// 	height: 10,
// 	sp: 0,
// 	color: "#0000FF"
// }

// const paddle2 = {
// 	x: 0,
// 	y: 0,
// 	vX: 0,
// 	vY: 0,
// 	width: 2,
// 	height: 10,
// 	sp: 0,
// 	color: "#FF0000"
// }

// // players + score
// const score = {
// 	color: "#FFFFFF",
// 	fontsize: 50,
// 	font: "",
// }
// score.font = `${score.fontsize}px \'Lilita One\', sans-serif`;

// const player1 = {
// 	login: "Player 1",
// 	id: 0,
//     clientId: 0,
//     color: "",
// 	paddle: paddle1,
// 	score: 0,
//     connected: false,
//     gameState: false,
//     roundState: false,
// }

// const player2 = {
// 	login: "Player 2",
// 	id: 0,
//     clientId: 0,
//     color: "",
// 	paddle: paddle2,
// 	score: 0,
//     connected: false,
//     gameState: false,
//     roundState: false,
// }

// const data = {
//     field: field,
//     ball: ball,
//     paddle1: paddle1,
//     paddle2: paddle2,
//     player1: player1,
//     player2: player2,
//     score: score,
// }

function initBall() {
    // data.ball.x = settings.ball.x;
    // data.ball.y = settings.ball.y;
    // data.ball.z = 0;
    // data.ball.vX = settings.ball.vX;
    // data.ball.vY = settings.ball.vY;
    // data.ball.sp = settings.ball.sp;
    // data.ball.r = settings.ball.r;
    data.ball = settings.ball;
    // getRandomDir(ball);
}

function initPaddle(paddle, settingsPaddle) {
    paddle.x = settingsPaddle.x;
    paddle.y = settingsPaddle.y;
    paddle.vX = settingsPaddle.vX;
    paddle.vY = settingsPaddle.vY;
    paddle.sp = settingsPaddle.sp;
    // paddle = settingsPaddle;
}

// function initPaddle1(paddle, settingsPaddle) {
//     paddle.x = settings.x;
//     paddle.y = settings.x;
//     paddle.vX = settings.x;
//     paddle.vY = settings.x;
//     paddle.sp = settings.paddles.sp;
// }

// function initPaddle2(paddle, settingsPaddle) {
//     paddle.x = settings.x;
//     paddle.y = settings.x;
//     paddle.vX = settings.x;
//     paddle.vY = settings.x;
//     paddle.sp = settings.paddles.sp;
// }

function initData() {
    initBall();
    initPaddle(data.paddle1, settings.paddle1);
    initPaddle(data.paddle2, settings.paddle2);
}

// vector calculations for ball dir
function normalizeBallDir() {
	let l = Math.sqrt(data.ball.vX * data.ball.vX + data.ball.vY * data.ball.vY);
	data.ball.vX /= l;
	data.ball.vY /= l;
	data.ball.vX *= data.ball.sp;
	data.ball.vY *= data.ball.sp;
}

function getRandomDir() {
	let signX = Math.random();
	let signY = Math.random();
	data.ball.vX = (Math.random()) * ((signX >= 0.5) ? 1 : -1);
	data.ball.vY = (Math.random()) * ((signY >= 0.5) ? 1 : -1);
	normalizeBallDir();
}

// collisions calculations
function calculateBallDir(paddleNbr) {
	let contactX = paddle1.x + paddle1.width;
	let contactY = ball.y;
	let paddleCenterX = paddle1.x - paddle1.width;
	let paddleCenterY = paddle1.y + paddle1.height / 2;

	if (paddleNbr == 2) {
		contactX = paddle2.x;
		contactY = ball.y;
		paddleCenterX = paddle2.x + paddle2.width * 2;
		paddleCenterY = paddle2.y + paddle2.height / 2;
	}

	ball.vX = contactX - paddleCenterX;
	ball.vY = contactY - paddleCenterY;
	normalizeBallDir();
}

function updateBall() {
    if (collisions.ballIsOut(data))
        return true;
    collisions.ballHitsWall(data.ball, data.field);
    collisions.ballHitsPaddle1(data.ball, data.paddle1);
    collisions.ballHitsPaddle2(data.ball, data.paddle2);
    data.ball.x += data.ball.vX;
    data.ball.y += data.ball.vY;
    return false;
}

function updatePaddle(paddle) {
    console.log("updating paddles");
    paddle.y += paddle.vY;
    // check for collisions;
    paddle.y = ((paddle.y - paddle.height / 2 < -data.field.height / 2) ? -data.field.height / 2 + paddle.height / 2 : paddle.y);
    paddle.y = ((paddle.y + paddle.height / 2 > data.field.height / 2) ? data.field.height / 2 - paddle.height / 2 : paddle.y);
}

function updateData() {
    if (updateBall()) {
        console.log('ball update returned true');
        return true;
    }
    updatePaddle(data.paddle1);
    updatePaddle(data.paddle2);
    return false;
}

function handleConnection(client) {
    console.log("CLIENT CONNECTED");
    numClients = io.engine.clientsCount;
    if (numClients < 2) {
        data.player1.clientId = client.id;
        data.player1.connected = true;
    }
    else if (numClients == 2) {
        data.player2.clientId = client.id;
        data.player2.connected = true;
    }

    client.emit('clientId', client.id, numClients);
    // client.emit('pong');
    console.log(`Client connected with ID: ${client.id}`);
    console.log(`Number of connected clients: ${numClients}`);
}

// Set up Socket.IO event handlers
io.on('connection', (client) => {
    handleConnection(client);
    // Handle other events or messages from the client
    client.on('ping', () => {
        console.log("ping received ! emitting pong...");
        client.emit('pong');
    });

    // player controls
    client.on('clickedfield', () => {
        console.log(`clicked field ! (from client ${client.id})`);
    });

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

    function calculateFrame() {
        // console.log(`player 1 game state : ${player1.gameState}`);
        if (updateData()) {
            data.player1.gameState = false;
            data.player2.gameState = false;
            // clearInterval();
            initData();
        }
        // console.log("calculating frame...");
        client.emit('render', data);
    }

    function startRound() {
        console.log("startRound");
        initData();
        getRandomDir();
        // gameInterval = setInterval(calculateFrame, 10);
    }

    function manageLobby() {
        initData();
        client.emit('generate', data);
        gameInterval = setInterval(calculateFrame, 10);
    }

    manageLobby();

    // disconnect event
    client.on('disconnect', () => {
        numClients = io.engine.clientsCount;
        initData();
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${numClients})`);
    });
});

// app.use(express.static('./public/remote/'));
