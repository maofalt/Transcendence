// Game parameters
const gameSettings = {
    paddleWidth: 10,
    paddleHeight: 100,
    ballSize: 10,
    ballSpeed: 5,
};

const screenWidth = 960;
const screenHeight = 500; 

// begin init game
let gameState = {
    player1: { x: 10, y: screenHeight / 2 - gameSettings.paddleHeight / 2, score: 0 },
    player2: { x: screenWidth - 10 - gameSettings.paddleWidth, y: screenHeight / 2 - gameSettings.paddleHeight / 2, score: 0 },
    ball: { x: screenWidth / 2, y: screenHeight / 2, vx: 5, vy: 5 }
};

// Fonction pour mettre à jour l'état du jeu
function updateGame() {
    // Mettre à jour la position de la balle
    gameState.ball.x += gameState.ball.vx;
    gameState.ball.y += gameState.ball.vy;

    // Gérer les collisions avec les bords
    if (gameState.ball.y <= 0 || gameState.ball.y >= screenHeight) {
        gameState.ball.vy *= -1;
    }

    // Plus de logique de collision et de score ici

    // Envoyer l'état mis à jour aux clients
    // ...
}

// Appeler updateGame à intervalles réguliers
setInterval(updateGame, 1000 / 60); // 60 fois par seconde
