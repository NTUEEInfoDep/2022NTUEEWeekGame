import { randItem } from "../utils.js";
import Actor from "./Actor.js";

const VARIANTS = ["obstacleGate", "obstacleCode"];

export default class Obstacle extends Actor {
  constructor(imageData) {
    super(imageData);
    this.sprite = randItem(VARIANTS);
    // these are dynamically set by the game
    this.speed = null;
    this.x = null;
    this.y = null;
  }

  nextFrame(speedRatio) {
    this.x -= this.speed * speedRatio;
  }
}
