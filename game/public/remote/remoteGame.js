var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// draw objects
function drawBall(ball) {
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

// function drawText(text, color, y) {
// 	ctx.font = score.font;
// 	ctx.fillStyle = color;
// 	ctx.textAlign = "center";
// 	ctx.fillText(text, canvas.width / 2, y);
// }

function drawLine(data) {
	ctx.strokeStyle = data.score.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawScore(data) {
	const fontsize = 50;
	ctx.font = data.score.font;
	ctx.fillStyle = data.score.color;
	ctx.textAlign = "center";
	ctx.fillText(`${data.player1.score}`, canvas.width / 2 - fontsize, fontsize);
	ctx.fillText(`${data.player2.score}`, canvas.width / 2 + fontsize, fontsize);
	drawLine(data);
}

// render
function renderFrame(data) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBall(data.ball);
	drawPaddle(data.paddle1);
	drawPaddle(data.paddle2);
	drawScore(data);
}

// input events : controlling paddles
function handleKeyPress(event) {
	if (event.key == "w")
		socket.emit('moveUp');
	if (event.key == "s")
		socket.emit('moveDown');
}

function handleKeyRelease(event) {
	if (event.key == "w" || event.key == "s")
		socket.emit('stop');
}

function clickCanvas() {
    socket.emit('clickedCanvas');
}

document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", handleKeyRelease);
canvas.addEventListener("click", clickCanvas);

// connect to socket server
const socket = io(`http://10.24.107.3:3000`);

// Listen for the 'connect' event, which is triggered when the connection is established
socket.on('connect', () => {
	console.log('Connected to Socket.IO server');
});

// Listen for the 'disconnect' event, triggered when the connection is lost
socket.on('disconnect', () => {
	console.log('Disconnected from Socket.IO server');
});

// socket.on('clientId', (clientId, clientNum) => {
// 	console.log(`Client unique ID: ${clientId}, client nbr: ${clientNum}`);
// 	if (player1.id == 0)
// 		player1.id = clientId;
// 	else if (player2.id == 0)
// 		player2.id = clientId;
// });

socket.on('render', (data) => {
	renderFrame(data);
});

socket.on('pong', () => {
	console.log("pong received !, emitting ping...");
	socket.emit('ping');
});

/*
TO DO :

*/

