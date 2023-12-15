// console.log("c parti");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

console.log("testtest");

// objects : paddles and ball
const ball = {
	x: canvas.width / 2,
	y: 50,
	vX: 1,
	vY: 1,
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
	sp: 6,
	color: "#0000FF"
}

const paddle2 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 15,
	height: 70,
	sp: 6,
	color: "#FF0000"
}

paddle1.x = paddle1.width;
paddle1.y = (canvas.height - paddle1.height) / 2;

paddle2.x = canvas.width - (paddle2.width * 2);
paddle2.y = (canvas.height - paddle2.height) / 2;

// players
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

// vector calculations for ball dir
function normalizeBallDir() {
	l = Math.sqrt(ball.vX * ball.vX + ball.vY * ball.vY);
	ball.vX /= l;
	ball.vY /= l;
	ball.vX *= ball.sp;
	ball.vY *= ball.sp;
}

function getRandomDir() {
	let signX = Math.random();
	let signY = Math.random();
	ball.vX = (Math.random() + 1) * ((signX >= 0.5) ? 1 : -1);
	ball.vY = (Math.random() + 1) * ((signY >= 0.5) ? 1 : -1);
	normalizeBallDir();
}

// init board
function initBoard() {
	ball.x = canvas.width / 2;
	ball.y = 50;
	getRandomDir();
	paddle1.x = paddle1.width;
	paddle1.y = (canvas.height - paddle1.height) / 2;
	paddle1.vX = 0;
	paddle1.vY = 0;
	paddle2.x = canvas.width - (paddle2.width * 2);
	paddle2.y = (canvas.height - paddle2.height) / 2;
	paddle2.vX = 0;
	paddle2.vY = 0;
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

function calculateBallDir(paddleNbr) {
	let contactX = paddle1.x + paddle1.width;
	let contactY = ball.y;
	let paddleCenterX = paddle1.x;
	let paddleCenterY = paddle1.y + paddle1.height / 2;

	if (paddleNbr == 2) {
		contactX = paddle2.x;
		contactY = ball.y;
		paddleCenterX = paddle2.x + paddle2.width;
		paddleCenterY = paddle2.y + paddle2.height / 2;
	}

	let l = 0;

	ball.vX = contactX - paddleCenterX;
	ball.vY = contactY - paddleCenterY;
	normalizeBallDir();
}

function ballHitsWall() {
	if (ball.y + ball.r >= canvas.height || ball.y - ball.r <= 0)
		ball.vY *= -1;
}

function ballHitsPaddle1() {
	if (ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height) {
		if (ball.x > paddle1.x + paddle1.width && ball.x - ball.r <= paddle1.x + paddle1.width) {
			calculateBallDir(1);
		}
	}
}

function ballHitsPaddle2() {
	if (ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height) {
		if (ball.x < paddle2.x && ball.x + ball.r >= paddle2.x) {
			ball.vX *= -1;
			calculateBallDir(2);
		}
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
		// startRound();
	}
	ballHitsWall();
	ballHitsPaddle1();
	ballHitsPaddle2();
	ball.x += ball.vX;
	ball.y += ball.vY;
	// console.log("update ball over");
	return false;
}

function updatePaddle(paddle) {
	paddle.x += paddle.vX;
	paddle.y += paddle.vY;
}

// controlling paddles
function handleKeyPress(event) {
	switch (event.key) {
		case "ArrowUp":
			console.log("up");
			paddle2.vY = -2;
			break;
		case "ArrowDown":
			console.log("down");
			paddle2.vY = 2;
			break;
		case "w":
			console.log("w");
			paddle1.vY = -2;
			break;
		case "s":
			console.log("s");
			paddle1.vY = 2;
			break;
	}
}

function handleKeyRelease(event) {
	switch (event.key) {
		case "ArrowUp":
		case "ArrowDown":
			paddle2.vY = 0;
			break;
		case "w":
		case "s":
			paddle1.vY = 0;
			break;
	}
}

// starting round
// function startRound() {
// 	ball.vX *= ball.sp;
// 	ball.vY *= ball.sp;
// }

//rendering frame
function renderFrame() {
	if (updateBall())
		return (initBoard(), clearInterval(gameInterval), endGame(), 1);
	updatePaddle(paddle1);
	updatePaddle(paddle2);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBall();
	drawPaddle(player1.paddle);
	drawPaddle(player2.paddle);
}

function endGame() {
	console.log("Game Over!");
	console.log(`Player 1 Score: ${player1.score}`);
	console.log(`Player 2 Score: ${player2.score}`);
}

document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", handleKeyRelease);

// function run() {
	initBoard();
	let gameInterval = setInterval(renderFrame, 10);
// }

// run();

/*
TO DO :
	- add score board;
	- add proper collisions i guess;
	- add proper touches with paddle;
	- add retry option ? infinite loop;
*/

