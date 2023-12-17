var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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

// function mainLoop() {
// 	runGame();
// }

// mainLoop();

/*
TO DO :
	- add proper collisions i guess;

	- add score board; [DONE]
	- add proper touches with paddle; [DONE]
	- add retry option ? infinite loop; [DONE]
*/

