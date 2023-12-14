// console.log("c parti");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

console.log("testtest");

// objects : paddles and ball
const ball = {
	x: canvas.width / 2,
	y: 50,
	spX: 2,
	spY: 2,
	r: 10,
	color: "#FFFFFF"
};

const paddle1 = {
	x: 0,
	y: 0,
	spX: 0,
	spY: 0,
	width: 20,
	height: 70,
	color: "#0000FF"
}

const paddle2 = {
	x: 0,
	y: 0,
	spX: 0,
	spY: 0,
	width: 20,
	height: 70,
	color: "#FF0000"
}

paddle1.x = paddle1.width;
paddle1.y = (canvas.height - paddle1.height) / 2;

paddle2.x = canvas.width - (paddle2.width * 2);
paddle2.y = (canvas.height - paddle2.height) / 2;

const player1 = {
	login: "Player 1",
	paddle: paddle1,
	score: 0,
}

const player2 = {
	login: "Player 2",
	paddle: paddle2,
	score: 0
}

// init board
function initBoard() {
	ball.x = canvas.width / 2;
	ball.y = 50;
	ball.spX = 2;
	ball.spY = 2;
	paddle1.x = paddle1.width;
	paddle1.y = (canvas.height - paddle1.height) / 2;
	paddle1.spX = 0;
	paddle1.spY = 0;
	paddle2.x = canvas.width - (paddle2.width * 2);
	paddle2.y = (canvas.height - paddle2.height) / 2;
	paddle2.spX = 0;
	paddle2.spY = 0;
}

// drawing objects
function drawBall() {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
	ctx.fillStyle = ball.color;
	ctx.fill();
	ctx.closePath();
}

function drawPaddle(paddle) {
	ctx.beginPath();
	ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
	ctx.fillStyle = paddle.color;
	ctx.fill();
	ctx.closePath();
}

// collisions
function ballHitsWall() {
	if (ball.y + ball.r >= canvas.height || ball.y - ball.r <= 0)
		ball.spY *= -1;
}

function ballHitsPaddle1() {
	if (ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height && 
		(ball.x - ball.r <= paddle1.x + paddle1.width)) {
		ball.spX *= -1;
		ball.spY += paddle1.spY;
	}
}

function ballHitsPaddle2() {
	if (ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height && 
		(ball.x + ball.r >= paddle2.x)) {
		ball.spX *= -1;
		ball.spY += paddle2.spY;
	}
}

function ballIsOut() {
	if (ball.x >= canvas.width)
		return (player1.score++, true);
	if (ball.x <= 0)
		return (player2.score++, true);
	return false;
}

// updating objects
function updateBall() {
	if (ballIsOut()) {
		if (player1.score >= 10 || player2.score >= 10)
			return true;
		initBoard();
		startRound();
	}
	ballHitsWall();
	ballHitsPaddle1();
	ballHitsPaddle2();
	ball.x += ball.spX;
	ball.y += ball.spY;
	return false;
}

function updatePaddle(paddle) {
	paddle.x += paddle.spX;
	paddle.y += paddle.spY;
}

// controlling paddles
function handleKeyPress(event) {
	switch (event.key) {
		case "ArrowUp":
			console.log("up");
			paddle2.spY = -2;
			break;
		case "ArrowDown":
			console.log("down");
			paddle2.spY = 2;
			break;
		case "w":
			console.log("w");
			paddle1.spY = -2;
			break;
		case "s":
			console.log("s");
			paddle1.spY = 2;
			break;
	}
}

function handleKeyRelease(event) {
	switch (event.key) {
		case "ArrowUp":
		case "ArrowDown":
			paddle2.spY = 0;
			break;
		case "w":
		case "s":
			paddle1.spY = 0;
			break;
	}
}

// starting round
function startRound() {
	ball.spX = 2;
	ball.spY = 2;
}

//rendering frame
function renderFrame() {
	if (updateBall())
		return (initBoard(), clearInterval(gameInterval), endGame(), 1);
	updatePaddle(paddle1);
	updatePaddle(paddle2);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPaddle(player1.paddle);
	drawPaddle(player2.paddle);
	drawBall();
}

function endGame() {
	console.log("Game Over!");
	console.log(`Player 1 Score: ${player1.score}`);
	console.log(`Player 2 Score: ${player2.score}`);
}

document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", handleKeyRelease);

initBoard();
startRound();
let gameInterval = setInterval(renderFrame, 10);