import { Button, ComponentX, Container, Label, Node, SpineSkeleton, Widget } from '@safe-engine/sdl'
import { sf_slot_dice, sp_dice_1, sp_dice_2, sp_gui_hand, sp_ui_your_turn } from '../assets'
import { COUNT_END, PLAY_TIME, ROLL_DICE } from '../network/constant.network'
import BackButton from './BackButton'
import BaseGameDialog from './BaseGameDialog'
import PlayerControl from './PlayerControl'
import ResultDialog from './ResultDialog'
import RollingDice from './RollingDice'

export default class UIController extends ComponentX {
  pauseDialog: BaseGameDialog
  lifeLabel: Label
  goldLabel: Label
  waveLabel: Label
  resultDialog: ResultDialog = null
  turnSprite: SpineSkeleton = null
  // labelCount: Label = null
  turnNode: Node = null
  handNode: Node = null
  playerRight: PlayerControl
  playerLeft: PlayerControl
  isThisPlayer: boolean

  count = PLAY_TIME

  onAnimationComplete() {
    // console.log('track, loopCount')
    this.turnSprite.node.active = false
  }

  startBattle() {
    // this.waitingNode.active = false;
    this.resultDialog.hide()
    // this.winEffect.stopSystem()
  }

  showResult(isWin, selfScore, oppScore) {
    // this.winEffect.resetSystem()
    this.handNode.active = false
    this.scheduleOnce(() => {
      this.resultDialog.showResult(isWin, selfScore, oppScore)
    }, 0.8)
  }

  showTurn(isSelf) {
    this.turnSprite.node.active = isSelf
    this.handNode.active = isSelf
    this.turnSprite.play('animation', false)
    // if (isSelf) {
    //   this.playerLeft.labelCount.node.active = true
    //   this.playerLeft.dice.node.active = true
    // } else {
    //   this.playerRight.labelCount.node.active = true
    //   this.playerRight.dice.node.active = true
    // }
    this.isThisPlayer = isSelf
    // this.handNode.active = false
    // this.turnSprite.spriteFrame = UIController.turnFrames[isSelf ? 0 : 1]
    // this.scheduleOnce(() => {
    // this.turnSprite.node.active = false
    // }, 0.8)
  }

  startCountDown(count = PLAY_TIME) {
    this.count = count
    // this.circleNode.active = true
    this.unscheduleAllCallbacks()
    this.updateCount(this.count)
    this.schedule(
      () => {
        this.count -= 1
        if (this.count < 0) {
          this.node.emit(COUNT_END)
          this.clearCount()
        } else {
          this.updateCount(this.count)
        }
      },
      1,
      count,
    )
  }

  updateCount(count: number) {
    if (this.isThisPlayer) this.playerLeft.labelCount.string = `${count}`
    else this.playerRight.labelCount.string = `${count}`
    // this.spriteCount.fillRange = (PLAY_TIME - count) / PLAY_TIME
  }

  clearCount() {
    this.unscheduleAllCallbacks()
    if (this.isThisPlayer) this.playerLeft.labelCount.string = ''
    else this.playerRight.labelCount.string = ''
    // this.spriteCount.fillRange = 0
    // this.circleNode.active = false
    this.handNode.active = false
  }

  onPress() {
    this.turnNode.emit(ROLL_DICE)
  }

  setLifeLabel(life: Integer) {
    this.lifeLabel.string = `life: ${life}`
  }

  setGoldLabel(gold: Integer) {
    this.goldLabel.string = `gold: ${gold}`
  }

  setWaveLabel(wave: Integer, total: Integer) {
    this.waveLabel.string = `wave ${wave}/${total}`
  }

  __view() {
    <Container>
      <Container node={{ x: 570, y: 1864 }}>
        <PlayerControl $ref={this.playerRight} node={{ x: 294 }} />
        <PlayerControl $ref={this.playerLeft} node={{ x: -294 }} isLeft />
        <Button $refNode={this.turnNode} spriteFrame={sf_slot_dice} node={{ anchorY: 0.55, rotation: 0 }} onPress={this.onPress} />
        <RollingDice $ref={this.playerRight.dice} skeletonData={sp_dice_1} skin="1" />
        <RollingDice $ref={this.playerLeft.dice} skeletonData={sp_dice_2} skin="2" />
        <SpineSkeleton $refNode={this.handNode} data={sp_gui_hand} animation="animation" />
        <Widget bottom={150} />
      </Container>
      <SpineSkeleton $ref={this.turnSprite} data={sp_ui_your_turn} node={{ x: 570, y: 1211 }} onAnimationComplete={this.onAnimationComplete} />
      <ResultDialog $ref={this.resultDialog} node={{ x: 563, y: 1218, active: false, zIndex: 11 }} />
      <BackButton />
    </Container>
  }
}
