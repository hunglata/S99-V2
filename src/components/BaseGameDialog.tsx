import { BaseComponentProps, ComponentX, Easing, Node, Sprite, Tween } from '@safe-engine/sdl'
import { DialogWrap } from './DialogWrap'

interface BaseGameDialogProps extends BaseComponentProps<BaseGameDialog> {
  spriteFrame: string
}
export default class BaseGameDialog extends ComponentX<BaseGameDialogProps> {
  dialogNode: Node

  show() {
    const duration: Float = 0.8
    this.dialogNode.scale = 0.8
    this.node.active = true
    this.node.parent.active = true
    Tween.to(this.dialogNode, { scale: 1 }, duration, {
      ease: Easing.backOut,
    })
  }

  hide() {
    const duration: Float = 0.6
    Tween.to(this.dialogNode, { scale: 0.1 }, duration, {
      ease: Easing.cubicIn,
      onComplete: () => this.onCompleteHide(),
    })
  }

  onCompleteHide() {
    this.node.active = false
    if (this.node.parent.getComponent(DialogWrap))
      this.node.parent.active = false
  }

  __view() {
    <Sprite $refNode={this.dialogNode} spriteFrame={this.props.spriteFrame} />
  }
}
