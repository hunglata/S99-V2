import { random } from 'lodash-es'

import { getNearestSnake } from '../../helper/utils'
import { MessageType, MOVE_ANIMATION_TIME, NEXT_TURN_DELAY, ROLL_DICE_ANIMATION_TIME, SNAKE_LADDER_ANIMATION_TIME } from '../../network/constant.network'
import { FINISH_POSITION, firstSnake, ignoreKickPos, ladders, snakes } from '../../network/map'
import { Command } from '../core/BotDispatcher'
import BattleRoom from './BotBattleRoom'

const testWinDices = [4, 6, 6, 6, 6, 1, 2, 6, 6, 6, 6, 6, 4, 4, 6, 6, 3]
const testSnakeDices = [6, 4, 4, 5, 6, 6, 6, 4, 4, 6, 6, 6, 6, 6, 4]
const testMoveDices = [6, 6, 6, 3, 3, 4, 6, 1, 6, 4, 4, 6, 6, 6, 6, 6, 4]
const isTest = false

export class RollDiceCommand extends Command<BattleRoom, { sessionId: string }> {
  validate({ sessionId }) {
    const { currentTurn, isRolled, winner } = this.state
    return currentTurn === sessionId && !isRolled && !winner
  }

  async execute({ sessionId }) {
    console.log(sessionId, 'roll')
    this.state.isRolled = true
    const inturnGuy = this.state.players.get(sessionId)
    const value = isTest ? testMoveDices.shift() : random(1, 6, false)
    inturnGuy.dice = value
    this.room.broadcast(MessageType.ROLL_DICE, { sessionId, value })
    await this.delay(2500) // wait run dice animation
    const canMoveList = []
    inturnGuy.chesses.forEach((chess, idx) => {
      chess.kick = 0
      const { position } = chess
      if ((position !== 0 && position + value <= FINISH_POSITION[this.room.mapIndex]) || (position === 0 && value === 6)) {
        canMoveList.push(idx)
      }
    })
    if (sessionId === 'bot') {
      if (canMoveList.length === 0) {
        if (value === 6) {
          await this.delay(Math.random() * 1000 + 500)
          return new CheckTurnCommand().setPayload({ sessionId: 'bot' })
        }
        await this.delay(NEXT_TURN_DELAY)
        return new SwitchTurnCommand()
      }
      await this.delay(Math.random() * 1000 + 500)
      if (canMoveList.length === 2) {
        const r = random(1, 100, false)
        if (r > 50) {
          return new MoveChessCommand().setPayload({ sessionId: 'bot', index: canMoveList[1] })
        }
      }
      return [new MoveChessCommand().setPayload({ sessionId: 'bot', index: canMoveList[0] })]
    }
    // await this.delay(ROLL_DICE_ANIMATION_TIME)
    if (canMoveList.length === 0) {
      if (value === 6) {
        this.state.isRolled = false
        this.room.setAutoMoveTimeout()
        return
      }
      await this.delay(NEXT_TURN_DELAY)
      return [new SwitchTurnCommand()]
    }
    if (canMoveList.length === 1) {
      await this.delay(ROLL_DICE_ANIMATION_TIME)
      return new MoveChessCommand().setPayload({ sessionId, index: canMoveList[0] })
    } else {
      this.room.setAutoMoveTimeout()
    }
  }
}

export class MoveChessCommand extends Command<BattleRoom, { sessionId: string, index: number }> {
  validate({ sessionId, index }) {
    const { currentTurn, isRolled, isMoved, players, winner } = this.state
    const player = players.get(sessionId)
    const chess = player?.chesses[index]
    if (!chess) {
      return false
    }
    const { position } = chess
    // console.log(sessionId, 'validate', index, player.dice);
    if (currentTurn !== sessionId || !isRolled || isMoved || winner) {
      return false
    }
    if (position === 0) {
      return player.dice === 6
    }
    return position + player.dice <= FINISH_POSITION[this.room.mapIndex]
  }

  async execute({ sessionId, index }) {
    this.state.isMoved = true
    const player = this.state.players.get(sessionId)
    // console.log(sessionId, 'move', index, player.dice);
    const { position } = player.chesses[index]
    const nextPos = position === 0 ? 1 : position + player.dice
    player.chesses[index].position = nextPos
    await this.delay(player.dice * MOVE_ANIMATION_TIME)
    return [new CheckWinCommand().setPayload({ sessionId, index })]
  }
}

export class CheckWinCommand extends Command<BattleRoom, { sessionId: string, index: number }> {
  async execute({ sessionId, index }) {
    const { players } = this.state
    const player = players.get(sessionId)
    if (player.chesses.every(chess => chess.position === FINISH_POSITION[this.room.mapIndex])) {
      player.score += 1
      this.state.winner = sessionId
      // cc.log(player.dice, nextPos, sessionId);
      if (['player', 'bot'].includes(sessionId)) {
        await this.delay(3500)
        this.room.broadcast(MessageType.LEAVE_GAME, 'bot')
      }
      return
    }
    return [
      new CheckSnakeLadderCommand().setPayload({ sessionId, index }),
      new CheckKickCommand().setPayload({ sessionId, index }),
      new CheckTurnCommand().setPayload({ sessionId }),
    ]
  }
}

export class CheckSnakeLadderCommand extends Command<BattleRoom, { sessionId: string, index: number }> {
  async execute({ sessionId, index }) {
    const { players } = this.state
    const player = players.get(sessionId)
    const { position } = player.chesses[index]
    const snake = snakes[this.room.mapIndex][position]
    if (snake) {
      player.chesses[index].position = snake
      await this.delay(SNAKE_LADDER_ANIMATION_TIME)
    } else {
      // not snake maybe ladder
      const ladder = ladders[this.room.mapIndex][position]
      // cc.log('ladder', ladder);
      if (ladder) {
        player.chesses[index].position = ladder
        await this.delay(SNAKE_LADDER_ANIMATION_TIME)
      }
    }
  }
}

export class CheckKickCommand extends Command<BattleRoom, { sessionId: string, index: number }> {
  async execute({ sessionId, index }) {
    const { players } = this.state
    const player = players.get(sessionId)
    if (!player || !player.chesses[index]) return
    let snakeLadderTime = 0
    const nextPos = player.chesses[index].position
    const playerIds = Array.from(this.state.players.keys())
    const otherPlayerSessionId = sessionId === playerIds[0] ? playerIds[1] : playerIds[0]
    if (!otherPlayerSessionId) return
    const otherPlayer = this.state.players.get(otherPlayerSessionId)
    if (!otherPlayer || !otherPlayer.chesses) return

    const finishPos = FINISH_POSITION[this.room.mapIndex ?? 0] ?? 79
    const firstSnakePos = firstSnake[this.room.mapIndex ?? 0] ?? firstSnake[0]
    const currentSnakesMap = snakes[this.room.mapIndex ?? 0] ?? snakes[0]

    otherPlayer.chesses.forEach((chess) => {
      if ([...ignoreKickPos, finishPos].includes(chess.position)) {
        return
      }
      if (chess.position === nextPos) {
        let newPos
        if (chess.position < firstSnakePos) {
          newPos = chess.position - 1
          chess.kick = newPos
          snakeLadderTime += MOVE_ANIMATION_TIME
        } else {
          const nearestSnake = getNearestSnake(currentSnakesMap, chess.position)
          newPos = currentSnakesMap[nearestSnake] ?? chess.position - 1
          snakeLadderTime += MOVE_ANIMATION_TIME * (chess.position - newPos) + SNAKE_LADDER_ANIMATION_TIME
          chess.kick = nearestSnake
        }
        chess.position = newPos
      }
    })
    if (otherPlayer.chesses[0] && otherPlayer.chesses[1] && otherPlayer.chesses[0].position === otherPlayer.chesses[1].position) {
      await this.delay(snakeLadderTime * 0.5)
    } else {
      await this.delay(snakeLadderTime)
    }
  }
}

export class CheckTurnCommand extends Command<BattleRoom, { sessionId: string }> {
  async execute({ sessionId }) {
    const { players } = this.state
    const player = players.get(sessionId)
    if (!player) return [new SwitchTurnCommand()]
    if (player.dice !== 6) {
      return [new SwitchTurnCommand()]
    } else {
      this.state.isMoved = false
      this.state.isRolled = false
      if (sessionId === 'bot') {
        await this.delay(Math.random() * 1000 + 500)
        return new RollDiceCommand().setPayload({ sessionId: 'bot' })
      } else {
        this.room.setAutoMoveTimeout()
      }
    }
  }
}

export class SwitchTurnCommand extends Command<BattleRoom> {
  async execute() {
    const sessionId = this.state.currentTurn
    const playerIds = Array.from(this.state.players.keys())
    const otherPlayerSessionId = sessionId === playerIds[0] ? playerIds[1] : playerIds[0]
    if (otherPlayerSessionId) {
      this.state.currentTurn = otherPlayerSessionId
    }
    this.state.isRolled = false
    this.state.isMoved = false
    if (otherPlayerSessionId === 'bot') {
      await this.delay(Math.random() * 1000 + 500)
      return [new RollDiceCommand().setPayload({ sessionId: 'bot' })]
    } else {
      this.room.setAutoMoveTimeout()
    }
  }
}

export class ResetGameCommand extends Command<BattleRoom> {
  execute() {
    this.state.players.forEach((player) => {
      player.dice = 0
      player.chesses.forEach((chess) => {
        chess.position = 0
        chess.kick = 0
      })
      player.isReady = false
    })
    // genGifts().forEach((pos) => {
    //   this.state.gifts.push(pos)
    // })
    this.state.winner = ''
    this.state.isRolled = false
    this.state.isMoved = false
  }
}

export class ReadyCommand extends Command<BattleRoom, { sessionId: string }> {
  execute({ sessionId }) {
    const player = this.state.players.get(sessionId)
    player.isReady = true
  }
}
