// const settings = require('./lobbySettings');

// Field class
class Field {
    constructor(fieldData) {
        this.goalsSize = fieldData.sizeOfGoals;
        this.wallsSize = fieldData.sizeOfGoals * fieldData.wallsFactor;
    }
}

// Player class
class Player {
    constructor(lobbyData, i) {
        this.login = lobbyData[i].login;
        this.ID = i;
        this.accountID =lobbyData[i].accountID;
        this.color = lobbyData[i].color;
        this.score = 0;
        this.paddle = new Paddle(lobbyData, i);
        // this.socket = playerSettings.socket;
    }
}

// Paddle class
class Paddle {
    constructor(lobbyData) {
		this.pos = new Vector(0, 0, 0);
		this.dirToCenter = new Vector(0, 0, 0);
        this.dirToTop = new Vector(0, 0, 0);
        this.w = lobbyData.paddlesData.width;
        this.h = lobbyData.paddlesData.height;
        this.sp = lobbyData.paddlesData.speed;
        this.col = lobbyData.paddlesData.color;
    }
}

// Ball class
class Ball {
    constructor(ballData) {
        this.pos = new Vector(0, 0, 0);
		this.dir = new Vector(0, 0, 0);
        this.r = ballData.r;
        this.sp = ballData.sp;
        this.color = ballData.color;
    }
}

// Data class
class Data {
    constructor(lobbyData) {
        this.field = new Field(lobbyData.fieldData);
        this.players = [];
        for (let i=0; i<lobbyData.nbrOfPlayers; i++) {
            this.players.push(new Player(lobbyData, i));
        }
        this.ball = new Ball(lobbyData.ballData);
    }
}

// Creating an instance of the Data class
// const data = new Data(settings);

module.exports = { Data };