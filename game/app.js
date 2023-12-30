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
// let gameState = false;

// board :
const field = {
    height: 420,
    width: 560,
}

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
	sp: 0,
	color: "#0000FF"
}

const paddle2 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 15,
	height: 70,
	sp: 0,
	color: "#FF0000"
}

// players + score
const score = {
	color: "#FFFFFF",
	fontsize: 50,
	font: "",
}
score.font = `${score.fontsize}px \'Lilita One\', sans-serif`;

const player1 = {
	login: "Player 1",
	id: 0,
    clientId: 0,
    color: "",
	paddle: paddle1,
	score: 0,
    connected: false,
    gameState: false,
    roundState: false,
}

const player2 = {
	login: "Player 2",
	id: 0,
    clientId: 0,
    color: "",
	paddle: paddle2,
	score: 0,
    connected: false,
    gameState: false,
    roundState: false,
}

const data = {
    field: field,
    ball: ball,
    paddle1: paddle1,
    paddle2: paddle2,
    player1: player1,
    player2: player2,
    score: score,
}

function initBall() {
    ball.x = field.width / 2;
    ball.y = field.height / 2;
    ball.vX = 0;
    ball.vY = 0;
    ball.sp = 2;
    ball.originalSp = 2;
    ball.r = 8;
    // getRandomDir(ball);
}

function initPaddle1(paddle) {
    paddle.x = paddle.width;
    paddle.y = (field.height - paddle.height) / 2;
    paddle.vX = 0;
    paddle.vY = 0;
    paddle.sp = 2;
}

function initPaddle2(paddle) {
    paddle.x = field.width - paddle.width * 2;
    paddle.y = (field.height - paddle.height) / 2;
    paddle.vX = 0;
    paddle.vY = 0;
    paddle.sp = 2;
}

function initData() {
    initBall();
    initPaddle1(paddle1);
    initPaddle2(paddle2);
}

// vector calculations for ball dir
function normalizeBallDir() {
	let l = Math.sqrt(ball.vX * ball.vX + ball.vY * ball.vY);
	ball.vX /= l;
	ball.vY /= l;
	ball.vX *= ball.sp;
	ball.vY *= ball.sp;
}

function getRandomDir() {
	let signX = Math.random();
	let signY = Math.random();
	ball.vX = (Math.random()) * ((signX >= 0.5) ? 1 : -1);
	ball.vY = (Math.random()) * ((signY >= 0.5) ? 1 : -1);
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

function ballHitsWall() {
    if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vY = -ball.vY;
    }
    else if (ball.y + ball.r > field.height) {
        ball.y = field.height - ball.r;
        ball.vY = -ball.vY;
    }
}

function ballHitsPaddle1() {
	if (ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height) {
		if (ball.x > paddle1.x + paddle1.width && ball.x - ball.r <= paddle1.x + paddle1.width) {
			// ball.sp *= 1.1;
			calculateBallDir(1);
		}
	}
}

function ballHitsPaddle2() {
	if (ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height) {
		if (ball.x < paddle2.x && ball.x + ball.r >= paddle2.x) {
			// ball.sp *= 1.1;
			calculateBallDir(2);
		}
	}
}

// ball out of bounds
function ballIsOut() {
	if (ball.x >= field.width)
		return (player1.score++, true);
	if (ball.x <= 0)
		return (player2.score++, true);
	return false;
}

function updateBall() {
    if (ballIsOut())
        return true;
    ballHitsWall();
    ballHitsPaddle1();
    ballHitsPaddle2();
    ball.x += ball.vX;
    ball.y += ball.vY;
    return false;
}

function updatePaddle(paddle) {
    paddle.y += paddle.vY;
    // check for collisions;
    paddle.y = ((paddle.y < 0) ? 0 : paddle.y);
    paddle.y = ((paddle.y + paddle.height > field.height) ? field.height - paddle.height : paddle.y);
}

function updateData() {
    if (updateBall()) {
        return true;
    }
    updatePaddle(paddle1);
    updatePaddle(paddle2);
    return false;
}

function handleConnection(client) {
    numClients = io.engine.clientsCount;
    if (numClients < 2) {
        player1.clientId = client.id;
        player1.connected = true;
    }
    else if (numClients == 2) {
        player2.clientId = client.id;
        player2.connected = true;
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
        if (client.id == player1.clientId) {
            // console.log(`player 1 moving up !`);
            if (player1.gameState == false && player2.gameState)
                return (player1.gameState = true, startRound());
            player1.gameState = true;
            paddle1.vY = -paddle1.sp;
        }
        else if (client.id == player2.clientId) {
            // console.log(`player 2 moving up !`);
            if (player2.gameState == false && player1.gameState)
                return (player2.gameState = true, startRound());
            player2.gameState = true;
            paddle2.vY = -paddle2.sp;
        }
    });

    client.on('moveDown', () => {
        if (client.id == player1.clientId) {
            // console.log(`player 1 moving down !`);
            if (player1.gameState == false && player2.gameState)
                return (player1.gameState = true, startRound());
            player1.gameState = true;
            paddle1.vY = paddle1.sp;
        }
        else if (client.id == player2.clientId) {
            // console.log(`player 2 moving down !`);
            if (player2.gameState == false && player1.gameState)
                return (player2.gameState = true, startRound());
            player2.gameState = true;
            paddle2.vY = paddle2.sp;
        }
    });

    client.on('stop', () => {
        if (client.id == player1.clientId) {
            // console.log(`player 1 stopping !`);
            paddle1.vY = 0;
        }
        else if (client.id == player2.clientId) {
            // console.log(`player 2 stopping !`);
            paddle2.vY = 0;
        }
    });

    function calculateFrame() {
        // console.log(`player 1 game state : ${player1.gameState}`);
        if (updateData()) {
            player1.gameState = false;
            player2.gameState = false;
            // clearInterval();
            initData();
        }
        // console.log("calculating frame...");
        client.emit('render', data);
    }

    function startRound() {
        console.log("startRound");
        // initData();
        // getRandomDir();
        ball.vX = ((player1.score > player2.score) ? 1 : -1) * ball.sp;
        console.log(`ball stats : ${ball.vX} ${ball.vY} ${ball.sp} ${ball.originalSp}`);
        console.log(`paddles stats : ${paddle1.sp} ${paddle2.sp} ${paddle1.vY} ${paddle2.vY}`);
        // gameInterval = setInterval(calculateFrame, 10);
    }

    function manageLobby() {
        initData();
        gameInterval = setInterval(calculateFrame, 10);
    }

    manageLobby();

    // disconnect event
    client.on('disconnect', () => {
        numClients = io.engine.clientsCount;
        // initData();
        console.log(`Client disconnected with ID: ${client.id} (num clients: ${numClients})`);
    });
});

app.use(express.static('./public/remote/'));

// Start the server
server.listen(expressPort, () => {
    console.log(`Express server running on port ${expressPort}`);
});
