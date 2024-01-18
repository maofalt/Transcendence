// Lobby Settings, used to initialize the lobby, and to reset objects at the start of each round;

const   gamemodeSettings = {
    nbrOfPlayers: 3, // from 2 to 8 - 10 ?
    nbrOfRounds: 5, // from 1 to 10
    timeLimit: 0, // in minutes, from 1 to 30. anything under 1 == no time limit;
    // IMPORTANT : game needs either a time limit or a nbr of rounds; if none = invalid setup.
    // This should be taken care of before calling this app.
}

const   fieldSettings = {
    wallsFactor: 1, // by how much we multiply the goals size to get the walls size; from 0 to 2 (0 == no walls)
    sizeOfGoals: 10, // arbitrary max, minumum needs to be calculated tho;
}

const paddlesSettings = {
    speed: 2,
    size: 10,
}

const ballSettings = {
    speed: 4,
    radius: 2,
    color: "ffffff",
}

const playerSettings = {
    login: "player",
    ID: 0,
    accountID: 0,
    color: "0000ff",
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