const objectsClasses = require('./gameObjectsClasses');
const debugDisp = require('./debugDisplay');
const { Vector } = require('./vectors');

function initLoop(data, wallDist, goalDist, angle) {
    let startingAngle = -Math.PI/2; // the angle of the first player, each other player will be based on this, with the angle var as a step
    let center = new Vector(0, 0, 0); // just for the code to be clearer

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {

        data.players[i].paddle.angle = startingAngle + angle * i; // player current angle

        // get rid of imprecisions to avoid multiplying by very small values in the positions calculations
        // and end up with too big a number that could also be interpreted as 'Infinity';
        let mCos = Math.cos(data.players[i].paddle.angle);
        mCos = Math.abs(mCos) < 0.000001 ? 0 : mCos;
        let mSin = Math.sin(data.players[i].paddle.angle);
        mSin = Math.abs(mSin) < 0.000001 ? 0 : mSin;

        // set up the players paddles positions :
        data.players[i].paddle.pos.x = (goalDist - data.players[i].paddle.w * 2) * mCos;
        data.players[i].paddle.pos.y = (goalDist - data.players[i].paddle.w * 2) * mSin;
        data.players[i].paddle.startingPos = data.players[i].paddle.pos;
        
        // setup the players paddles vectors :
        data.players[i].paddle.dirToCenter = center.getDirFrom(data.players[i].paddle.pos).normalize();
        data.players[i].paddle.dirToTop = data.players[i].paddle.dirToCenter.rotateAroundZ(-Math.PI / 2);
        // data.players[i].paddle.dirToCenter = something; // need to add the other direction vector but will check out best formula for this

        /*--------------------------------------------------------------------------------------------*/

        data.field.walls[i].angle = startingAngle + angle / 2 + angle * i; // wall current angle

        // get rid of imprecisions to avoid multiplying by very small values in the positions calculations
        // and end up with too big a number that could also be interpreted as 'Infinity';
        mCos = Math.cos(data.field.walls[i].angle);
        mCos = Math.abs(mCos) < 0.000001 ? 0 : mCos;
        mSin = Math.sin(data.field.walls[i].angle);
        mSin = Math.abs(mSin) < 0.000001 ? 0 : mSin;

        // set up the walls positions
        data.field.walls[i].pos.x = wallDist * mCos;
        data.field.walls[i].pos.y = wallDist * mSin;

        // set up the walls vectors
        data.field.walls[i].dirToCenter = center.getDirFrom(data.field.walls[i].pos).normalize();
        data.field.walls[i].dirToTop = data.field.walls[i].dirToCenter.rotateAroundZ(-Math.PI / 2);
        // data.players[i].paddle.dirToCenter = something; // need to add the other direction vector but will check out best formula for this
    }
}

function initWalls(data) {
    let wall = 0;

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        wall = data.field.walls[i];
        wall.top = wall.pos.add(wall.dirToTop.scale(wall.h / 2));
        wall.top = wall.top.add(wall.dirToCenter.scale(wall.w / 2));
        wall.bottom = wall.pos.add(wall.dirToTop.scale(-wall.h / 2));
        wall.bottom = wall.bottom.add(wall.dirToCenter.scale(wall.w / 2));
        wall.topBack = wall.top.add(wall.dirToCenter.scale(-wall.w));
        wall.bottomBack = wall.bottom.add(wall.dirToCenter.scale(-wall.w));
    }
}

function initPaddles(data) {
    let paddle = 0;

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        paddle = data.players[i].paddle;
        paddle.top = paddle.pos.add(paddle.dirToTop.scale(paddle.h / 2));
        paddle.top = paddle.top.add(paddle.dirToCenter.scale(paddle.w / 2));
        paddle.bottom = paddle.pos.add(paddle.dirToTop.scale(-paddle.h / 2));
        paddle.bottom = paddle.bottom.add(paddle.dirToCenter.scale(paddle.w / 2));
        paddle.topBack = paddle.top.add(paddle.dirToCenter.scale(-paddle.w));
        paddle.bottomBack = paddle.bottom.add(paddle.dirToCenter.scale(-paddle.w));
    }
}

function initFieldShape(data) {
    let angle = 2 * Math.PI/data.gamemode.nbrOfPlayers; // angle between two players fields or positions
    let a = angle / 2; // saving calculations for pythagore

    let gs = data.field.goalsSize / 2; // saving calculations for pythagore
    let ws = data.field.wallsSize / 2; // same

    let wallDist = gs / Math.sin(a) + ws / Math.tan(a); // pythagore to find the dist the walls have to be from the center
    let goalDist = gs / Math.tan(a) + ws / Math.sin(a); // same but for goals;

    data.camera.pos.z = wallDist < goalDist ? (goalDist * 3) : (wallDist * 3);

    initLoop(data, wallDist, goalDist, angle); // looping through the players array and the walls array to init their pos and dir;
    initWalls(data);
    initPaddles(data);
}

function initLobby(lobbyData) {
    let data = new objectsClasses.Data(lobbyData);

    debugDisp.displayData(data); // display the game data
    initFieldShape(data); // init angles + positions of players and walls;
    debugDisp.displayData(data); // display the game data
    return data;
}

module.exports = { initLobby };