import { Button, instantiate, Label, loadAll, loadScene, Scene, SpineSkeleton, Sprite, Touch, TouchEventRegister, Widget } from '@safe-engine/sdl'

import { postRedeems } from '../api/redeem'
import { button_sfx, sf_avatar_1, sf_background_1, sf_background_name, sf_battle, sf_bg_button, sf_bg_text, sf_button_add, sf_bxh, sf_character_1, sf_character_2, sf_character_3, sf_character_4, sf_daily_reward, sf_friends, sf_ic_gem_bg, sf_ic_gold_bg, sf_island, sf_lucky_wheel, sf_shop, sp_touch } from '../assets'
import { showRewardedAd } from '../binding/AdMob'
import AudioController from '../binding/AudioController'
import DailyReward from '../components/DailyReward'
import GiftCodeDialog from '../components/GiftCodeDialog'
import LuckySpin from '../components/LuckySpin'
import RewardDialog from '../components/RewardDialog'
import { GameState } from '../data/GameState'
import { BROWN } from '../helper/colors'
import { createWarningText } from '../helper/func'
import BotGame from './BotGame'
import Matching from './Matching'
import Shop from './Shop'

export default class Home extends Scene {
  lbGold: Label
  lbGem: Label
  lbName: Label
  spAvatar: Sprite
  giftCodeDialog: GiftCodeDialog
  rewardDialog: RewardDialog
  dailyReward: DailyReward
  luckySpin: LuckySpin

  onLoad() {
    const touchListener = this.node.addComponent(TouchEventRegister, {
      onTouchStart: touch => this.showTouchEffect(touch),
      consumeInput: false,
    })
    touchListener.inputPriority = Number.MAX_SAFE_INTEGER
  }

  async onEnter() {
    AudioController.Instance.playBackgroundMusic()
    // test_addBuildTimeLabel()
    const { profile } = GameState
    this.lbGem.string = `${profile.gem}`
    this.lbGold.string = `${profile.gold}`
    this.lbName.string = profile.name || 'chicky'
    if (profile.avatar) {
      console.log('avatar', profile)
      const texture = await loadAll([profile.avatar])
      this.spAvatar.spriteFrame = texture[0]
    }
    try {
      await this.dailyReward.show(true)
    } catch (error) {
      console.error('Failed to load daily reward', error)
    }
    // loadScene(Game)
  }

  showTouchEffect(touch: Touch) {
    const effect = instantiate(SpineSkeleton, {
      data: sp_touch,
      animation: 'animation',
      loop: false,
      onAnimationComplete: () => effect.node.destroy(),
    })
    effect.node.position = touch.getLocation()
    effect.node.zIndex = 1000
    this.node.addChild(effect.node)
  }

  onPressGame() {
    AudioController.Instance.playEffectSound(button_sfx)
    GameState.loadingScene = 'bot'
    loadScene(BotGame)
  }

  onPressFriend() {
    AudioController.Instance.playEffectSound(button_sfx)
    GameState.loadingScene = 'match'
    loadScene(Matching)
  }

  onPressShop() {
    AudioController.Instance.playEffectSound(button_sfx)
    GameState.loadingScene = 'shop'
    loadScene(Shop)
  }

  onPressAvatar() {
    this.giftCodeDialog.baseGameDialog.show()
  }

  onPressDaily() {
    AudioController.Instance.playEffectSound(button_sfx)
    void this.dailyReward.show()
  }

  async onEnterCode(code: string) {
    try {
      const result = await postRedeems(code)
      this.rewardDialog.show(result)
      this.giftCodeDialog.baseGameDialog.hide()
      const { profile } = GameState
      if (result.gem) {
        profile.gem += result.gem
        this.lbGem.string = `${profile.gem}`
      }
      if (result.gold) {
        profile.gold += result.gold
        this.lbGold.string = `${profile.gold}`
      }
    } catch (error) {
      const warning = createWarningText(error.data.message)
      warning.node.setPosition(this.node.width * 0.5, this.node.height * 0.5)
      this.node.addChild(warning.node)
    }
  }

  onPressLuckyWheel() {
    AudioController.Instance.playEffectSound(button_sfx)
    this.luckySpin.show()
  }

  onLuckySpinReward() {
    const { profile } = GameState
    this.lbGem.string = `${profile.gem}`
    this.lbGold.string = `${profile.gold}`
  }

  __view() {
    <Scene>
      <Sprite spriteFrame={sf_background_1} node={{ x: 563, y: 1218 }} />
      <Sprite spriteFrame={sf_island} node={{ x: 548, y: 1207 }}>
        <Sprite spriteFrame={sf_bxh} node={{ x: -238, y: -721 }}>
          <Sprite spriteFrame={sf_bg_text} node={{ x: -1, y: 105 }}>
            <Label string="Ranking" />
          </Sprite>
        </Sprite>
        <Button spriteFrame={sf_shop} node={{ x: -163, y: -158 }} onPress={this.onPressShop}>
          <Sprite spriteFrame={sf_bg_text} node={{ x: 6, y: 98 }}>
            <Label string="Shop" />
          </Sprite>
        </Button>
        <Button spriteFrame={sf_friends} node={{ x: -54, y: 258 }} onPress={this.onPressFriend}>
          <Sprite spriteFrame={sf_bg_text} node={{ x: 15, y: 176 }}>
            <Label string="Friend" />
          </Sprite>
        </Button>
        <Button spriteFrame={sf_battle} node={{ x: -130, y: 781 }} onPress={this.onPressGame}>
          <Sprite spriteFrame={sf_bg_text} node={{ x: -23, y: 217 }}>
            <Label string="Battle" />
          </Sprite>
        </Button>
        <Sprite spriteFrame={sf_character_3} node={{ x: 203, y: 703 }} />
        <Sprite spriteFrame={sf_character_4} node={{ x: 153, y: 585 }} />
        <Sprite spriteFrame={sf_character_1} node={{ x: 71, y: 71 }} />
        <Sprite spriteFrame={sf_character_2} node={{ x: 180, y: -34 }} />
      </Sprite>
      <Button spriteFrame={sf_bg_button} node={{ x: 984, y: 573 }} onPress={this.onPressLuckyWheel}>
        <Sprite spriteFrame={sf_lucky_wheel} node={{ x: -1, y: 24 }} />
        <Label string="Lucky" node={{ x: 1, y: -64 }} size={40} />
      </Button>
      <Button spriteFrame={sf_bg_button} node={{ x: 976, y: 379 }} onPress={this.onPressDaily}>
        <Sprite spriteFrame={sf_daily_reward} node={{ x: 2, y: 20 }} />
        <Label string="Daily" node={{ x: -7, y: -67 }} size={40} />
      </Button>
      <Button spriteFrame={sf_background_name} node={{ x: 202, y: 50 }} onPress={this.onPressAvatar}>
        <Sprite $ref={this.spAvatar} spriteFrame={sf_avatar_1} node={{ x: -121, y: 22 }} />
        <Label $ref={this.lbName} node={{ x: 25, color: BROWN }} string="no name" size={48} />
        <Widget top={50} left={60} />
      </Button>
      <Sprite spriteFrame={sf_ic_gold_bg} node={{ x: 592, y: 2299 }}>
        <Label $ref={this.lbGold} node={{ x: 34, y: 1, color: BROWN }} string="1000" size={48} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -44, y: 15 }} />
        <Widget top={50} />
      </Sprite>
      <Sprite spriteFrame={sf_ic_gem_bg} node={{ x: 904, y: 2294 }}>
        <Label $ref={this.lbGem} node={{ color: BROWN, x: 48, y: 2, anchorX: 0.5, anchorY: 0.5 }} string="20" size={48} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -48, y: 23 }} />
        <Widget top={50} />
      </Sprite>
      <GiftCodeDialog $ref={this.giftCodeDialog} node={{ active: false }} onEnterCode={this.onEnterCode} />
      <RewardDialog $ref={this.rewardDialog} node={{ active: false }} />
      <DailyReward
        $ref={this.dailyReward}
        node={{ active: false }}
        onClose={() => {
          this.dailyReward.node.active = false
          const { profile } = GameState
          if (profile) {
            this.lbGem.string = `${profile.gem}`
            this.lbGold.string = `${profile.gold}`
          }
        }}
        onWatchAd={showRewardedAd}
      />
      <LuckySpin
        $ref={this.luckySpin}
        node={{ active: false }}
        onWatchAd={showRewardedAd}
        onReward={this.onLuckySpinReward}
      />
    </Scene>
  }
}
