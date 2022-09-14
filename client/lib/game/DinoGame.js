import Bird from "../actors/Bird.js";
import Obstacle from "../actors/Obstacle.js";
import Cloud from "../actors/Cloud.js";
import Dino from "../actors/Dino.js";
import Bullet from "../actors/Bullet.js";
import Item from "../actors/Item.js";
import sprites from "../sprites.js";
import { playSound } from "../sounds.js";
import {
  loadFont,
  loadImage,
  getImageData,
  randBoolean,
  randInteger,
} from "../utils.js";
import GameRunner from "./GameRunner.js";

export default class DinoGame extends GameRunner {
  constructor(width, height, endGameRoute) {
    super();

    this.width = null;
    this.height = null;
    this.canvas = this.createCanvas(width, height);
    this.canvasCtx = this.canvas.getContext("2d");
    this.spriteImage = null;
    this.spriteImageData = null;
    this.endGameRoute = endGameRoute;

    /*
     * units
     * fpa: frames per action
     * ppf: pixels per frame
     * px: pixels
     */
    this.defaultSettings = {
      bgSpeed: 8, // ppf
      birdSpeed: 7.2, // ppf
      birdSpawnRate: 240, // fpa
      birdWingsRate: 15, // fpa
      obstaclesSpawnRate: 50, // fpa
      cloudSpawnRate: 200, // fpa
      cloudSpeed: 2, // ppf
      dinoGravity: 0.5, // ppf
      dinoGroundOffset: 4, // px
      dinoLegsRate: 6, // fpa
      dinoLift: 10, // ppf
      bulletSpawnRate: 20, // fpa
      bulletSpeed: 10, // ppf
      itemSpawnRate: 200, // fpa
      powerUpTimes: {
        // seconds
        guitar: 3,
        dance: 3,
        band: 3,
        eater: 3,
        week: 3,
        covid: 3,
      },
      scoreBlinkRate: 20, // fpa
      scoreIncreaseRate: 6, // fpa
    };

    this.state = {
      settings: { ...this.defaultSettings },
      birds: [],
      obstacles: [],
      clouds: [],
      bullets: [],
      items: [],
      dino: null,
      gameOver: false,
      groundX: 0,
      groundY: 0,
      isRunning: false,
      level: 0,
      speedRatio: 1,
      score: {
        blinkFrames: 0,
        blinks: 0,
        isBlinking: false,
        value: 0,
      },
    };
  }

  // ref for canvas pixel density:
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#correcting_resolution_in_a_%3Ccanvas%3E
  createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio;

    this.width = width;
    this.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);

    document.body.appendChild(canvas);
    return canvas;
  }

  async preload() {
    const { settings } = this.state;
    const [spriteImage] = await Promise.all([
      loadImage("./assets/sprite.png"),
      loadFont("./assets/PressStart2P-Regular.ttf", "PressStart2P"),
    ]);
    this.spriteImage = spriteImage;
    this.spriteImageData = getImageData(spriteImage);
    const dino = new Dino(this.spriteImageData);

    dino.legsRate = settings.dinoLegsRate;
    dino.lift = settings.dinoLift;
    dino.gravity = settings.dinoGravity;
    dino.x = 25;
    dino.baseY = this.height - settings.dinoGroundOffset;
    this.state.dino = dino;
    this.state.groundY = this.height - sprites.ground.h / 2;
  }

  onFrame() {
    const { state } = this;

    this.drawBackground();
    this.drawFPS();
    this.drawGround();
    this.drawClouds();
    this.drawDino();
    this.drawScore();

    if (state.isRunning) {
      let spawnedObstacle, spawnedBird, spawnedItem;
      this.drawBullets();

      spawnedObstacle = this.drawObstacles();

      if (state.level > 3) {
        spawnedBird = this.drawBirds();
      }

      spawnedItem = this.drawItems(spawnedObstacle, spawnedBird);

      if (state.dino.hits([state.obstacles[0], state.birds[0]])) {
        if (this.state.dino.powerUp !== "band") {
          playSound("game-over");
          state.gameOver = true;
        }
      }

      // bullets hit
      state.bullets.forEach((bullet) => {
        if (bullet.hits([state.obstacles[0]])) {
          state.obstacles.shift();
          bullet.destroy();
          // playSound("hit");
        }
        if (bullet.hits([state.birds[0]])) {
          state.birds.shift();
          bullet.destroy();
          // playSound("hit");
        }
      });

      // items hit
      state.items.forEach((item) => {
        if (item.hits([state.dino])) {
          item.destroy();
          state.dino.powerUp = item.sprite;
          state.dino.powerUpTime =
            state.settings.powerUpTimes[item.sprite] * this.frameRate;
          playSound("level-up");

          switch ((this, state.dino.powerUp)) {
            case "guitar":
              break;
            case "dance":
              this.state.speedRatio = 2;
              break;
            case "band":
              this.state.speedRatio = 0.5;
              state.dino.blinking(true);
              break;
            case "eater":
              break;
            case "week":
              break;
            case "covid":
              break;
          }
        }
      });

      if (state.gameOver) {
        this.endGame();
      } else {
        this.updateScore();
      }
    }
  }

  onInput(type) {
    const { state } = this;

    switch (type) {
      case "jump": {
        if (state.isRunning) {
          if (state.dino.jump()) {
            playSound("jump");
          }
        } else {
          this.resetGame();
          state.dino.jump();
          playSound("jump");
        }
        break;
      }

      case "duck": {
        if (state.isRunning) {
          state.dino.duck(true);
        }
        break;
      }

      case "stop-duck": {
        if (state.isRunning) {
          state.dino.duck(false);
        }
        break;
      }
    }
  }

  resetGame() {
    this.state.dino.reset();
    Object.assign(this.state, {
      settings: { ...this.defaultSettings },
      birds: [],
      obstacles: [],
      gameOver: false,
      isRunning: true,
      level: 0,
      score: {
        blinkFrames: 0,
        blinks: 0,
        isBlinking: false,
        value: 0,
      },
    });

    this.start();
  }

  endGame() {
    const iconSprite = sprites.replayIcon;
    const padding = 15;

    this.paintText(
      "G A M E  O V E R",
      this.width / 2,
      this.height / 2 - padding,
      {
        font: "PressStart2P",
        size: "12px",
        align: "center",
        baseline: "bottom",
        color: "#535353",
      }
    );

    // this.paintSprite(
    //   'replayIcon',
    //   this.width / 2 - iconSprite.w / 4,
    //   this.height / 2 - iconSprite.h / 4 + padding
    // )

    this.state.isRunning = false;
    this.drawScore();
    this.stop();
    setTimeout(this.endGameRoute, 500);
  }

  increaseDifficulty() {
    const { birds, obstacles, clouds, dino, settings } = this.state;
    const { bgSpeed, obstaclesSpawnRate, dinoLegsRate } = settings;
    const { level } = this.state;

    if (level > 4 && level < 8) {
      settings.bgSpeed++;
      settings.birdSpeed = settings.bgSpeed * 0.8;
    } else if (level > 7) {
      settings.bgSpeed = Math.ceil(bgSpeed * 1.1);
      settings.birdSpeed = settings.bgSpeed * 0.9;
      settings.obstaclesSpawnRate = Math.floor(obstaclesSpawnRate * 0.98);

      if (level > 7 && level % 2 === 0 && dinoLegsRate > 3) {
        settings.dinoLegsRate--;
      }
    }

    for (const bird of birds) {
      bird.speed = settings.birdSpeed;
    }

    for (const obstacle of obstacles) {
      obstacle.speed = settings.bgSpeed;
    }

    for (const cloud of clouds) {
      cloud.speed = settings.bgSpeed;
    }

    dino.legsRate = settings.dinoLegsRate;
  }

  updateScore() {
    const { state } = this;

    if (this.frameCount % state.settings.scoreIncreaseRate === 0) {
      const oldLevel = state.level;

      state.score.value++;
      state.level = Math.floor(state.score.value / 100);

      if (state.level !== oldLevel) {
        playSound("level-up");
        this.increaseDifficulty();
        state.score.isBlinking = true;
      }
    }
  }

  drawFPS() {
    this.paintText("fps: " + Math.round(this.frameRate), 0, 0, {
      font: "PressStart2P",
      size: "12px",
      baseline: "top",
      align: "left",
      color: "#535353",
    });
  }

  drawBackground() {
    this.canvasCtx.fillStyle = "#f7f7f7";
    this.canvasCtx.fillRect(0, 0, this.width, this.height);
  }

  drawGround() {
    const { state } = this;
    const { bgSpeed } = state.settings;
    const groundImgWidth = sprites.ground.w / 2;

    this.paintSprite("ground", state.groundX, state.groundY);
    state.groundX -= bgSpeed * state.speedRatio;

    // append second image until first is fully translated
    if (state.groundX <= -groundImgWidth + this.width) {
      this.paintSprite("ground", state.groundX + groundImgWidth, state.groundY);

      if (state.groundX <= -groundImgWidth) {
        state.groundX = -bgSpeed * state.speedRatio;
      }
    }
  }

  drawClouds() {
    const { clouds, settings } = this.state;

    this.progressInstances(clouds);
    if (this.frameCount % settings.cloudSpawnRate === 0) {
      const newCloud = new Cloud();
      newCloud.speed = settings.bgSpeed;
      newCloud.x = this.width;
      newCloud.y = randInteger(20, 80);
      clouds.push(newCloud);
    }
    this.paintInstances(clouds);
  }

  drawDino() {
    const { dino } = this.state;

    // determine expire
    if (dino.powerUp !== "none") {
      console.log(dino.powerUp);
      dino.powerUpTime--;
      if (dino.powerUpTime <= 0) {
        switch (dino.powerUp) {
          case "guitar":
            break;
          case "dance":
          case "band":
            this.state.speedRatio = 1;
            this.state.dino.blinking(false);
            break;
          case "eater":
            break;
          case "week":
            break;
          case "covid":
            break;
        }
        dino.powerUp = "none";
        console.log("powerup expired");
      }
    }

    dino.nextFrame(this.state.speedRatio);
    this.paintSprite(dino.sprite, dino.x, dino.y);
  }

  drawBullets() {
    const { bullets, settings } = this.state;

    this.progressInstances(bullets);
    if (
      this.frameCount % settings.bulletSpawnRate === 0 &&
      this.state.dino.powerUp === "guitar"
    ) {
      const newBullet = new Bullet();
      newBullet.speed = settings.bulletSpeed;
      newBullet.x = this.state.dino.x + this.state.dino.width;
      newBullet.y = this.state.dino.y + this.state.dino.height / 2;
      bullets.push(newBullet);
      // console.log(bullets);
    }
    this.paintInstances(bullets);
  }

  drawItems(spawnedObstacle, spawnedBird) {
    const { state } = this;
    const { items, settings } = this.state;
    let spawned = false;

    this.progressInstances(items);
    if (this.frameCount % settings.itemSpawnRate === 0) {
      if (randBoolean() && state.dino.powerUp === "none") {
        spawned = true;
        const newItem = new Item();
        newItem.speed = settings.bgSpeed;
        newItem.x = this.width;
        newItem.y = this.height - newItem.height - 50 * randInteger(0, 2);
        if (spawnedObstacle) {
          newItem.y = this.height - newItem.height - 100;
        }
        if (spawnedBird) {
          newItem.y = this.height - newItem.height;
        }
        items.push(newItem);
      }
    }
    this.paintInstances(items);
    return spawned;
  }

  drawObstacles() {
    const { state } = this;
    const { obstacles, settings } = state;
    let spawned = false;

    this.progressInstances(obstacles);
    if (this.frameCount % settings.obstaclesSpawnRate === 0) {
      // randomly either do or don't add obstacle
      if (!state.birds.length && randBoolean()) {
        spawned = true;
        const newObstacles = new Obstacle(this.spriteImageData);
        newObstacles.speed = settings.bgSpeed;
        newObstacles.x = this.width;
        newObstacles.y = this.height - newObstacles.height - 2;
        obstacles.push(newObstacles);
      }
    }
    this.paintInstances(obstacles);
    return spawned;
  }

  drawBirds() {
    const { birds, settings } = this.state;
    let spawned = false;

    this.progressInstances(birds);
    if (this.frameCount % settings.birdSpawnRate === 0) {
      // randomly either do or don't add bird
      if (randBoolean()) {
        spawned = true;
        const newBird = new Bird(this.spriteImageData);
        newBird.speed = settings.birdSpeed;
        newBird.wingsRate = settings.birdWingsRate;
        newBird.x = this.width;
        // ensure birds are always at least 5px higher than a ducking dino
        newBird.y =
          this.height -
          Bird.maxBirdHeight -
          Bird.wingSpriteYShift -
          5 -
          sprites.dinoDuckLeftLeg.h / 2 -
          settings.dinoGroundOffset;
        birds.push(newBird);
      }
    }
    this.paintInstances(birds);
    return spawned;
  }

  drawScore() {
    const { canvasCtx, state } = this;
    const { isRunning, score, settings } = state;
    const fontSize = 12;
    let shouldDraw = true;
    let drawValue = score.value;

    if (isRunning && score.isBlinking) {
      score.blinkFrames++;

      if (score.blinkFrames % settings.scoreBlinkRate === 0) {
        score.blinks++;
      }

      if (score.blinks > 7) {
        score.blinkFrames = 0;
        score.blinks = 0;
        score.isBlinking = false;
      } else {
        if (score.blinks % 2 === 0) {
          drawValue = Math.floor(drawValue / 100) * 100;
        } else {
          shouldDraw = false;
        }
      }
    }

    if (shouldDraw) {
      // draw the background behind it in case this is called
      // at a time where the background isn't re-drawn (i.e. in `endGame`)
      canvasCtx.fillStyle = "#f7f7f7";
      canvasCtx.fillRect(this.width - fontSize * 5, 0, fontSize * 5, fontSize);

      this.paintText((drawValue + "").padStart(5, "0"), this.width, 0, {
        font: "PressStart2P",
        size: `${fontSize}px`,
        align: "right",
        baseline: "top",
        color: "#535353",
      });
    }
  }

  /**
   * For each instance in the provided array, calculate the next
   * frame and remove any that are no longer visible
   * @param {Actor[]} instances
   */
  progressInstances(instances) {
    for (let i = instances.length - 1; i >= 0; i--) {
      const instance = instances[i];

      instance.nextFrame(this.state.speedRatio);
      if (instance.rightX <= 0 || instance.x > this.width) {
        // remove if off screen
        instances.splice(i, 1);
      }
    }
  }

  /**
   * @param {Actor[]} instances
   */
  paintInstances(instances) {
    for (const instance of instances) {
      this.paintSprite(instance.sprite, instance.x, instance.y);
    }
  }

  paintSprite(spriteName, dx, dy) {
    const { h, w, x, y } = sprites[spriteName];
    this.canvasCtx.drawImage(
      this.spriteImage,
      x,
      y,
      w,
      h,
      dx,
      dy,
      w / 2,
      h / 2
    );
  }

  paintText(text, x, y, opts) {
    const { font = "serif", size = "12px" } = opts;
    const { canvasCtx } = this;

    canvasCtx.font = `${size} ${font}`;
    if (opts.align) canvasCtx.textAlign = opts.align;
    if (opts.baseline) canvasCtx.textBaseline = opts.baseline;
    if (opts.color) canvasCtx.fillStyle = opts.color;
    canvasCtx.fillText(text, x, y);
  }
}
