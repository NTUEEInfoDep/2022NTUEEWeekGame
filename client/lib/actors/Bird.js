import sprites from '../sprites.js'
import { randItem } from '../utils.js'
import Actor from './Actor.js'

const VARIANTS = ['birdCircuit', 'birdPaper']

export default class Bird extends Actor {
  static maxBirdHeight =
    Math.max(sprites.birdCircuit.h, sprites.birdPaper.h) / 2

  constructor(imageData) {
    super(imageData)
    this.wingFrames = 0
    this.sprite = randItem(VARIANTS)
    // these are dynamically set by the game
    this.x = null
    this.y = null
    this.speed = null
  }

  nextFrame(speedRatio) {
    this.x -= this.speed * speedRatio
  }
}
