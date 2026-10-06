import { Delayed } from '@colyseus/timer'
import { GameState } from '../../data/GameState'
import { MapType, MessageType, TURN_TIMEOUT } from '../../network/constant.network'
import { Dispatcher } from '../core/BotDispatcher'
import Client from '../core/Client'
import { Room } from '../core/Room'
import { Player } from '../schema/BotPlayer'
import BotRoomState from '../schema/RoomState'
import { MoveChessCommand, ResetGameCommand, RollDiceCommand } from './BotCommand'

export default class BotBattleRoom extends Room<BotRoomState> {
  declare state: BotRoomState
  dispatcher = new Dispatcher(this)
  randomMoveTimeout: Delayed
  readyCount = {}
  mapIndex: MapType = MapType.LONG

  init() {
    this.state = new BotRoomState()
    this.mapIndex = GameState.mapIndex
    // console.log('init', this.state);
    this.state.players.set('player', new Player())
    this.state.players.set('bot', new Player())
    this.listenClient(MessageType.ROLL_DICE, this.onRollDice.bind(this))
    this.listenClient(MessageType.MOVE_CHESS, this.onMoveChess.bind(this))
    this.listenClient(MessageType.RE_MATCH, this.onReMatch.bind(this))
    this.dispatcher.dispatch(new ResetGameCommand())

    this.clock.setTimeout(() => {
      this.broadcast(MessageType.START_BATTLE)
      this.state.currentTurn = 'player'
      this.setAutoMoveTimeout()
    }, 100)
  }

  leave(consented?: boolean): void {
    super.leave(consented)
    if (this.randomMoveTimeout) {
      this.randomMoveTimeout.clear()
    }
    this.clock.clear()
  }

  onRollDice(client: Client) {
    this.dispatcher.dispatch(new RollDiceCommand(), {
      sessionId: client.sessionId,
    })
    // this.setAutoMoveTimeout();
  }

  onMoveChess(client: Client, index) {
    // console.log(client.sessionId, index);
    this.dispatcher.dispatch(new MoveChessCommand(), {
      sessionId: client.sessionId,
      index,
    })
  }

  setAutoMoveTimeout() {
    if (this.randomMoveTimeout) {
      this.randomMoveTimeout.clear()
    }

    this.randomMoveTimeout = this.clock.setTimeout(() => this.doRandomMove(), TURN_TIMEOUT)
  }

  doRandomMove() {
    const { currentTurn, isRolled } = this.state
    // console.log('doRandomMove', currentTurn, isRolled);
    if (isRolled) {
      this.dispatcher.dispatch(new MoveChessCommand(), {
        sessionId: currentTurn,
        index: 0,
      })
      this.dispatcher.dispatch(new MoveChessCommand(), {
        sessionId: currentTurn,
        index: 1,
      })
    } else {
      this.dispatcher.dispatch(new RollDiceCommand(), {
        sessionId: currentTurn,
      })
    }
  }

  onReMatch(client: Client) {
    this.readyCount[client.sessionId] = true
    const ready = Object.values(this.readyCount)
    if (ready[0] && ready[1]) {
      this.restartGame()
    }
  }

  restartGame() {
    const nextTurn = this.state.winner || this.sessionId
    this.dispatcher.dispatch(new ResetGameCommand())
    this.readyCount = {}
    this.setAutoMoveTimeout()
    this.broadcast(MessageType.START_BATTLE)
    this.clock.setTimeout(() => {
      this.state.currentTurn = nextTurn
    }, 100)
  }
}
