const	settings = require('./gameSettings');

// global vars
let numClients = 0;
let gameInterval = 0;
let roundState = false;
// let gameState = false;

// board :
const field = {
	height: settings.field.height,
	width: settings.field.width,
}

// objects : paddles and ball
const ball = {
	x: settings.ball.x,
	y: settings.ball.y,
	vX: settings.ball.vX,
	vY: settings.ball.vY,
	r: settings.ball.r,
	sp: settings.ball.sp,
	color: settings.ball.color,
};

const paddle1 = {
	x: settings.paddle1.x,
	y: settings.paddle1.y,
	vX: settings.paddle1.vX,
	vY: settings.paddle1.vY,
	width: settings.paddles.width,
	height: settings.paddles.height,
	sp: settings.paddles.sp,
	color: settings.paddle1.color
}

const paddle2 = {
	x: settings.paddle2.x,
	y: settings.paddle2.y,
	vX: settings.paddle2.vX,
	vY: settings.paddle2.vY,
	width: settings.paddles.width,
	height: settings.paddles.height,
	sp: settings.paddles.sp,
	color: settings.paddle2.color
}

// players + score
const score = {
	color: settings.score.color,
	fontsize: settings.score.fontsize,
	font: settings.score.font,
}

const player1 = {
	login: settings.player1.login,
	id: settings.player1.id,
	socket: settings.player1.socket,
	clientId: settings.player1.clientId,
	color: settings.player1.color,
	paddle: settings.player1.paddle,
	score: settings.player1.score,
	connected: settings.player1.connected,
	gameState: settings.player1.gameState,
	roundState: settings.player1.roundState,
}

const player2 = {
	login: settings.player2.login,
	id: settings.player2.id,
	socket: settings.player1.socket,
	clientId: settings.player2.clientId,
	color: settings.player2.color,
	paddle: settings.player2.paddle,
	score: settings.player2.score,
	connected: settings.player2.connected,
	gameState: settings.player2.gameState,
	roundState: settings.player2.roundState,
}

const data = {
	field: field,
	ball: ball,
	paddle1: paddle1,
	paddle2: paddle2,
	player1: player1,
	player2: player2,
	score: score,
}

module.exports = { field, ball, paddle1, paddle2, score, player1, player2, data };