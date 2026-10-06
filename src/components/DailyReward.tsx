import { BaseComponentProps, Button, ComponentX, Container, Label, loadScene, Sprite, Widget } from '@safe-engine/sdl'
import { getDailyRewards, postDailyRewardsClaim } from '../api/dailyReward'
import { button_sfx, sf_banner_daily, sf_btn_back, sf_btn_confirm, sf_button_add, sf_daily_1, sf_daily_1_done, sf_ic_gem_bg, sf_ic_gold_bg, sf_icon_daily_gem, sf_icon_daily_gold, sf_icon_tick, sf_rectangle_16, sf_ads_watch_button } from '../assets'
import AudioController from '../binding/AudioController'
import { GameState } from '../data/GameState'
import { BLACK, BROWN, YELLOW, WHITE } from '../helper/colors'
import Home from '../scene/Home'
import { DialogWrap } from './DialogWrap'

export interface DailyRewardProps extends BaseComponentProps<DailyReward> {
  onClose?: () => void
  onClaim?: (reward: PostDailyRewardsClaimResponse) => void
  onWatchAd?: () => Promise<boolean>
}

export class DailyReward extends ComponentX<DailyRewardProps> {
  lbGold: Label
  lbGem: Label
  lbStreak: Label
  lbStatus: Label
  claimButton: Button
  watchAdButton: Button
  daySprites: Sprite[] = []
  dayTicks: Sprite[] = []
  reward: GetDailyRewardsResponse
  claiming = false
  watchingAd = false

  async show(onlyIfClaimable = false) {
    this.reward = await getDailyRewards()
    if (onlyIfClaimable && !this.reward.canClaim) return
    const { profile } = GameState
    if (this.lbGold && profile) {
      this.lbGold.string = `${profile.gold}`
    }
    if (this.lbGem && profile) {
      this.lbGem.string = `${profile.gem}`
    }
    this.updateRewardState()
    this.node.active = true
  }

  updateRewardState() {
    if (!this.reward) return
    const canClaim = this.reward.canClaim
    this.daySprites.forEach((sprite, index) => {
      sprite.spriteFrame = index < this.reward.claimedDays ? sf_daily_1_done : sf_daily_1
    })
    this.dayTicks.forEach((tick, index) => {
      tick.node.active = index < this.reward.claimedDays
    })
    this.claimButton.node.active = canClaim
    this.watchAdButton.node.active = canClaim
    if (this.lbStatus) {
      this.lbStatus.string = canClaim
        ? `Day ${this.reward.currentDay} reward is ready to claim!`
        : 'Come back tomorrow for the next reward!'
    }
  }

  onPressBack() {
    AudioController.Instance.playEffectSound(button_sfx)
    if (this.props.onClose) {
      this.props.onClose()
    } else {
      this.node.active = false
    }
  }

  async onPressClaim(doubled = false) {
    if (this.claiming || !this.reward?.canClaim) return
    AudioController.Instance.playEffectSound(button_sfx)
    this.claiming = true
    try {
      const claimed = await postDailyRewardsClaim(doubled)
      const { profile } = GameState
      profile.gold += claimed.gold
      profile.gem += claimed.gem
      this.reward = await getDailyRewards()
      this.updateRewardState()
      this.lbGold.string = `${profile.gold}`
      this.lbGem.string = `${profile.gem}`
      this.props.onClaim?.(claimed)
    } catch {
      this.lbStatus.string = 'Unable to claim reward. Please try again.'
    } finally {
      this.claiming = false
    }
  }

  onPressNormalClaim() {
    void this.onPressClaim(false)
  }

  async onPressWatchAd() {
    if (this.watchingAd || !this.reward?.canClaim) return
    if (!this.props.onWatchAd) {
      this.lbStatus.string = 'Rewarded ads are unavailable.'
      return
    }
    this.watchingAd = true
    try {
      if (await this.props.onWatchAd()) {
        await this.onPressClaim(true)
      } else {
        this.lbStatus.string = 'Ad is not ready. Please try again.'
      }
    } finally {
      this.watchingAd = false
    }
  }

  onPress() {
    loadScene(Home)
  }

  __view() {
    <DialogWrap>
      {/* Top Navigation & Currency Bar */}
      <Sprite spriteFrame={sf_rectangle_16} node={{ xy: [0, 0] }} />
      <Button spriteFrame={sf_btn_back} onPress={this.onPress} node={{ xy: [-481, -1144] }} />
      <Sprite spriteFrame={sf_ic_gold_bg} node={{ x: 37, y: -1115 }}>
        <Label $ref={this.lbGold} node={{ x: 40, y: 2, color: BROWN }} string="3.600" size={44} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -44, y: 18 }} />
        <Widget top={-1164} inSafeArea={false} />
      </Sprite>
      <Sprite spriteFrame={sf_ic_gem_bg} node={{ x: 347, y: -1115 }}>
        <Label $ref={this.lbGem} node={{ x: 45, y: 2, color: BROWN }} string="20" size={44} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -48, y: 23 }} />
        <Widget top={-1164} inSafeArea={false} />
      </Sprite>
      {/* Header Banner & Streak Progress Tracker */}
      <Sprite spriteFrame={sf_banner_daily} node={{ x: -23, y: -778 }} />
      {/* 7 Days Reward Grid */}
      {/* Row 1: Day 1, Day 2, Day 3 */}
      {/* Day 1 - Claimed */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1_done} node={{ x: -367, y: -338 }}>
        <Label node={{ x: 0, y: -120, color: BROWN }} string="Day 1" size={38} />
        <Sprite spriteFrame={sf_icon_daily_gold} node={{ x: 0, y: -5, scale: 0.9 }} />
        <Label node={{ x: 0, y: 110, color: BROWN }} string="300" size={36} />
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Day 2 - Claimed */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1} node={{ x: -23, y: -338 }}>
        <Label node={{ x: 0, y: -120, color: BROWN }} string="Day 2" size={38} />
        <Sprite spriteFrame={sf_icon_daily_gold} node={{ x: 0, y: -5, scale: 0.9 }} />
        <Label node={{ x: 0, y: 110, color: BROWN }} string="300" size={36} />
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Day 3 - Current / Claimable */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1} node={{ x: 333, y: -338 }}>
        <Label node={{ x: 0, y: -120, color: BROWN }} string="Day 3" size={38} />
        <Sprite spriteFrame={sf_icon_daily_gold} node={{ x: 0, y: -5, scale: 0.9 }} />
        <Label node={{ x: 0, y: 110, color: BROWN }} string="300" size={36} />
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Day 2 - Claimed */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1} node={{ x: -373, y: 32 }}>
        <Label node={{ x: 0, y: -120, color: BROWN }} string="Day 4" size={38} />
        <Sprite spriteFrame={sf_icon_daily_gold} node={{ x: 0, y: -5, scale: 0.9 }} />
        <Label node={{ x: 0, y: 110, color: BROWN }} string="300" size={36} />
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Day 3 - Current / Claimable */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1} node={{ x: -23, y: 32 }}>
        <Label node={{ x: 0, y: -120, color: BROWN }} string="Day 5" size={38} />
        <Sprite spriteFrame={sf_icon_daily_gem} node={{ x: 0, y: -5, scale: 0.9 }} />
        <Label node={{ x: 0, y: 110, color: BROWN }} string="30" size={36} />
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Row 2: Day 4, Day 5, Day 6 */}
      {/* Day 4 */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1} node={{ x: 330, y: 32 }}>
        <Label node={{ x: 0, y: -120, color: BROWN }} string="Day 6" size={38} />
        <Sprite spriteFrame={sf_icon_daily_gold} node={{ x: 0, y: -5, scale: 0.9 }} />
        <Label node={{ x: 0, y: 110, color: BROWN }} string="300" size={36} />
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Day 5 */}
      <Sprite $push={this.daySprites} spriteFrame={sf_daily_1} node={{ x: -23, y: 432, width: 1016 }} capInsets={[100, 115, 99, 83]} tiled={false}>
        <Sprite $push={this.dayTicks} spriteFrame={sf_icon_tick} node={{ scaleX: 3.2, scaleY: 3.2, active: false }} />
      </Sprite>
      {/* Day 6 */}
      <Container node={{ x: -23, y: 432 }}>
        <Label node={{ x: 0, y: -130, color: BROWN }} string="Day 7" size={42} />
        <Sprite spriteFrame={sf_icon_daily_gold} node={{ x: -150, y: 0, scale: 1 }}>
          <Label node={{ x: 0, y: 110, color: BROWN }} string="500" size={36} />
        </Sprite>
        <Sprite spriteFrame={sf_icon_daily_gem} node={{ x: 166, y: 0, scale: 1 }}>
          <Label node={{ x: 0, y: 110, color: BROWN }} string="50" size={36} />
        </Sprite>
      </Container>
      {/* Row 3: Day 7 Mega Reward */}
      <Label $ref={this.lbStatus} node={{ x: -23, y: 762, color: YELLOW }} string="Day 3 reward is ready to claim!" size={38} outline={[BLACK, 5]} />
      <Button $ref={this.claimButton} spriteFrame={sf_btn_confirm} node={{ x: -213, y: 902 }} onPress={this.onPressNormalClaim} />
      <Button $ref={this.watchAdButton} spriteFrame={sf_ads_watch_button} node={{ x: 167, y: 902, width: 357 }} onPress={this.onPressWatchAd} capInsets={[123, 0, 106, 0]}>
        <Label string="WATCH AD x2" node={{ color: WHITE, xy: [33, 0] }} size={28} />
      </Button>
    </DialogWrap>
  }
}

export default DailyReward
