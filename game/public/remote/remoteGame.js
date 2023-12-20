var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// global vars
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

// paddle1.x = paddle1.width;
// paddle1.y = (canvas.height - paddle1.height) / 2;

// paddle2.x = canvas.width - (paddle2.width * 2);
// paddle2.y = (canvas.height - paddle2.height) / 2;

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

// update data
function updateData(data) {
	ball = data.ball;
	paddle1 = data.paddle1;
	paddle2 = data.paddle2;
	player1.score = data.player1.score;
	player2.score = data.player2.score;
}

// draw objects
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

function drawLine() {
	ctx.strokeStyle = score.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawScore() {
	const fontsize = 50;
	ctx.font = score.font;
	ctx.fillStyle = score.color;
	ctx.textAlign = "center";
	ctx.fillText(`${player1.score}`, canvas.width / 2 - fontsize, fontsize);
	ctx.fillText(`${player2.score}`, canvas.width / 2 + fontsize, fontsize);
	drawLine();
}

// render
function renderFrame(data) {
	updateData(data);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBall();
	drawPaddle(data.paddle1);
	drawPaddle(data.paddle2);
	drawScore();
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
const socket = io(`http://localhost:3000`);

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

