import { randInteger } from '../utils.js'
import Actor from './Actor.js'

export default class Cloud extends Actor {
  constructor(canvasWidth) {
    super()
    this.sprite = 'cloud'
    this.speedMod = randInteger(8, 12) / 10
    // these are dynamically set by the game
    this.speed = null
    this.x = null
    this.y = null
  }

  nextFrame(speedRatio) {
    this.x -= this.speed * this.speedMod * speedRatio
  }
}
