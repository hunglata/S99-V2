import { BaseComponentProps, Button, ComponentX, Easing, Label, Node, SpineSkeleton, Sprite, Tween, Widget } from '@safe-engine/sdl'
import { postLuckySpinsClaim } from '../api/luckySpin'
import { button_sfx, sf_ads_watch_button, sf_background_1, sf_btn_back, sf_button_add, sf_ic_gem_bg, sf_ic_gold_bg, sf_icon_gem, sf_icon_gold, sf_kim_vong_xoay, sf_vong_xoay, sp_text_lucky_spine } from '../assets'
import { isNativeApp } from '../binding/AdMob'
import AudioController from '../binding/AudioController'
import { GameState } from '../data/GameState'
import { BLACK, BROWN, WHITE, YELLOW } from '../helper/colors'
import { DialogWrap } from './DialogWrap'

interface LuckySpinProps extends BaseComponentProps<LuckySpin> {
  onWatchAd: () => Promise<boolean>
  onReward?: (reward: LuckySpinReward) => void
}

export default class LuckySpin extends ComponentX<LuckySpinProps> {
  lbGold: Label
  lbGem: Label
  wheelNode: Node
  rewardEffectNode: Node
  rewardEffectLabel: Label
  watchingAd = false
  spinning = false
  waitingForReward = false

  show() {
    const { profile } = GameState
    this.lbGold.string = `${profile.gold}`
    this.lbGem.string = `${profile.gem}`
    this.node.active = true
  }

  onPressBack() {
    AudioController.Instance.playEffectSound(button_sfx)
    this.node.active = false
  }

  async onPressWatchAd() {
    if (this.watchingAd || this.spinning) return
    if (!isNativeApp) {
      await this.claimReward()
      return
    }
    this.watchingAd = true
    try {
      if (!await this.props.onWatchAd()) return
      await this.claimReward()
    } finally {
      this.watchingAd = false
    }
  }

  async claimReward() {
    this.spinning = true
    this.waitingForReward = true
    try {
      const reward = await postLuckySpinsClaim()
      this.waitingForReward = false
      this.spinToReward(reward)
    } catch (error) {
      this.waitingForReward = false
      this.spinning = false
      console.error('Failed to claim Lucky Spin reward', error)
    }
  }

  spinToReward(reward: LuckySpinReward, claimReward = true) {
    const targetRotation = reward.gold === 500
      ? 0
      : reward.gem === 5
        ? -45
        : reward.gold === 1000
          ? -90
          : reward.gem === 10
            ? -135
            : reward.gold === 2000
              ? -180
              : reward.gem === 15
                ? -225
                : reward.gold === 800
                  ? -270
                  : -315
    const currentRotation = this.wheelNode.rotation % 360
    Tween.to(this.wheelNode, { rotation: this.wheelNode.rotation + 1800 + targetRotation - currentRotation }, 3, {
      ease: Easing.cubicOut,
      onComplete: () => claimReward ? this.showReward(reward) : this.finishSpin(),
    })
  }

  showReward(reward: LuckySpinReward) {
    const { profile } = GameState
    profile.gold += reward.gold
    profile.gem += reward.gem
    this.lbGold.string = `${profile.gold}`
    this.lbGem.string = `${profile.gem}`
    this.props.onReward?.(reward)

    this.rewardEffectLabel.string = reward.gold ? `+${reward.gold} GOLD` : `+${reward.gem} GEM`
    this.rewardEffectNode.active = true
    this.rewardEffectNode.scale = 0.5
    this.rewardEffectNode.opacity = 0
    Tween.sequence()
      .to(this.rewardEffectNode, { scale: 1.2, opacity: 255 }, 0.25, { ease: Easing.backOut })
      .delay(0.8)
      .to(this.rewardEffectNode, { scale: 1.5, opacity: 0 }, 0.25, { ease: Easing.cubicIn })
      .call(() => {
        this.rewardEffectNode.active = false
        this.finishSpin()
      })
      .start()
  }

  finishSpin() {
    this.spinning = false
  }

  onUpdate(dt: number) {
    if (this.waitingForReward) this.wheelNode.rotation += dt * 720
  }

  __view() {
    <DialogWrap>
      <Sprite spriteFrame={sf_background_1} node={{ xy: [0, 0] }} />
      <Button spriteFrame={sf_btn_back} node={{ x: -481, y: -1144 }} onPress={this.onPressBack} />
      <Sprite spriteFrame={sf_ic_gold_bg} node={{ x: 37, y: -1115 }}>
        <Label $ref={this.lbGold} node={{ x: 40, y: 2, color: BROWN }} string="0" size={44} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -44, y: 18 }} />
        <Widget top={-1164} inSafeArea={false} />
      </Sprite>
      <Sprite spriteFrame={sf_ic_gem_bg} node={{ x: 347, y: -1115 }}>
        <Label $ref={this.lbGem} node={{ x: 45, y: 2, color: BROWN }} string="0" size={44} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -48, y: 23 }} />
        <Widget top={-1164} inSafeArea={false} />
      </Sprite>
      <SpineSkeleton data={sp_text_lucky_spine} node={{ x: 0, y: -722 }} />
      <Sprite $refNode={this.wheelNode} spriteFrame={sf_vong_xoay} node={{ x: 0, y: 0, scale: 0.9 }}>
        <Sprite spriteFrame={sf_icon_gold} node={{ x: 0, y: -270, scale: 1.6, rotation: 0 }}>
          <Label node={{ y: 45, color: WHITE }} string="500" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gem} node={{ x: 190, y: -190, scale: 1.6, rotation: 45 }}>
          <Label node={{ y: 45, color: WHITE }} string="5" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gold} node={{ x: 270, y: 0, scale: 1.6, rotation: 90 }}>
          <Label node={{ y: 45, color: WHITE }} string="1K" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gem} node={{ x: 190, y: 190, scale: 1.6, rotation: 135 }}>
          <Label node={{ y: 45, color: WHITE }} string="10" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gold} node={{ x: 0, y: 270, scale: 1.6, rotation: 180 }}>
          <Label node={{ y: 45, color: WHITE }} string="2K" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gem} node={{ x: -190, y: 190, scale: 1.6, rotation: -135 }}>
          <Label node={{ y: 45, color: WHITE }} string="15" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gold} node={{ x: -270, y: 0, scale: 1.6, rotation: -90 }}>
          <Label node={{ y: 45, color: WHITE }} string="800" size={25} outline={[BLACK, 3]} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_gem} node={{ x: -190, y: -190, scale: 1.6, rotation: -45 }}>
          <Label node={{ y: 45, color: WHITE }} string="20" size={25} outline={[BLACK, 3]} />
        </Sprite>
      </Sprite>
      <Sprite spriteFrame={sf_kim_vong_xoay} node={{ x: 0, y: 0, anchorX: 0.512, anchorY: 0.628 }} />
      <Label $ref={this.rewardEffectLabel} $refNode={this.rewardEffectNode} node={{ x: 0, y: 580, active: false, scale: 0.5, opacity: 0, color: YELLOW }} string="+500 GOLD" size={52} outline={[BLACK, 6]} />
      <Button spriteFrame={sf_ads_watch_button} node={{ x: 0, y: 900 }} onPress={this.onPressWatchAd}>
        <Label string="Watch To Spin" />
      </Button>
    </DialogWrap>
  }
}
