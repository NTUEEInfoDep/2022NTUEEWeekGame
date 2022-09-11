import DinoGame from "./game/DinoGame.js";

const $id = (element) => document.getElementById(element);

const baseURL = "http://localhost:4000/api/"

const game = new DinoGame(900, 300, endGameRoute);
const isTouchDevice =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

const keycodes = {
  // up, spacebar
  JUMP: { 38: 1, 32: 1 },
  // down
  DUCK: { 40: 1 },
};

const ontouchstart = ({ touches }) => {
  if (touches.length === 1) {
    game.onInput("jump");
  } else if (touches.length === 2) {
    game.onInput("duck");
  }
};
const ontouchend = ({ touches }) => {
  game.onInput("stop-duck");
};
const onKeyDown = ({ keyCode }) => {
  if (keycodes.JUMP[keyCode]) {
    game.onInput("jump");
  } else if (keycodes.DUCK[keyCode]) {
    game.onInput("duck");
  }
};
const onKeyUp = ({ keyCode }) => {
  if (keycodes.DUCK[keyCode]) {
    game.onInput("stop-duck");
  }
};
function keyStart() {
  if (isTouchDevice) {
    document.addEventListener("touchstart", ontouchstart);

    document.addEventListener("touchend", ontouchend);
  } else {
    document.addEventListener("keydown", onKeyDown);

    document.addEventListener("keyup", onKeyUp);
  }
}
function keyStop() {
  if (isTouchDevice) {
    document.removeEventListener("touchstart", ontouchstart);

    document.removeEventListener("touchend", ontouchend);
  } else {
    document.removeEventListener("keydown", onKeyDown);

    document.removeEventListener("keyup", onKeyUp);
  }
}

// TODO: Complete this function
const checkStudentIDForm = (studentID)=>{
  return studentID;
}

// TODO: 
//    1. Check studentID is filled
//    2. Check studentID is valid
//    3. Ask player whether data is correct
const checkUserData = ()=>{
  startGame();
}

function startHomePage() {
  $id("home-page").classList.remove("hidden");
  $id("end-game-page").classList.add("hidden");

  $id("name-input").focus();
  $id("name-input").value = "";
  keyStop();
  // $id("name-input").onkeydown = (e) => {
  //   if (e.code === "Enter") startGame();
  // };
  $id("start-button").onclick = checkUserData;
  $id("start-leaderboard-button").onclick = showLeaderboard;
}

function startGame() {
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  game.start().catch(console.error);
  keyStart();
}

function restartGame() {
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  game.resetGame();
  keyStart();
}

function endGameRoute() {
  const studentID = $id("student-id-input").value;
  const name = $id("name-input").value;
  const score = game.state.score.value;
  if (checkStudentIDForm(studentID)){
    fetch(`${baseURL}reportScore`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name, studentID, score})
    }).then(()=>{
      $id("leaderboard-page").classList.add("hidden");
      $id("end-game-page").classList.remove("hidden");
      $id("home-page").classList.add("hidden");
      $id("score-bar").textContent = `Your score is ${score}`;
      $id("leaderboard-button").onclick = showLeaderboard;
      $id("restart-button").onclick = restartGame;
      keyStop();
    })  
  }else{
    $id("leaderboard-page").classList.add("hidden");
    $id("end-game-page").classList.remove("hidden");
    $id("home-page").classList.add("hidden");
    $id("score-bar").textContent = `Your score is ${score}`;
    $id("leaderboard-button").onclick = showLeaderboard;
    $id("restart-button").onclick = restartGame;
    keyStop();
  }
}

function showLeaderboard() {
  $id("leaderboard-page").classList.remove("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");

  const gameStudentID = $id("student-id-input").value;
  const gameName = $id("name-input").value;
  const gameScore = game.state.score.value;

  var rankCount = 1;
  var tr = document.createElement("tr");
  tr.id = "leaderboard-tr-header";

  $id("leaderboard-table-container").innerHTML = "";
  ["Rank", "Name", "Score", "StudentID"].forEach((text) => {
    var cell = document.createElement("th");
    cell.appendChild(document.createTextNode(text));
    tr.appendChild(cell);
  });
  $id("leaderboard-table-container").appendChild(tr)

  fetch(`${baseURL}leaderBoard`).then(response=>response.json()).then(dataList => {
    console.log(dataList)
    dataList.map((data) => {
      const { name, score, studentID } = data;
      var tr = document.createElement("tr");
      tr.classList.add("leaderboard-tr-data");
      [rankCount, name, score, studentID].forEach((text) => {
        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(text));
        tr.appendChild(cell);
      });
      $id("leaderboard-table-container").appendChild(tr);
      rankCount += 1;
    });
  })
  if(gameScore != 0){
    var tr = document.createElement("tr");
      tr.classList.add("leaderboard-game-tr-data");
      ["your score", gameName, gameScore, gameStudentID].forEach((text) => {
        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(text));
        tr.appendChild(cell);
      });
      $id("leaderboard-table-container").appendChild(tr);
  }

  $id("leaderboard-restart-button").onclick = restartGame;
}

startHomePage();
// showLeaderboard()
