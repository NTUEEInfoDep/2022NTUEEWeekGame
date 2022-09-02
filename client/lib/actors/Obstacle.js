import { randItem } from "../utils.js";
import Actor from "./Actor.js";

const VARIANTS = [
  "obstacle",
  "obstacleDouble",
  "obstacleDoubleB",
  "obstacleTriple",
];

export default class Obstacle extends Actor {
  constructor(imageData) {
    super(imageData);
    this.sprite = randItem(VARIANTS);
    // these are dynamically set by the game
    this.speed = null;
    this.x = null;
    this.y = null;
  }

  nextFrame() {
    this.x -= this.speed;
  }
}
