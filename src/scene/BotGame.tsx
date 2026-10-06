import { instantiate, Label, loadAll, loadScene, Scene, SpineBonesControl, SpineSkeleton, Sprite, TiledMap, Touch, TouchEventRegister, Tween, TweenHandle, TweenSequence, Vec2, Widget } from '@safe-engine/sdl';
import { ding_sfx, map_1_json, sf_15, sf_8, sf_avatar_1, sf_avatar_2, sf_background_play_2, sf_cau_treo_1, sf_cloud, sf_cloud_1, sf_cloud_2, sf_cloud_3, sf_cloud_4, sf_s_preview, sp_cauthang, sp_destination, sp_g_item_giftbox, sp_hero_1, sp_hero_2, sp_snake_1, sp_touch, won_sfx } from '../assets';
import AudioController from '../binding/AudioController';
import FireBaseManager from '../binding/FireBaseManager';
import BotBattleRoom from '../bot/room/BotBattleRoom';
import { Chess } from '../bot/schema/BotChess';
import { Player } from '../bot/schema/BotPlayer';
import HeroDisplay from '../components/HeroDisplay';
import PlayerControl from '../components/PlayerControl';
import UIController from '../components/UIController';
import { GameState } from '../data/GameState';
import { BLACK, RED } from '../helper/colors';
import { JUMPED, MessageType, MOVE_ANIM_DONE, ROLL_ANIM_DONE, ROLL_DICE } from '../network/constant.network';
import { FINISH_POSITION, ladders, map1, maps, snakes } from '../network/map';
import Home from './Home';
import Shop from './Shop';

export default class BotGame extends Scene {
  laddersSkeleton: SpineSkeleton[] = []
  laddersSprite: Sprite[] = []
  snakesSkeleton: SpineSkeleton[] = []
  room: BotBattleRoom = null
  playersMap: { [key: string]: PlayerControl } = {}
  heroesList: HeroDisplay[] = []
  isPaused = false
  winner = ''
  tiledMapComp: TiledMap
  // dice: RollingDice
  maxMoveY = 5
  uiController: UIController
  currentRollData
  mapPoints: Vec2[]
  cloudSprites: Sprite[] = []
  private tileLandTweens = new Map<number, TweenSequence>()
  private cloudTweens: TweenHandle[] = []

  onLoad() {
    const touchListener = this.node.addComponent(TouchEventRegister, {
      onTouchStart: touch => this.showTouchEffect(touch),
      consumeInput: false,
    })
    touchListener.inputPriority = Number.MAX_SAFE_INTEGER
  }

  get $() {
    return function (state) {
      return state
    }
  }

  onEnter() {
    const room = new BotBattleRoom()
    this.room = room
    room.init()

    this.mapPoints = maps[GameState.mapIndex].map(([tx, ty]) => {
      const { x, y } = this.tiledMapComp.getLayer('map').getPositionAt(tx, ty)
      return Vec2(x + 62, y)
    });
    [this.uiController.playerRight, this.uiController.playerLeft].forEach((player) => {
      player.dice.node.on(ROLL_ANIM_DONE, this.onRollDone, this)
      // player.dice.node.active = false
      player.chesses.forEach((hero) => {
        hero.movePoints = this.mapPoints
        hero.node.on(MOVE_ANIM_DONE, this.onMoveDone, this)
        hero.node.on(JUMPED, this.onHeroJumped, this)
      })
    })
    this.uiController.turnNode.on(ROLL_DICE, this.onClickDice.bind(this))

    // this.uiController.loadingNode.active = false
    // const remoteUrl = FBInstant.player.getPhoto()
    // cc.assetManager.loadRemote(remoteUrl, { type: 'png' }, (err, texture: cc.Texture2D) => {
    const frame = sf_avatar_2
    const name = 'player'
    this.uiController.playerRight.setup(name, frame)
    this.uiController.playerRight.diceSkin = '2'
    //   this.uiController.resultDialog.players[0].setup(name, frame)
    // })
    // cc.assetManager.loadRemote(GameState.opponentAvatar, { type: 'png' }, (err, texture: cc.Texture2D) => {
    {
      const frame = sf_avatar_1
      const name = GameState.opponentName
      this.uiController.playerLeft.setup(name, frame)
    }
    //   this.uiController.resultDialog.players[1].setup(name, frame)
    // })
    // this.uiController.dimNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    // this.createLabels()

    // console.log(this.$(this.room.state))
    // console.log('this.state', this.room.state)
    // this.$(this.room.state).players.onAdd = this.onAddPlayer.bind(this)
    this.$(this.room.state).listen('winner', this.onHaveWinner.bind(this))
    this.$(this.room.state).listen('currentTurn', this.onChangeTurn.bind(this))
    this.room.onMessage(MessageType.START_BATTLE, this.onStartBattle)
    this.room.onMessage(MessageType.ROLL_DICE, this.onRollMessage.bind(this))
    this.room.onMessage(MessageType.LEAVE_GAME, this.onLeaveGame.bind(this))
    this.onStartBattle()
    this.startCloudEffects()
    // console.log('BotGame onEnter', this.snakesSkeleton[0])
  }

  onUnload(): void {
    this.room?.leave()
    this.cloudTweens.forEach(tween => tween.stop())
    this.cloudTweens = []
  }

  private startCloudEffects() {
    const cloudConfigs = [
      { index: 0, fromX: 730, toX: -730, duration: 34 },
      { index: 1, fromX: -730, toX: 730, duration: 41 },
      { index: 2, fromX: 730, toX: -730, duration: 38 },
      { index: 3, fromX: -730, toX: 730, duration: 45 },
      { index: 4, fromX: 730, toX: -730, duration: 36 },
      { index: 5, fromX: -730, toX: 730, duration: 43 },
    ]

    cloudConfigs.forEach(({ index, fromX, toX, duration }) => {
      const cloud = this.cloudSprites[index]
      if (!cloud) return

      const fly = () => {
        cloud.node.x = fromX
        const tween = Tween.to(cloud.node, { x: toX }, duration, {
          onComplete: () => {
            this.cloudTweens = this.cloudTweens.filter(item => item !== tween)
            fly()
          },
        })
        this.cloudTweens.push(tween)
      }
      fly()
    })
  }

  onUpdate(): void {
    this.room?.tick()
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

  createLabels() {
    map1.forEach(([x, y], index) => {
      if (index === 0) return
      const labelNumber = instantiate(Label, { string: index.toString(), size: 48, outline: [BLACK, 2] })
      const pos = this.tiledMapComp.getLayer('map').getPositionAt(x, y)
      labelNumber.node.position = Vec2(pos.x + 62, pos.y - 28)
      labelNumber.node.color = RED
      this.tiledMapComp.node.addChild(labelNumber.node)
    })
  }

  onHaveWinner(currentValue) {
    // console.log(`currentTurn is now ${currentValue}`);
    // console.log(`previous value was: ${previousValue}`);
    if (!currentValue || this.isPaused) {
      return
    }
    this.isPaused = !!currentValue
    this.winner = currentValue
    this.node.scheduleOnce(() => {
      this.showWinner()
    }, 0.2)
  }

  showWinner() {
    AudioController.Instance.playEffectSound(won_sfx)
    const sessionId = this.room.sessionId
    const playerIds = Array.from(this.room.state.players.keys())
    const otherPlayerSessionId = sessionId === playerIds[0] ? playerIds[1] : playerIds[0]
    const selfScore = this.room.state.players.get(sessionId)?.score
    const oppScore = this.room.state.players.get(otherPlayerSessionId)?.score || '-'
    const isWin = sessionId === this.winner
    this.uiController.showResult(isWin, selfScore, oppScore)
  }

  onStartBattle = () => {
    // this.room.state.gifts.forEach((pos) => {
    //   const gift = instantiate(SpineSkeleton, { data: sp_g_item_giftbox, animation: 'Run', skin: 'Gift 1' })
    //   gift.node.position = this.mapPoints[pos]
    //   this.tiledMapComp.node.addChild(gift.node)
    // })
    // console.log('onStartBattle', this.room.state.players)
    this.room.state.players.forEach((player, key) => {
      this.onAddPlayer(player, key)
    })
    this.uiController.startBattle()
    this.isPaused = false
  }

  ensurePlayersReady() {
    if (!this.room?.state?.players) {
      return
    }
    this.room.state.players.forEach((player, key) => {
      this.onAddPlayer(player, key)
    })
  }

  onChangeTurn(currentValue, previousValue) {
    if (this.isPaused) {
      return
    }
    console.log('onChangeTurn', currentValue, previousValue)
    this.ensurePlayersReady()
    if (previousValue) {
      const previousPlayer = this.playersMap[previousValue]
      if (previousPlayer) {
        previousPlayer.dice.node.active = false
        previousPlayer.labelCount.node.active = false
        previousPlayer.hideChessCanMove()
      }
      this.uiController.clearCount()
    }
    if (!this.playersMap[currentValue]) {
      console.warn('BotGame received turn for unknown player', currentValue)
      return
    }
    this.playersMap[currentValue].dice.node.active = true
    // this.scheduleOnce(() => {
    this.showTurnUI(currentValue)
    this.uiController.turnNode.rotation = currentValue === this.room.sessionId ? 85 : -85
    // }, 1);
  }

  showTurnUI(currentValue) {
    this.uiController.startCountDown()
    this.uiController.showTurn(this.room.sessionId === currentValue)
  }

  onRollMessage(data) {
    const { sessionId, value } = data
    this.ensurePlayersReady()
    const curPlayer = this.playersMap[sessionId]
    console.log('onRollMessage', value, curPlayer)
    if (!curPlayer) {
      console.warn('BotGame received roll for unknown player', sessionId, Object.keys(this.playersMap))
      return
    }
    curPlayer.rollDice(value)
    this.currentRollData = data
    this.uiController.clearCount()
    AudioController.Instance.playEffectSound(ding_sfx)
  }

  onRollDone() {
    if (!this.currentRollData) return
    const { sessionId, value } = this.currentRollData
    const canMoveList = []
    this.room.state.players.get(sessionId).chesses.forEach((chess, idx) => {
      const { position } = chess
      if ((position !== 0 && position + value <= FINISH_POSITION[GameState.mapIndex]) || (position === 0 && value === 6)) {
        canMoveList.push(idx)
      }
    })
    console.log('onRollDone', value, canMoveList)
    if (canMoveList.length > 0) {
      this.uiController.startCountDown()
    }
    if (this.room.sessionId === sessionId) {
      this.playersMap[sessionId].showChessCanMove(canMoveList)
    }
    // this.uiController.handNode.active = false
    // this.uiController.dimNode.active = true
    if (canMoveList.length === 0 && value === 6) {
      this.showTurnUI(sessionId)
    }
    if (this.room?.sessionId === sessionId && canMoveList.length === 1) {
      this.node.scheduleOnce(() => {
        const { currentTurn, isRolled } = this.room?.state || {}
        if (currentTurn === this.room?.sessionId && isRolled) {
          this.uiController.clearCount()
          this.room.send(MessageType.MOVE_CHESS, canMoveList[0])
          this.playersMap[currentTurn]?.hideChessCanMove()
        }
      }, 0.3)
    }
  }

  onAddPlayer(player: Player, key) {
    // console.log('has been added at', key, this.room.sessionId)
    if (this.playersMap[key]) {
      return
    }
    this.addPlayerEvents(player, key)
    if (key === this.room.sessionId) {
      this.playersMap[key] = this.uiController.playerRight
    } else {
      this.playersMap[key] = this.uiController.playerLeft
    }
    const { profile } = GameState
    if (key === this.room.sessionId && profile?.equipments) {
      profile.equipments.forEach(async ({ slot, itemId }) => {
        switch (slot) {
          case 'character': {
            const data = Shop.heroesSpine[itemId - 1001]
            await loadAll([data])
            this.playersMap[key].chesses.forEach((chess) => {
              chess.spineSkeleton.setSkeletonData(data)
            })
            break
          }
          case 'dice': {
            const data = Shop.dicesSpine[itemId - 1]
            await loadAll([data])
            this.playersMap[key].dice.setSkin(data)
            this.playersMap[key].diceSkin = `${itemId}`
            break
          }
          default:
            break
        }
      })
    } else if (GameState.opponentCharacter) {
      this.playersMap[key].chesses.forEach(async (chess) => {
        const data = GameState.opponentCharacter
        await loadAll([data])
        chess.spineSkeleton.setSkeletonData(data)
      })
    }
  }

  addPlayerEvents(player: Player, key: string) {
    player.chesses.forEach((hero: Chess, index: number) => {
      // console.log('hero have changes at', index);
      this.$(hero).listen('position', (val, prev) => this.onChangePosition(val, prev, index, key))
    })
    this.$(player).listen('isReady', val => this.onPlayerReady(val, key))
  }

  onPlayerReady(isReady, key) {
    const curPlayer = this.room.sessionId === key ? 0 : 1
    this.uiController.resultDialog.players[curPlayer].updateStatus(isReady ? 'Ready' : '')
  }

  onLeaveGame(key) {
    console.log(key, 'leaved')
    const curPlayer = this.room.sessionId === key ? 0 : 1
    this.uiController.resultDialog.players[curPlayer].updateStatus('Leaved')
  }

  onChangePosition(value, prev, index, key) {
    console.log('onChangePosition', value, prev, index, key)
    if (prev === undefined || !value) {
      return
    }
    const curPlayer = this.playersMap[key]
    // const { currentTurn } = this.room.state
    const playerState = this.room.state.players.get(key)
    const { kick } = playerState.chesses[index]
    const snake = snakes[GameState.mapIndex][prev]
    const ladder = ladders[GameState.mapIndex][prev]
    // console.log(key, index, prev, value, ladder, snake, kick, playerState);
    if ((snake || ladder) && !kick) {
      this.node.scheduleOnce(() => {
        if (snake) {
          AudioController.Instance.playEatSound()
          const snakeIndex = Object.values(snakes[GameState.mapIndex]).indexOf(snake)
          if (this.snakesSkeleton[snakeIndex]) {
            this.snakesSkeleton[snakeIndex].play('Attack', false)
          }
        }
        curPlayer.moveChess(index, prev, value, ladder, snake, kick)
      }, 0.5)
    } else {
      curPlayer.moveChess(index, prev, value, ladder, snake, kick)
    }
  }

  onMoveDone(isReachFinish) {
    if (isReachFinish) {
      AudioController.Instance.playFinishSound()
      // this.uiController.finishEffect.resetSystem()
    }
    // console.log('onMoveDone', isReachFinish, this.winner);
    const currentTurn = this.room.state.currentTurn
    // this.scheduleOnce(() => {
    const curPlayer = this.room.state.players.get(currentTurn)
    // console.log('onMoveDone', curPlayer.dice, currentTurn);
    if (curPlayer.dice === 6) {
      this.showTurnUI(currentTurn)
    }
    // }, 1);
  }

  onHeroJumped = (position: number) => {
    const tilePosition = maps[GameState.mapIndex][position + 1]
    if (!tilePosition) return

    const [column, row] = tilePosition
    this.tileLandTweens.get(position)?.stop()
    const offset = { y: 0 }
    const updateOffset = () => this.tiledMapComp.setTileOffset('map', column, row, 0, offset.y)
    const tween = Tween.sequence()
      .to(offset, { y: 8 }, 0.08, { onUpdate: updateOffset })
      .to(offset, { y: 0 }, 0.16, { onUpdate: updateOffset })
      .call(() => this.tileLandTweens.delete(position))
      .start()
    this.tileLandTweens.set(position, tween)
  }

  onClickDice() {
    const room = this.room
    if (!room?.state) {
      return
    }
    const { currentTurn, isRolled } = room.state
    if (currentTurn !== room.sessionId || isRolled) {
      return
    }
    console.log('dice', currentTurn, isRolled)
    this.uiController.clearCount()
    room.send(MessageType.ROLL_DICE)
  }

  onClickHero(button: Touch) {
    const { currentTurn, isRolled } = this.room.state
    if (currentTurn !== this.room.sessionId || !isRolled) {
      return
    }
    const data = button.currentTarget.node.tag
    console.log('onClickHero', currentTurn, data)
    this.uiController.clearCount()
    this.room.send(MessageType.MOVE_CHESS, data)
    // this.uiController.dimNode.active = false
    this.playersMap[currentTurn].hideChessCanMove()
  }

  onClickRematch() {
    FireBaseManager.firebaseLog('Rematch')
    // this.uiController.resultDialog.onClickRematch()
    this.room.send(MessageType.RE_MATCH)
  }

  onClickNextOpp() {
    FireBaseManager.firebaseLog('NextOpp')
    this.room.leave()
    loadScene(Home)
  }

  __view() {
    <Scene>
      <Sprite spriteFrame={sf_background_play_2} node={{ x: 563, y: 1218 }} />
      <UIController $ref={this.uiController} node={{ zIndex: 100 }} />
      <TiledMap $ref={this.tiledMapComp} mapFile={map_1_json} node={{ x: 563, y: 1584 }}>
        <Sprite $push={this.cloudSprites} spriteFrame={sf_cloud} node={{ x: 730, y: 650, scale: 0.18 }} />
        <Sprite $push={this.cloudSprites} spriteFrame={sf_cloud_2} node={{ x: -730, y: 570, scale: 0.2 }} />
        <Sprite $push={this.cloudSprites} spriteFrame={sf_cloud_4} node={{ x: 730, y: 530, scale: 0.17 }} />
        <Sprite spriteFrame={sf_15} node={{ x: -622, y: -184 }} />
        <Sprite spriteFrame={sf_8} node={{ x: 582, y: -114 }} />
        <SpineSkeleton data={sp_destination} node={{ x: 77, y: -980 }} skin="Blue" animation="Tower_2" />
        <SpineSkeleton $push={this.snakesSkeleton} data={sp_snake_1} node={{ x: -94, y: 284, scaleX: 1, name: 'snake1', rotation: -4 }} animation="Idle">
          <SpineBonesControl bones={[['1', -14, 73], ['2', -35, 42], ['3', 7, 11], ['4', 2, -27], ['5', 40, -62]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.snakesSkeleton} data={sp_snake_1} node={{ x: 271, y: -75, scaleX: -1, name: 's2' }} animation="Idle">
          <SpineBonesControl bones={[['1', 24, 81], ['2', -26, 55], ['3', -45, -8], ['4', -30, -56], ['5', -9, -112]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.snakesSkeleton} data={sp_snake_1} node={{ x: -328, y: -185, scaleX: 1, name: 's3' }} animation="Idle">
          <SpineBonesControl bones={[['1', 23, 109], ['2', -38, 75], ['3', -54, 4], ['4', -25, -61], ['5', -4, -150]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.snakesSkeleton} data={sp_snake_1} node={{ x: 322, y: -509, scaleX: -1, name: 's4' }} animation="Idle">
          <SpineBonesControl bones={[['1', 18, 105], ['2', -5, 72], ['3', 15, 24], ['4', 11, -22], ['5', 36, -74]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.snakesSkeleton} data={sp_snake_1} node={{ x: -331, y: -568, scaleX: 1, name: 's5' }} animation="Idle">
          <SpineBonesControl bones={[['1', 5, 123], ['2', -30, 75], ['3', -11, 26], ['4', -5, -29], ['5', -15, -140]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.laddersSkeleton} data={sp_cauthang} node={{ x: -200, y: -178 }} />
        <SpineSkeleton $push={this.laddersSkeleton} data={sp_cauthang} node={{ x: -199, y: -573 }} />
        <SpineSkeleton $push={this.laddersSkeleton} data={sp_cauthang} node={{ x: 36, y: -561, scaleX: -1 }}>
          <SpineBonesControl bones={[['A', -90, -25], ['B', -50, -80], ['C', 107, 171], ['D', 151, 136]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.laddersSkeleton} data={sp_cauthang} node={{ x: 257, y: -278, scaleX: -1, width: 1 }}>
          <SpineBonesControl bones={[['A', -98, -21], ['B', -49, -75], ['C', 134, 153], ['D', 195, 124]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.laddersSkeleton} data={sp_cauthang} node={{ x: 50, y: 30, scaleX: -1 }}>
          <SpineBonesControl bones={[['A', -88, -33], ['B', -50, -80], ['C', 107, 171], ['D', 151, 136]]} />
        </SpineSkeleton>
        <SpineSkeleton $push={this.laddersSkeleton} data={sp_cauthang} node={{ x: -162, y: 59, scaleX: 1 }}>
          <SpineBonesControl bones={[['A', -77, -39], ['B', -27, -82], ['C', 79, 170], ['D', 132, 139]]} />
        </SpineSkeleton>
        <Sprite spriteFrame={sf_s_preview} node={{ x: -343, y: 387, scale: 0.5 }} />
        <Sprite spriteFrame={sf_s_preview} node={{ x: 390, y: 387, scaleX: -0.5, scaleY: 0.5 }} />
        <Sprite $push={this.cloudSprites} spriteFrame={sf_cloud_1} node={{ x: -730, y: -1170, scale: 0.2 }} />
        <Sprite $push={this.cloudSprites} spriteFrame={sf_cloud_3} node={{ x: 730, y: -1225, scale: 0.19 }} />
        <Sprite $push={this.cloudSprites} spriteFrame={sf_cloud_4} node={{ x: -730, y: -1280, scale: 0.16 }} />
        <HeroDisplay $push={this.uiController.playerRight.chesses} node={{ x: 440, y: 409, tag: 0 }} skeletonData={sp_hero_1}>
          <TouchEventRegister onTouchStart={this.onClickHero.bind(this)} />
        </HeroDisplay>
        <HeroDisplay $push={this.uiController.playerRight.chesses} node={{ x: 325, y: 409, tag: 1 }} skeletonData={sp_hero_1}>
          <TouchEventRegister onTouchStart={this.onClickHero.bind(this)} />
        </HeroDisplay>
        <HeroDisplay $push={this.uiController.playerLeft.chesses} node={{ x: -263, y: 413, scaleX: -1, tag: 0 }} skeletonData={sp_hero_2}>
          <TouchEventRegister onTouchStart={this.onClickHero.bind(this)} />
        </HeroDisplay>
        <HeroDisplay $push={this.uiController.playerLeft.chesses} node={{ x: -395, y: 402, scaleX: -1, tag: 1 }} skeletonData={sp_hero_2}>
          <TouchEventRegister onTouchStart={this.onClickHero.bind(this)} />
        </HeroDisplay>
        <SpineSkeleton data={sp_g_item_giftbox} node={{ x: 444, y: -522 }} />
        <Widget bottom={-163} />
      </TiledMap>
    </Scene>
  }
}
