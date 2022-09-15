import DinoGame from "./game/DinoGame.js";

const $id = (element) => document.getElementById(element);

const baseURL = "http://localhost:4000/api/";

const game = new DinoGame(900, 300, endGameRoute);
const isTouchDevice =
  "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

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
  console.log("down");
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
  console.log("start");
  console.log(isTouchDevice);
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
const checkStudentIDForm = (studentID) => {
  return studentID;
};

// TODO:
//    1. Check studentID is filled
//    2. Check studentID is valid
//    3. Ask player whether data is correct
const checkUserData = () => {
  startGame();
};

function startHomePage() {
  $id("home-page").classList.remove("hidden");
  $id("end-game-page").classList.add("hidden");
  $id("prop-page").classList.add("hidden"); //Lawra
  $id("name-input").focus();
  $id("name-input").value = "";
  keyStop();
  // $id("name-input").onkeydown = (e) => {
  //   if (e.code === "Enter") startGame();
  // };
  $id("start-button").onclick = checkUserData;
  $id("prop-button").onclick = showPropList; //Lawra
}

function startGame() {
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  $id("prop-page").classList.add("hidden"); //Lawra
  game.start().catch(console.error);
  keyStart();
}

function restartGame() {
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  $id("prop-page").classList.add("hidden"); //Lawra
  game.resetGame();
  keyStart();
}

function endGameRoute() {
  let studentID = $id("student-id-input").value;
  const name = $id("name-input").value;
  const score = game.state.score.value;
  const dance = game.state.props.dance;
  const band = game.state.props.band;
  const eater = game.state.props.eater;
  const week = game.state.props.week;
  const guitar = game.state.props.guitar;
  let studentID_re = "";
  //檢查有沒有前十名
  /*
  fetch(`${baseURL}tenthHighestScore`)
    .then((response) => response.json())
    .then((score) => {
      console.log(score);
    });
*/
  /*
  if (!checkStudentIDForm(studentID)) {
    fetch(`${baseURL}leaderBoard`)
      .then((response) => response.json())
      .then((dataList) => {
        console.log(dataList);
        let tenthScore = 0;
        if (dataList.length > 9) {
          tenthScore = dataList[9].score;
        }
        if (tenthScore <= score) {
          studentID_re = prompt("您已經進入前10名, 填寫學號以儲存您的分數");
          studentID = studentID_re;
        }
      });
  }
  */
  console.log(checkStudentIDForm(studentID));
  if (checkStudentIDForm(studentID)) {
    fetch(`${baseURL}reportScore`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, studentID, score }),
    }).then(() => {
      $id("leaderboard-page").classList.add("hidden");
      $id("end-game-page").classList.remove("hidden");
      $id("home-page").classList.add("hidden");
      //print本次遊玩的成績
      $id("prop-page").classList.add("hidden");//Lawra
      $id("score-bar").textContent = `Your score is ${score}`;
      $id("props-dance").textContent = `You have ${dance} dances`;
      $id("props-band").textContent = `You have ${band} bands`;
      $id("props-eater").textContent = `You have ${eater} eaters`;
      $id("props-week").textContent = `You have ${week} weeks`;
      $id("props-guitar").textContent = `You have ${guitar} guitars`;
      $id("leaderboard-button").onclick = showLeaderboard;
      $id("restart-button").onclick = restartGame;
      $id("endgame-button").onclick = startHomePage; //傅渝翔 新增
      keyStop();
    });
    fetch(`${baseURL}highestScores`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ studentID }),
    })
      .then((response) => response.json())
      .then((data) => {
        const highestScore = data.score;
        $id("highestScore").textContent = `Your highest score is ${highestScore}`;
        if (highestScore !== 0 && score < highestScore) {
          $id("encouragement").textContent = "退步了, 加油EE點好嗎?";
        } else if (highestScore !== 0 && score > highestScore) {
          $id("encouragement").textContent = "進步了, kEEp going!";
        } else {
          $id("encouragement").textContent = "";
        }
      });
  } else {
    fetch(`${baseURL}leaderBoard`)
      .then((response) => response.json())
      .then((dataList) => {
        console.log(dataList);
        let tenthScore = 0;
        if (dataList.length > 9) {
          tenthScore = dataList[9].score;
        }
        if (tenthScore <= score) {
          studentID_re = prompt("您已經進入前10名, 填寫學號以儲存您的分數");
          studentID = studentID_re;
        }
        if (checkStudentIDForm(studentID)) {
          fetch(`${baseURL}reportScore`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, studentID, score }),
          }).then(() => {});
        }
      });
    $id("leaderboard-page").classList.add("hidden");
    $id("end-game-page").classList.remove("hidden");
    $id("home-page").classList.add("hidden");
    $id("prop-page").classList.add("hidden");//Lawra
    $id("score-bar").textContent = `Your score is ${score}`;
    $id("props-dance").textContent = `You have ${dance} dances`;
    $id("props-band").textContent = `You have ${band} bands`;
    $id("props-eater").textContent = `You have ${eater} eaters`;
    $id("props-week").textContent = `You have ${week} weeks`;
    $id("props-guitar").textContent = `You have ${guitar} guitars`;
    $id("leaderboard-button").onclick = showLeaderboard;
    $id("restart-button").onclick = restartGame;
    $id("endgame-button").onclick = startHomePage; //傅渝翔 新增
    keyStop();
  }
}
function showPropList(){ //Lawra
  $id("leaderboard-page").classList.add("hidden");
  $id("home-page").classList.remove("hidden");
  $id("end-game-page").classList.add("hidden");
  $id("prop-page").classList.remove("hidden");//Lawra

  $id("prop-close-button").onclick = startHomePage;
}



function showLeaderboard() {
  $id("leaderboard-page").classList.remove("hidden");
  $id("home-page").classList.add("hidden");
  $id("end-game-page").classList.add("hidden");
  $id("prop-page").classList.add("hidden");//Lawra

  var tr = document.createElement("tr");
  tr.id = "leaderboard-tr-header";

  $id("leaderboard-table-container").innerHTML = "";
  ["Name", "Score", "StudentID"].forEach((text) => {
    var cell = document.createElement("th");
    cell.appendChild(document.createTextNode(text));
    tr.appendChild(cell);
  });
  $id("leaderboard-table-container").appendChild(tr);

  fetch(`${baseURL}leaderBoard`)
    .then((response) => response.json())
    .then((dataList) => {
      dataList.map((data) => {
        const { name, score, studentID } = data;
        var tr = document.createElement("tr");
        tr.classList.add("leaderboard-tr-data");
        [name, score, studentID].forEach((text) => {
          var cell = document.createElement("td");
          cell.appendChild(document.createTextNode(text));
          tr.appendChild(cell);
        });
        $id("leaderboard-table-container").appendChild(tr);
      });
    });

  $id("leaderboard-restart-button").onclick = restartGame;
  
}

startHomePage();
// showLeaderboard()
