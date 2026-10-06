import { BaseComponentProps, Button, ComponentX, Label, Node, Sprite } from '@safe-engine/sdl'
import { sf_bar_1, sf_bar_2 } from '../assets'
import { BLACK } from '../helper/colors'

interface TabItemProps extends BaseComponentProps<TabItem> {
  icon: string
  title: string
  onSelect: (i: number) => void
}

export default class TabItem extends ComponentX<TabItemProps> {
  titleNode: Node
  iconNode: Node
  containerSprite: Sprite
  index: number

  selected() {
    this.containerSprite.spriteFrame = sf_bar_2
    this.iconNode.scale = 1.2
    this.titleNode.active = true
  }

  reset() {
    this.containerSprite.spriteFrame = sf_bar_1
    this.iconNode.scale = 1
    this.titleNode.active = false
  }

  onPress() {
    this.props.onSelect(this.index)
  }

  __view() {
    <Button $ref={this.containerSprite} spriteFrame={sf_bar_1} onPress={this.onPress}>
      <Sprite $refNode={this.iconNode} spriteFrame={this.props.icon} />
      <Label $refNode={this.titleNode} node={{ y: 30 }} string={this.props.title} outline={[BLACK, 5]} size={48} />
    </Button>
  }
}
