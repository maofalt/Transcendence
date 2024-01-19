// const settings = require('./lobbySettings');

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
    constructor(lobbyData) {
        this.pos = new Vector(0, 0, 0);
		this.dirToCenter = new Vector(0, 0, 0); // direction from the center of the object to the center of the field;
        this.dirToTop = new Vector(0, 0, 0); // direction from the center of the object to the top side of the object
                                             // (perpendicular to dirToCenter, on the x,y plane); (*)
        this.w = lobbyData.paddlesData.width;
        this.h = lobbyData.paddlesData.height;
        this.col = "0xffffff";
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
		this.dirToCenter = new Vector(0, 0, 0); // dirToCenter and dirToTop = same def as in Wall Class (*)
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
		this.dir = new Vector(0, 0, 0); // dir in which the ball is moving (*)
        this.r = ballData.r;
        this.sp = ballData.sp;
        this.color = ballData.color;
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
        // create field + ball objects
        this.field = new Field(lobbyData.fieldData);
        this.ball = new Ball(lobbyData.ballData);

        // create and fill the array of players
        this.players = [];
        for (let i=0; i<lobbyData.nbrOfPlayers; i++) {
            this.players.push(new Player(lobbyData, i));
        }

        // create walls & fill the array of walls
        for (let i=0; i<lobbyData.nbrOfPlayers; i++) {
            this.field.walls.push(new Wall(lobbyData));
        }
    }
}

// Creating an instance of the Data class
// const data = new Data(settings);

module.exports = { Data };