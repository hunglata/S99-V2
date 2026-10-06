import { BaseComponentProps, ComponentX, Label, Node, Sprite } from '@safe-engine/sdl'
import { sf_avatar_1, sf_background_name } from '../assets'
import { BLACK, RED } from '../helper/colors'
import HeroDisplay from './HeroDisplay'
import RollingDice from './RollingDice'

interface PlayerControlProps extends BaseComponentProps<PlayerControl> {
  isLeft?: boolean
}

export default class PlayerControl extends ComponentX<PlayerControlProps> {
  labelCount: Label = null
  spriteCount: Sprite = null
  spriteAvatar: Sprite = null
  spriteLand: Sprite = null
  labelName: Label = null
  dice: RollingDice = null
  circleNode: Node = null
  chesses: HeroDisplay[] = []
  diceSkin = '1'
  // avatarsHero: Node[] = []

  setup(name = '', frame) {
    this.labelName.string = name
    this.spriteAvatar.spriteFrame = frame
  }

  rollDice(result) {
    this.dice.startRoll(result, this.diceSkin)
  }

  moveChess(index, from, position, ladder, snake, kick) {
    const chess = this.chesses[index]
    if (kick) {
      chess.move(from, position, ladder, snake, kick)
    } else if (snake) {
      chess.snakeMove(from, position)
    } else if (ladder) {
      chess.ladderMove(position)
    } else if (!from) {
      this.appear(index)
    } else {
      chess.move(from, position, ladder, snake, kick)
    }
  }

  appear(index) {
    const chess = this.chesses[index]
    chess.appear()
    // this.avatarsHero[index].active = false
  }

  showChessCanMove(canMoveList = []) {
    // log(isCanMove);
    this.chesses.forEach((chess, index) => {
      if (canMoveList.includes(index)) {
        chess.highlight()
        // this.avatarsHero[index].color = WHITE
      } else {
        chess.stopHighlight()
        // this.avatarsHero[index].color = GRAY
      }
    })
  }

  hideChessCanMove() {
    this.chesses.forEach((chess) => {
      chess.stopHighlight()
    })
  }

  resetChesses() {
    this.chesses.forEach((chess) => {
      chess.resetPosition()
      chess.stopHighlight()
    })
  }

  __view() {
    <Sprite $ref={this.spriteLand} spriteFrame={sf_background_name} node={{ zIndex: -1 }}>
      <Sprite $ref={this.spriteAvatar} spriteFrame={sf_avatar_1} node={{ x: this.props.isLeft ? -180 : 180 }}>
        <Label $ref={this.labelCount} string="10" node={{ color: RED, active: false }} size={120} />
      </Sprite>
      <Label $ref={this.labelName} string="Player" outline={[BLACK, 3]} size={32} />
    </Sprite>
  }
}
