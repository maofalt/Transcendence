// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
// let gameState = false;

const paddles = {
	width: 1,
	height: 5,
	sp: 0.1,
}

// board :
const field = {
	paddleMin: 1,
	paddleMax: 15,
	playersMin: 2,
	playersMax: 8,
	goalMin: 0,
	goalMax: 0,
	wallMin: 0,
	wallMax: 3,
	ballMin: 0,
	ballMax: 0,
	height: 0,
	width: 0,
}
field.goalMin = field.paddleMin * 3;
field.goalMax = field.paddleMax * 10;
field.ballMin = field.paddleMin;
field.ballMax = field.paddleMax;

field.height = paddles.height * 5,
field.width = field.height * 2;

const game = {
	nbrOfWinningPoints: 10,
}

// objects : paddles and ball
const ball = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	r: paddles.width,
	sp: 0.2,
	color: "#FFFFFF"
};

const paddle1 = {
	x: -field.width / 2,
	y: 0,
	vX: 0,
	vY: 0,
	width: paddles.width,
	height: paddles.height,
	sp: paddles.sp,
	color: "#0000FF"
}

const paddle2 = {
	x: field.width / 2,
	y: 0,
	vX: 0,
	vY: 0,
	width: paddles.width,
	height: paddles.height,
	sp: paddles.sp,
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
	socket: 0,
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
	socket: 0,
	clientId: 0,
	color: "",
	paddle: paddle2,
	score: 0,
	connected: false,
	gameState: false,
	roundState: false,
}

