function displayPlayer(playerData) {
    console.log(`
	--------------------------------------------------------------------
	- login :...............................................[ ${playerData.login} ]
	- lobby ID (its position in the array of players) :.....[ ${playerData.ID} ]
	- unique account ID :...................................[ ${playerData.accountID} ]
	- color :...............................................[ ${playerData.color} ]
	- paddle info :
		- position :....................................[ ${playerData.paddle.pos.x}, ${playerData.paddle.pos.y}, ${playerData.paddle.pos.z} ]
		- dir to center :...............................[ ${playerData.paddle.dirToCenter.x}, ${playerData.paddle.dirToCenter.y}, ${playerData.paddle.dirToCenter.z} ]
		- dir to top :..................................[ ${playerData.paddle.dirToTop.x}, ${playerData.paddle.dirToTop.y}, ${playerData.paddle.dirToTop.z} ]
		- height :......................................[ ${playerData.paddle.h} ]
		- speed :.......................................[ ${playerData.paddle.sp} ]
`);
}

function displayData(data) {
    console.log(`
Data :
======== game mode data : ==================================================
	- nbr of players :......................................[ ${data.gamemode.nbrOfPlayers} ]
	- nbr of rounds :.......................................[ ${data.gamemode.nbrOfRounds} ]
	- time limit :..........................................[ ${data.gamemode.timeLimit} ]

======== field data : ======================================================
	- size of goals :.......................................[ ${data.field.wallsSize} ]
	- size of walls :.......................................[ ${data.field.goalsSize} ]

======== camera data : =====================================================
	- position :............................................[ ${data.camera.pos.x}, ${data.camera.pos.y}, ${data.camera.pos.z} ]
	- target :..............................................[ ${data.camera.target.x}, ${data.camera.target.y}, ${data.camera.target.z} ]

======== ball infos : ======================================================
	- position :............................................[ ${data.ball.pos.x}, ${data.ball.pos.y}, ${data.ball.pos.z} ]
	- dir :.................................................[ ${data.ball.dir.x}, ${data.ball.dir.y}, ${data.ball.dir.z} ]
	- speed :...............................................[ ${data.ball.sp} ]
	- radius :..............................................[ ${data.ball.r} ]
	- color :...............................................[ 0x${data.ball.col} ]

======== players : =========================================================`);

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        displayPlayer(data.players[i]);
    }

	console.log(`============================================================================
`);
}

module.exports = { displayData };