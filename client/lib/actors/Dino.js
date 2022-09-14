import Actor from "./Actor.js";

export default class Dino extends Actor {
  constructor(imageData) {
    super(imageData);
    this.isDucking = false;
    this.powerUp = "none";
    this.powerUpTime = 0;
    this.legFrames = 0;
    this.legShowing = "Left";
    this.sprite = `dino${this.legShowing}Leg`;
    this.vVelocity = null;
    this.baseY = 0;
    this.relativeY = 0;
    // these are dynamically set by the game
    this.legsRate = null;
    this.lift = null;
    this.gravity = null;
    this.blink = false;
    this.shine = 0;
  }

  get y() {
    return this.baseY - this.height + this.relativeY;
  }

  set y(value) {
    this.baseY = value;
  }

  reset() {
    this.isDucking = false;
    this.powerUp = "none";
    this.legFrames = 0;
    this.legShowing = "Left";
    this.sprite = `dino${this.legShowing}Leg`;
    this.vVelocity = null;
    this.relativeY = 0;
    this.blink = false;
    this.shine = 0;
  }

  jump() {
    if (this.relativeY === 0) {
      this.vVelocity = -this.lift;
      return true;
    }
    return false;
  }

  blinking(value) {
    this.blink = Boolean(value);
  }

  duck(value) {
    this.isDucking = Boolean(value);
  }

  nextFrame(speedRatio) {
    if (this.vVelocity !== null) {
      // use gravity to gradually decrease vVelocity
      this.vVelocity += this.gravity * speedRatio;
      this.relativeY += this.vVelocity * speedRatio;
    }

    // stop falling once back down to the ground
    if (this.relativeY > 0) {
      this.vVelocity = null;
      this.relativeY = 0;
    }

    this.determineSprite();
  }

  determineSprite() {
    if (this.blink) {
      console.log("owo");
      this.shine += 1;
      if (this.shine < 20) {
        this.sprite = `dinodisappear`;
        return;
      } else if (this.shine > 40) {
        this.shine = 0;
      }
    }
    if (this.relativeY < 0) {
      // in the air stiff
      this.sprite = "dino";
    } else {
      // on the ground running
      if (this.legFrames >= this.legsRate) {
        this.legShowing = this.legShowing === "Left" ? "Right" : "Left";
        this.legFrames = 0;
      }

      if (this.isDucking) {
        this.sprite = `dinoDuck${this.legShowing}Leg`;
      } else {
        this.sprite = `dino${this.legShowing}Leg`;
      }

      this.legFrames++;
    }
  }
}
