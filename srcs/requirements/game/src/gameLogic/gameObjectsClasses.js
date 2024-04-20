// const settings = require('./lobbySettings');
const vecs = require('./vectors');

class Camera {
    constructor() {
        this.pos = new vecs.Vector(0, 0, 50);   // this can change (even during the game) depending on the number
                                                // of players and size of field

        this.target = new vecs.Vector(0, 0, 0); // this is fixed
        // The rotation of the camera will be determined by the client, according to the ID of the player.
        // It will also depend on user preferences : vertical view or horizontal view;
    }
}

// Gamemode class
class GameMode {
    constructor(gamemodeData) {
        this.gameType = gamemodeData.gameType;
        this.nbrOfPlayers = gamemodeData.nbrOfPlayers;
        this.nbrOfRounds = gamemodeData.nbrOfRounds; // nbr of points needed to win
        this.timeLimit = gamemodeData.timeLimit; // in minutes. gamemode needs either a nbr of rounds or a time limit. if not, the game will be
                                                // infinite and therefore the setup is invalid;
                                                // also nice to have an internal maximum for the duration of a game in case one lobby stays on
                                                // so we can find a way to kill it;
    }
}

// Field class
class Field {
    constructor(fieldData) {
        this.goalsSize = fieldData.sizeOfGoals;
        this.wallsSize = fieldData.sizeOfGoals * fieldData.wallsFactor;
        this.walls = [];
        this.wallDist = 0;
        this.goalDist = 0;
        // this.goals = [];
    }
}

// Wall class
class Wall {
    constructor(lobbyData, wallSize) {
        this.pos = new vecs.Vector(0, 0, 0);
		this.dirToCenter = new vecs.Vector(0, 0, 0); // direction from the center of the object to the center of the field;
        this.dirToTop = new vecs.Vector(0, 0, 0); // direction from the center of the object to the top side of the object
                                             // (perpendicular to dirToCenter, on the x,y plane); (*)
        this.top = new vecs.Vector(0, 0, 0);
        this.bottom = new vecs.Vector(0, 0, 0);
        this.topBack = new vecs.Vector(0, 0, 0);
        this.bottomBack = new vecs.Vector(0, 0, 0);
        this.angle = 0;
        this.w = lobbyData.paddlesData.width;
        this.h = wallSize;
        this.col = 0xffffff;
    }
}

// class Goal {
//     constructor(top, bottom) {
//         this.top = top.copy();
//         this.bottom = bottom.copy();
//     }
// }

// Player class
class Player {
    constructor(lobbyData, i) {
        // this.matchID = lobbyData.playtersData[i].matchID; // ?
        this.accountID = lobbyData.playersData[i].accountID; // unique ID of the user account
        this.socketID = -1; // ID of the client/server socket
        this.ID = i; // position in the array of players in the lobby
        this.login = lobbyData.playersData[i].login; // user login
        this.connected = false; // connection status
        this.paddle = new Paddle(lobbyData, i); // creating paddle object for this player
        this.color = parseInt(lobbyData.playersData[i].color, 16);
        this.score = 0;
        this.scorePos = new vecs.Vector(0, 0, 0);
    }
}

// Paddle class
class Paddle {
    constructor(lobbyData, i) {
		this.pos = new vecs.Vector(0, 0, 0);
        this.startingPos = new vecs.Vector(0, 0, 0);
        this.dir = new vecs.Vector(0, 0, 0);
		this.dirToCenter = new vecs.Vector(0, 0, 0); // dirToCenter and dirToTop = same def as in Wall Class (*)
        this.dirToTop = new vecs.Vector(1, 0, 0);
        this.top = new vecs.Vector(0, 0, 0);
        this.bottom = new vecs.Vector(0, 0, 0);
        this.topBack = new vecs.Vector(0, 0, 0);
        this.bottomBack = new vecs.Vector(0, 0, 0);
        this.angle = 0;
        this.w = lobbyData.paddlesData.width;
        this.h = lobbyData.paddlesData.height;
        this.sp = lobbyData.paddlesData.speed;
        this.currSp = 0;
        this.col = parseInt(lobbyData.playersData[i].color, 16);
        this.dashSp = 0;
        this.dashFrameCounter = 0;
    }
}

// Ball class
class Ball {
    constructor(ballData) {
        this.pos = new vecs.Vector(0, 0, 0);
		this.dir = new vecs.Vector(0, 0, 0); // direction in which the ball is moving
        // this.lastHit = -1; // ID of the last player who hit the ball
                           // Will be useful in gamemodes with more than 2 players where we want to give points to
                           // the right player.
        // this.previousLastHit = -1;
        // this.lastScoredOn = -1;
        this.r = ballData.radius;
        this.startingSp = ballData.speed;
		this.currStartingSP = ballData.speed;
        this.sp = ballData.speed;
        this.col = parseInt(ballData.color, 16);
        this.model = ballData.model;
        this.texture = ballData.texture;
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
        this.connectedPlayers = 0;
        this.gameInterval = 0;

        this.imminent = false;
        this.ongoing = false;
        this.timeLimit = null;
        this.gameCountDown = null;
        this.countDownDisplay = null;
        this.consecutiveWallHits = 0;

        // get the gamemode info from the lobby data;
        this.gamemode = new GameMode(lobbyData.gamemodeData);

        // create camera + field + ball objects
        this.camera = new Camera();
        this.field = new Field(lobbyData.fieldData);
        this.ball = new Ball(lobbyData.ballData);
        
        // create and fill the array of players
        this.players = {};
        this.winner = 0;

		this.playersArray = [];

        for (let i=0; i<lobbyData.gamemodeData.nbrOfPlayers; i++) {
			let player = new Player(lobbyData, i);
            this.players[player.accountID] = player;
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
