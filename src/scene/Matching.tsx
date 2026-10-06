import { Button, Label, loadAll, loadScene, Node, Scene, SpineSkeleton, Sprite } from '@safe-engine/sdl'

import { getStateCallbacks } from 'colyseus.js'
import { getProfileById } from '../api/profile'
import {
  button_sfx,
  sf_avatar_1,
  sf_avatar_2,
  sf_background,
  sf_btn_add,
  sf_btn_back,
  sf_btn_cancel,
  sf_btn_ready,
  sf_btn_start,
  sf_icon_view,
  sf_icon_vs,
  sf_slot_name,
  sf_stand_4,
  sf_stand_5,
  sp_hero_1,
  sp_hero_2,
  sp_icon_ready,
} from '../assets'
import AudioController from '../binding/AudioController'
import { getAccessToken } from '../data/GameDataManager'
import { GameState } from '../data/GameState'
import { BLACK } from '../helper/colors'
import NetworkManager from '../network/NetworkManager'
import { BATTLE_ROOM, MessageType } from '../network/constant.network'
import { BattleRoomState } from '../network/schema/BattleRoomState'
import { Player } from '../network/schema/Player'
import Game from './Game'
import Home from './Home'
import Shop from './Shop'

enum PlayerStatus {
  Idle,
  Ready,
}

export default class Matching extends Scene {
  static readonly allRes = [
    sf_avatar_1,
    sf_avatar_2,
    sf_background,
    sf_btn_back,
    sf_btn_ready,
    sf_icon_view,
    sf_icon_vs,
    sf_slot_name,
    sf_stand_4,
    sf_stand_5,
    sp_hero_1,
    sp_hero_2,
    sf_btn_cancel,
    sf_btn_start,
    sf_btn_add,
    sp_icon_ready,
  ]

  static readonly playerStatesSpriteFrames = [sf_btn_cancel, sf_btn_ready, sf_btn_start]
  spineHero1: SpineSkeleton
  readyNode1: Node
  spineHero2: SpineSkeleton
  readyNode2: Node
  noOpponentNode: Node
  actionButton: Sprite
  status: PlayerStatus = PlayerStatus.Idle
  labelRoomId: Label
  lbName1: Label
  lbName2: Label

  async onEnter() {
    const { profile } = GameState
    this.lbName1.string = profile?.name ?? ''
    this.labelRoomId.string = 'ID: connecting...'

    console.log('[Matching] client:creating')
    try {
      const { client } = NetworkManager.Instance
      const token = getAccessToken()
      if (!token) {
        throw new Error('Missing access token')
      }

      client.auth.token = token
      console.log('[Matching] joinOrCreate:start')
      const room = await client.joinOrCreate<BattleRoomState>(BATTLE_ROOM, {
        map: 0,
      })
      console.log('[Matching] joinOrCreate:done', room.roomId, room.sessionId)
      this.labelRoomId.string = `ID: ${room.roomId}`
      NetworkManager.Instance.battleRoom = room
      room.onMessage(MessageType.START_BATTLE, this.onStartBattle)
      const $ = getStateCallbacks(room)
      $(room.state).players.onAdd(this.onAddPlayer.bind(this))
      $(room.state).players.onRemove(this.onRemovePlayer.bind(this))
    } catch (error) {
      this.labelRoomId.string = 'ID: unavailable'
      console.error('[Matching] joinOrCreate:failed', error)
    }
  }

  isHost() {
    const { battleRoom } = NetworkManager.Instance
    const firstId: Player = battleRoom?.state?.players
      ? Array.from(battleRoom.state.players.values())[0]
      : null
    const { profile } = GameState
    console.log('first', firstId, profile.id)
    return firstId?.userId === profile?.id
  }

  async onAddPlayer(player: Player, key) {
    console.log(player, 'has been added at', key)
    const { battleRoom } = NetworkManager.Instance
    const { profile } = GameState
    const $ = getStateCallbacks(battleRoom)
    $(player).listen('isReady', val => this.onPlayerReady(val, key))
    if (this.isHost()) {
      this.actionButton.node.active = false
      const player = battleRoom.state.players.get(key)
      const curPlayer = player.userId === profile.id
      if (curPlayer) {
        battleRoom.send(MessageType.READY_BATTLE)
      }
    } else {
      this.actionButton.node.active = true
    }
    if (player.userId === profile.id) {
      this.lbName1.string = profile.name
      profile.equipments.forEach(async ({ slot, itemId }) => {
        switch (slot) {
          case 'character': {
            const data = Shop.heroesSpine[itemId - 1001]
            await loadAll([data])
            this.spineHero1.setSkeletonData(data)
            break
          }
          default:
            break
        }
      })

      return
    }
    this.noOpponentNode.active = false
    const opponent = await getProfileById(player.userId)
    if (opponent) {
      this.spineHero2.node.active = true
      GameState.opponentName = opponent.name || 'bot'
      GameState.opponentAvatar = opponent.avatar
      this.lbName2.string = GameState.opponentName
      opponent.equipments.forEach(async ({ slot, itemId }) => {
        switch (slot) {
          case 'character': {
            const data = Shop.heroesSpineBlack[itemId - 1001]
            GameState.opponentCharacter = data
            await loadAll([data])
            this.spineHero2.setSkeletonData(data)
            break
          }
          default:
            break
        }
      })
    }
  }

  async onRemovePlayer() {
    this.spineHero2.node.active = false
    this.noOpponentNode.active = true
    this.readyNode2.active = false
    this.lbName2.string = ''
  }

  onPlayerReady(isReady, key) {
    console.log('onPlayerReady', isReady, key)
    const { battleRoom } = NetworkManager.Instance
    const player = battleRoom.state.players.get(key)
    const curPlayer = player.userId === GameState.profile.id
    const ready = Array.from(battleRoom.state.players.values()).map(p => p.isReady)
    if (this.isHost()) {
      if (ready[0] && ready[1]) {
        this.actionButton.spriteFrame = sf_btn_start
        this.actionButton.node.active = true
      } else {
        this.actionButton.spriteFrame = sf_btn_cancel
        this.actionButton.node.active = false
      }
      if (curPlayer) {
        this.readyNode1.active = isReady
        this.status = isReady ? PlayerStatus.Ready : PlayerStatus.Idle
      } else {
        this.readyNode2.active = isReady
      }
    } else {
      if (curPlayer) {
        this.readyNode2.active = isReady
        this.status = isReady ? PlayerStatus.Ready : PlayerStatus.Idle
        this.actionButton.spriteFrame = isReady ? sf_btn_cancel : sf_btn_ready
      } else {
        this.readyNode1.active = isReady
      }
    }
  }

  onStartBattle = () => {
    AudioController.Instance.playEffectSound(button_sfx)
    GameState.loadingScene = 'game'
    loadScene(Game)
  }

  onPressBack() {
    const { battleRoom } = NetworkManager.Instance
    battleRoom?.send(MessageType.LEAVE_GAME)
    loadScene(Home)
  }

  onPressAction() {
    const { battleRoom } = NetworkManager.Instance
    if (!battleRoom?.state?.players) return

    if (this.isHost()) {
      const ready = Array.from(battleRoom.state.players.values()).map(p => p.isReady)
      if (ready[0] && ready[1]) {
        battleRoom.send(MessageType.START_BATTLE)
      }
    } else {
      battleRoom.send(MessageType.READY_BATTLE)
    }
  }

  __view() {
    <Scene>
      <Sprite spriteFrame={sf_background} node={{ x: 563, y: 1218 }} />
      <Button spriteFrame={sf_btn_back} node={{ x: 80, y: 75 }} onPress={this.onPressBack} />
      <Label $ref={this.labelRoomId} string="ID:" node={{ x: 414, y: 295, color: BLACK }} />
      <Sprite spriteFrame={sf_stand_4} node={{ x: 633, y: 1651 }}>
        <SpineSkeleton $ref={this.spineHero1} data={sp_hero_1} animation="Idle" node={{ x: -15, y: 42, scale: 2 }} />
        <SpineSkeleton $refNode={this.readyNode1} data={sp_icon_ready} node={{ x: 88, y: 31 }} />
        <Sprite spriteFrame={sf_slot_name} node={{ x: -3, y: 155 }}>
          <Label $ref={this.lbName1} string="Name1:" size={48} />
        </Sprite>
      </Sprite>
      <Sprite spriteFrame={sf_icon_vs} node={{ x: 627, y: 1220 }} />
      <Sprite spriteFrame={sf_stand_5} node={{ x: 627, y: 748 }}>
        <Sprite $refNode={this.noOpponentNode} spriteFrame={sf_btn_add} node={{ x: 2, y: -35 }} />
        <SpineSkeleton $ref={this.spineHero2} data={sp_hero_2} animation="Idle" node={{ x: 2, y: 31, scale: 2, active: false }} />
        <SpineSkeleton $refNode={this.readyNode2} data={sp_icon_ready} node={{ active: false, zIndex: 2, xy: [122, 53] }} />
        <Sprite spriteFrame={sf_slot_name} node={{ x: 14, y: 136 }}>
          <Label $ref={this.lbName2} string="Name2:" size={48} />
        </Sprite>
      </Sprite>
      {/* <Sprite spriteFrame={sf_icon_view} node={{ x: 314, y: 139 }} />
      <Sprite spriteFrame={sf_avatar_1} node={{ x: 501, y: 145 }} />
      <Sprite spriteFrame={sf_avatar_2} node={{ x: 694, y: 145 }} /> */}
      <Button $ref={this.actionButton} spriteFrame={sf_btn_ready} node={{ x: 615, y: 2200, active: false }} onPress={this.onPressAction} />
    </Scene>
  }
}
