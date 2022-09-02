import DinoGame from "./game/DinoGame.js";

const $id = (element) => document.getElementById(element);

const game = new DinoGame(600, 150, endGameRoute);
const isTouchDevice =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;


const keycodes = {
  // up, spacebar
  JUMP: { 38: 1, 32: 1 },
  // down
  DUCK: { 40: 1 },
}

const ontouchstart = ({ touches }) => {
  if (touches.length === 1) {
    game.onInput('jump')
  } else if (touches.length === 2) {
    game.onInput('duck')
  }
}

const ontouchend = ({ touches }) => {
  game.onInput('stop-duck')
}

const onKeyDown = ({ keyCode }) => {
  if (keycodes.JUMP[keyCode]) {
    game.onInput('jump')
  } else if (keycodes.DUCK[keyCode]) {
    game.onInput('duck')
  }
}

const onKeyUp = ({ keyCode }) => {
  if (keycodes.DUCK[keyCode]) {
    game.onInput('stop-duck')
  }
}

function keyStart(){
  if (isTouchDevice) {
    document.addEventListener('touchstart', ontouchstart)
  
    document.addEventListener('touchend', ontouchend)
  } else {  
    document.addEventListener('keydown', onKeyDown)
  
    document.addEventListener('keyup', onKeyUp)
  }
}

function keyStop(){
if (isTouchDevice) {
    document.removeEventListener('touchstart', ontouchstart)
  
    document.removeEventListener('touchend', ontouchend)
  } else {
  
    document.removeEventListener('keydown', onKeyDown)
  
    document.removeEventListener('keyup', onKeyUp)
  }
}

function startHomePage(){
  $id("home-page").classList.remove("hidden");
  $id("end-game-page").classList.add("hidden");

  $id("name-input").focus();
  $id("name-input").value = "";
  keyStop();
  $id("name-input").onkeydown = (e) => {
    if (e.code === "Enter") startGame();
  };
  $id("start-button").onclick = startGame;
}

function startGame(){
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  game.start().catch(console.error)
  keyStart();
}

function restartGame(){
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  game.resetGame()
  keyStart();
}

function endGameRoute(){
  $id("leaderboard-page").classList.add("hidden");
  $id("end-game-page").classList.remove("hidden");
  $id("home-page").classList.add("hidden");
  $id("score-bar").textContent = `Your score is ${game.state.score.value}`
  $id("leaderboard-button").onclick = showLeaderboard;
  $id("restart-button").onclick = restartGame;
  keyStop();
}

function showLeaderboard(){
  $id("leaderboard-page").classList.remove("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");

  // TODO: get data from backend
  const dataList = [
    {
      "name":"早安呀",
      "score":110,
      "studentID":"B09901186"
    },
    {
      "name":"早安呀",
      "score":110,
      "studentID":"B09901186"
    }
  ] 

  dataList.map((data)=>{
    const {name, score, studentID} = data;
    var tr = document.createElement('tr');
    tr.classList.add("leaderboard-tr-data");
    [name, score, studentID].forEach((text)=>{
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(text));
      
      tr.appendChild(cell);
    })
    $id("leaderboard-table-container").appendChild(tr)
  })
  
  $id("leaderboard-restart-button").onclick = restartGame;
  
}

startHomePage();
// showLeaderboard()
