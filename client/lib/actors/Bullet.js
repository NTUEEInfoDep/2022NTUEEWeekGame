import Actor from "./Actor.js";

export default class Bullet extends Actor {
  constructor(canvasWidth) {
    super();
    this.sprite = "bullet";

    this.speed = null;
    this.x = null;
    this.y = null;
  }

  nextFrame() {
    this.x += this.speed;
  }
}
