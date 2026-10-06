import { Button, ComponentX, Label, loadScene, Node, Sprite, Widget } from '@safe-engine/sdl'
import {
  sf_background_play_2,
  sf_button_add,
  sf_button_home,
  sf_button_replay,
  sf_ic_gem_bg,
  sf_ic_gold_bg,
  sf_icon_vs,
  sf_logo_lost,
  sf_logo_win,
} from '../assets'
import { GameState } from '../data/GameState'
import { BLACK, BROWN, GREEN, YELLOW } from '../helper/colors'
import Game from '../scene/Game'
import Home from '../scene/Home'
import BaseGameDialog from './BaseGameDialog'
import ResultUIPlayer from './ResultUIPlayer'

export default class ResultDialog extends ComponentX {
  lbInfo: Label
  lbScore: Label
  lbGold: Label
  lbGem: Label
  // uiPlayerLeft: ResultUIPlayer
  // uiPlayerRight: ResultUIPlayer
  dialog: BaseGameDialog
  titleSprite: Sprite = null
  nextOppBtn: Node = null
  rematchBtn: Node = null
  players: ResultUIPlayer[] = []

  hide() {
    this.dialog.hide()
  }

  onClickRematch() {
    loadScene(Game)
  }

  onClickHome() {
    loadScene(Home)
  }

  showResult(isWin, selfScore, oppScore) {
    this.node.active = true
    this.titleSprite.spriteFrame = isWin ? sf_logo_win : sf_logo_lost
    this.dialog.show()
    this.lbScore.string = `${selfScore}:${oppScore}`
    // this.rematchBtn.node.opacity = 255
    // this.rematchBtn.enabled = true
    const earn = isWin ? 100 : 10
    // setCoin(getCoin() + earn)
    GameState.profile.gold += earn
  }

  __view() {
    <BaseGameDialog $ref={this.dialog} spriteFrame={sf_background_play_2} node={{ xy: [582, 1380], anchorX: 0.525, anchorY: 0.572 }}>
      <Label $ref={this.lbInfo} node={{ x: -73, y: 47, color: YELLOW }} string="You play like a legend" outline={[BLACK, 6]} />
      <Sprite spriteFrame={sf_ic_gold_bg} node={{ x: 14, y: -1303 }}>
        <Label $ref={this.lbGold} node={{ x: 37, y: 3, color: BROWN }} string="1000" size={48} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -61, y: 15 }} />
        <Widget top={-1352} />
      </Sprite>
      <Sprite spriteFrame={sf_ic_gem_bg} node={{ x: 390, y: -1303 }}>
        <Label $ref={this.lbGem} node={{ x: 55, y: 11, color: BROWN }} string="20" size={48} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -41, y: 15 }} />
        <Widget top={-1352} />
      </Sprite>
      <Sprite $ref={this.titleSprite} spriteFrame={sf_logo_lost} node={{ x: -15, y: -452 }} />
      <Button spriteFrame={sf_button_replay} node={{ x: 216, y: 901 }} onPress={this.onClickRematch}>
        <Widget bottom={1441} />
      </Button>
      <Button spriteFrame={sf_button_home} node={{ x: -297, y: 904 }} onPress={this.onClickHome}>
        <Widget bottom={1436} />
      </Button>
      <Sprite spriteFrame={sf_icon_vs} node={{ x: -37, y: 276 }}>
        <Label $ref={this.lbScore} node={{ x: 12, y: 1195, color: GREEN }} string="1 : 0" outline={[BLACK, 6]} />
      </Sprite>
      <ResultUIPlayer $push={this.players} node={{ x: -383, y: 295 }} />
      <ResultUIPlayer $push={this.players} node={{ x: 275, y: 280 }} />
      <Widget centerHorizon centerVertical />
    </BaseGameDialog>
  }
}
