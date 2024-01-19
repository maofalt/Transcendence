// const settings = require('./lobbySettings');
const vecs = require('./vectors');

class Camera {
    constructor() {
        this.pos = new vecs.Vector(0, 0, 50);   // this can change (even during the game) depending on the number
                                                // of players and size of field

        this.target = new vecs.Vector(0, 0, 0); // this is fixed
        // The rotation of the camera will be determined by the cliend, according to the ID of the player.
        // It will also depend on user preferences : vertical view or horizontal view;
    }
}

// Field class
class Field {
    constructor(fieldData) {
        this.goalsSize = fieldData.sizeOfGoals;
        this.wallsSize = fieldData.sizeOfGoals * fieldData.wallsFactor;
        this.walls = [];
    }
}

// Wall class
class Wall {
    constructor(lobbyData, wallSize) {
        this.pos = new vecs.Vector(0, 0, 0);
		this.dirToCenter = new vecs.Vector(0, 0, 0); // direction from the center of the object to the center of the field;
        this.dirToTop = new vecs.Vector(0, 0, 0); // direction from the center of the object to the top side of the object
                                             // (perpendicular to dirToCenter, on the x,y plane); (*)
        this.w = lobbyData.paddlesData.width;
        this.h = wallSize;
        this.col = "0xffffff";
    }
}

// Player class
class Player {
    constructor(lobbyData, i) {
        this.login = lobbyData.playersData[i].login + `_${i}`;
        this.ID = i;
        this.socketID = -1;
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
		this.dirToCenter = new vecs.Vector(0, 0, 0); // dirToCenter and dirToTop = same def as in Wall Class (*)
        this.dirToTop = new vecs.Vector(0, 0, 0);
        this.w = lobbyData.paddlesData.width;
        this.h = lobbyData.paddlesData.height;
        this.sp = lobbyData.paddlesData.speed;
        this.col = lobbyData.playersData[i].color;
    }
}

// Ball class
class Ball {
    constructor(ballData) {
        this.pos = new vecs.Vector(0, 0, 0);
		this.dir = new vecs.Vector(0, 0, 0); // direction in which the ball is moving
        this.lastHit = -1; // ID of the last player who hit the ball
                           // Will be useful in gamemodes with more than 2 players where we want to give points to
                           // the right player.
        this.r = ballData.radius;
        this.sp = ballData.speed;
        this.col = ballData.color;
    }
}

// *** :  All the vectors in the game are (for now at least) in the x,y plane, and therefore they have no z component;
//      or to be more precise, a z component of 0. Vectors require a z component since in the client part we use threeJS,
//      but all calculations are still performed in 2D.
//      3D is only a visual effect and a design choice, and I have chosen to implement the z here in order to not think
//      about it in the client and just transfer the values.
//      Another possibility could have been to just put 0 for z everywhere in the client, maybe it would
//      save calculations here. We will see.

// Data class
class Data {
    constructor(lobbyData) {
        // get the gamemode info from the lobby data;
        this.gamemode = lobbyData.gamemodeData;

        // create camera + field + ball objects
        this.camera = new Camera();
        this.field = new Field(lobbyData.fieldData);
        this.ball = new Ball(lobbyData.ballData);

        // create and fill the array of players
        this.players = [];
        for (let i=0; i<lobbyData.gamemodeData.nbrOfPlayers; i++) {
            this.players.push(new Player(lobbyData, i));
        }

        // create walls & fill the array of walls
        for (let i=0; i<lobbyData.gamemodeData.nbrOfPlayers; i++) {
            this.field.walls.push(new Wall(lobbyData, this.field.wallsSize));
        }
    }
}

// Creating an instance of the Data class
// const data = new Data(settings);

module.exports = { Data };