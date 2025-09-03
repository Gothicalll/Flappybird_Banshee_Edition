//Our board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//Our bird
let birdWidth = 34; // 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

//Pipes 
let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//Physics
let velocityX = -2;
let velocityY = 0;
let gravity   = 0.4;

//Game OvEr
let gameOver = false;
let gameStarted = false;  
let score = 0;

//Retry
let retryBtn = null;
let pipeTimer = null; 

//Music
let bgm; 
let soundEnabled = true; 

//Marvelous Intro 
window.onload = function() {
  const intro = document.getElementById('intro');

  const onIntroEnd = () => {
    if (intro) intro.style.display = 'none';
    prepareAndTryPlayMusic();
    startGame();
  };

  if (intro) {
    intro.addEventListener('animationend', onIntroEnd, { once:true });
  } else {
    onIntroEnd();
  }
};

function startGame() {
  board = document.getElementById("board");
  board.style.display = "block";
  board.height = boardHeight;
  board.width  = boardWidth;
  context = board.getContext("2d");

  retryBtn = document.getElementById("retryBtn");
  if (retryBtn) {
    retryBtn.style.display = "none";
    retryBtn.onclick = resetGame;
  }

  birdImg = new Image();
  birdImg.src = "./bird.png";
  birdImg.onload = () => context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  topPipeImg = new Image();  topPipeImg.src = "./pipetop.png";
  bottomPipeImg = new Image(); bottomPipeImg.src = "./pipebot.png";

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveBird);
}

function update() {
  requestAnimationFrame(update);
  context.clearRect(0, 0, board.width, board.height);

//Gravity Logic
  if (gameStarted && !gameOver) {
    velocityY += gravity;
  } else {
    velocityY = 0;
  }
  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) gameOver = true;

//For Pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    if (gameStarted && !gameOver) pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (gameStarted && !gameOver && !pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
    }
    if (gameStarted && !gameOver && detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) pipeArray.shift();

  //Score 
  context.fillStyle = "white";
  context.font = "25px sans-serif";
  context.fillText(score, 5, 45);

  //Hint
  if (!gameStarted && !gameOver) {
    context.font = "20px sans-serif";
    context.textAlign = "center";
    context.fillText("Нажми ПРОБЕЛ для старта", boardWidth/2, boardHeight/2 + 40);
    context.textAlign = "start";
  }

  //Game OvEr
  if (gameOver) {
    context.fillText("Кончил МОЩНО И БЫСТРО", 20, 90);
    if (retryBtn) retryBtn.style.display = "inline-flex";
  }
}

function placePipes() {
  if (!gameStarted || gameOver) return;

  let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
  let openingSpace = board.height/4;

  pipeArray.push({ img: topPipeImg, x: pipeX, y: randomPipeY, width: pipeWidth, height: pipeHeight, passed: false });
  pipeArray.push({ img: bottomPipeImg, x: pipeX, y: randomPipeY + pipeHeight + openingSpace, width: pipeWidth, height: pipeHeight, passed: false });
}

//Buttons
function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    if (!gameStarted) {
      gameStarted = true; 
      pipeTimer = setInterval(placePipes, 1500);
    }
    if (!gameOver) velocityY = -6;

    if (gameOver) resetGame();
  }
}

//Reset logic
function resetGame() {
  gameOver = false;
  gameStarted = false;
  bird.y = birdY;
  velocityY = 0;
  score = 0;
  pipeArray = [];
  if (pipeTimer) { clearInterval(pipeTimer); pipeTimer = null; }
  if (retryBtn) retryBtn.style.display = "none";
}

//Limits
function detectCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

//Music
function prepareAndTryPlayMusic() {
  if (!bgm) {
    bgm = new Audio('./Plenka.mp3'); 
    bgm.loop = true;
    bgm.volume = 0.35;
  }


  bgm.play().catch(() => {

    const sp = document.getElementById('soundPrompt');
    if (!sp) return;

    sp.style.display = 'block';

    const enable = () => {
      sp.style.display = 'none';
      bgm.play().catch(()=>{});
      sp.removeEventListener('click', enable);
      document.removeEventListener('keydown', enable);
      document.removeEventListener('touchstart', enable);
    };

    sp.addEventListener('click', enable);
    document.addEventListener('keydown', enable, { once:true });
    document.addEventListener('touchstart', enable, { once:true });
  });
}