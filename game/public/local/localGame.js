// Elems
var StartBt;
var Bal;
var Player1;
var Player2;
var PaneltxtScore;

// Animation control
var game, frames;

// Positions
var posBalX, posBalY;
var posPlayer1X, posPlayer1Y;
var posPlayer2X, posPlayer2Y;

// Direction for keypress
var dirPlayer1y;

// Initial postios
var posInitPlayer1Y = 180;
var posInitPlayer2Y = 180;
var posInitBalX = 475, posInitBalY = 240;

// Sizes
var playfieldX = 0, playfieldY = 0;
var playfieldW = 960, playfieldH = 500;
var paddleW = 20, paddleH = 140;
var balW = 20, balH = 20;

// Direction
var balX, balY;
var Player1Y = 0, Player2Y = 0;

// Speed
var balSpeed, player1Speed, player2Speed;

// Game control
var score = 0;
var key;
var runing = false;

// Game control fucntions

function playerControl(){
    if (runing){
        posPlayer1Y += player1Speed*dirPlayer1y;
        Player1.style.top = posPlayer1Y + "px";
    }
}

function keyDown(){
    key = event.keyCode;
    if (key == 38){ // arrow down
        dirPlayer1y = -1;
    }else if (key == 40){
        dirPlayer1y = 1;
    }
}

function keyUp(){
    key = event.keyCode;
    if (key == 38){ // arrow down
        dirPlayer1y = 0;
    }else if (key == 40){
        dirPlayer1y = 0;
    }
}
// Basics controls functions for the game

function game(){
    if (runing){
         playerControl();       
    }
    frames = requestAnimationFrame(game);
}

function initGame(){
    if(!runing){
        cancelAnimationFrame(frames);
        runing = true;
        dirPlayer1y = 0;
        posBalX = posInitBalX;
        posBalY = posInitBalY;
        posPlayer1Y = posInitPlayer1Y;
        posPlayer2Y = posInitPlayer2Y;
        game();
    }
}

function initVars(){

    balSpeed = player1Speed = player2Speed = 8;
    StartBt = document.getElementById("btStart");
    StartBt.addEventListener("click", initGame);
    Player1 = document.getElementById("dvPlayer1");
    Player2 = document.getElementById("dvPlayer2");
    Bal = document.getElementById("dvBal");
    PaneltxtScore = document.getElementById("txtScore");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
}

window.addEventListener("load", initVars);
