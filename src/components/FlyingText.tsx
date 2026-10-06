import { ComponentX, Label, Tween } from '@safe-engine/sdl'

export default class FlyingText extends ComponentX {
  label: Label
  onAwake() {
    Tween.to(this.node, { y: 450 }, 2, {
      onComplete: () => {
        this.node.destroy()
      },
    })
  }

  __view() {
    <Label $ref={this.label} />
  }
}
