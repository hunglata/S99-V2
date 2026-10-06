import { Button, ComponentX, Label, SpineSkeleton, Sprite } from '@safe-engine/sdl'
import { sf_btn_confirm, sf_icon_gold, sf_popup_giftcode, sp_g_item_giftbox } from '../assets'
import { BLACK, GREEN, ORANGE } from '../helper/colors'

export default class RewardDialog extends ComponentX {
  lbReward: Label
  openSpine: SpineSkeleton

  show(result) {
    this.lbReward.string = `+${result.gold || result.gem}`
    this.openSpine.play('Run', false)
    this.node.active = true
  }

  onPress() {
    this.node.active = false
  }

  __view() {
    <Sprite spriteFrame={sf_popup_giftcode}>
      <Label string="You rewards" node={{ xy: [0, -250], color: ORANGE }} />
      <SpineSkeleton $ref={this.openSpine} data={sp_g_item_giftbox} animation="Idle" />
      <Sprite spriteFrame={sf_icon_gold} node={{ xy: [-3, -50] }}>
        <Label $ref={this.lbReward} string="defaultFont" node={{ x: 7, y: 140, color: GREEN }} outline={[BLACK, 5]} />
      </Sprite>
      <Button spriteFrame={sf_btn_confirm} node={{ x: 0, y: 207 }} onPress={this.onPress} />
    </Sprite>
  }
}
