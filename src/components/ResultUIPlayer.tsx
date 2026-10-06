import { ComponentX, Label, Node, SpineSkeleton, Sprite } from '@safe-engine/sdl'
import { sf_avatar_2, sp_icon_ready } from '../assets'
import { BLACK } from '../helper/colors'

export default class ResultUIPlayer extends ComponentX {
  Sprite: Sprite
  lbName: Label
  lbStatus: Label
  readyNode: Node

  updateStatus(status: string) {
    this.lbStatus.string = status
  }

  __view() {
    <Sprite $ref={this.Sprite} spriteFrame={sf_avatar_2}>
      <SpineSkeleton $refNode={this.readyNode} data={sp_icon_ready} node={{ x: 93, y: 57 }} />
      <Label $ref={this.lbName} node={{ x: 4, y: 103 }} string="player" outline={[BLACK, 6]} />
      <Label $ref={this.lbStatus} node={{ x: 4, y: -101 }} string="status" outline={[BLACK, 6]} />
    </Sprite>
  }
}
