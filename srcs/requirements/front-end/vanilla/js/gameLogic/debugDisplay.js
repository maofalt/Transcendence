function displayPlayer(playerData) {
    // console.log(`
	--------------------------------------------------------------------
	- unique account ID :...................................[ ${playerData.accountID} ]
	- socket ID :...........................................[ ${playerData.socketID} ]
	- lobby ID (its position in the array of players) :.....[ ${playerData.ID} ]
	- login :...............................................[ ${playerData.login} ]
	- color :...............................................[ ${playerData.color} ]
	- score :...............................................[ ${playerData.score} ]
	- paddle info :
		- position :....................................[ ${playerData.paddle.pos.x}, ${playerData.paddle.pos.y}, ${playerData.paddle.pos.z} ]
		- dir to center :...............................[ ${playerData.paddle.dirToCenter.x}, ${playerData.paddle.dirToCenter.y}, ${playerData.paddle.dirToCenter.z} ]
		- dir to top :..................................[ ${playerData.paddle.dirToTop.x}, ${playerData.paddle.dirToTop.y}, ${playerData.paddle.dirToTop.z} ]
		- width :.......................................[ ${playerData.paddle.w} ]
		- height :......................................[ ${playerData.paddle.h} ]
		- speed :.......................................[ ${playerData.paddle.sp} ]
`);
}

function displayWall(wallData, i) {
    // console.log(`
	------- n◦${i} ---------------------------------------------------------
	- position :....................................[ ${wallData.pos.x}, ${wallData.pos.y}, ${wallData.pos.z} ]
		- dir to center :...............................[ ${wallData.dirToCenter.x}, ${wallData.dirToCenter.y}, ${wallData.dirToCenter.z} ]
		- dir to top :..................................[ ${wallData.dirToTop.x}, ${wallData.dirToTop.y}, ${wallData.dirToTop.z} ]
		- width :.......................................[ ${wallData.w} ]
		- height :......................................[ ${wallData.h} ]
		- color :.......................................[ ${wallData.col} ]
`);
}

function displayData(data) {
    // console.log(`
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
	- color :...............................................[ ${data.ball.col} ]

======== players : =========================================================`);

	Object.values(data.players).forEach((player) => {
		displayPlayer(player);
	});

	// console.log("======== walls : ==========================================================");

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        displayWall(data.field.walls[i], i);
    }

	// console.log(`============================================================================
`);
}

// module.exports = { displayData };
export default displayData;