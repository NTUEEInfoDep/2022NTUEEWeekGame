import Bird from '../actors/Bird.js'
import Obstacle from '../actors/Obstacle.js'
import Cloud from '../actors/Cloud.js'
import Dino from '../actors/Dino.js'
import Bullet from '../actors/Bullet.js'
import Item from '../actors/Item.js'
import Food from '../actors/Food.js'
import sprites from '../sprites.js'
import { playSound } from '../sounds.js'
import {
  loadFont,
  loadImage,
  getImageData,
  randBoolean,
  randInteger,
  changeToString,
} from '../utils.js'
import GameRunner from './GameRunner.js'

import { week } from '../card.js'

CanvasRenderingContext2D.prototype.roundRect = function (
  x,
  y,
  width,
  height,
  radius
) {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  this.beginPath()
  this.moveTo(x + radius, y)
  this.arcTo(x + width, y, x + width, y + height, radius)
  this.arcTo(x + width, y + height, x, y + height, radius)
  this.arcTo(x, y + height, x, y, radius)
  this.arcTo(x, y, x + width, y, radius)
  this.closePath()
  return this
}

export default class DinoGame extends GameRunner {
  constructor(width, height, endGameRoute, isTouchDevice) {
    super()
    // console.log(isTouchDevice)
    this.width = null
    this.height = null
    this.canvas = this.createCanvas(width, height)
    this.canvasCtx = this.canvas.getContext('2d')
    this.spriteImage = null
    this.spriteImageData = null
    this.endGameRoute = endGameRoute
    this.highestScore = 0
    this.lowFrameRateCounter = 0

    this.circle = {
      x: 0.9,
      y: 0.4,
      x_center: null,
      y_center: null,
      radius: Math.max((width + height) / 30, 45),
      scale: 1.2,
    }
    this.isTouchDevice = isTouchDevice

    /*
     * units
     * fpa: frames per action
     * ppf: pixels per frame
     * px: pixels
     */
    this.defaultSettings = {
      bgSpeed: 12, // ppf
      birdSpeed: 12 * 1.2, // ppf
      birdSpawnRate: 190, // fpa
      birdWingsRate: 15, // fpa
      obstaclesSpawnRate: 50, // fpa
      foodSpawnRate: 10,
      foodScore: 5,
      cloudSpawnRate: 200, // fpa
      cloudSpeedRelativeToBg: 0.7, // ppf
      dinoGravity: 2, // ppf
      dinoGroundOffset: -40, // px
      dinoLegsRate: 10, // fpa
      dinoLift: 34, // ppf
      bulletSpawnRate: 20, // fpa
      bulletSpeed: 10, // ppf
      itemSpawnRate: 200, // fpa
      speedRatio: 1,
      scoreRatio: 1,
      powerUpTimes: {
        // seconds
        guitar: 3,
        dance: 5,
        band: 5,
        eater: 5,
        week: 0.5,
      },
      scoreBlinkRate: 20, // fpa
      scoreIncreaseRate: 2, // fpa
    }

    this.state = {
      settings: { ...this.defaultSettings },
      birds: [],
      obstacles: [],
      foods: [],
      clouds: [],
      bullets: [],
      items: [],
      dino: null,
      foodHeightMode: null,
      foodScoreTextAlpha: 0,
      gameOver: false,
      groundX: 0,
      groundY: 0,
      isRunning: true,
      level: 0,
      speedRatio: 1,
      scoreRatio: 1,
      score: {
        blinkFrames: 0,
        blinks: 0,
        isBlinking: false,
        value: 0,
        bonus: 0,
      },
      props: {
        dance: 0,
        band: 0,
        eater: 0,
        week: 0,
        guitar: 0,
      },
    }
  }

  // ref for canvas pixel density:
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#correcting_resolution_in_a_%3Ccanvas%3E
  createCanvas(width, height) {
    const canvas = document.getElementById('game')
    const ctx = canvas.getContext('2d')
    const scale = window.devicePixelRatio

    this.width = Math.min(window.innerWidth, 1500)
    this.height = window.innerHeight
    canvas.style.width = this.width + 'px'
    canvas.style.height = this.height + 'px'
    canvas.width = Math.floor(width * scale)
    canvas.height = Math.floor(height * scale)
    ctx.scale(scale, scale)

    // document.body.appendChild(canvas);
    return canvas
  }

  resize() {
    this._resize()
    setTimeout(() => {
      this._resize()
    }, 500)
  }

  _resize() {
    this.width = Math.min(window.innerWidth, 1500)
    this.height = window.innerHeight
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    this.canvas.width = Math.floor(this.width * window.devicePixelRatio)
    this.canvas.height = Math.floor(this.height * window.devicePixelRatio)
    this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const oldBaseY = this.state.dino.baseY
    this.state.groundY =
      this.height - Math.min(sprites.ground.h / 2, this.height * 0.2)
    this.state.dino.baseY =
      this.state.groundY - this.state.settings.dinoGroundOffset

    // set Y position of items
    const delta = this.state.dino.baseY - oldBaseY
    this.state.items.forEach((item) => {
      item.y += delta
    })
    this.state.bullets.forEach((bullet) => {
      bullet.y += delta
    })
    this.state.foods.forEach((food) => {
      food.y += delta
    })
    this.state.obstacles.forEach((obstacle) => {
      obstacle.y += delta
    })
    this.state.birds.forEach((bird) => {
      bird.y += delta
    })
  }

  async preload() {
    const { settings } = this.state
    const [spriteImage] = await Promise.all([
      loadImage('./assets/sprite.png'),
      loadFont('./assets/PressStart2P-Regular.ttf', 'PressStart2P'),
    ])
    this.backgroundImage = await loadImage('./assets/background.png')
    this.spriteImage = spriteImage
    this.spriteImageData = getImageData(spriteImage)
    this.duck_buttonImage = await loadImage('./assets/down-arrow.png')
    const dino = new Dino(this.spriteImageData)

    dino.legsRate = settings.dinoLegsRate
    dino.lift = settings.dinoLift
    dino.gravity = settings.dinoGravity
    dino.x = 25
    this.state.dino = dino
    this.state.groundY =
      this.height - Math.min(sprites.ground.h / 2, this.height * 0.2)
    dino.baseY = this.state.groundY - settings.dinoGroundOffset
  }

  onFrame() {
    const { state } = this

    this.drawBackground()
    this.drawGround()
    this.drawClouds()
    if (this.isTouchDevice) {
      this.drawDuckButton()
    }
    this.drawDino()
    this.drawProgressBar()
    this.drawScore()
    this.drawFPS()

    if (state.isRunning) {
      if (state.dino.powerUp === 'none') {
        state.speedRatio = 60 / this.frameRate
        state.scoreRatio = 1
      }

      let spawnedObstacle, spawnedBird, spawnedItem, spawnedFood
      this.drawBullets()

      spawnedObstacle = this.drawObstacles()

      spawnedFood = this.drawFoods()

      if (state.level > 3) {
        spawnedBird = this.drawBirds()
      }

      spawnedItem = this.drawItems(spawnedObstacle, spawnedBird)

      if (state.dino.hits([state.obstacles[0], state.birds[0]])) {
        if (this.state.dino.powerUp !== 'band') {
          if (state.obstacles[0] !== undefined) {
            if (
              state.obstacles[0].sprite !== 'obstacleGateHit' &&
              state.obstacles[0].sprite !== 'obstacleCodeHit'
            ) {
              playSound('game-over')
              state.gameOver = true
            }
          } else if (state.birds[0] !== undefined) {
            if (
              state.birds[0].sprite !== 'birdCircuitHit' &&
              state.birds[0].sprite !== 'birdPaperHit'
            ) {
              playSound('game-over')
              state.gameOver = true
            }
          }
        }
      }

      state.foodScoreTextAlpha *= 0.8

      if (state.dino.hits([state.foods[0]])) {
        // Maybe play an "Eating sound" here
        state.score.bonus += state.settings.foodScore
        state.foodScoreTextAlpha = 1
        state.foods[0].destroy()
      }

      this.drawFoodScoreTexts()

      // bullets hit
      state.bullets.forEach((bullet) => {
        if (bullet.hits([state.obstacles[0]])) {
          //to-do
          // state.obstacles[0].sprite = `${state.obstacles[0].sprite}Hit`;
          switch (state.obstacles[0].sprite) {
            case 'obstacleCode':
              state.obstacles[0].sprite = 'obstacleCodeHit'
            case 'obstacleGate':
              state.obstacles[0].sprite = 'obstacleGateHit'
          }
          setTimeout(() => {
            state.obstacles.shift()
          }, 120)
          bullet.destroy()

          //to do
          // playSound("hit");
        }
        if (bullet.hits([state.birds[0]])) {
          //to-do
          // state.birds[0].sprite = `${state.birds[0].sprite}Hit`;
          // state.obstacles[0].sprite = "birdHit";

          switch (state.birds[0].sprite) {
            case 'birdCircuit':
              state.birds[0].sprite = 'birdCircuitHit'
            case 'birdPaper':
              state.birds[0].sprite = 'birdPaperHit'
          }

          //to-do

          setTimeout(() => {
            state.birds.shift()
          }, 120)
          bullet.destroy()
          // playSound("hit");
        }
      })

      // items hit
      state.items.forEach((item) => {
        if (item.hits([state.dino])) {
          item.destroy()
          state.dino.powerUp = item.sprite
          state.dino.powerUpTime =
            state.settings.powerUpTimes[item.sprite] * this.frameRate
          state.dino.powerUpMaxTime = state.dino.powerUpTime
          playSound('level-up')

          switch ((this, state.dino.powerUp)) {
            case 'guitar':
              // this.state.speedRatio = 1
              // this.state.scoreRatio = 1
              this.state.props.guitar++
              break
            case 'dance':
              this.state.props.dance++
              this.state.speedRatio *= 1.5
              this.state.scoreRatio = 3
              break
            case 'band':
              this.state.props.band++
              this.state.speedRatio *= 0.8
              state.dino.blinking(true)
              break
            case 'eater':
              this.state.props.eater++
              this.state.foodHeightMode = randInteger(0, 2)
              break
            case 'week':
              this.state.props.week++
              const week_plus = randInteger(1, 100)
              week(`+${week_plus}`)
              this.state.score.bonus += week_plus //????????????????????????!
              break
          }
        }
      })

      if (state.gameOver) {
        this.endGame()
      } else {
        this.updateScore()
      }
    }
  }

  onInput(type) {
    const { state } = this

    switch (type) {
      case 'jump': {
        if (state.isRunning) {
          if (state.dino.jump()) {
            playSound('jump')
          }
        } else {
          // this.resetGame();
          state.dino.jump()
          playSound('jump')
        }
        break
      }

      case 'duck': {
        if (state.isRunning) {
          state.dino.duck(true)
        }
        break
      }

      case 'stop-duck': {
        if (state.isRunning) {
          state.dino.duck(false)
        }
        break
      }
    }
  }

  resetGame() {
    this.state.dino.reset()
    Object.assign(this.state, {
      settings: { ...this.defaultSettings },
      birds: [],
      obstacles: [],
      foods: [],
      bullets: [],
      items: [],
      gameOver: false,
      isRunning: true,
      speedRatio: 1,
      scoreRatio: 1,
      level: 0,
      score: {
        blinkFrames: 0,
        blinks: 0,
        isBlinking: false,
        value: 0,
        bonus: 0,
      },
      props: {
        guitar: 0,
        dance: 0,
        band: 0,
        eater: 0,
        week: 0,
      },
    })

    this.start()
  }

  endGame() {
    // const iconSprite = sprites.replayIcon;
    // const padding = 15;

    // this.paintText("G A M E  O V E R", this.width / 2, this.height / 2 - padding, {
    //   font: "PressStart2P",
    //   size: "12px",
    //   align: "center",
    //   baseline: "bottom",
    //   color: "#535353",
    // });

    // this.paintSprite(
    //   'replayIcon',
    //   this.width / 2 - iconSprite.w / 4,
    //   this.height / 2 - iconSprite.h / 4 + padding
    // )
    const score = this.state.score.value
    if (score > this.highestScore) {
      this.highestScore = score
    }
    this.state.isRunning = false
    this.drawScore()
    this.stop()
    setTimeout(this.endGameRoute, 500)
  }

  increaseDifficulty() {
    const { birds, obstacles, foods, clouds, dino, settings } = this.state
    const { bgSpeed, obstaclesSpawnRate, dinoLegsRate } = settings
    const { level } = this.state

    if (level > 4 && level < 8) {
      settings.bgSpeed++
      settings.birdSpeed = settings.bgSpeed * 1.2
    } else if ((level > 7 && level < 14) || (level > 13 && level % 5 === 0)) {
      settings.bgSpeed = Math.ceil(bgSpeed * 1.1)
      settings.birdSpeed = settings.bgSpeed * 1.2
      settings.obstaclesSpawnRate = Math.floor(obstaclesSpawnRate * 0.98)

      if (level > 7 && level % 2 === 0 && dinoLegsRate > 3) {
        settings.dinoLegsRate--
      }
    }

    for (const bird of birds) {
      bird.speed = settings.birdSpeed
    }

    for (const obstacle of obstacles) {
      obstacle.speed = settings.bgSpeed
    }

    for (const food of foods) {
      food.speed = settings.bgSpeed
    }

    for (const cloud of clouds) {
      cloud.speed = settings.bgSpeed * settings.cloudSpeedRelativeToBg
    }

    dino.legsRate = settings.dinoLegsRate
  }

  updateScore() {
    const { state } = this
    const levelGap = 200

    if (this.frameCount % state.settings.scoreIncreaseRate === 0) {
      const oldHundred = Math.floor(
        (state.score.value + state.score.bonus) / 500
      )
      const oldLevel = state.level

      state.score.value += 1
      state.score.bonus += state.scoreRatio - 1
      state.level = Math.floor(state.score.value / levelGap)

      if (
        Math.floor((state.score.value + state.score.bonus) / 500) !== oldHundred
      ) {
        playSound('level-up')
        state.score.isBlinking = true
      }

      if (state.level !== oldLevel) {
        this.increaseDifficulty()
      }
    }
  }

  drawFPS() {
    if (this.frameRate < 50) {
      this.lowFrameRateCounter++
    } else {
      this.lowFrameRateCounter = 0
    }

    // let text = 'FPS: ' + Math.round(this.frameRate)

    if (this.lowFrameRateCounter > 100) {
      const text = 'Low FPS, your score may be lower than expected'
      this.paintText(text, this.width, this.height, {
        font: 'PressStart2P',
        size: '12px',
        baseline: 'bottom',
        align: 'right',
        color: '#ff0000',
      })
    }
  }
  drawDuckButton() {
    // this.canvasCtx.fillStyle = "#f7f7f7";
    // this.canvasCtx.fillRect(0, 0, this.width, this.height);
    const { circle, canvasCtx, width, height } = this

    circle.x_center = Math.max(width, height) * circle.x
    circle.y_center = Math.min(width, height) * circle.y
    // circle.radius = 45
    circle.radius = Math.max(Math.min(80, (width + height) / 35), 45)

    const x = circle.x_center,
      y = circle.y_center

    // console.log(x, y)
    console.log(circle.radius)
    // Math.max(Math.max(150, Math.max(width, height) * 0.08), 40),

    canvasCtx.drawImage(
      this.duck_buttonImage,
      x - circle.radius * circle.scale,
      y - circle.radius * circle.scale,
      circle.radius * circle.scale * 2,
      circle.radius * circle.scale * 2
    )
  }

  drawBackground() {
    // this.canvasCtx.fillStyle = "#f7f7f7";
    // this.canvasCtx.fillRect(0, 0, this.width, this.height);
    this.canvasCtx.drawImage(
      this.backgroundImage,
      0,
      0,
      this.width,
      this.height
    )
  }

  drawGround() {
    const { state } = this
    const { bgSpeed } = state.settings
    const groundImgWidth = sprites.ground.w / 2
    // const groundImgWidth = 1920;

    this.paintSprite('ground', state.groundX, state.groundY)
    // this.canvasCtx.drawImage(this.backgroundImage, state.groundX, state.groundY, 1920, this.height);
    state.groundX -= bgSpeed * state.speedRatio

    // append second image until first is fully translated
    if (state.groundX <= -groundImgWidth + this.width) {
      this.paintSprite('ground', state.groundX + groundImgWidth, state.groundY)
      // this.canvasCtx.drawImage(this.backgroundImage, state.groundX + groundImgWidth, state.groundY, 1920, this.height);

      if (state.groundX <= -groundImgWidth) {
        state.groundX = -bgSpeed * state.speedRatio
      }
    }
  }

  drawClouds() {
    const { clouds, settings } = this.state

    this.progressInstances(clouds)
    if (this.frameCount % settings.cloudSpawnRate === 0) {
      const newCloud = new Cloud()
      newCloud.speed = settings.bgSpeed * settings.cloudSpeedRelativeToBg
      newCloud.x = this.width
      newCloud.y = randInteger(this.height * 0.1, this.height * 0.4)
      //newCloud.y = randInteger(sprites.cloud.h+10, this.state.dinoGroundOffset - sprites.cloud.h - sprites.dinoDuckLeftLeg.h);
      clouds.push(newCloud)
    }
    this.paintInstances(clouds)
  }

  drawDino() {
    const { dino } = this.state

    // determine expire
    if (dino.powerUp !== 'none') {
      console.log(dino.powerUp)
      dino.powerUpTime--
      if (dino.powerUpTime <= 0) {
        this.state.dino.blinking(false)
        dino.powerUp = 'none'
        console.log('powerUp expired')
      }
    }

    dino.nextFrame(this.state.speedRatio)
    this.paintSprite(dino.sprite, dino.x, dino.y)
  }

  drawProgressBar() {
    const { canvasCtx, state } = this
    const { dino } = state
    const { powerUpTime, powerUpMaxTime, powerUp } = dino
    const width = 200
    const height = 30
    const margin = {
      top: 10,
      left: 10,
    }

    if (powerUp !== 'none' && powerUp !== 'week') {
      const progress = (powerUpTime / powerUpMaxTime) * 100
      const progressWidth = (width * progress) / 100

      canvasCtx.fillStyle = '#535353'
      canvasCtx
        .roundRect(margin.left, margin.top, width, height, height / 2)
        .fill()
      canvasCtx.fillStyle = '#f7f7f7'
      canvasCtx
        .roundRect(margin.left, margin.top, progressWidth, height, height / 2)
        .fill()
    }
  }

  drawBullets() {
    const { bullets, settings } = this.state

    this.progressInstances(bullets)
    if (
      this.frameCount % settings.bulletSpawnRate === 0 &&
      this.state.dino.powerUp === 'guitar'
    ) {
      const newBullet = new Bullet()
      newBullet.speed = settings.bulletSpeed
      newBullet.x = this.state.dino.x + this.state.dino.width
      newBullet.y = this.state.dino.y + this.state.dino.height / 2
      bullets.push(newBullet)
      // console.log(bullets);
    }
    this.paintInstances(bullets)
  }

  drawItems(spawnedObstacle, spawnedBird) {
    const { state } = this
    const { items, settings } = this.state
    let spawned = false

    this.progressInstances(items)
    if (this.frameCount % settings.itemSpawnRate === 0) {
      if (randBoolean() && state.dino.powerUp === 'none') {
        spawned = true
        const newItem = new Item()
        newItem.speed = settings.bgSpeed
        newItem.x = this.width
        newItem.y = state.dino.baseY - newItem.height - 100 * randInteger(0, 2)
        if (spawnedObstacle) {
          newItem.y = state.dino.baseY - newItem.height - 250
        }
        if (spawnedBird) {
          newItem.y = state.dino.baseY - newItem.height
        }
        items.push(newItem)
      }
    }
    this.paintInstances(items)
    return spawned
  }

  drawObstacles() {
    const { state } = this
    const { obstacles, dino, settings } = state
    let spawned = false

    this.progressInstances(obstacles)
    if (this.frameCount % settings.obstaclesSpawnRate === 0) {
      // randomly either do or don't add obstacle
      if (!state.birds.length && randBoolean() && dino.powerUp !== 'eater') {
        spawned = true
        const newObstacles = new Obstacle(this.spriteImageData)
        newObstacles.speed = settings.bgSpeed
        newObstacles.x = this.width
        newObstacles.y = state.dino.baseY - newObstacles.height
        obstacles.push(newObstacles)
      }
    }
    this.paintInstances(obstacles)
    return spawned
  }

  drawBirds() {
    const { birds, settings, dino, obstacles } = this.state
    let spawned = false

    this.progressInstances(birds)
    if (this.frameCount % settings.birdSpawnRate === 0) {
      // When the bird reaches the player, if there is an obstacle being too close to it, don't spawn the bird.
      const reachPlayerTime = (this.width - dino.x) / settings.birdSpeed
      var tooCloseToOb = false
      for (const ob of obstacles) {
        if (
          Math.abs(ob.x - reachPlayerTime * settings.bgSpeed - dino.x) <
          dino.width * 3
        ) {
          tooCloseToOb = true
          break
        }
      }

      // randomly either do or don't add bird
      if (!tooCloseToOb && randBoolean() && dino.powerUp !== 'eater') {
        spawned = true
        const newBird = new Bird(this.spriteImageData)
        newBird.speed = settings.birdSpeed
        newBird.x = this.width
        // ensure birds are always at least 5px higher than a ducking dino
        newBird.y =
          dino.baseY - Bird.maxBirdHeight - 5 - sprites.dinoDuckLeftLeg.h / 2
        birds.push(newBird)
      }
    }
    this.paintInstances(birds)
    return spawned
  }

  drawFoods() {
    const { state } = this
    const { foods, dino, settings } = state
    let spawned = false

    this.progressInstances(foods)
    if (
      dino.powerUp === 'eater' &&
      this.frameCount % settings.foodSpawnRate === 0
    ) {
      spawned = true
      const newFood = new Food(this.spriteImageData)
      newFood.speed = settings.bgSpeed
      newFood.x = this.width
      newFood.y =
        state.dino.baseY - newFood.height + this.foodHeightFunc(this.frameCount)
      foods.push(newFood)
    }
    this.paintInstances(foods)
    return spawned
  }

  foodHeightFunc(cnt) {
    if (this.state.foodHeightMode === 0) {
      return -150 - 100 * Math.sin(cnt / 15.0)
    } else if (this.state.foodHeightMode === 1) {
      return randInteger(-300, -10)
    } else {
      return -220 * Math.abs(Math.sin(cnt / 14.0))
    }
  }

  drawScore() {
    // console.log(this.state.score)
    const { canvasCtx, state } = this
    const { isRunning, score, settings } = state
    const fontSize = 30
    const margin = 10
    let shouldDraw = true
    let drawValue = score.value + score.bonus

    if (isRunning && score.isBlinking) {
      score.blinkFrames++

      if (score.blinkFrames % settings.scoreBlinkRate === 0) {
        score.blinks++
      }

      if (score.blinks > 7) {
        score.blinkFrames = 0
        score.blinks = 0
        score.isBlinking = false
      } else {
        if (score.blinks % 2 === 0) {
          drawValue = Math.floor(drawValue / 100) * 100
        } else {
          shouldDraw = false
        }
      }
    }

    let drawValueStr = ''
    if (shouldDraw) {
      drawValueStr = `HI ${changeToString(this.highestScore)} ${changeToString(
        drawValue
      )}`
    } else {
      drawValueStr = `HI ${changeToString(this.highestScore)}      `
    }
    canvasCtx.fillStyle = 'rgb(211, 231, 181)'
    canvasCtx.fillRect(
      this.width - fontSize * 14 - margin,
      margin,
      fontSize * 14,
      fontSize
    )

    this.paintText(drawValueStr, this.width - margin, margin, {
      font: 'PressStart2P',
      size: `${fontSize}px`,
      align: 'right',
      baseline: 'top',
      color: '#535353',
    })
  }

  drawFoodScoreTexts() {
    const { state } = this
    const { foodScoreTextAlpha, dino, settings } = state
    const fontSize = 30

    this.paintText(
      '+' + settings.foodScore,
      dino.x + dino.width / 2,
      dino.y - 20,
      {
        font: 'PressStart2P',
        size: `${fontSize}px`,
        align: 'center',
        baseline: 'bottom',
        color: 'rgba(83, 83, 83, ' + foodScoreTextAlpha + ')',
      }
    )
  }

  /**
   * For each instance in the provided array, calculate the next
   * frame and remove any that are no longer visible
   * @param {Actor[]} instances
   */
  progressInstances(instances) {
    for (let i = instances.length - 1; i >= 0; i--) {
      const instance = instances[i]

      instance.nextFrame(this.state.speedRatio)
      if (instance.rightX <= 0 || instance.x > this.width) {
        // remove if off screen
        instances.splice(i, 1)
      }
    }
  }

  /**
   * @param {Actor[]} instances
   */
  paintInstances(instances) {
    for (const instance of instances) {
      this.paintSprite(instance.sprite, instance.x, instance.y)
    }
  }

  paintSprite(spriteName, dx, dy) {
    const { h, w, x, y } = sprites[spriteName]
    this.canvasCtx.drawImage(this.spriteImage, x, y, w, h, dx, dy, w / 2, h / 2)
  }

  paintText(text, x, y, opts) {
    const { font = 'serif', size = '12px' } = opts
    const { canvasCtx } = this

    canvasCtx.font = `${size} ${font}`
    if (opts.align) canvasCtx.textAlign = opts.align
    if (opts.baseline) canvasCtx.textBaseline = opts.baseline
    if (opts.color) canvasCtx.fillStyle = opts.color
    canvasCtx.fillText(text, x, y)
  }
}
