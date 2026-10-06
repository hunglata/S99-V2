import { BaseComponentProps, Button, ComponentX, Label, Node, Sprite } from '@safe-engine/sdl'
import { sf_icon_gem, sf_icon_gold, sf_icon_tick, sf_s_item_hero_1, sf_s_slot_item, sf_s_strock_slot } from '../assets'
import { BROWN } from '../helper/colors'

interface ShopItemProps extends BaseComponentProps<ShopItem> {
  onPress: (i: Button) => void
}
export default class ShopItem extends ComponentX<ShopItemProps> {
  lbGold: Label
  spriteCurrency: Sprite
  spriteIcon: Sprite
  nodeSelected: Node
  nodeIconTick: Node
  id: number

  get IsBought() {
    return !this.spriteCurrency.node.active
  }

  get IsUsed() {
    return this.nodeIconTick.active
  }

  selected() {
    this.nodeSelected.active = true
  }

  reset() {
    this.nodeSelected.active = false
  }

  used() {
    this.nodeIconTick.active = true
  }

  unused() {
    this.nodeIconTick.active = false
  }

  bought() {
    this.spriteCurrency.node.active = false
    this.lbGold.node.active = false
  }

  setPrice(price = 0, priceGem = 0) {
    if (priceGem) {
      this.spriteCurrency.spriteFrame = sf_icon_gem
    }
    this.lbGold.string = `${priceGem || price}`
  }

  __view() {
    <Button spriteFrame={sf_s_slot_item} onPress={this.props.onPress}>
      <Sprite $ref={this.spriteIcon} spriteFrame={sf_s_item_hero_1} />
      <Sprite $refNode={this.nodeIconTick} spriteFrame={sf_icon_tick} node={{ x: 109, y: -157, active: false }} />
      <Sprite $refNode={this.nodeSelected} spriteFrame={sf_s_strock_slot} node={{ active: false }} />
      <Sprite spriteFrame={sf_icon_gold} node={{ x: -97, y: 149 }} $ref={this.spriteCurrency}>
        <Label $ref={this.lbGold} align="left" node={{ x: 130, width: 200, color: BROWN }} string="1000" size={48} />
      </Sprite>
    </Button>
  }
}
