// Lobby Settings, used to initialize the lobby, and to reset objects at the start of each round;

const   gamemodeSettings = {
    gameType: 1,
    nbrOfPlayers: 2, // from 2 to 8 - 10 ?
    nbrOfRounds: 5, // from 1 to 10
    timeLimit: 0, // in minutes, from 1 to 30. anything under 1 == no time limit;
    // IMPORTANT : game needs either a time limit or a nbr of rounds; if none = invalid setup.
    // This should be taken care of before calling this app.
}

const   fieldSettings = {
    wallsFactor: 1, // by how much we multiply the goals size to get the walls size; from 0 to 2 (0 == no walls)
    sizeOfGoals: 20, // arbitrary max, minumum needs to be calculated tho;
}

const paddlesSettings = {
    width: 2,
    height: 12,
    speed: 0.5,
}

const ballSettings = {
    speed: 0.7,
    radius: 1,
    color: 0xffffff,
}

const playerSettings = {
    username: "username",
    color: 0x0000ff,
}

const lobbyData = {
    gamemodeData: gamemodeSettings,
    fieldData: fieldSettings,
    paddlesData: paddlesSettings,
    ballData: ballSettings,
    playersData: [],
}

function setPlayersData() {
    for (let i=0; i<lobbyData.gamemodeData.nbrOfPlayers; i++) {
        lobbyData.playersData.push(playerSettings);
    }
}

setPlayersData();

module.exports = { lobbyData };