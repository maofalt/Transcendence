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

// connect to socket server
const socket = io(`http://10.24.1.2:3000`);

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

socket.on('pong', () => {
	console.log("pong received !, emitting ping...");
	socket.emit('ping');
});

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

/*
TO DO :

*/

