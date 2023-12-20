// console.log("c parti");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

console.log("testtest");

// objects : paddle and ball
const ball = {
	x: canvas.width / 2,
	y: 50,
	spX: 2,
	spY: 2,
	r: 5,
	color: "#FFFFFF"
};

const paddle = {
	x: 10,
	y: 0,
	spX: 0,
	spY: 0,
	width: 10,
	height: 50,
	color: "#FFFFFF"
}
paddle.y = (canvas.height - paddle.height) / 2;

// drawing objects
function drawBall() {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
	ctx.fillStyle = ball.color;
	ctx.fill();
	ctx.closePath();
}

function drawPaddle() {
	ctx.beginPath();
	ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
	ctx.fillStyle = paddle.color;
	ctx.fill();
	ctx.closePath();
}

// collisions
function ballHitsWall() {
	if (ball.x + ball.r >= canvas.width || ball.x - ball.r <= 0)
		ball.spX *= -1;
	if (ball.y + ball.r >= canvas.height || ball.y - ball.r <= 0)
		ball.spY *= -1;
}

function ballHitsPaddle() {
	if (ball.y >= paddle.y && ball.y <= paddle.y + paddle.height && 
		(ball.x - ball.r <= paddle.x + paddle.width))
		ball.spX *= -1;
}

// updating objects
function updateBall() {
	ballHitsWall();
	ballHitsPaddle();
	ball.x += ball.spX;
	ball.y += ball.spY;
}

//rendering frame
function renderFrame() {
	updateBall();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPaddle();
	drawBall();
}

setInterval(renderFrame, 10);