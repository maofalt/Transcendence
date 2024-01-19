const objectsClasses = require('./gameObjectsClasses');
const debugDisp = require('./debugDisplay');
const { Vector } = require('./vectors');

function initLoop(data, wallDist, goalDist, angle) {
    let startingAngle = -Math.PI/2; // the angle of the first player, each other player will be based on this, with the angle var as a step
    let center = new Vector(0, 0, 0); // just for the code to be clearer
    let currAngle = 0; // angle buffer to save calculations

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {

        currAngle = startingAngle + angle * i; // player current angle
        
        // set up the players paddles positions :
        data.players[i].paddle.pos.x = (goalDist - data.players[i].paddle.w * 2) * Math.cos(currAngle);
        data.players[i].paddle.pos.y = (goalDist - data.players[i].paddle.w * 2) * Math.sin(currAngle);
        
        // setup the players paddles vectors :
        data.players[i].paddle.dirToCenter = data.players[i].paddle.pos.getDirTo(center);
        // data.players[i].paddle.dirToCenter = something; // need to add the other direction vector but will check out best formula for this

        /*--------------------------------------------------------------------------------------------*/

        currAngle = startingAngle + angle / 2 + angle * i; // wall current angle

        // set up the walls positions
        data.field.walls[i].pos.x = wallDist * Math.cos(currAngle);
        data.field.walls[i].pos.y = wallDist * Math.sin(currAngle);

        // set up the walls vectors
        data.field.walls[i].dirToCenter = data.field.walls[i].pos.getDirTo(center);
        // data.players[i].paddle.dirToCenter = something; // need to add the other direction vector but will check out best formula for this
    }
}

function initFieldShape(data) {
    let angle = 2 * Math.PI/data.gamemode.nbrOfPlayers; // angle between two players fields or positions
    let a = angle / 2; // saving calculations for pythagore

    let gs = data.field.goalsSize / 2; // saving calculations for pythagore
    let ws = data.field.wallsSize / 2; // same

    let wallDist = gs / Math.sin(a) + ws / Math.tan(a); // pythagore to find the dist the walls have to be from the center
    let goalDist = gs / Math.tan(a) + ws / Math.sin(a); // same but for goals;

    initLoop(data, wallDist, goalDist, angle); // looping through the players array and the walls array to init their pos and dir;
}

function initLobby(lobbyData) {
    let data = new objectsClasses.Data(lobbyData);

    debugDisp.displayData(data); // display the game data

    initFieldShape(data); // init angles + positions of players and walls;

    debugDisp.displayData(data); // display the game data

    return data;
}

module.exports = { initLobby };