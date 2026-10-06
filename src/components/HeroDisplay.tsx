import { BaseComponentProps, ComponentX, Container, SpineData, SpineSkeleton, Tween, TweenHandle, TweenSequence, Vec2 } from '@safe-engine/sdl'
import { sp_target_hero, sp_ui_arrow } from '../assets'
import AudioController from '../binding/AudioController'
import { GameState } from '../data/GameState'
import { JUMPED, MOVE_ANIM_DONE } from '../network/constant.network'
import { FINISH_POSITION } from '../network/map'

interface HeroDisplayProps extends BaseComponentProps<HeroDisplay> {
  skeletonData: SpineData
}

export default class HeroDisplay extends ComponentX<HeroDisplayProps> {
  initPosition: Vec2
  actionTime = 0
  spineSkeleton: SpineSkeleton
  spineTarget: SpineSkeleton
  spineArrow: SpineSkeleton
  movePoints: Array<Vec2> = []
  private tweens: Array<TweenHandle | TweenSequence> = []
  private highlightTween: TweenSequence | null = null

  private trackTween<T extends TweenHandle | TweenSequence>(tween: T): T {
    this.tweens.push(tween)
    return tween
  }

  private stopTweens() {
    this.stopHighlightTween()
    this.tweens.forEach(tween => tween.stop())
    this.tweens = []
  }

  private stopHighlightTween() {
    this.highlightTween?.stop()
    this.highlightTween = null
  }

  private startHighlightPulse() {
    const fullScale = this.node.scaleX < 0 ? -1 : 1
    const pulseScale = this.node.scaleX < 0 ? -0.9 : 0.9
    this.highlightTween = Tween.sequence()
      .to(this.node, { scaleX: pulseScale, scaleY: 0.9 }, 2)
      .to(this.node, { scaleX: fullScale, scaleY: 1 }, 2)
      .call(() => this.startHighlightPulse())
      .start()
  }

  start() {
    this.initPosition = Vec2(this.node.x, this.node.y)
    this.stopHighlight()
  }

  heroJump(times) {
    this.stopTweens()
    const tl = Tween.sequence()
    for (let i = 0; i < times; i++) {
      tl.to(this.node, { y: this.node.y - 20 }, 0.5)
      tl.to(this.node, { y: this.node.y + 20 }, 0.5)
    }
    this.trackTween(tl.start())
  }

  highlight() {
    this.stopHighlightTween()
    this.startHighlightPulse()
    this.node.zIndex = 10
    this.spineTarget.node.active = true
    this.spineArrow.node.active = true
  }

  stopHighlight() {
    this.stopHighlightTween()
    this.node.scaleX = this.node.scaleX < 0 ? -1 : 1
    this.node.scaleY = 1
    this.node.zIndex = 0
    this.spineTarget.node.active = false
    this.spineArrow.node.active = false
  }

  onMoveDone(isReachFinish: boolean) {
    if (isReachFinish) {
      this.stopHighlight()
      this.node.active = false
    }
    this.node.emit(MOVE_ANIM_DONE, isReachFinish)
  }

  move(from: number, to: number, ladder: number, snake: number, kick: number) {
    this.node.active = true
    this.stopTweens()
    const movePosList = this.movePoints
    let paths = from > to ? movePosList.slice(to + 1, from + 1) : movePosList.slice(from + 1, to + 1)
    const tl = Tween.sequence()
    if (kick) {
      this.spineSkeleton?.play('Idle', true)
      paths = movePosList.slice(kick, from + 1).reverse()
      // log('kick', kick, paths);
      paths.forEach(({ x, y }) => {
        tl.to(this.node, { x, y }, 1.2)
      })
      this.actionTime = 0.2 * paths.length
      if (kick !== to) {
        const { x, y } = movePosList[to]
        this.actionTime += 1.4
        tl.to(this.node, { x, y }, 1.4)
      }
      tl.call(() => {
        this.onMoveDone(to === FINISH_POSITION[GameState.mapIndex])
        this.spineSkeleton?.play('Idle', true)
      })
      this.trackTween(tl.start())
      return
    }
    this.spineSkeleton?.play('Run', true)
    if (ladder) {
      paths = movePosList.slice(from + 1, ladder + 1)
    } else if (snake) {
      paths = movePosList.slice(from + 1, snake + 1)
    }
    // this.heroJump(paths.length);
    console.log('move', from, to, ladder, snake, kick, paths)
    const stepHopTime = 0.30
    const landPauseTime = 0.08

    paths.forEach(({ x, y }, i) => {
      const startX = i === 0 ? this.node.x : (this.node.tag === 1 ? paths[i - 1].x + 12 : paths[i - 1].x)
      const startY = i === 0 ? this.node.y : paths[i - 1].y
      const targetX = this.node.tag === 1 ? x + 12 : x
      const targetY = y
      const baseScaleX = startX < targetX ? -1 : 1
      const jumpArc = 25

      const animState = { t: 0 }

      tl.to(animState, { t: 1 }, stepHopTime, {
        onStart: () => {
          AudioController.Instance.playStepSound()
          this.node.scaleX = baseScaleX
        },
        onUpdate: () => {
          const t = animState.t
          this.node.x = startX + (targetX - startX) * t
          const arcY = Math.sin(t * Math.PI) * jumpArc
          this.node.y = startY + (targetY - startY) * t - arcY
        }
      })
        .call(() => {
          this.node.x = targetX
          this.node.y = targetY
          this.node.emit(JUMPED, from + i)
        })
        .to(this.node, {
          scaleX: baseScaleX * 1.1,
          scaleY: 0.85
        }, landPauseTime)
        .to(this.node, {
          scaleX: baseScaleX,
          scaleY: 1
        }, 0.04)
    })
    tl.call(() => {
      this.onMoveDone(to === FINISH_POSITION[GameState.mapIndex])
      this.spineSkeleton.play('Idle', true)
    })
    this.trackTween(tl.start())
    const totalStepTime = stepHopTime + landPauseTime + 0.04
    this.actionTime = totalStepTime * paths.length
    if (ladder || snake) {
      this.actionTime += 1.4
    }
  }

  snakeMove(from: number, to: number) {
    this.stopTweens()
    const movePosList = this.movePoints
    if (!movePosList || !movePosList[from] || !movePosList[to]) {
      this.onMoveDone(false)
      return
    }

    const headPos = movePosList[from]
    this.node.x = this.node.tag === 1 ? headPos.x + 12 : headPos.x
    this.node.y = headPos.y
    this.node.active = true

    const tl = Tween.sequence()
      // Wait for snake bite motion to strike hero (0.3s)
      .delay(0.3)
      // Hero disappears / gets swallowed into snake head
      .call(() => {
        this.node.active = false
      })
      // Wait for attack animation to finish (0.8s)
      .delay(0.8)
      // Move to snake tail position and reappear
      .call(() => {
        const tailPos = movePosList[to]
        this.node.x = this.node.tag === 1 ? tailPos.x + 12 : tailPos.x
        this.node.y = tailPos.y
        this.node.active = true
        this.spineSkeleton?.play('Idle', true)
        this.onMoveDone(to === FINISH_POSITION[GameState.mapIndex])
      })

    this.actionTime = 1.1
    this.trackTween(tl.start())
  }

  ladderMove(to: number) {
    this.node.active = true
    this.stopTweens()
    const movePosList = this.movePoints
    if (!movePosList || !movePosList[to]) {
      this.onMoveDone(false)
      return
    }

    const targetX = this.node.tag === 1 ? movePosList[to].x + 12 : movePosList[to].x
    const targetY = movePosList[to].y
    const startX = this.node.x
    const startY = this.node.y
    const baseScaleX = startX < targetX ? -1 : 1

    // Ensure normal scale and Idle animation at the foot of the ladder/bridge
    this.node.scaleX = baseScaleX
    this.node.scaleY = 1
    this.spineSkeleton?.play('Idle', true)

    const animState = { t: 0 }

    const tl = Tween.sequence()
      // Pause 0.3s at foot of ladder/bridge
      .delay(0.3)
      // Start slide straight across the bridge without any jump/bounce effect
      .call(() => {
        AudioController.Instance.playLadderSound()
        this.node.scaleX = baseScaleX
        this.node.scaleY = 1
        this.spineSkeleton?.play('Run', true)
      })
      // Smooth straight linear slide to target position across the bridge
      .to(animState, { t: 1 }, 0.8, {
        onUpdate: () => {
          const t = animState.t
          this.node.x = startX + (targetX - startX) * t
          this.node.y = startY + (targetY - startY) * t
        }
      })
      // Arrive at destination tile
      .call(() => {
        this.node.x = targetX
        this.node.y = targetY
        this.node.scaleX = baseScaleX
        this.node.scaleY = 1
        this.spineSkeleton?.play('Idle', true)
        this.onMoveDone(to === FINISH_POSITION[GameState.mapIndex])
      })

    this.actionTime = 1.15
    this.trackTween(tl.start())
  }

  appear() {
    if (!this.movePoints || !this.movePoints[1]) {
      this.onMoveDone(false)
      return
    }
    this.stopTweens()

    const startX = this.node.x
    const startY = this.node.y
    const targetX = this.node.tag === 1 ? this.movePoints[1].x + 12 : this.movePoints[1].x
    const targetY = this.movePoints[1].y

    const baseScaleX = startX < targetX ? -1 : 1
    const jumpHeight = 160

    this.node.active = true
    this.spineSkeleton?.play('Run', true)
    AudioController.Instance.playStepSound()

    const animState = { t: 0 }

    const tl = Tween.sequence()
      // Crouch / Anticipation (0.1s)
      .to(this.node, {
        scaleX: baseScaleX * 1.15,
        scaleY: 0.75
      }, 0.1)
      // High parabolic jump vọt lên (0.6s)
      .to(animState, { t: 1 }, 0.6, {
        onUpdate: () => {
          const t = animState.t
          this.node.x = startX + (targetX - startX) * t
          const arcY = Math.sin(t * Math.PI) * jumpHeight
          this.node.y = startY + (targetY - startY) * t - arcY

          // Mid-air stretch & squash
          const stretch = Math.sin(t * Math.PI)
          this.node.scaleY = 1 + stretch * 0.25
          this.node.scaleX = baseScaleX * (1 - stretch * 0.15)
        }
      })
      // Landing on board tile (0.08s)
      .call(() => {
        this.node.x = targetX
        this.node.y = targetY
        this.node.emit(JUMPED, 0)
        AudioController.Instance.playStepSound()
      })
      .to(this.node, {
        scaleX: baseScaleX * 1.15,
        scaleY: 0.8
      }, 0.08)
      // Recover to Idle (0.08s)
      .to(this.node, {
        scaleX: baseScaleX,
        scaleY: 1
      }, 0.08)
      .call(() => {
        this.spineSkeleton?.play('Idle', true)
        this.onMoveDone(false)
      })

    this.actionTime = 0.86
    this.trackTween(tl.start())
  }

  resetPosition() {
    if (this.initPosition) {
      this.node.x = this.initPosition.x
      this.node.y = this.initPosition.y
      this.node.active = true
    }
  }

  __view() {
    <Container node={{ width: 120, height: 160 }}>
      <SpineSkeleton $ref={this.spineTarget} data={sp_target_hero} animation="Idle" skin="1" />
      <SpineSkeleton $ref={this.spineSkeleton} data={this.props.skeletonData} animation="Idle" />
      <SpineSkeleton $ref={this.spineArrow} data={sp_ui_arrow} animation="animation" node={{ x: 1, y: -68 }} />
    </Container>
  }
}
