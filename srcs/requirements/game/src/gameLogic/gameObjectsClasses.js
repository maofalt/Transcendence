// const settings = require('./lobbySettings');
const vecs = require('./vectors');

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
        this.login = lobbyData.playersData[i].login + `_${i}`;
        this.ID = i;
        this.accountID =lobbyData.playersData[i].accountID;
        this.color = lobbyData.playersData[i].color;
        this.score = 0;
        this.paddle = new Paddle(lobbyData, i);
        // this.socket = playerSettings.socket;
    }
}

// Paddle class
class Paddle {
    constructor(lobbyData, i) {
		this.pos = new vecs.Vector(0, 0, 0);
		this.dirToCenter = new vecs.Vector(0, 0, 0);
        this.dirToTop = new vecs.Vector(0, 0, 0);
        this.w = 1;
        this.h = lobbyData.paddlesData.size;
        this.sp = lobbyData.paddlesData.speed;
        this.col = lobbyData.playersData[i].color;
    }
}

// Ball class
class Ball {
    constructor(ballData) {
        this.pos = new vecs.Vector(0, 0, 0);
		this.dir = new vecs.Vector(0, 0, 0);
        this.r = ballData.radius;
        this.sp = ballData.speed;
        this.col = ballData.color;
    }
}

// Data class
class Data {
    constructor(lobbyData) {
        this.gamemode = lobbyData.gamemodeData;
        this.field = new Field(lobbyData.fieldData);
        this.players = [];
        for (let i=0; i<lobbyData.gamemodeData.nbrOfPlayers; i++) {
            this.players.push(new Player(lobbyData, i));
        }
        this.ball = new Ball(lobbyData.ballData);
    }
}

// Creating an instance of the Data class
// const data = new Data(settings);

module.exports = { Data };