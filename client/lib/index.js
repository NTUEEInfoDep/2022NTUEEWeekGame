import '../style/main.css'
import '../style/card.css'
import '../style/end.css'
import '../style/phone.css'
import DinoGame from './game/DinoGame.js'

const $id = (element) => document.getElementById(element)
const $class = (element) => document.getElementsByClassName(element)

const baseURL = window.location.href.toString() + 'api/'
let first = true

const pub_key = base64ToArrayBuffer(process.env.PUBLIC_KEY)
let key = ''

async function importKey() {
  key = await crypto.subtle.importKey(
    'raw',
    pub_key,
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

async function testMessage() {
  const { key, keyStr } = await generateKey()
  console.log(`string key for the node server: ${keyStr}`)
  const { iv, encrypted } = await encrypt(key, 'test message')
  const raw = await crypto.subtle.exportKey('raw', key)
  console.log(`string key for the browser: ${buf2base64(raw)}`)
  console.log(`base64 iv: ${iv}, base64 encrypted message: ${encrypted}`)
}
// testMessage();

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

async function generateKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const jwk = await crypto.subtle.exportKey('jwk', key)
  return { key, keyStr: jwk.k }
}

async function encrypt(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    str2buf(text)
  )
  return {
    iv: buf2base64(iv),
    encrypted: buf2base64(encrypted),
  }
}

// helpers
function str2buf(str) {
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i)
  return bytes
}
function buf2base64(buf) {
  let binary = ''
  let bytes = new Uint8Array(buf)
  let len = bytes.byteLength
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

const game = new DinoGame(
  window.innerWidth,
  window.innerHeight,
  preEndGameRoute
)
const isTouchDevice =
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0 ||
  'gesturestart' in window

const keycodes = {
  // up, spacebar
  JUMP: { 38: 1, 32: 1 },
  // down
  DUCK: { 40: 1 },
}
const isradius = (x, y, r) => {
  const center_x = game.circle.x,
    center_y = game.circle.y,
    center_r = game.circle.radius
  return (x - center_x) ** 2 + (y - center_y) ** 2 <= center_r ** 2
}

// function encrypt(toEncrypt) {
//   const publicKey = process.env.PUBLIC_KEY;
//   const buffer = Buffer.from(toEncrypt, 'utf8')
//   const encrypted = publicEncrypt(publicKey, buffer)
//   return encrypted.toString('base64')
// }

const ontouchstart = ({ touches }) => {
  console.log(touches[0].clientX)
  console.log(window.innerHeight, window.innerWidth)
  if (isradius(touches[0].clientX, touches[0].clientY)) {
    // isradius(touches[0].clientX, touches[0].clientY)
    game.onInput('duck')
  } else if (touches.length === 1) {
    game.onInput('jump')
  }
}
const ontouchend = () => {
  game.onInput('stop-duck')
}
const onKeyDown = ({ keyCode }) => {
  console.log('key down')
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
function keyStart() {
  console.log(`isTouchDevice: ${isTouchDevice}`)
  if (isTouchDevice) {
    document.addEventListener('touchstart', ontouchstart)

    document.addEventListener('touchend', ontouchend)
  }
  document.addEventListener('keydown', onKeyDown)

  document.addEventListener('keyup', onKeyUp)
}
function keyStop() {
  if (isTouchDevice) {
    document.removeEventListener('touchstart', ontouchstart)

    document.removeEventListener('touchend', ontouchend)
  }
  document.removeEventListener('keydown', onKeyDown)

  document.removeEventListener('keyup', onKeyUp)
}

// TODO: Complete this function
const checkStudentIDForm = (studentID) => {
  if (studentID) {
    const regex = /[BSTKRYAPJMDZCFQEN]\d{2}[0-9ABE][01][A-Z0-9]{4}/
    return regex.test(studentID)
  } else {
    return false
  }
}

// TODO:
//    1. Check studentID is filled
//    2. Check studentID is valid
//    3. Ask player whether data is correct
const checkUserData = () => {
  const name = $id('name-input').value
  const studentID = $id('student-id-input').value
  if (name) {
    if (studentID) {
      if (checkStudentIDForm(studentID)) {
        startGame()
      } else {
        $id('error-container').classList.remove('hidden')
        $id(
          'error-page-text'
        ).textContent = `你的學號[${studentID}]似乎有問題喔`
      }
    } else {
      $id('warning-container').classList.remove('hidden')
      $id(
        'warning-page-text'
      ).textContent = `玩家[${name}]你好，確定不填學號齁?不會留紀錄喔`
    }
  } else {
    $id('error-container').classList.remove('hidden')
    $id('error-page-text').textContent = `請告訴我們你是誰 >_<`
  }
}

async function startHomePage() {
  $id('home-page').classList.remove('hidden')
  $id('end-game-page').classList.add('hidden')
  $id('prop-container').classList.add('hidden') //Lawra
  $id('rule-container').classList.add('hidden') //lichun
  $id('instruction-container').classList.add('hidden')
  $id('name-input').focus()
  // $id("name-input").value = "";
  keyStop()
  // $id("name-input").onkeydown = (e) => {
  //   if (e.code === "Enter") startGame();
  // };
  await game.start(true).catch(console.error)
  $id('start-button').textContent = '開始遊戲'
  $id('start-button').onclick = checkUserData
}

async function getHighestScore() {
  const studentID = $id('student-id-input').value
  return fetch(`${baseURL}highestScore?studentID=${studentID}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data.score
    })
    .catch((err) => {
      console.log(err)
    })
}

async function startGame() {
  $id('leaderboard-container').classList.add('hidden')
  $id('home-page').classList.add('hidden')
  $id('end-game-page').classList.add('hidden')
  $id('prop-container').classList.add('hidden') //Lawra
  $id('rule-container').classList.add('hidden') //lichun
  $id('error-container').classList.add('hidden')
  $id('warning-container').classList.add('hidden')
  $id('instruction-container').classList.add('hidden')
  if (first) {
    // game.start().catch(console.error);
    game.highestScore = await getHighestScore()
    game.unpause()
    first = false
  } else {
    game.resetGame()
  }
  // console.log("start");
  keyStart()
}

function restartGame() {
  $id('leaderboard-container').classList.add('hidden')
  $id('home-page').classList.add('hidden')
  $id('end-game-page').classList.add('hidden')
  $id('prop-container').classList.add('hidden') //Lawra
  $id('rule-container').classList.add('hidden') //lichun
  $id('error-container').classList.add('hidden')
  $id('warning-container').classList.add('hidden')
  $id('instruction-container').classList.add('hidden')
  game.resetGame()
  keyStart()
}

function preEndGameRoute() {
  keyStop()
  const score = game.state.score.value
  let studentID = $id('student-id-input').value
  if (checkStudentIDForm(studentID)) {
    endGameRoute()
  } else {
    fetch(`${baseURL}leaderBoard`)
      .then((response) => response.json())
      .then((dataList) => {
        // console.log(dataList);
        let tenthScore = 0
        if (dataList.length > 9) {
          tenthScore = dataList[9].score
        }
        if (tenthScore <= score) {
          $id('prompt-container').classList.remove('hidden')
        } else {
          endGameRoute()
        }
      })
  }
}

function endGameRoute() {
  let studentID = $id('student-id-input').value
  const name = $id('name-input').value
  const score = game.state.score.value
  const dance = game.state.props.dance
  const band = game.state.props.band
  const eater = game.state.props.eater
  const week = game.state.props.week
  const guitar = game.state.props.guitar
  if (checkStudentIDForm(studentID)) {
    fetch(`${baseURL}highestScore?studentID=${studentID}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
        const encoded = JSON.stringify({ studentID, score })
        const { iv, encrypted } = await encrypt(key, encoded)

        fetch(`${baseURL}reportScore`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, iv, encrypted }),
        }).then(() => {
          $id('leaderboard-container').classList.add('hidden')
          $id('end-game-page').classList.remove('hidden')
          $id('home-page').classList.add('hidden')
          //print本次遊玩的成績
          $id('prop-container').classList.add('hidden') //Lawra
          $id('score').textContent = `${score}`
          // $id("props-dance").textContent = `You have ${dance} dances`;
          // $id("props-band").textContent = `You have ${band} bands`;
          // $id("props-eater").textContent = `You have ${eater} eaters`;
          // $id("props-week").textContent = `You have ${week} weeks`;
          // $id("props-guitar").textContent = `You have ${guitar} guitars`;
          //endpage不需提供得到道具資訊
          keyStop()
        })
        const highestScore = data.score
        if (highestScore !== 0) {
          $id('highestScore').textContent = `你之前的最高分是${highestScore}`
        } else {
          $id('highestScore').textContent = `Good first try!`
        }
        if (highestScore !== 0 && score < highestScore) {
          $id('encouragement').textContent = '退步了, 加油EE點好嗎?'
        } else if (highestScore !== 0 && score > highestScore) {
          $id('encouragement').textContent = '進步了, kEEp going!'
        } else {
          $id('encouragement').textContent = ''
        }
      })
  } else {
    $id('leaderboard-container').classList.add('hidden')
    $id('end-game-page').classList.remove('hidden')
    $id('home-page').classList.add('hidden')
    $id('prop-container').classList.add('hidden') //Lawra
    $id('score').textContent = `${score}`
    // $id("props-dance").textContent = `You have ${dance} dances`;
    // $id("props-band").textContent = `You have ${band} bands`;
    // $id("props-eater").textContent = `You have ${eater} eaters`;
    // $id("props-week").textContent = `You have ${week} weeks`;
    // $id("props-guitar").textContent = `You have ${guitar} guitars`;
    //endpage不需提供得到道具資訊
  }
}
function showRule() {
  //lichun
  $id('leaderboard-container').classList.add('hidden')
  $id('home-page').classList.remove('hidden')
  $id('end-game-page').classList.add('hidden')
  $id('rule-container').classList.remove('hidden') //lichun
}

function showPropList() {
  //Lawra
  $id('leaderboard-container').classList.add('hidden')
  $id('home-page').classList.remove('hidden')
  $id('end-game-page').classList.add('hidden')
  $id('prop-container').classList.remove('hidden') //Lawra
}

function showLeaderboard() {
  // $id("home-page").classList.add("hidden");
  // $id("end-game-page").classList.add("hidden");
  // $id("prop-container").classList.add("hidden");//Lawra

  const gameStudentID = $id('student-id-input').value
  const gameName = $id('name-input').value
  const gameScore = game.state.score.value

  var rankCount = 1
  var tr = document.createElement('tr')
  tr.id = 'leaderboard-tr-header'

  $id('leaderboard-table-container').innerHTML = ''
  ;['排名', '名字', '分數'].forEach((text) => {
    var cell = document.createElement('th')
    cell.appendChild(document.createTextNode(text))
    tr.appendChild(cell)
  })
  $id('leaderboard-table-container').appendChild(tr)

  fetch(`${baseURL}leaderBoard`)
    .then((response) => response.json())
    .then((dataList) => {
      // console.log(dataList)
      dataList.map((data) => {
        const { name, score, studentID } = data
        var tr = document.createElement('tr')
        tr.classList.add('leaderboard-tr-data')
        ;[rankCount, name, score].forEach((text) => {
          var cell = document.createElement('td')
          cell.appendChild(document.createTextNode(text))
          tr.appendChild(cell)
        })
        $id('leaderboard-table-container').appendChild(tr)
        rankCount += 1
      })

      // Show this player's highest score and rank
      fetch(`${baseURL}highestScore?studentID=${gameStudentID}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          const { score, name } = data
          if (gameScore != 0 && checkStudentIDForm(gameStudentID)) {
            var tr = document.createElement('tr')
            tr.classList.add('leaderboard-game-tr-data')
            ;['你的分數', name, score].forEach((text) => {
              var cell = document.createElement('td')
              cell.appendChild(document.createTextNode(text))
              tr.appendChild(cell)
            })
            $id('leaderboard-table-container').appendChild(tr)
          }
        })
      $id('leaderboard-container').classList.remove('hidden')
    })
}

// Global function
;[].forEach.call($class('leaderboard-button'), (node) => {
  node.onclick = showLeaderboard
})
$id('endPage-leaderboard-button').onclick = showLeaderboard
;[].forEach.call($class('prop-button'), (node) => {
  node.onclick = showPropList
})
$id('rule-button').onclick = showRule //lichun
$id('restart-button').onclick = restartGame
$id('endgame-button').onclick = startHomePage //傅渝翔 新增
$id('rule-close-button').onclick = () => {
  $id('rule-container').classList.add('hidden')
}
$id('prop-close-button').onclick = () => {
  $id('prop-container').classList.add('hidden')
}
$id('warning-go-back-button').onclick = () => {
  $id('warning-container').classList.add('hidden')
}
$id('warning-start-button').onclick = () => {
  $id('warning-container').classList.add('hidden')
  startGame()
}
$id('error-go-back-button').onclick = () => {
  $id('error-container').classList.add('hidden')
}
$id('prompt-reject-button').onclick = () => {
  $id('prompt-container').classList.add('hidden')
  endGameRoute()
}
$id('prompt-confirm-button').onclick = () => {
  const promptStudentID = $id('prompt-student-id-input').value
  if (checkStudentIDForm(promptStudentID)) {
    $id('student-id-input').value = promptStudentID
    $id('prompt-container').classList.add('hidden')
    endGameRoute()
  } else {
    $id('error-container').classList.remove('hidden')
    $id(
      'error-page-text'
    ).textContent = `你的學號[${promptStudentID}]似乎有問題喔`
  }
}
;[].forEach.call($class('instruction-button'), (node) => {
  node.onclick = () => $id('instruction-container').classList.remove('hidden')
})
$id('instruction-container').onclick = (e) => {
  if (e.target == document.getElementById('instruction-container')) {
    $id('instruction-container').classList.add('hidden')
  }
}
$id('leaderboard-container').onclick = (e) => {
  if (e.target == document.getElementById('leaderboard-container')) {
    $id('leaderboard-container').classList.add('hidden')
  }
}

// Find matches
var mql = window.matchMedia('(orientation: portrait)')

// If there are matches, we're in portrait
if (mql.matches) {
  // Portrait orientation
  $id('landscape-page').classList.remove('hidden')
} else {
  // Landscape orientation
  $id('landscape-page').classList.add('hidden')
}

// Add a media query change listener
mql.addListener(function (m) {
  if (m.matches) {
    // Changed to portrait
    $id('landscape-page').classList.remove('hidden')
  } else {
    // Changed to landscape
    $id('landscape-page').classList.add('hidden')
  }
  game.resize()
})

// resize game
window.addEventListener('resize', function () {
  console.log('resize')
  game.resize()
})

// const clientHeight = document.body.clientHeight;
//   window.scrollBy(0, clientHeight);

startHomePage()
importKey()
// $('body').show();
// showLeaderboard()
