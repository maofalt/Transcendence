const settings = require('./gameSettings');

// Player class
class Player {
    constructor(playerSettings) {
        this.login = playerSettings.login;
        this.id = playerSettings.id;
        this.socket = playerSettings.socket;
        this.clientId = playerSettings.clientId;
        this.color = playerSettings.color;
        this.paddle = new Paddle(playerSettings.paddle);
        this.score = playerSettings.score;
        this.connected = playerSettings.connected;
        this.gameState = playerSettings.gameState;
        this.roundState = playerSettings.roundState;
    }
}

// Paddle class
class Paddle {
    constructor(paddleSettings) {
		this.pos = new Vector(paddleSettings.x, paddleSettings.y, 0);
		this.dir = new Vector(paddleSettings.vX, paddleSettings.vY, 0);
        this.width = paddleSettings.width;
        this.height = paddleSettings.height;
        this.sp = paddleSettings.sp;
        this.color = paddleSettings.color;
    }
}

// Ball class
class Ball {
    constructor(ballSettings) {
        this.pos = new Vector(ballSettings.x, ballSettings.y, 0);
		this.dir = new Vector(ballSettings.vX, ballSettings.vY, 0);
        this.r = ballSettings.r;
        this.sp = ballSettings.sp;
        this.color = ballSettings.color;
    }
}

// Field class
class Field {
    constructor(fieldSettings) {
        this.height = fieldSettings.height;
        this.width = fieldSettings.width;
    }
}

// Score class
class Score {
    constructor(scoreSettings) {
        this.color = scoreSettings.color;
        this.fontsize = scoreSettings.fontsize;
        this.font = scoreSettings.font;
    }
}

// Data class
class Data {
    constructor(dataSettings) {
        this.field = new Field(dataSettings.field);
        this.ball = new Ball(dataSettings.ball);
        this.paddle1 = new Paddle(dataSettings.paddle1);
        this.paddle2 = new Paddle(dataSettings.paddle2);
        this.player1 = new Player(dataSettings.player1);
        this.player2 = new Player(dataSettings.player2);
        this.score = new Score(dataSettings.score);
    }
}

// Creating an instance of the Data class
const data = new Data(settings);

module.exports = data;