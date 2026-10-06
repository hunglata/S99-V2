import { ComponentX } from '@safe-engine/sdl'

export default class RotateForever extends ComponentX {
  onUpdate(dt: Float) {
    this.node.rotation += dt * 100
  }
}
