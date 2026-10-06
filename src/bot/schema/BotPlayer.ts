import BotSchema, { type } from '../core/Schema'
import { Chess } from './BotChess'

export class Player extends BotSchema {
  @type([Chess])
  chesses = [new Chess(), new Chess()]

  @type('uint8')
  dice = 0

  @type('uint16')
  score = 0

  @type('boolean')
  isReady = false
}
