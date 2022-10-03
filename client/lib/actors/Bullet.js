import Actor from './Actor.js'

export default class Bullet extends Actor {
  constructor(canvasWidth) {
    super()
    this.sprite = 'bullet'

    this.speed = null
    this.x = null
    this.y = null
  }

  nextFrame() {
    this.x += this.speed
  }

  destroy() {
    // console.log('Bullet destroyed')
    this.x = -100
    this.y = -100
  }
}
