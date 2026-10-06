import { BaseComponentProps, ComponentX, SpineData, SpineSkeleton } from '@safe-engine/sdl'
import { ROLL_ANIM_DONE } from '../network/constant.network'

interface RollingDiceProps extends BaseComponentProps<RollingDice> {
  skeletonData: SpineData
  skin: string
}
export default class RollingDice extends ComponentX<RollingDiceProps> {
  face = 0
  spineSkeleton: SpineSkeleton = null

  setSkin(diceSkel) {
    this.spineSkeleton.setSkeletonData(diceSkel)
    this.spineSkeleton.props.onAnimationComplete = this.onAnimationComplete.bind(this)
  }

  onAnimationComplete(trackName, loopCount) {
    console.log('RollingDice', trackName, loopCount)
    if (trackName === 'Run') {
      this.spineSkeleton.play(`${this.face}`, false)
    } else {
      this.node.emit(ROLL_ANIM_DONE, this.face)
    }
  }

  startRoll(result: number, skin: string) {
    this.node.active = true
    this.face = result
    // this.onAnimCompleted()
    console.log('startRoll', result, skin)
    // this.spineSkeleton.node.skeleton.setSkinByName(`${skin}`)
    this.spineSkeleton.play('Run', true)
  }

  __view() {
    <SpineSkeleton
      $ref={this.spineSkeleton}
      data={this.props.skeletonData}
      animation="6"
      node={{ active: false }}
      // skin={this.props.skin}
      loop={false}
      onAnimationComplete={this.onAnimationComplete}
    />
  }
}
