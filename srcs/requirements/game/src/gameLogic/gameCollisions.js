function ballHitsWall(ball, field) {
	if (ball.y + ball.r >= field.height / 2) {
		ball.y = field.height / 2 - ball.r;
		ball.vY = -ball.vY;
	}
	else if (ball.y - ball.r <= -field.height / 2) {
		ball.y = -field.height / 2 + ball.r;
		ball.vY = -ball.vY;
	}
}

function ballHitsPaddle1(ball, paddle1) {
	if (ball.y >= paddle1.y - paddle1.height / 2 && ball.y <= paddle1.y + paddle1.height / 2) {
		if (ball.x > paddle1.x + paddle1.width / 2 && ball.x - ball.r <= paddle1.x + paddle1.width / 2) {
			// ball.sp *= 1.1;
			// calculateBallDir(1);
			ball.vX = -ball.vX;
		}
	}
}

function ballHitsPaddle2(ball, paddle2) {
	if (ball.y >= paddle2.y - paddle2.height / 2 && ball.y <= paddle2.y + paddle2.height / 2) {
		if (ball.x < paddle2.x - paddle2.width / 2 && ball.x + ball.r >= paddle2.x - paddle2.width / 2) {
			// ball.sp *= 1.1;
			// calculateBallDir(2);
			ball.vX = -ball.vX;
		}
	}
}

// ball out of bounds
function ballIsOut(data) {
	if (data.ball.x >= data.field.width / 2)
		return (data.player1.score++, true);
	if (data.ball.x <= -data.field.width / 2)
		return (data.player2.score++, true);
	return false;
}

module.exports = { ballHitsPaddle1, ballHitsPaddle2, ballHitsWall, ballIsOut };