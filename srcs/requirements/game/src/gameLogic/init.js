const objectsClasses = require('./gameObjectsClasses');
const debugDisp = require('./debugDisplay')

function initFieldShape(data) {
    let angle = 2 * Math.PI/data.gamemode.nbrOfPlayers;
    let a = angle / 2;
    let gs = data.field.goalsSize / 2;
    let ws = data.field.wallsSize / 2;

    let wallDist = gs / Math.sin(a) + ws / Math.tan(a);
    let goalDist = gs / Math.tan(a) + ws / Math.sin(a);

    let startingAngle = -Math.PI/2;

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        // setting up the players positions
        data.players[i].paddle.pos.x = (goalDist - data.players[i].paddle.w * 2) * Math.cos(startingAngle + angle * i);
        data.players[i].paddle.pos.y = (goalDist - data.players[i].paddle.w * 2) * Math.sin(startingAngle + angle * i);

        // setting up the walls positions
        data.field.walls[i].pos.x = wallDist * Math.cos(startingAngle + angle / 2 + angle * i);
        data.field.walls[i].pos.y = wallDist * Math.sin(startingAngle + angle / 2 + angle * i);
    }
}

function initLobby(lobbyData) {
    let data = new objectsClasses.Data(lobbyData);

    debugDisp.displayData(data);

    // init angles + positions of players;
    initFieldShape(data);

    // init camera pos according to those;
    // 
    debugDisp.displayData(data);

    return data;
}

module.exports = { initLobby };