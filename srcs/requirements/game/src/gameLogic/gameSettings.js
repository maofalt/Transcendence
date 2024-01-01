// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
// let gameState = false;

// board :
const field = {
	height: 50,
	width: 85,
}

const game = {
	nbrOfWinningPoints: 10,
}

// objects : paddles and ball
const ball = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	r: 2,
	sp: 0.4,
	color: "#FFFFFF"
};

const paddles = {
	width: 2,
	height: 18,
	sp: 0.2,
}

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

module.exports = { field, game, ball, paddles, paddle1, paddle2, score, player1, player2 };
