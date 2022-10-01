import Actor from './Actor.js'

export default class Food extends Actor {
  constructor(imageData) {
    super(imageData)
    this.sprite = 'food'

    this.speed = null
    this.x = null
    this.y = null
  }

  nextFrame(speedRatio) {
    this.x -= this.speed * speedRatio
  }

  destroy() {
    console.log('Food destroyed')
    this.x = -100
    this.y = -100
  }
}
