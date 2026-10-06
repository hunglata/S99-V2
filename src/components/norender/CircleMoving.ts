import { ComponentX, Vec2 } from '@safe-engine/sdl'

export default class CircleMoving extends ComponentX {
  center: Vec2 = Vec2()
  radius = 20
  speed = 20
  angle = 0

  onUpdate(dt) {
    this.angle += dt * this.speed
    this.node.x = Math.cos(this.angle) * this.radius
    this.node.y = Math.sin(this.angle) * this.radius
  }
}
