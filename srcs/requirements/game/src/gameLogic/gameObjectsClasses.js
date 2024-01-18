// const settings = require('./lobbySettings');
const vecs = require('./vectors');

// Field class
class Field {
    constructor(fieldData) {
        this.goalsSize = fieldData.sizeOfGoals;
        this.wallsSize = fieldData.sizeOfGoals * fieldData.wallsFactor;
    }
}

class Camera {
    constructor() {
        this.pos = new vecs.Vector(0, 0, 50);   // this can change (even during the game) depending on the number
                                                // of players and size of field

        this.target = new vecs.Vector(0, 0, 0); // this is fixed
        // The rotation of the camera will be determined by the cliend, according to the ID of the player.
        // It will also depend on user preferences : vertical view or horizontal view;
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
        this.lastHit = -1; // ID of the last player who hit the ball (-1 = no last hist = start of round)
    }
}

// Data class
class Data {
    constructor(lobbyData) {
        this.gamemode = lobbyData.gamemodeData;
        this.field = new Field(lobbyData.fieldData);
        this.camera = new Camera();
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