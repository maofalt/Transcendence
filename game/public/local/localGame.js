var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

console.log("testtest");

const ball = {
	x: canvas.width / 2,
	y: 50,
	spX: 2,
	spY: 2,
	radius: 5,
	color: "FFFFFF"
};

function drawBall() {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.closePath();
}

function ballHitsWall() {
	if (ball.x >= canvas.width || ball.x <= 0)
		ball.spX *= -1;
	if (ball.y >= canvas.height || ball.y <= 0)
		ball.spY *= -1;
}

function updateBall() {
	ballHitsWall();
	ball.x += ball.spX;
	ball.y += ball.spY;
}

function renderFrame() {
	updateBall();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBall();
}

setInterval(renderFrame, 10);