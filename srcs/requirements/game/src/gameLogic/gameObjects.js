// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
// let gameState = false;

// board :
const field = {
    height: 0,
    width: 0,
}

// objects : paddles and ball
const ball = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	r: 0,
	sp: 0,
	originalSp: 0,
	color: ""
};

const paddle1 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 0,
	height: 0,
	sp: 0,
	color: ""
}

const paddle2 = {
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 0,
	height: 0,
	sp: 0,
	color: ""
}

// players + score
const score = {
	color: "",
	fontsize: 0,
	font: "",
}

const player1 = {
	login: "",
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
	login: "",
	id: 0,
    clientId: 0,
    color: "",
	paddle: paddle2,
	score: 0,
    connected: false,
    gameState: false,
    roundState: false,
}
