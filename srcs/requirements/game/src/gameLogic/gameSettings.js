// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
// let gameState = false;

// board :
const field = {
    height: 30,
    width: 50,
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
	sp: 0.2,
	color: "#FFFFFF"
};

const paddles = {
	width: 2,
	height: 10,
	sp: 0
}

const paddle1 = {
	x: 10,
	y: 0,
	vX: 0,
	vY: 0,
	color: "#0000FF"
}

const paddle2 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
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
    clientId: 0,
    color: "",
	paddle: paddle2,
	score: 0,
    connected: false,
    gameState: false,
    roundState: false,
}
